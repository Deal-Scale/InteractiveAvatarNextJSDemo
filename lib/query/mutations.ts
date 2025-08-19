import {
	useMutation,
	UseMutationOptions,
	QueryClient,
} from "@tanstack/react-query";

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

export function invalidateOn(client: QueryClient, keys: readonly unknown[][]) {
	return Promise.all(
		keys.map((key) => client.invalidateQueries({ queryKey: key })),
	);
}
