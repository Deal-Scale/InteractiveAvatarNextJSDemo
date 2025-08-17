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

export interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  original: string;
  alternative?: string;
  isGenerating?: boolean;
  onChoose: (choice: "A" | "B") => void;
}

export const CompareDialog: React.FC<CompareDialogProps> = ({
  open,
  onOpenChange,
  leftLabel = "A",
  rightLabel = "B",
  original,
  alternative,
  isGenerating,
  onChoose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Compare responses</DialogTitle>
          <DialogDescription>
            Review two alternatives side-by-side and pick the better one.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-h-[220px] rounded-md border bg-muted p-2 text-sm overflow-auto">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Option {leftLabel}</div>
            <pre className="whitespace-pre-wrap break-words text-foreground/90">{original}</pre>
          </div>
          <div className="min-h-[220px] rounded-md border bg-muted p-2 text-sm overflow-auto">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Option {rightLabel}</div>
            {alternative ? (
              <pre className="whitespace-pre-wrap break-words text-foreground/90">{alternative}</pre>
            ) : (
              <div className="text-sm text-muted-foreground">
                {isGenerating ? "Generating alternative..." : "No alternative yet."}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button disabled={!original} onClick={() => onChoose("A")}>Choose A</Button>
          <Button disabled={!alternative} onClick={() => onChoose("B")}>Choose B</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
