"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import Sidebar from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function App() {
  return (
    <SidebarProvider>
      <div className="w-full h-full flex flex-row overflow-hidden">
        <Sidebar onSelect={() => {}} />
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
