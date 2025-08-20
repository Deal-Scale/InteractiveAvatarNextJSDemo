import {
	useMutation,
	UseMutationOptions,
	QueryClient,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
	createTextKB,
	testConnector,
	connectKBSource,
	scheduleInitialSync,
	KBItem,
} from "@/lib/services/kb";

export function useStandardMutation<TData, TVariables, TContext = unknown>(
	mutationFn: (vars: TVariables) => Promise<TData>,
	options?: UseMutationOptions<TData, Error, TVariables, TContext>,
) {
	return useMutation<TData, Error, TVariables, TContext>({
		mutationFn,
		retry: 1,
		...options,
	});
}

export function exponentialBackoff(attempt: number, base = 300, cap = 3000) {
	return Math.min(cap, base * 2 ** attempt);
}

export function invalidateOn(
	client: QueryClient,
	keys: ReadonlyArray<readonly unknown[]>,
) {
	return Promise.all(
		keys.map((key) => client.invalidateQueries({ queryKey: key })),
	);
}

// Knowledge Base hooks (additive)
export function useCreateTextKB(
	options?: UseMutationOptions<
		KBItem,
		Error,
		{ name: string; description?: string; content: string }
	>,
) {
	const client = useQueryClient();
	return useStandardMutation(createTextKB, {
		...options,
		onSuccess: async (data, vars, ctx) => {
			await invalidateOn(client, [queryKeys.kb.list]);
			options?.onSuccess?.(data, vars, ctx);
		},
	});
}

export function useTestKBConnection(
	options?: UseMutationOptions<
		{ ok: boolean; message?: string },
		Error,
		{ connectorKey: string; config: Record<string, string> }
	>,
) {
	return useStandardMutation(testConnector, options);
}

export function useConnectKBSource(
	options?: UseMutationOptions<
		KBItem,
		Error,
		{ connectorKey: string; config: Record<string, string> }
	>,
) {
	const client = useQueryClient();
	return useStandardMutation(connectKBSource, {
		...options,
		onSuccess: async (data, vars, ctx) => {
			await invalidateOn(client, [queryKeys.kb.list]);
			options?.onSuccess?.(data, vars, ctx);
		},
	});
}

export function useScheduleKBSync(
	options?: UseMutationOptions<{ ok: boolean }, Error, { id: string }>,
) {
	const client = useQueryClient();
	return useStandardMutation(({ id }) => scheduleInitialSync(id), {
		...options,
		onSuccess: async (data, vars, ctx) => {
			await invalidateOn(client, [
				queryKeys.kb.list,
				queryKeys.kb.detail(vars.id),
			]);
			options?.onSuccess?.(data, vars, ctx);
		},
	});
}
