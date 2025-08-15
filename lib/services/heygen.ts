import StreamingAvatar, { TaskMode, TaskType } from "@heygen/streaming-avatar";

import { ApiService, TextChatService, VoiceChatService } from "./api";

export class HeyGenService implements ApiService {
  textChat: TextChatService;
  voiceChat: VoiceChatService;

  constructor(avatar: StreamingAvatar) {
    this.textChat = {
      sendMessage: (message: string) => {
        avatar.speak({
          text: message,
          taskType: TaskType.TALK,
          taskMode: TaskMode.ASYNC,
        });
      },
      sendMessageSync: async (message: string) => {
        return await avatar.speak({
          text: message,
          taskType: TaskType.TALK,
          taskMode: TaskMode.SYNC,
        });
      },
      repeatMessage: (message: string) => {
        avatar.speak({
          text: message,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.ASYNC,
        });
      },
      repeatMessageSync: async (message: string) => {
        return await avatar.speak({
          text: message,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
      },
    };

    this.voiceChat = {
      start: async (options: {
        isInputAudioMuted?: boolean;
        mediaStream?: MediaStream;
      }) => {
        await avatar.startVoiceChat(options);
      },
      stop: () => {
        avatar.closeVoiceChat();
      },
      mute: () => {
        avatar.muteInputAudio();
      },
      unmute: () => {
        avatar.unmuteInputAudio();
      },
    };
  }
}
