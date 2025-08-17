"use client";

import type { Agent } from "./AgentCard";

import React from "react";

export default function AgentPreview(props: { agent: Agent }) {
  const { agent } = props;
  const { name, avatarUrl, role, description, tags } = agent;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-20 w-32 overflow-hidden rounded bg-muted/50">
          {avatarUrl ? (
            <img
              alt={name}
              className="h-full w-full object-cover"
              src={avatarUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              {name?.substring(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{role || "Agent"}</div>
          {description && <p className="mt-1 text-sm">{description}</p>}
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
              {tags.map((t) => (
                <span key={t} className="rounded bg-muted px-1.5 py-0.5">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
