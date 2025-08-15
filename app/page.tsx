"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import Sidebar from "@/components/Sidebar";

export default function App() {
  return (
    <div className="w-full h-full flex flex-row overflow-hidden">
      <Sidebar />
      <div className="flex-1">
        <InteractiveAvatar />
      </div>
    </div>
  );
}
