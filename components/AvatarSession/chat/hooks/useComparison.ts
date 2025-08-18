import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toaster";
import { Message, MessageSender } from "@/lib/types";
import { useTextChat } from "@/components/logic/useTextChat";

export function useComparison(messages: Message[]) {
  const { publish } = useToast();
  const { sendMessage: apiSendMessage } = useTextChat();

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareForId, setCompareForId] = useState<string | null>(null);
  const [compareOriginal, setCompareOriginal] = useState<string>("");
  const [compareAlternative, setCompareAlternative] = useState<string | undefined>(
    undefined,
  );
  const [isGeneratingAlt, setIsGeneratingAlt] = useState(false);
  const [avatarMsgCountAtStart, setAvatarMsgCountAtStart] = useState<number>(0);

  const handleCompare = (content: string, id: string) => {
    setCompareOpen(true);
    setCompareForId(id);
    setCompareOriginal(content);
    setCompareAlternative(undefined);
    setIsGeneratingAlt(true);
    const currentAvatarCount = messages.filter((m) => m.sender === MessageSender.AVATAR)
      .length;
    setAvatarMsgCountAtStart(currentAvatarCount);
    const prompt = `Provide an alternative to the following assistant message. Do not include commentary, only the alternative.\n\n---\n${content}`;
    apiSendMessage(prompt);
  };

  // Watch for a new avatar message after starting comparison to populate alternative
  useEffect(() => {
    if (!compareOpen || !isGeneratingAlt) return;
    const avatarMsgs = messages.filter((m) => m.sender === MessageSender.AVATAR);
    if (avatarMsgs.length > avatarMsgCountAtStart) 
    {
      const latest = avatarMsgs[avatarMsgs.length - 1];
      setCompareAlternative(latest.content);
      setIsGeneratingAlt(false);
    }
  }, [messages, compareOpen, isGeneratingAlt, avatarMsgCountAtStart]);

  const handleChooseComparison = (choice: "A" | "B") => {
    const chosen = choice === "A" ? compareOriginal : compareAlternative ?? "";
    if (!chosen) return;
    publish({ title: "Choice sent", description: `Picked ${choice}` });
    // Upstream Chat will decide how to send; expose chosen value by returning it
    return chosen;
  };

  return {
    state: {
      compareOpen,
      compareOriginal,
      compareAlternative,
      isGeneratingAlt,
    },
    setCompareOpen,
    handleCompare,
    handleChooseComparison,
  } as const;
}
