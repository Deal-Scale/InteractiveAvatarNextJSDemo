"use client";

import React, { createContext, useContext, useState } from "react";

// Basic provider to manage open/close state for a collapsible sidebar
type SidebarCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Persist open state for better UX between reloads
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const v = window.localStorage.getItem("ui.sidebar.open");
      return v === null ? true : v === "1";
    } catch {
      return true;
    }
  });
  const setAndPersist = (v: boolean) => {
    setOpen(v);
    try {
      window.localStorage.setItem("ui.sidebar.open", v ? "1" : "0");
    } catch {}
  };
  return <Ctx.Provider value={{ open, setOpen: setAndPersist }}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

export function SidebarTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { open, setOpen } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      aria-pressed={open}
      className={className}
      onClick={() => setOpen(!open)}
    >
      {children ?? (
        // Simple hamburger fallback
        <div className="flex flex-col gap-0.5">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </div>
      )}
    </button>
  );
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  // Container next to sidebar area
  return <div className="flex-1 min-w-0">{children}</div>;
}

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { open } = useSidebar();
  return (
    <aside
      role="navigation"
      aria-label="Primary"
      data-state={open ? "open" : "collapsed"}
      className={
        "group/sidebar bg-gray-800 text-white transition-[width] duration-200 " +
        (open ? "w-[320px] border-r border-zinc-700" : "w-0 border-r-0")
      }
    >
      <div className="flex h-full flex-col gap-4 py-4 max-h-full overflow-y-auto px-2 group-data-[state=collapsed]/sidebar:hidden">
        {children}
      </div>
    </aside>
  );
}

export function SidebarHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`shrink-0 ${className}`}>{children}</div>;
}

export function SidebarContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex-1 min-h-0 ${className}`}>{children}</div>;
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-2">{children}</div>;
}

export function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2 pb-1 text-xs uppercase tracking-wide text-zinc-400">{children}</div>;
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col gap-0.5">{children}</ul>;
}

export function SidebarMenuButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left rounded-md px-3 py-2 hover:bg-zinc-700/70 ${className}`}
      >
        {children}
      </button>
    </li>
  );
}

export function SidebarFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-auto shrink-0 ${className}`}>{children}</div>;
}
