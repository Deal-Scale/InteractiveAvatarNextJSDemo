import { useCallback } from "react";

import { useApiService } from "./ApiServiceContext";
import { useStreamingAvatarContext } from "./context";

export const useVoiceChat = () => {
  const { apiService } = useApiService();
  const {
    isMuted,
    setIsMuted,
    isVoiceChatActive,
    setIsVoiceChatActive,
    isVoiceChatLoading,
    setIsVoiceChatLoading,
  } = useStreamingAvatarContext();

  const startVoiceChat = useCallback(
    async (isInputAudioMuted?: boolean) => {
      if (!apiService?.voiceChat) return;

      setIsVoiceChatLoading(true);
      await apiService.voiceChat.start(isInputAudioMuted);
      setIsVoiceChatLoading(false);
      setIsVoiceChatActive(true);
      setIsMuted(!!isInputAudioMuted);
    },
    [apiService, setIsMuted, setIsVoiceChatActive, setIsVoiceChatLoading],
  );

  const stopVoiceChat = useCallback(() => {
    if (!apiService?.voiceChat) return;

    apiService.voiceChat.stop();
    setIsVoiceChatActive(false);
    setIsMuted(true);
  }, [apiService, setIsMuted, setIsVoiceChatActive]);

  const muteInputAudio = useCallback(() => {
    if (!apiService?.voiceChat) return;

    apiService.voiceChat.mute();
    setIsMuted(true);
  }, [apiService, setIsMuted]);

  const unmuteInputAudio = useCallback(() => {
    if (!apiService?.voiceChat) return;

    apiService.voiceChat.unmute();
    setIsMuted(false);
  }, [apiService, setIsMuted]);

  return {
    startVoiceChat,
    stopVoiceChat,
    muteInputAudio,
    unmuteInputAudio,
    isMuted,
    isVoiceChatActive,
    isVoiceChatLoading,
  };
};
