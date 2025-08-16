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
  const [avatarOptions, setAvatarOptions] = useState<Array<{ avatar_id: string; name: string }>>([]);
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
          name: a.pose_name || a.normal_preview || a.default_voice || a.avatar_id,
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
    <div className="relative w-full h-full bg-black overflow-hidden">
      {viewTab === "video" ? (
        sessionState === StreamingAvatarSessionState.CONNECTED ? (
          <AvatarVideo ref={mediaStream} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="relative w-[360px] overflow-hidden border-zinc-700 bg-zinc-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Select an avatar to start session</CardTitle>
                <CardDescription>
                  Choose an avatar and click Start Session to begin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-zinc-300">Avatar</label>
                    <Select
                      value={selectedAvatar}
                      onValueChange={(v) => setSelectedAvatar(v)}
                    >
                      <SelectTrigger className="bg-zinc-800/90 border-zinc-600 text-zinc-100 hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-500/50">
                        <SelectValue placeholder="Select an avatar" />
                      </SelectTrigger>
                      <SelectContent
                        align="start"
                        avoidCollisions={false}
                        className="z-50 bg-zinc-900/95 text-zinc-100 border border-zinc-700 shadow-xl backdrop-blur"
                        position="popper"
                        side="bottom"
                        sideOffset={4}
                      >
                        {avatarOptions.map((opt) => (
                          <SelectItem
                            key={opt.avatar_id}
                            value={opt.avatar_id}
                            className="cursor-pointer text-zinc-100 focus:bg-zinc-800 data-[highlighted]:bg-zinc-800 data-[state=checked]:bg-zinc-800"
                          >
                            {opt.name}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="CUSTOM"
                          className="cursor-pointer text-zinc-100 focus:bg-zinc-800 data-[highlighted]:bg-zinc-800"
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
                            <div className="text-green-400 text-xs mt-1">
                              Agent ID found
                            </div>
                          ) : (
                            <div className="text-red-400 text-xs mt-1">
                              Agent ID not found in available avatars
                            </div>
                          )
                        ) : null}
                      </div>
                    )}
                    {/* Knowledge Base ID (optional) */}
                    <div className="mt-3 flex flex-col gap-2">
                      <label className="text-sm text-zinc-300">Knowledge Base ID (optional)</label>
                      <Input
                        placeholder="Enter knowledge base ID (if any)"
                        value={knowledgeBaseId}
                        onChange={setKnowledgeBaseId}
                      />
                      {knowledgeBaseId ? (
                        kbIdValid ? (
                          <div className="text-green-400 text-xs">Knowledge Base ID format looks good</div>
                        ) : (
                          <div className="text-red-400 text-xs">Invalid Knowledge Base ID format</div>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button
                  className="border-zinc-600 bg-zinc-900/70 text-zinc-100 hover:bg-zinc-800"
                  onClick={onStartWithoutAvatar}
                  size="sm"
                  variant="outline"
                >
                  Start without avatar
                </Button>
                <div className="relative inline-flex overflow-hidden rounded-md">
                  {(() => {
                    const isDisabled =
                      !selectedAvatar ||
                      (selectedAvatar === "CUSTOM" && (!customAvatarId || !customIdValid)) ||
                      (!!knowledgeBaseId && !kbIdValid);
                    if (isDisabled) {
                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0} className="inline-flex">
                                <Button
                                  className="bg-zinc-800 text-zinc-100"
                                  disabled
                                  onClick={() =>
                                    onStartSession?.(
                                      selectedAvatar === "CUSTOM" ? customAvatarId : selectedAvatar,
                                    )
                                  }
                                  size="sm"
                                  variant="secondary"
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
                        className="bg-zinc-800 text-zinc-100"
                        onClick={() =>
                          onStartSession?.(
                            selectedAvatar === "CUSTOM" ? customAvatarId : selectedAvatar,
                          )
                        }
                        size="sm"
                        variant="secondary"
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
                colorFrom="#38bdf8"
                colorTo="#a78bfa"
                duration={8}
                initialOffset={10}
                size={120}
              />
              <BorderBeam
                borderWidth={2}
                colorFrom="#f59e0b"
                colorTo="#ef4444"
                duration={10}
                initialOffset={60}
                reverse
                size={160}
              />
            </Card>
          </div>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
          <div className="text-center text-zinc-200">
            <div className="mb-3 flex items-center justify-center">
              {viewTab === "brain" && (
                <Brain className="h-8 w-8 text-indigo-400" />
              )}
              {viewTab === "data" && (
                <Database className="h-8 w-8 text-sky-400" />
              )}
              {viewTab === "actions" && (
                <LayoutDashboard className="h-8 w-8 text-emerald-400" />
              )}
            </div>
            <div className="text-lg font-medium capitalize">{viewTab}</div>
            <div className="text-sm text-zinc-400">Alternate view panel</div>
          </div>
        </div>
      )}

      {userVideoStream && (
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-gray-700">
          <UserVideo userVideoStream={userVideoStream} />
        </div>
      )}

      <AvatarControls stopSession={stopSession} />
    </div>
  );
}
