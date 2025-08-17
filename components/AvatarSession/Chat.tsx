"use client";

import { useKeyPress } from "ahooks";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { ChatInput } from "./ChatInput";
import { MessageItem } from "./MessageItem";
import { BranchDialog } from "./BranchDialog";
import { CompareDialog } from "./CompareDialog";
import { formatAttachmentSummary } from "./utils";
import { useComposerStore } from "@/lib/stores/composer";
import { useAgentStore } from "@/lib/stores/agent";

import { useStreamingAvatarContext } from "@/components/logic/context";
import { useTextChat } from "@/components/logic/useTextChat";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Loader } from "@/components/ui/loader";
import { Message, MessageAvatar } from "@/components/ui/message";
import { ScrollButton } from "@/components/ui/scroll-button";
import { useToast } from "@/components/ui/toaster";
import { Message as MessageType, MessageSender, MessageAsset } from "@/lib/types";
import { StickToBottom } from "use-stick-to-bottom";

interface ChatProps {
  chatInput: string;
  isSending: boolean;
  isVoiceChatActive: boolean;
  messages: MessageType[];
  // When true, render only the input area (no messages/scroll area)
  inputOnly?: boolean;
  onArrowDown: () => void;
  onArrowUp: () => void;
  onChatInputChange: (value: string) => void;
  onCopy: (text: string) => void;
  onSendMessage: (text: string, assets?: MessageAsset[]) => void;
  onStartVoiceChat: () => void;
  onStopVoiceChat: () => void;
}

export const Chat: React.FC<ChatProps> = ({
  chatInput,
  isSending,
  isVoiceChatActive,
  messages,
  inputOnly = false,
  onArrowDown,
  onArrowUp,
  onChatInputChange,
  onCopy,
  onSendMessage,
  onStartVoiceChat,
  onStopVoiceChat,
}) => {
  useKeyPress("ArrowUp", onArrowUp);
  useKeyPress("ArrowDown", onArrowDown);

  const { publish } = useToast();
  const { isAvatarTalking, isVoiceChatLoading } = useStreamingAvatarContext();
  const { sendMessage: apiSendMessage, repeatMessage: apiRepeatMessage } = useTextChat();

  const [attachments, setAttachments] = useState<File[]>([]);
  const composerAttachments = useComposerStore((s) => s.assetAttachments);
  const clearComposerAttachments = useComposerStore((s) => s.clearAssetAttachments);
  const removeComposerAttachment = useComposerStore((s) => s.removeAssetAttachment);
  const currentAgent = useAgentStore((s) => s.currentAgent);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const promptSuggestions = useMemo(
    () => [
      "What can you do?",
      "Summarize the last reply",
      "Explain step by step",
      "Give me an example",
    ],
    [],
  );

  // Provide a demo JSX message if there are no messages yet
  const baseMessages = useMemo(() => {
    if (messages && messages.length > 0) return messages;
    const demo: MessageType = {
      id: "demo-jsx-1",
      sender: MessageSender.AVATAR,
      content: "Here is a PromptKit-like stat rendered via JSX.",
      jsx: '<div class="flex items-center gap-2"><StatBadge label="Tokens" value="1,234" hint="used" /><StatBadge label="Latency" value="142ms" /></div>',
      sources: [
        {
          href: "#",
          title: "PromptKit Example",
          description: "Demo component rendered in chat via JSX.",
        },
      ],
    };
    return [demo];
  }, [messages]);

  // Adjacent de-duplication by id + content to avoid rendering repeated messages
  const dedupedMessages = useMemo(() => {
    const out: MessageType[] = [];
    let prevKey: string | null = null;
    for (const m of baseMessages) {
      const key = `${m.id}|${m.content}`;
      if (key !== prevKey) {
        out.push(m);
      }
      prevKey = key;
    }
    if (out.length !== baseMessages.length) {
      console.debug("[Chat] deduped messages", {
        before: baseMessages.length,
        after: out.length,
      });
    }
    return out;
  }, [baseMessages]);

  // Always append a mock JSX message at the end of the thread (demo)
  const augmentedMessages = useMemo(() => {
    const contentLines = [
      `
# \`CodeBlock\` Component

A component for displaying code snippets with syntax highlighting and customizable styling.

---

## ✨ Features

- Syntax highlighting for multiple languages (powered by [Shiki](https://shiki.matsu.io/))
- Support for headers, actions, tabs, and file names
- Easily switch themes (e.g. \`github-dark\`, \`nord\`, \`dracula\`)
- Integrates with Markdown, with prose-safe styles

---

## 🚀 Examples

### Basic Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Call the function
greet("World");
\`\`\`

---

### Code Block with Header

You can use \`CodeBlockGroup\` to add a header with metadata and actions to your code blocks.

\`\`\`tsx file=Counter.tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

---

### Tabs (Multiple Files)

\`\`\`tabs
--- app/page.tsx
import { Button } from "@/components/ui/button";
export default function Page() {
  return <Button>Click</Button>
}
--- app/layout.tsx
export default function Layout({ children }) {
  return <html><body>{children}</body></html>
}
\`\`\`

---

### Different Languages

You can highlight code in various languages by changing the \`language\` prop.

#### Python Example

\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Generate the first 10 Fibonacci numbers
for number in fibonacci(10):
    print(number)
\`\`\`

#### CSS Example

\`\`\`css
.button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.button:hover {
  background-color: #45a049;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
\`\`\`

---

### Different Themes

Shiki supports many popular themes. Here are some examples:

#### GitHub Dark Theme

\`\`\`javascript theme=github-dark
function calculateTotal(items) {
  return items
    .filter(item => item.price > 0)
    .reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
}
\`\`\`

#### Nord Theme

\`\`\`javascript theme=nord
function calculateTotal(items) {
  return items
    .filter(item => item.price > 0)
    .reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
}
\`\`\`

---

## 📦 Installation

\`\`\`bash
npx shadcn add "https://prompt-kit.com/c/code-block.json"
\`\`\`

---

## 🧩 Component API

### \`<CodeBlock>\`

| Prop      | Type                              | Default | Description                |
| --------- | --------------------------------- | ------- | -------------------------- |
| children  | \`React.ReactNode\`               |         | Child components to render |
| className | \`string\`                        |         | Additional CSS classes     |
| ...props  | \`React.HTMLProps<HTMLDivElement>\` |         | All other div props        |

### \`<CodeBlockCode>\`

| Prop      | Type                              | Default        | Description                          |
| --------- | --------------------------------- | -------------- | ------------------------------------ |
| code      | \`string\`                        |                | The code to display and highlight    |
| language  | \`string\`                        | \`"tsx"\`      | The language for syntax highlighting |
| theme     | \`string\`                        | \`"github-light"\` | The theme for syntax highlighting |
| className | \`string\`                        |                | Additional CSS classes               |
| ...props  | \`React.HTMLProps<HTMLDivElement>\` |                | All other div props                  |

### \`<CodeBlockGroup>\`

| Prop      | Type                                     | Default | Description                |
| --------- | ---------------------------------------- | ------- | -------------------------- |
| children  | \`React.ReactNode\`                      |         | Child components to render |
| className | \`string\`                               |         | Additional CSS classes     |
| ...props  | \`React.HTMLAttributes<HTMLDivElement>\` |         | All other div props        |

---

## 📝 Usage with Markdown

The \`CodeBlock\` component is used internally by the \`Markdown\` component to render code blocks in markdown content. When used within the \`Markdown\` component, code blocks are automatically wrapped with the \`not-prose\` class to prevent conflicts with prose styling.

\`\`\`tsx
import { Markdown } from "@/components/prompt-kit/markdown"

function MyComponent() {
  const markdownContent = \`
# Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`
\`

  return <Markdown className="prose">{markdownContent}</Markdown>
}
\`\`\`

---
      `.trim(),
    ];
    return [{ ...baseMessages[0], content: contentLines.join("\n") }];
  }, [baseMessages]);
    // Build prose-only (no fenced code) and code-only (only fenced code) variants
    const prose: string[] = [];
    const codeOnly: string[] = [];
    let inFence = false;
    let buffer: string[] = [];
    const flushBufferTo = (arr: string[]) => {
      if (buffer.length) {
        arr.push(...buffer);
        buffer = [];
      }
    };
    for (const line of contentLines) {
      if (line.startsWith('```')) {
        // toggle fence
        buffer.push(line);
        if (!inFence) {
          inFence = true;
        } else {
          inFence = false;
        }
        // when closing a fence, dump buffer into codeOnly
        if (!inFence) {
          flushBufferTo(codeOnly);
        }
        continue;
      }
      if (inFence) {
        buffer.push(line);
      } else {
        // prose path
        prose.push(line);
      }
    }
    // safety in case of unclosed fence
    if (buffer.length) flushBufferTo(codeOnly);

    const contentMd = prose.join('\n');
    const contentCodeOnly = codeOnly.join('\n');

    const mockMarkdownOnly: MessageType = {
      id: "demo-markdown-only",
      sender: MessageSender.AVATAR,
      content: contentMd,
    };
    const mockCodeOnly: MessageType = {
      id: "demo-code-only",
      sender: MessageSender.AVATAR,
      content: contentCodeOnly,
    };
    const mockJsxOnly: MessageType = {
      id: "demo-jsx-only",
      sender: MessageSender.AVATAR,
      content: 'Live stats rendered via JSX:',
      jsx: '<div class="flex items-center gap-2"><StatBadge label="Accuracy" value="98%" /><StatBadge label="Score" value="A" hint="model" /></div>',
    };
    return [...dedupedMessages, mockMarkdownOnly, mockCodeOnly, mockJsxOnly];
  }, [dedupedMessages]);

  const onFilesAdded = (files: File[]) => {
    if (files.length) {
      console.debug("[Chat] onFilesAdded", { count: files.length, names: files.map((f) => f.name) });
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const sendWithAttachments = (text: string) => {
    console.debug("[Chat] sendWithAttachments invoked", {
      textLength: (text ?? "").length,
      hasFiles: attachments.length > 0,
      fileCount: attachments.length,
      composerCount: composerAttachments.length,
    });
    const trimmed = (text ?? "").trim();

    if (!trimmed && attachments.length === 0 && composerAttachments.length === 0) {
      return;
    }

    const parts: string[] = [];
    if (attachments.length) {
      parts.push(formatAttachmentSummary(attachments));
    }
    const suffix = parts.length ? `\n\n[Attachments: ${parts.join(", ")}]` : "";

    // Build structured assets from composer attachments
    const assets: MessageAsset[] | undefined = composerAttachments.length
      ? composerAttachments.map((a) => ({
          id: a.id,
          name: a.name,
          url: a.url,
          thumbnailUrl: a.thumbnailUrl,
          mimeType: a.mimeType,
        }))
      : undefined;

    console.debug("[Chat] built outgoing payload", {
      text: `${trimmed}${suffix}`,
      assets,
    });

    onSendMessage(`${trimmed}${suffix}`, assets);
    console.debug("[Chat] onSendMessage called; clearing attachments");
    setAttachments([]);
    clearComposerAttachments();
    onChatInputChange("");
  };

  const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);
  const [voteState, setVoteState] = useState<
    Record<string, "up" | "down" | null>
  >({});

  const [isEditing, setIsEditing] = useState(false);
  const [inputBackup, setInputBackup] = useState<string>("");

  // Branch dialog state
  const [branchOpen, setBranchOpen] = useState(false);
  const [branchMsgId, setBranchMsgId] = useState<string | null>(null);
  const [branchMsgContent, setBranchMsgContent] = useState<string>("");
  const [branchAction, setBranchAction] = useState<string>("Act on this response");

  // Compare dialog state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareForId, setCompareForId] = useState<string | null>(null);
  const [compareOriginal, setCompareOriginal] = useState<string>("");
  const [compareAlternative, setCompareAlternative] = useState<string | undefined>(undefined);
  const [isGeneratingAlt, setIsGeneratingAlt] = useState(false);
  const [avatarMsgCountAtStart, setAvatarMsgCountAtStart] = useState<number>(0);

  // Track ChatInput height to prevent message overlap
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const [inputHeight, setInputHeight] = useState<number>(0);

  useEffect(() => {
    const el = inputWrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        setInputHeight(Math.ceil(h));
      }
    });
    ro.observe(el);
    // Initialize immediately
    setInputHeight(Math.ceil(el.getBoundingClientRect().height));
    return () => ro.disconnect();
  }, []);

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setLastCopiedId(id);
      setTimeout(() => {
        setLastCopiedId((prev) => (prev === id ? null : prev));
      }, 1500);
      console.debug("[Chat] message copied", { id });
      onCopy(content);
      publish({ description: "Message copied to clipboard.", title: "Copied" });
    } catch (e) {
      console.error("[Chat] copy failed", e);
      publish({
        description: "Could not copy to clipboard.",
        duration: 4000,
        title: "Copy failed",
      });
    }
  };

  const setVote = (id: string, dir: "up" | "down") => {
    setVoteState((prev) => {
      const current = prev[id] ?? null;
      const next = current === dir ? null : dir;

      console.debug("[Chat] vote", { direction: next, id });

      return { ...prev, [id]: next };
    });
  };

  const handleEditToInput = (content: string) => {
    if (!isEditing) {
      setInputBackup(chatInput);
    }

    setIsEditing(true);
    onChatInputChange(content);

    // Defer focus and caret placement until after the DOM updates with new value
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    onChatInputChange(inputBackup);
  };

  const confirmEdit = () => {
    const text = chatInput ?? "";
    console.debug("[Chat] confirmEdit", { textLength: text.length });
    sendWithAttachments(text);
    setIsEditing(false);
    onChatInputChange("");
    publish({ description: "Edited message sent.", title: "Edited" });
  };

  // Branch the selected AI message via modal
  const handleBranch = (content: string, id: string) => {
    if (!currentAgent) {
      publish({
        title: "No agent selected",
        description: "Pick an agent before branching.",
        duration: 3500,
      });
      return;
    }
    setBranchMsgId(id);
    setBranchMsgContent(content);
    setBranchAction("Act on this response");
    setBranchOpen(true);
  };

  const confirmBranch = () => {
    if (!branchMsgId || !currentAgent) return;
    const action = (branchAction ?? "").trim();
    if (!action) {
      publish({ title: "Branch cancelled", description: "No action provided." });
      return;
    }
    const header = `@agent:${currentAgent.name ?? currentAgent.id ?? "agent"}`;
    const text = `${header}\nAction: ${action}\n\nContext (from AI):\n> ${branchMsgContent.replaceAll("\n", "\n> ")}`;
    console.debug("[Chat] branch -> agent", { agent: currentAgent.name, id: branchMsgId, actionLength: action.length });
    apiSendMessage(text);
    publish({ title: "Branched to agent", description: currentAgent.name ?? "Agent" });
    setBranchOpen(false);
  };

  // Retry: re-send the previous user message before this AI message
  const handleRetry = (id: string) => {
    const idx = dedupedMessages.findIndex((m) => m.id === id);
    if (idx <= 0) return;
    for (let i = idx - 1; i >= 0; i--) {
      const m = dedupedMessages[i];
      if (m.sender === MessageSender.CLIENT) {
        console.debug("[Chat] retry", { forMessageId: id, usingUserMessageId: m.id });
        // Prefer API repeat when available
        apiRepeatMessage(m.content);
        publish({ title: "Retrying", description: "Regenerating response..." });
        return;
      }
    }
  };

  // Compare: open modal and trigger generating an alternative
  const handleCompare = (content: string, id: string) => {
    setCompareOpen(true);
    setCompareForId(id);
    setCompareOriginal(content);
    setCompareAlternative(undefined);
    setIsGeneratingAlt(true);
    // Track current avatar message count; when a new one arrives, capture as alternative
    const currentAvatarCount = dedupedMessages.filter((m) => m.sender === MessageSender.AVATAR).length;
    setAvatarMsgCountAtStart(currentAvatarCount);
    const prompt = `Provide an alternative to the following assistant message. Do not include commentary, only the alternative.\n\n---\n${content}`;
    apiSendMessage(prompt);
  };

  // Watch for a new avatar message after starting comparison to populate alternative
  useEffect(() => {
    if (!compareOpen || !isGeneratingAlt) return;
    const avatarMsgs = dedupedMessages.filter((m) => m.sender === MessageSender.AVATAR);
    if (avatarMsgs.length > avatarMsgCountAtStart) {
      const latest = avatarMsgs[avatarMsgs.length - 1];
      setCompareAlternative(latest.content);
      setIsGeneratingAlt(false);
    }
  }, [dedupedMessages, compareOpen, isGeneratingAlt, avatarMsgCountAtStart]);

  const handleChooseComparison = (choice: "A" | "B") => {
    const chosen = choice === "A" ? compareOriginal : (compareAlternative ?? "");
    if (!chosen) return;
    onSendMessage(`Chosen option ${choice}:\n\n${chosen}`);
    publish({ title: "Choice sent", description: `Picked ${choice}` });
    setCompareOpen(false);
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      {!inputOnly && (
        <StickToBottom className="flex-1 min-h-0 text-foreground">
          {/* Dynamically pad bottom by input height to avoid overlap */}
          <ChatContainerRoot
            className="flex-1 min-h-0 text-foreground"
            style={{ paddingBottom: Math.max(16, inputHeight + 8) }}
          >
            <ChatContainerContent>
              {augmentedMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  handleCopy={handleCopy}
                  handleEditToInput={handleEditToInput}
                  onBranch={handleBranch}
                  onRetry={(mid) => handleRetry(mid)}
                  onCompare={(content, mid) => handleCompare(content, mid)}
                  isStreaming={
                    isAvatarTalking && message.sender === MessageSender.AVATAR
                  }
                  lastCopiedId={lastCopiedId}
                  message={message}
                  setVote={setVote}
                  streamMode="typewriter"
                  streamSpeed={28}
                  voteState={voteState}
                />
              ))}
              {isAvatarTalking && (
                <Message className="flex gap-2 items-start">
                  <MessageAvatar alt="Avatar" fallback="A" src="/heygen-logo.png" />
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-xs text-muted-foreground">Avatar</p>
                    <div className="prose break-words whitespace-normal rounded-lg bg-secondary p-2 text-sm text-foreground">
                      <div className="py-1">
                        <Loader variant="typing" />
                      </div>
                    </div>
                  </div>
                </Message>
              )}
            </ChatContainerContent>
            <ChatContainerScrollAnchor />
            <div className="absolute bottom-4 right-4">
              <ScrollButton className="shadow-sm" />
            </div>
          </ChatContainerRoot>
        </StickToBottom>
      )}
      {/* Ensure input section never shrinks and visually docks under messages */}
      <div
        ref={inputWrapRef}
        className="shrink-0 border-t border-border pt-3 bg-background"
      >
        {/* Branch Dialog */}
        <BranchDialog
          open={branchOpen}
          onOpenChange={setBranchOpen}
          messageContent={branchMsgContent}
          agentName={currentAgent?.name}
          actionText={branchAction}
          onActionTextChange={setBranchAction}
          onConfirm={confirmBranch}
        />

        {/* Compare Dialog */}
        <CompareDialog
          open={compareOpen}
          onOpenChange={setCompareOpen}
          original={compareOriginal}
          alternative={compareAlternative}
          isGenerating={isGeneratingAlt}
          onChoose={handleChooseComparison}
        />
        <ChatInput
          attachments={attachments}
          composerAttachments={composerAttachments}
          cancelEdit={cancelEdit}
          chatInput={chatInput}
          confirmEdit={confirmEdit}
          inputRef={inputRef}
          isEditing={isEditing}
          isSending={isSending}
          isVoiceChatActive={isVoiceChatActive}
          isVoiceChatLoading={isVoiceChatLoading}
          promptSuggestions={promptSuggestions}
          removeAttachment={removeAttachment}
          removeComposerAttachment={removeComposerAttachment}
          sendWithAttachments={sendWithAttachments}
          onChatInputChange={onChatInputChange}
          onFilesAdded={onFilesAdded}
          onStartVoiceChat={onStartVoiceChat}
          onStopVoiceChat={onStopVoiceChat}
        />
      </div>
    </div>
  );
}
