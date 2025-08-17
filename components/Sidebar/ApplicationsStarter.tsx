"use client";

import type { AppOption } from "./types";

import { useMemo } from "react";
import { ChevronRight, AppWindow } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";

export default function ApplicationsStarter(props: {
  collapsedStarter: boolean;
  setCollapsedStarter: (fn: (v: boolean) => boolean) => void;
  starterScale: number;
  setStarterScale: (n: number) => void;
  currentAgent: any;
  updateAgent: (patch: any) => void;
  globalSettings: any;
  setGlobalSettings: (v: any) => void;
  clearGlobalSettings: () => void;
  showGlobalForm: boolean;
  setShowGlobalForm: (fn: (v: boolean) => boolean) => void;
  apps?: AppOption[];
}) {
  const {
    collapsedStarter,
    setCollapsedStarter,
    starterScale,
    setStarterScale,
    currentAgent,
    updateAgent,
    globalSettings,
    setGlobalSettings,
    clearGlobalSettings,
    showGlobalForm,
    setShowGlobalForm,
    apps,
  } = props;

  const starterApps: AppOption[] = useMemo(
    () =>
      (apps && apps.length > 0
        ? apps
        : [
            {
              id: "starter-1",
              label: "Quick Demo",
              icon: <AppWindow className="size-4" />,
            },
            {
              id: "starter-2",
              label: "Sales Flow",
              icon: <AppWindow className="size-4" />,
            },
            {
              id: "starter-3",
              label: "Support Flow",
              icon: <AppWindow className="size-4" />,
            },
          ]) as AppOption[],
    [apps],
  );

  return (
    <SidebarGroup>
      <button
        className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-muted"
        type="button"
        onClick={() => setCollapsedStarter((v) => !v)}
      >
        <SidebarGroupLabel>Applications Starter</SidebarGroupLabel>
        <ChevronRight
          className={`size-3 transition-transform ${collapsedStarter ? "rotate-0" : "rotate-90"}`}
        />
      </button>
      {!collapsedStarter && (
        <>
          <div className="px-2 py-1 group-data-[state=collapsed]/sidebar:hidden">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Card size</span>
              <span>{starterScale.toFixed(1)}x</span>
            </div>
            <Slider
              max={1.4}
              min={0.8}
              step={0.1}
              value={[starterScale]}
              onValueChange={(v) => setStarterScale(v[0] ?? 1)}
            />
          </div>

          {/* Inline Agent Controls */}
          <div className="px-2 py-2 space-y-2 text-xs group-data-[state=collapsed]/sidebar:hidden">
            <div className="font-medium text-muted-foreground">
              Agent quick settings
            </div>
            <div className="grid grid-cols-1 gap-2">
              {/* Language */}
              <label className="grid gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Language
                </span>
                <select
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                  value={currentAgent?.language ?? "en"}
                  onChange={(e) => updateAgent({ language: e.target.value })}
                >
                  {STT_LANGUAGE_LIST.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Avatar */}
              <label className="grid gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Avatar
                </span>
                <select
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                  value={currentAgent?.avatarId ?? ""}
                  onChange={(e) => updateAgent({ avatarId: e.target.value })}
                >
                  <option value="">Custom...</option>
                  {AVATARS.map((a) => (
                    <option key={a.avatar_id} value={a.avatar_id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Voice ID */}
              <label className="grid gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Voice ID
                </span>
                <input
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                  placeholder="elevenlabs voice id"
                  value={
                    currentAgent?.voiceId ?? currentAgent?.voice?.voiceId ?? ""
                  }
                  onChange={(e) =>
                    updateAgent({
                      voiceId: e.target.value,
                      voice: {
                        ...(currentAgent?.voice ?? {}),
                        voiceId: e.target.value,
                      } as any,
                    })
                  }
                />
              </label>

              {/* Knowledge Base ID */}
              <label className="grid gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Knowledge Base ID
                </span>
                <input
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                  placeholder="kb_..."
                  value={currentAgent?.knowledgeBaseId ?? ""}
                  onChange={(e) =>
                    updateAgent({ knowledgeBaseId: e.target.value })
                  }
                />
              </label>

              {/* Temperature */}
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Temperature
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {(currentAgent?.temperature ?? 1).toFixed(1)}
                  </span>
                </div>
                <Slider
                  max={2}
                  min={0}
                  step={0.1}
                  value={[currentAgent?.temperature ?? 1]}
                  onValueChange={(v) => updateAgent({ temperature: v[0] ?? 1 })}
                />
              </div>
            </div>
          </div>

          {/* Inline Global Settings */}
          <div className="px-2 py-2 space-y-2 text-xs group-data-[state=collapsed]/sidebar:hidden">
            <button
              className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
              type="button"
              onClick={() => setShowGlobalForm((v) => !v)}
            >
              <span className="font-medium text-muted-foreground">
                Global settings
              </span>
              <ChevronRight
                className={`size-3 transition-transform ${showGlobalForm ? "rotate-90" : "rotate-0"}`}
              />
            </button>
            {showGlobalForm && (
              <div className="grid grid-cols-1 gap-2">
                {(() => {
                  const defaults = {
                    theme: "system",
                    telemetryEnabled: false,
                    apiBaseUrl: "https://api.heygen.com",
                  } as const;
                  const gs = globalSettings ?? (defaults as any);

                  return (
                    <>
                      {/* Theme */}
                      <label className="grid gap-1">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Theme
                        </span>
                        <select
                          className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                          value={(gs as any).theme}
                          onChange={(e) =>
                            setGlobalSettings({
                              ...(gs as any),
                              theme: e.target.value as any,
                            })
                          }
                        >
                          <option value="system">System</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </label>

                      {/* Telemetry */}
                      <label className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Telemetry
                        </span>
                        <input
                          checked={!!(gs as any).telemetryEnabled}
                          className="size-4 accent-primary"
                          type="checkbox"
                          onChange={(e) =>
                            setGlobalSettings({
                              ...(gs as any),
                              telemetryEnabled: e.target.checked,
                            })
                          }
                        />
                      </label>

                      {/* API Base URL */}
                      <label className="grid gap-1">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          API Base URL
                        </span>
                        <input
                          className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                          placeholder="https://api.heygen.com"
                          value={(gs as any).apiBaseUrl ?? ""}
                          onChange={(e) =>
                            setGlobalSettings({
                              ...(gs as any),
                              apiBaseUrl: e.target.value,
                            })
                          }
                        />
                      </label>

                      {/* Actions */}
                      <div className="mt-1 flex items-center gap-2">
                        <Button
                          className="h-7 px-2"
                          size="sm"
                          variant="outline"
                          onClick={() => clearGlobalSettings()}
                        >
                          Reset
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Starter apps */}
          <SidebarMenu>
            {starterApps.map((s) => (
              <SidebarMenuButton key={s.id} className="justify-start">
                <span className="mr-2 inline-flex size-4 items-center justify-center overflow-hidden rounded">
                  {s.imageUrl ? (
                    <img
                      alt={s.label}
                      className="h-4 w-4 object-cover"
                      src={s.imageUrl}
                    />
                  ) : (
                    (s.icon ?? <AppWindow className="size-4" />)
                  )}
                </span>
                <span
                  style={{
                    transform: `scale(${starterScale})`,
                    transformOrigin: "left center",
                  }}
                >
                  {s.label}
                </span>
              </SidebarMenuButton>
            ))}
          </SidebarMenu>
        </>
      )}
    </SidebarGroup>
  );
}
