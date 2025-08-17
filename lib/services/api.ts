import type { MessageAsset } from "@/lib/types";

export interface TextChatService {
  sendMessage(message: string, assets?: MessageAsset[]): void;
  sendMessageSync(message: string, assets?: MessageAsset[]): Promise<any>;
  repeatMessage(message: string): void;
  repeatMessageSync(message: string): Promise<any>;
}

export interface VoiceChatService {
  start(options: {
    isInputAudioMuted?: boolean;
    mediaStream?: MediaStream;
  }): Promise<void>;
  stop(): void;
  mute(): void;
  unmute(): void;
}

export interface ApiService {
  textChat: TextChatService;
  voiceChat: VoiceChatService;
}

export enum ApiProvider {
  HeyGen = "HeyGen",
  // Future providers can be added here
}
