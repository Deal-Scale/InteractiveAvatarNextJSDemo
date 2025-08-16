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
           
            <div className="flex-1 min-h-0">
              <InteractiveAvatar />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
