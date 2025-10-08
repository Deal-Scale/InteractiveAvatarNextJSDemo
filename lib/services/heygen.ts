import StreamingAvatar, { TaskMode, TaskType } from "@heygen/streaming-avatar";

import { ApiService, TextChatService, VoiceChatService } from "./api";
import type { MessageAsset } from "@/lib/types";

export class HeyGenService implements ApiService {
	private avatar: StreamingAvatar;
	private speakQueue: Promise<void>;
	textChat: TextChatService;
	voiceChat: VoiceChatService;

	constructor(avatar: StreamingAvatar) {
		this.avatar = avatar;
		this.speakQueue = Promise.resolve();

		const enqueue = async (message: string, taskType: TaskType) => {
			this.speakQueue = this.speakQueue
				.catch((err) => {
					console.error("[HeyGenService] prior speak failed", err);
				})
				.then(async () => {
					await this.avatar.speak({
						text: message,
						taskType,
						taskMode: TaskMode.ASYNC,
					});
				});

			return this.speakQueue;
		};

		this.textChat = {
			sendMessage: (message: string, _assets?: MessageAsset[]) => {
				void enqueue(message, TaskType.TALK);
			},
			sendMessageSync: async (message: string, _assets?: MessageAsset[]) => {
				return await this.avatar.speak({
					text: message,
					taskType: TaskType.TALK,
					taskMode: TaskMode.SYNC,
				});
			},
			repeatMessage: (message: string) => {
				void enqueue(message, TaskType.REPEAT);
			},
			repeatMessageSync: async (message: string) => {
				return await this.avatar.speak({
					text: message,
					taskType: TaskType.REPEAT,
					taskMode: TaskMode.SYNC,
				});
			},
			speakQueued: async (message: string) => {
				await enqueue(message, TaskType.TALK);
			},
		};

		this.voiceChat = {
			start: async (options: {
				isInputAudioMuted?: boolean;
				mediaStream?: MediaStream;
			}) => {
				await this.avatar.startVoiceChat(options);
			},
			stop: () => {
				this.avatar.closeVoiceChat();
			},
			mute: () => {
				this.avatar.muteInputAudio();
			},
			unmute: () => {
				this.avatar.unmuteInputAudio();
			},
		};
	}
}
