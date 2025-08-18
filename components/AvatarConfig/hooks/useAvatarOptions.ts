import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AVATARS } from "@/app/lib/constants";

export type AvatarOption = { avatar_id: string; name: string };

export function useAvatarOptions(selectedId?: string) {
  const [avatarOptionsState, setAvatarOptions] = useState<AvatarOption[]>(AVATARS);

  // Source of truth via React Query with cached results
  const { data: avatarsFromApi } = useQuery({
    queryKey: ["avatars", "list"],
    queryFn: async () => {
      const res = await fetch("/api/avatars", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data : [];
      return list.map((a: any) => ({
        avatar_id: a.avatar_id,
        name: a.pose_name || a.normal_preview || a.default_voice || a.avatar_id,
      })) as AvatarOption[];
    },
    // Provide defaults and avoid flashes
    initialData: AVATARS,
    staleTime: 5 * 60_000,
  });

  const avatarOptions = avatarsFromApi?.length ? avatarsFromApi : avatarOptionsState;

  const selectedAvatar = useMemo(() => {
    const avatar = avatarOptions.find((a) => a.avatar_id === selectedId);

    if (!avatar) {
      return {
        isCustom: true as const,
        name: "Custom Avatar ID",
        avatarId: null as string | null,
      };
    }

    return {
      isCustom: false as const,
      name: avatar.name,
      avatarId: avatar.avatar_id,
    };
  }, [selectedId, avatarOptions]);

  const customIdValid = useMemo(() => {
    if (!selectedAvatar?.isCustom) return true;
    if (!selectedId) return false;

    return avatarOptions.some((a) => a.avatar_id === selectedId);
  }, [selectedAvatar?.isCustom, selectedId, avatarOptions]);

  return { avatarOptions, setAvatarOptions, selectedAvatar, customIdValid };
}
