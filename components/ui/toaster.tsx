"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";

import { cn, safeWindow } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ToastItem = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: { label: string; onClick: () => void } | null;
  duration?: number; // ms
  type?: "foreground" | "background";
  variant?: "default" | "success" | "error" | "warning" | "loading" | "custom";
  emoji?: React.ReactNode;
  color?: string; // for custom variant, tailwind color class or css color value
  persist?: boolean; // if true, do not auto-dismiss; caller must dismiss/update
  progress?: number | null; // 0..1 for determinate progress; null for indeterminate
};

type ToastPatch = Partial<Omit<ToastItem, "id">>;

type ToastContextType = {
  publish: (t: Omit<ToastItem, "id">) => string; // returns id for async flows
  update: (id: string, patch: ToastPatch) => void;
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
  const timers = useRef<Map<string, number>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const m = timers.current;
    const h = m.get(id);

    if (h) {
      const w = safeWindow();

      if (w) w.clearTimeout(h);
      m.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [clearTimer],
  );

  const publish = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = `t_${Date.now()}_${idSeq.current++}`;
      const duration = t.duration ?? 3000;
      const persist = !!t.persist;

      setItems((prev) => [
        ...prev,
        { id, duration, persist, progress: t.progress ?? null, ...t },
      ]);
      if (duration > 0 && !persist) {
        const w = safeWindow();

        if (w) {
          const h = w.setTimeout(() => dismiss(id), duration);

          timers.current.set(id, h);
        }
      }

      return id;
    },
    [dismiss],
  );

  const update = useCallback(
    (id: string, patch: ToastPatch) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      );
      const duration = patch.duration ?? undefined;
      const persist = patch.persist ?? undefined;

      if (duration !== undefined || persist !== undefined) {
        // reset timer according to latest flags
        clearTimer(id);
        const itemsNow = items; // may be stale but sufficient to respect new duration/persist immediately
        const target = itemsNow.find((x) => x.id === id);
        const willPersist = persist ?? target?.persist ?? false;
        const dur = duration ?? target?.duration ?? 3000;

        if (dur > 0 && !willPersist) {
          const w = safeWindow();

          if (w) {
            const h = w.setTimeout(() => dismiss(id), dur);

            timers.current.set(id, h);
          }
        }
      }
    },
    [clearTimer, dismiss, items],
  );

  const value = useMemo(
    () => ({ publish, update, dismiss }),
    [publish, update, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster items={items} onDismiss={dismiss} />
      <ToastBridge />
    </ToastContext.Provider>
  );
}

function ToastCard({
  t,
  onDismiss,
}: {
  t: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [start, setStart] = useState(false);
  const duration = t.duration ?? 3000;

  useEffect(() => {
    // kick off progress animation on mount
    const raf = requestAnimationFrame(() => setStart(true));

    return () => cancelAnimationFrame(raf);
  }, []);

  const preset = useMemo(() => {
    const variant = t.variant ?? "default";
    const map = {
      default: {
        base: "bg-card border-border/60 text-card-foreground",
        bar: "bg-foreground/30",
        emoji: "ℹ️",
      },
      success: {
        base: "bg-accent/20 border-accent/40 text-foreground",
        bar: "bg-accent",
        emoji: "✅",
      },
      error: {
        base: "bg-destructive/20 border-destructive/40 text-foreground",
        bar: "bg-destructive",
        emoji: "❌",
      },
      warning: {
        base: "bg-secondary/20 border-secondary/40 text-foreground",
        bar: "bg-secondary",
        emoji: "⚠️",
      },
      loading: {
        base: "bg-muted border-border/60 text-foreground",
        bar: "bg-foreground/30",
        emoji: "",
      },
      custom: { base: "", bar: "", emoji: "✨" },
    } as const;

    return map[variant];
  }, [t.variant]);

  // Support custom color for custom variant
  const customColor =
    t.variant === "custom" ? (t.color ?? "hsl(var(--accent))") : undefined;

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-lg border p-3 shadow-lg backdrop-blur",
        "text-sm",
        preset.base,
        t.type === "foreground" && "ring-1 ring-foreground/5",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          {t.variant === "loading" ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-foreground/40 border-t-foreground" />
          ) : (
            <span aria-hidden className="select-none">
              {t.emoji ?? preset.emoji}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {t.title && <div className="font-medium leading-5">{t.title}</div>}
          {t.description && (
            <div className={cn("mt-0.5 leading-5 text-muted-foreground")}>
              {t.description}
            </div>
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
          className="rounded-md p-1.5 hover:bg-foreground/10 transition"
          onClick={() => onDismiss(t.id)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {(duration > 0 && !t.persist) || typeof t.progress === "number" ? (
        <div className="relative mt-3 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className={cn("h-full", t.variant === "custom" ? "" : preset.bar)}
            style={{
              width:
                typeof t.progress === "number"
                  ? `${Math.max(0, Math.min(1, t.progress)) * 100}%`
                  : start
                    ? 0
                    : "100%",
              transition:
                typeof t.progress === "number"
                  ? "width 120ms linear"
                  : `width ${duration}ms linear`,
              backgroundColor: t.variant === "custom" ? customColor : undefined,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function Toaster({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[90vw] flex-col gap-2"
      role="region"
    >
      {items.map((t) => (
        <ToastCard key={t.id} t={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Bridge: allow external systems (e.g., MCP agents) to trigger toasts via window events or a global API.
declare global {
  interface Window {
    mcpToast?: {
      publish: (t: Omit<ToastItem, "id">) => string;
      update: (id: string, patch: ToastPatch) => void;
      dismiss: (id: string) => void;
    };
  }
}

// Attach listeners and global API inside provider lifecycle
export function ToastBridge() {
  const ctx = useContext(ToastContext);

  useEffect(() => {
    if (!ctx) return;
    const w = safeWindow();

    if (!w) return;
    const { publish, update, dismiss } = ctx;

    function onPublish(e: Event) {
      const ce = e as CustomEvent<Omit<ToastItem, "id">>;

      publish(ce.detail);
    }
    function onUpdate(e: Event) {
      const ce = e as CustomEvent<{ id: string; patch: ToastPatch }>;

      update(ce.detail.id, ce.detail.patch);
    }
    function onDismiss(e: Event) {
      const ce = e as CustomEvent<string>;

      dismiss(ce.detail);
    }

    w.addEventListener("app:toast:publish", onPublish as EventListener);
    w.addEventListener("app:toast:update", onUpdate as EventListener);
    w.addEventListener("app:toast:dismiss", onDismiss as EventListener);

    w.mcpToast = { publish, update, dismiss };

    return () => {
      w.removeEventListener("app:toast:publish", onPublish as EventListener);
      w.removeEventListener("app:toast:update", onUpdate as EventListener);
      w.removeEventListener("app:toast:dismiss", onDismiss as EventListener);
      if (w.mcpToast) delete w.mcpToast;
    };
  }, [ctx]);

  return null;
}
