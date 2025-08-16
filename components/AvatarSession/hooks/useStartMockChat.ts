import { useMemoizedFn } from "ahooks";

export function useStartMockChat(args: {
  dock: "right" | "bottom" | "floating";
  expanded: boolean;
  setDock: (mode: "right" | "bottom" | "floating") => void;
  setBottomSize: (pct: number) => void;
  toggleExpand: () => void;
  enableMockChatUi: () => void;
}) {
  const {
    dock,
    expanded,
    setDock,
    setBottomSize,
    toggleExpand,
    enableMockChatUi,
  } = args;

  const startMockChat = useMemoizedFn(() => {
    if (dock !== "bottom") setDock("bottom");
    enableMockChatUi();

    if (dock === "bottom") {
      if (!expanded) {
        toggleExpand();
      } else {
        setBottomSize(100);
      }
    } else {
      setBottomSize(100);
    }
  });

  return startMockChat;
}
