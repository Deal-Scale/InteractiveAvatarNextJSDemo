"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import Sidebar from "@/components/Sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export default function App() {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  return (
    <SidebarProvider>
      <div className="w-full h-full flex flex-row overflow-hidden">
        <Sidebar onSelect={(c) => setSelectedTitle(c.title)} />
        <SidebarInset>
          <div className="flex h-full flex-col">
            <header className="bg-background z-10 flex h-14 w-full shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="text-foreground">
                {selectedTitle ?? "Select a conversation"}
              </div>
            </header>
            <div className="flex-1 min-h-0">
              <InteractiveAvatar />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
