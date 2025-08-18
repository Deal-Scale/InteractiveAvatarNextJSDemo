"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function DataCard({ title, value, hint, className }: { title: string; value: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-3 text-card-foreground", className)}>
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function MetricGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>{children}</div>;
}

export function Metric({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md bg-muted px-2 py-1", className)}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
