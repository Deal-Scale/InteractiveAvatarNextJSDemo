"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ToastItem = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: { label: string; onClick: () => void } | null;
  duration?: number; // ms
  type?: "foreground" | "background";
};

type ToastContextType = {
  publish: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idSeq = useRef(0);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const publish = useCallback((t: Omit<ToastItem, "id">) => {
    const id = `t_${Date.now()}_${idSeq.current++}`;
    const duration = t.duration ?? 3000;
    setItems((prev) => [...prev, { id, duration, ...t }]);
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const value = useMemo(() => ({ publish, dismiss }), [publish, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function Toaster({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[90vw] flex-col gap-2"
      role="region"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-lg border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur",
            "text-sm"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              {t.title && <div className="font-medium leading-5">{t.title}</div>}
              {t.description && (
                <div className={cn("mt-0.5 text-muted-foreground leading-5")}>{t.description}</div>
              )}
              {t.action && (
                <div className="mt-2">
                  <Button size="sm" variant="secondary" onClick={t.action.onClick}>
                    {t.action.label}
                  </Button>
                </div>
              )}
            </div>
            <button
              aria-label="Dismiss notification"
              className="rounded-md p-1 hover:bg-foreground/10"
              onClick={() => onDismiss(t.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
