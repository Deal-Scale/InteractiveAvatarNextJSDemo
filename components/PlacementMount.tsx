"use client";

import React from "react";
import { usePlacementStore } from "@/lib/stores/placement";
import { BottomTab } from "@/components/ui/bottom-tab";
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";

export default function PlacementMount() {
  const setDockMode = usePlacementStore((s) => s.setDockMode);
  const setBottomHeightFrac = usePlacementStore((s) => s.setBottomHeightFrac);
  React.useEffect(() => {
    // Ensure bottom mode and start collapsed so the BottomTab is visible.
    setDockMode("bottom");
    setBottomHeightFrac(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <BottomTab label="Chat">
        <div className="flex h-full w-full flex-col">
          <ChatContainerRoot className="flex-1 min-h-0">
            <ChatContainerContent>
              <div className="p-3 text-sm text-muted-foreground">Chat content goes here.</div>
              <ChatContainerScrollAnchor />
            </ChatContainerContent>
          </ChatContainerRoot>
        </div>
      </BottomTab>
    </>
  );
}
