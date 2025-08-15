import React from "react";

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="flex flex-col gap-4 w-[550px] py-8 max-h-full overflow-y-auto px-4 bg-gray-800 text-white">
      {children}
    </div>
  );
}
