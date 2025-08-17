"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageContent: string;
  agentName?: string | null;
  actionText: string;
  onActionTextChange: (v: string) => void;
  onConfirm: () => void;
}

export const BranchDialog: React.FC<BranchDialogProps> = ({
  open,
  onOpenChange,
  messageContent,
  agentName,
  actionText,
  onActionTextChange,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Branch to agent{agentName ? `: ${agentName}` : ""}</DialogTitle>
          <DialogDescription>
            Provide an action for the agent. The original AI response is shown for context.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-h-[160px] rounded-md border bg-muted p-2 text-sm overflow-auto">
            <p className="font-medium mb-1">Original AI response</p>
            <pre className="whitespace-pre-wrap break-words text-foreground/90">{messageContent}</pre>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Action prompt for agent</label>
            <Textarea
              value={actionText}
              onChange={(e) => onActionTextChange(e.target.value)}
              placeholder="Describe what the agent should do with this response"
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Be specific about desired output. You can ask the agent to propose two alternatives labeled A and B for easier comparison.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Send to agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
