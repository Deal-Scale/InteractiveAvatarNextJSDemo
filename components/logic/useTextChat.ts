import { useCallback } from "react";

import { useApiService } from "./ApiServiceContext";
import type { MessageAsset } from "@/lib/types";

export const useTextChat = () => {
	const { apiService } = useApiService();

	const sendMessage = useCallback(
		(message: string, assets?: MessageAsset[]) => {
			console.debug("[useTextChat] sendMessage", {
				messageLength: message?.length ?? 0,
				assetCount: assets?.length ?? 0,
				assets,
			});
			apiService?.textChat.sendMessage(message, assets);
		},
		[apiService],
	);

	const sendMessageSync = useCallback(
		async (message: string, assets?: MessageAsset[]) => {
			console.debug("[useTextChat] sendMessageSync", {
				messageLength: message?.length ?? 0,
				assetCount: assets?.length ?? 0,
				assets,
			});
			return await apiService?.textChat.sendMessageSync(message, assets);
		},
		[apiService],
	);

	const repeatMessage = useCallback(
		(message: string) => {
			apiService?.textChat.repeatMessage(message);
		},
		[apiService],
	);

	const repeatMessageSync = useCallback(
		async (message: string) => {
			return await apiService?.textChat.repeatMessageSync(message);
		},
		[apiService],
	);

	return {
		sendMessage,
		sendMessageSync,
		repeatMessage,
		repeatMessageSync,
	};
};
