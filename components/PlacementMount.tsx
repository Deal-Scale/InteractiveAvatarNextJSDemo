"use client";

import React from "react";
import { usePlacementStore } from "@/lib/stores/placement";
import { BottomTab } from "@/components/ui/bottom-tab";
import { BottomChat } from "@/components/BottomChat";

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
        <BottomChat />
      </BottomTab>
    </>
  );
}
