"use client";

import * as React from "react";

import { useThemeStore } from "@/lib/stores/theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMOTIONS = [
  { id: "none", label: "None" },
  { id: "happy", label: "Happy" },
  { id: "sad", label: "Sad" },
  { id: "anger", label: "Anger" },
  { id: "fear", label: "Fear" },
  { id: "surprise", label: "Surprise" },
  { id: "disgust", label: "Disgust" },
  { id: "neutral", label: "Neutral" },
] as const;

type EmotionId = (typeof EMOTIONS)[number]["id"];

export function ThemeEmotionSelect({ className }: { className?: string }) {
  const emotion = useThemeStore((s) => s.emotion);
  const setEmotion = useThemeStore((s) => s.setEmotion);
  const onChange = (val: EmotionId) => setEmotion(val as any);

  return (
    <div className={className}>
      <Select value={emotion} onValueChange={(v) => onChange(v as EmotionId)}>
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Emotion" />
        </SelectTrigger>
        <SelectContent>
          {EMOTIONS.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default ThemeEmotionSelect;
