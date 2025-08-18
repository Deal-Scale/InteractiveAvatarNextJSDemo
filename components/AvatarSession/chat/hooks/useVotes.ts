import { useState } from "react";

export function useVotes() {
  const [voteState, setVoteState] = useState<Record<string, "up" | "down" | null>>({});

  const setVote = (id: string, dir: "up" | "down") => {
    setVoteState((prev) => {
      const current = prev[id] ?? null;
      const next = current === dir ? null : dir;
      return { ...prev, [id]: next };
    });
  };

  return { voteState, setVote } as const;
}
