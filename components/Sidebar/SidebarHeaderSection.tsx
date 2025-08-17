"use client";

import React from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import HeaderActionsStack from "@/components/Sidebar/HeaderActionsStack";

type Props = {
  onAssetsClick: () => void;
  query: string;
  setQuery: (v: string) => void;
};

const SidebarHeaderSection: React.FC<Props> = ({
  onAssetsClick,
  query,
  setQuery,
}) => {
  return (
    <div className="flex flex-col gap-2 px-2 py-2">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-2 px-2">
          <div className="bg-primary/10 size-8 rounded-md" />
          <div className="text-md font-medium tracking-tight text-foreground group-data-[state=collapsed]/sidebar:hidden">
            zola.chat
          </div>
        </div>
        <HeaderActionsStack onAssetsClick={onAssetsClick} />
      </div>

      <div className="px-2 group-data-[state=collapsed]/sidebar:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-8 text-sm bg-background text-foreground placeholder:text-muted-foreground border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SidebarHeaderSection;
