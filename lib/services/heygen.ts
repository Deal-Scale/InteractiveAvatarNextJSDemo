import { StreamingAvatarApi, TaskMode, TaskType } from "@heygen/streaming-avatar";
import { ApiService } from "./api";

export class HeyGenService implements ApiService {
  private avatar: StreamingAvatarApi;

  constructor(avatar: StreamingAvatarApi) {
    this.avatar = avatar;
  }

  // Text Chat Methods
  sendMessage(message: string) {
    this.avatar.speak({
      text: message,
      taskType: TaskType.TALK,
      taskMode: TaskMode.ASYNC,
    });
  }

  async sendMessageSync(message: string) {
    return await this.avatar.speak({
      text: message,
      taskType: TaskType.TALK,
      taskMode: TaskMode.SYNC,
    });
  }

  repeatMessage(message: string) {
    this.avatar.speak({
      text: message,
      taskType: TaskType.REPEAT,
      taskMode: TaskMode.ASYNC,
    });
  }

  async repeatMessageSync(message: string) {
    return await this.avatar.speak({
      text: message,
      taskType: TaskType.REPEAT,
      taskMode: TaskMode.SYNC,
    });
  }

  // Voice Chat Methods
  async startVoiceChat(isInputAudioMuted?: boolean) {
    await this.avatar.startVoiceChat({ isInputAudioMuted });
  }

  stopVoiceChat() {
    this.avatar.closeVoiceChat();
  }

  muteInputAudio() {
    this.avatar.muteInputAudio();
  }

  unmuteInputAudio() {
    this.avatar.unmuteInputAudio();
  }
}
