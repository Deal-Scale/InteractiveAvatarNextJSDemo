import { TaskMode, TaskType } from "@heygen/streaming-avatar";

export interface TextChatService {
  sendMessage(message: string): void;
  sendMessageSync(message: string): Promise<any>;
  repeatMessage(message: string): void;
  repeatMessageSync(message: string): Promise<any>;
}

export interface VoiceChatService {
  startVoiceChat(isInputAudioMuted?: boolean): Promise<void>;
  stopVoiceChat(): void;
  muteInputAudio(): void;
  unmuteInputAudio(): void;
}

export interface ApiService extends TextChatService, VoiceChatService {}

export enum ApiProvider {
  HeyGen = "HeyGen",
  // Future providers can be added here
}
