import { useState } from "react";
import { useAgentStore } from "@/lib/stores/agent";
import { useToast } from "@/components/ui/toaster";
import { useTextChat } from "@/components/logic/useTextChat";

export function useBranching() {
  const { publish } = useToast();
  const currentAgent = useAgentStore((s) => s.currentAgent);
  const { sendMessage: apiSendMessage } = useTextChat();

  const [branchOpen, setBranchOpen] = useState(false);
  const [branchMsgId, setBranchMsgId] = useState<string | null>(null);
  const [branchMsgContent, setBranchMsgContent] = useState<string>("");
  const [branchAction, setBranchAction] = useState<string>("Act on this response");

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

  return {
    state: { branchOpen, branchMsgContent, branchAction },
    setBranchOpen,
    setBranchAction,
    handleBranch,
    confirmBranch,
    agentName: currentAgent?.name,
  } as const;
}
