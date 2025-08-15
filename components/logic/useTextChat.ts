import { useCallback } from "react";
import { useApiService } from "./ApiServiceContext";

export const useTextChat = () => {
  const { apiService } = useApiService();

  const sendMessage = useCallback(
    (message: string) => {
      apiService?.sendMessage(message);
    },
    [apiService]
  );

  const sendMessageSync = useCallback(
    async (message: string) => {
      return await apiService?.sendMessageSync(message);
    },
    [apiService]
  );

  const repeatMessage = useCallback(
    (message: string) => {
      apiService?.repeatMessage(message);
    },
    [apiService]
  );

  const repeatMessageSync = useCallback(
    async (message: string) => {
      return await apiService?.repeatMessageSync(message);
    },
    [apiService]
  );

  return {
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  };
};
