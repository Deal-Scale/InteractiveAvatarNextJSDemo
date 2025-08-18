import { Message as MessageType, MessageSender } from "@/lib/types";
import { exampleReasoning } from "../_mock_data/example-reasoning";
import { exampleTools } from "../_mock_data/example-tools";
import { exampleMultiCode } from "../_mock_data/example-multi-code";
import { exampleMarkdownCode } from "../_mock_data/example-markdown-code";
import { exampleSource } from "../_mock_data/example-source";
import { exampleJsxPreview } from "../_mock_data/example-jsx-preview";
import { exampleMermaid } from "../_mock_data/example-mermaid";

export function buildBaseMessagesIfEmpty(messages: MessageType[]): MessageType[] {
  if (messages && messages.length > 0) return messages;
  const demo: MessageType = {
    id: "demo-jsx-1",
    sender: MessageSender.AVATAR,
    content: "Here is a PromptKit-like stat rendered via JSX.",
    jsx: '<div class="flex items-center gap-2"><StatBadge label="Tokens" value="1,234" hint="used" /><StatBadge label="Latency" value="142ms" /></div>',
    sources: [
      { href: "#", title: "PromptKit Example", description: "Demo component rendered in chat via JSX." },
    ],
  };
  return [demo];
}

export function dedupeAdjacent(messages: MessageType[]): MessageType[] {
  const out: MessageType[] = [];
  let prevKey: string | null = null;
  for (const m of messages) {
    const key = `${m.id}|${m.content}`;
    if (key !== prevKey) out.push(m);
    prevKey = key;
  }
  return out;
}

export function buildAugmentedMessages(deduped: MessageType[]): MessageType[] {
  const showExtras = (globalThis as any)?.process?.env?.NEXT_PUBLIC_SHOW_EXTRA_DEMOS === "true";
  const contentMd = String.raw`# \`CodeBlock\` Component

A powerful, composable code display component with syntax highlighting, theming, copy-to-clipboard, headers, tabs, and Markdown support.

---

## 🚀 Features

- Syntax highlighting via [Shiki](https://github.com/shikijs/shiki) (or Prism)
- Multiple language support (\`js\`, \`tsx\`, \`python\`, \`css\`, etc.)
- Copy-to-clipboard button
- Headers and metadata
- Tabs for multi-file/code previews
- Custom themes (GitHub Light/Dark, Nord, Dracula, etc.)
- Tailwind \`not-prose\` compatibility
- Used by the \`Markdown\` component for code blocks

---

## 👨‍💻 Usage Examples

### Basic

~~~tsx
import { CodeBlock } from "@/components/prompt-kit/code-block";

<CodeBlock
  code={
"function greet(name) {\n" +
"  return \"Hello, " + "name" + "!\";\n" +
"}\n" +
"// Call the function\n" +
"greet(\"World\");"
  }
  language="javascript"
/>
~~~

---

### With Header

~~~tsx
import { CodeBlockGroup } from "@/components/prompt-kit/code-block-group";

<CodeBlockGroup header="Counter Example">
  <CodeBlock
    filename="Counter.tsx"
    code={
      "import { useState } from 'react';\n" +
      "\n" +
      "function Counter() {\n" +
      "  const [count, setCount] = useState(0);\n" +
      "  return (\n" +
      "    <div>\n" +
      "      <p>You clicked {count} times</p>\n" +
      "      <button onClick={() => setCount(count + 1)}>Click me</button>\n" +
      "    </div>\n" +
      "  );\n" +
      "}"
    }
    language="tsx"
  />
</CodeBlockGroup>
~~~

---

### Tabs

~~~tsx
<CodeBlock
  tabs={[
    { name: "App.js", code: "console.log('Hello')", language: "js" },
    { name: "styles.css", code: ".button { color: blue; }", language: "css" },
  ]}
/>
~~~

---

### Languages

#### Python

~~~python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

for number in fibonacci(10):
    print(number)
~~~

#### CSS

~~~css
.button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.button:hover {
  background-color: #45a049;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
~~~

---

### Themes

~~~js {theme="github-dark"}
function calculateTotal(items) {
  return items
    .filter(item => item.price > 0)
    .reduce((total, item) => total + item.price * item.quantity, 0);
}
~~~

~~~js {theme="nord"}
function calculateTotal(items) {
  return items
    .filter(item => item.price > 0)
    .reduce((total, item) => total + item.price * item.quantity, 0);
}
~~~

---

### Markdown Integration

~~~md
~~~tsx
// This block is rendered by the Markdown component!
function MyComponent() {
  return <div>Hello from Markdown!</div>;
}
~~~
~~~

---

## 🛠️ Installation

~~~bash
npx shadcn add "https://prompt-kit.com/c/code-block.json"
npm install shiki
~~~`;

  const contentLines = contentMd.split('\n');
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
    if (line.startsWith('```') || line.startsWith('~~~')) {
      buffer.push(line);
      if (!inFence) inFence = true; else inFence = false;
      if (!inFence) flushBufferTo(codeOnly);
      continue;
    }
    if (inFence) buffer.push(line); else prose.push(line);
  }
  if (buffer.length) flushBufferTo(codeOnly);

  const contentMdProse = prose.join('\n');
  const contentCodeOnly = codeOnly.join('\n');

  const mockMarkdownOnly: MessageType = {
    id: "demo-markdown-only",
    sender: MessageSender.AVATAR,
    content: contentMdProse,
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

  const result: MessageType[] = [
    ...deduped,
    exampleReasoning.message,
    exampleTools.message,
    exampleMultiCode.message,
    exampleMarkdownCode.message,
    exampleSource.message,
    exampleJsxPreview.message,
    exampleMermaid.message,
  ];
  if (showExtras) result.push(mockMarkdownOnly, mockCodeOnly, mockJsxOnly);
  return result;
}
