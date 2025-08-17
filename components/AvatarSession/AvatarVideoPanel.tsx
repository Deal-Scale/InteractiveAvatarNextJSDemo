import { Brain, Database, LayoutDashboard } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { StreamingAvatarSessionState } from "../logic/context";

import { AvatarVideo } from "./AvatarVideo";
import { UserVideo } from "./UserVideo";
import { AvatarControls } from "./AvatarControls";

import { useSessionStore } from "@/lib/stores/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BorderBeam } from "@/components/magicui/border-beam";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { Input } from "@/components/Input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AvatarVideoPanel({
  mediaStream,
  userVideoStream,
  stopSession,
  sessionState,
  onStartSession,
  onStartWithoutAvatar,
}: {
  mediaStream: React.RefObject<HTMLVideoElement>;
  userVideoStream: MediaStream | null;
  stopSession: () => void;
  sessionState: StreamingAvatarSessionState;
  onStartSession?: (avatarId: string) => void;
  onStartWithoutAvatar?: () => void;
}) {
  const { viewTab } = useSessionStore();
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [customAvatarId, setCustomAvatarId] = useState<string>("");
  const [avatarOptions, setAvatarOptions] = useState<
    Array<{ avatar_id: string; name: string }>
  >([]);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const fetchAvatars = async () => {
      try {
        const res = await fetch("/api/avatars", { cache: "no-store" });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        const mapped = list.map((a: any) => ({
          avatar_id: a.avatar_id,
          name:
            a.pose_name || a.normal_preview || a.default_voice || a.avatar_id,
        }));

        if (!cancelled && mapped.length) setAvatarOptions(mapped);
      } catch {
        // leave empty -> dropdown will have only Custom option
      }
    };

    fetchAvatars();

    return () => {
      cancelled = true;
    };
  }, []);

  const customIdValid = useMemo(() => {
    if (selectedAvatar !== "CUSTOM") return true;
    if (!customAvatarId) return false;

    return avatarOptions.some((a) => a.avatar_id === customAvatarId);
  }, [selectedAvatar, customAvatarId, avatarOptions]);

  // Simple client-side check for Knowledge Base ID. If provided, must match a minimal pattern.
  // Accept UUID-like or alphanumeric with dashes/underscores of length >= 10.
  const kbIdValid = useMemo(() => {
    if (!knowledgeBaseId) return true; // optional
    const uuidLike = /^[0-9a-fA-F-]{10,}$/;
    const generic = /^[A-Za-z0-9_-]{10,}$/;

    return uuidLike.test(knowledgeBaseId) || generic.test(knowledgeBaseId);
  }, [knowledgeBaseId]);

  return (
    <div className="group relative w-full h-full bg-background overflow-hidden">
      {viewTab === "video" && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <RetroGrid
            angle={65}
            cellSize={60}
            className="[&>div:last-child]:hidden"
            darkLineColor="hsl(var(--primary))"
            lightLineColor="hsl(var(--primary))"
            opacity={0.6}
          />
        </div>
      )}
      <div className="relative z-10 h-full">
      {viewTab === "video" ? (
        sessionState === StreamingAvatarSessionState.CONNECTED ? (
          <AvatarVideo ref={mediaStream} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="relative w-[360px] overflow-hidden border-border bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Select an avatar to start session</CardTitle>
                <CardDescription>
                  Choose an avatar and click Start Session to begin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-muted-foreground">
                      Avatar
                    </label>
                    <Select
                      value={selectedAvatar}
                      onValueChange={(v) => setSelectedAvatar(v)}
                    >
                      <SelectTrigger className="bg-popover/90 border-border text-popover-foreground hover:bg-popover focus:ring-2 focus:ring-ring/50">
                        <SelectValue placeholder="Select an avatar" />
                      </SelectTrigger>
                      <SelectContent
                        align="start"
                        avoidCollisions={false}
                        className="z-50 bg-popover/95 text-popover-foreground border border-border shadow-xl backdrop-blur"
                        position="popper"
                        side="bottom"
                        sideOffset={4}
                      >
                        {avatarOptions.map((opt) => (
                          <SelectItem
                            key={opt.avatar_id}
                            className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent data-[state=checked]:bg-accent"
                            value={opt.avatar_id}
                          >
                            {opt.name}
                          </SelectItem>
                        ))}
                        <SelectItem
                          className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent"
                          value="CUSTOM"
                        >
                          Custom Avatar ID
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedAvatar === "CUSTOM" && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter custom agent ID"
                          value={customAvatarId}
                          onChange={setCustomAvatarId}
                        />
                        {customAvatarId ? (
                          customIdValid ? (
                            <div className="text-primary text-xs mt-1">
                              Agent ID found
                            </div>
                          ) : (
                            <div className="text-destructive text-xs mt-1">
                              Agent ID not found in available avatars
                            </div>
                          )
                        ) : null}
                      </div>
                    )}
                    {/* Knowledge Base ID (optional) */}
                    <div className="mt-3 flex flex-col gap-2">
                      <label className="text-sm text-muted-foreground">
                        Knowledge Base ID (optional)
                      </label>
                      <Input
                        placeholder="Enter knowledge base ID (if any)"
                        value={knowledgeBaseId}
                        onChange={setKnowledgeBaseId}
                      />
                      {knowledgeBaseId ? (
                        kbIdValid ? (
                          <div className="text-primary text-xs">
                            Knowledge Base ID format looks good
                          </div>
                        ) : (
                          <div className="text-destructive text-xs">
                            Invalid Knowledge Base ID format
                          </div>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button
                  className="border-border bg-background/70 text-foreground hover:bg-muted"
                  size="sm"
                  variant="outline"
                  onClick={onStartWithoutAvatar}
                >
                  Start without avatar
                </Button>
                <div className="relative inline-flex overflow-hidden rounded-md">
                  {(() => {
                    const isDisabled =
                      !selectedAvatar ||
                      (selectedAvatar === "CUSTOM" &&
                        (!customAvatarId || !customIdValid)) ||
                      (!!knowledgeBaseId && !kbIdValid);

                    if (isDisabled) {
                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex" tabIndex={0}>
                                <Button
                                  disabled
                                  className="bg-secondary text-secondary-foreground"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    onStartSession?.(
                                      selectedAvatar === "CUSTOM"
                                        ? customAvatarId
                                        : selectedAvatar,
                                    )
                                  }
                                >
                                  Start Session
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Set up your agent and settings first
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return (
                      <Button
                        className="bg-secondary text-secondary-foreground"
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          onStartSession?.(
                            selectedAvatar === "CUSTOM"
                              ? customAvatarId
                              : selectedAvatar,
                          )
                        }
                      >
                        Start Session
                      </Button>
                    );
                  })()}
                  <BorderBeam borderWidth={2} duration={8} size={80} />
                </div>
              </CardFooter>
              <BorderBeam
                borderWidth={2}
                duration={8}
                initialOffset={10}
                size={120}
              />
              <BorderBeam
                reverse
                borderWidth={2}
                duration={10}
                initialOffset={60}
                size={160}
              />
            </Card>
          </div>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-muted to-background">
          <div className="text-center text-foreground">
            <div className="mb-3 flex items-center justify-center">
              {viewTab === "brain" && (
                <Brain className="h-8 w-8 text-primary" />
              )}
              {viewTab === "data" && (
                <Database className="h-8 w-8 text-accent-foreground" />
              )}
              {viewTab === "actions" && (
                <LayoutDashboard className="h-8 w-8 text-secondary-foreground" />
              )}
            </div>
            <div className="text-lg font-medium capitalize">{viewTab}</div>
            <div className="text-sm text-muted-foreground">
              Alternate view panel
            </div>
          </div>
        </div>
      )}

      {userVideoStream && (
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-border">
          <UserVideo userVideoStream={userVideoStream} />
        </div>
      )}

      <AvatarControls stopSession={stopSession} />
      </div>
    </div>
  );
}
