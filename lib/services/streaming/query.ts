import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

// --- Types from Heygen responses (simplified) ---
export type NewSessionResponse = {
	code?: number;
	message?: string;
	data: {
		session_id: string;
		url: string;
		access_token: string;
		session_duration_limit?: number;
		is_paid?: boolean;
		realtime_endpoint?: string;
	};
};

export type ActiveSessionsResponse = {
	sessions: Array<{
		session_id: string;
		status: string; // new | connecting | connected
		created_at: number;
	}>;
};

export type SessionsHistoryResponse = {
	total: number;
	page: number;
	page_size: number;
	next_pagination_token?: string;
	data: Array<{
		session_id: string;
		status: string;
		created_at: number;
		api_key_type?: string;
		duration?: number;
		avatar_id?: string;
		voice_name?: string;
	}>;
};

// --- Fetchers ---
async function postJson<T>(url: string, body?: any): Promise<T> {
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body ?? {}),
	});
	if (!res.ok) throw new Error(`${url} failed (${res.status})`);
	return (await res.json()) as T;
}

async function getJson<T>(url: string): Promise<T> {
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) throw new Error(`${url} failed (${res.status})`);
	return (await res.json()) as T;
}

// --- Queries ---
export function useActiveSessionsQuery() {
	return useQuery({
		queryKey: queryKeys.sessions.active,
		queryFn: () => getJson<ActiveSessionsResponse>("/api/streaming/list"),
		staleTime: 10_000,
	});
}

export function useSessionsHistoryQuery(params?: {
	page?: number | string;
	page_size?: number | string;
	date_from?: string;
	date_to?: string;
	status?: string;
	token?: string;
}) {
	const qs = new URLSearchParams();
	if (params?.page != null) qs.set("page", String(params.page));
	if (params?.page_size != null) qs.set("page_size", String(params.page_size));
	if (params?.date_from) qs.set("date_from", params.date_from);
	if (params?.date_to) qs.set("date_to", params.date_to);
	if (params?.status) qs.set("status", params.status);
	if (params?.token) qs.set("token", params.token);
	const keyParam = qs.toString();
	return useQuery({
		queryKey: queryKeys.sessions.history(keyParam || undefined),
		queryFn: () =>
			getJson<SessionsHistoryResponse>(
				`/api/streaming/history${keyParam ? `?${keyParam}` : ""}`,
			),
		staleTime: 15_000,
	});
}

// --- Mutations ---
export function useNewSessionMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (body: any) => {
			console.log("[DEBUG] useNewSessionMutation called with body:", body);
			const response = await postJson<NewSessionResponse>(
				"/api/streaming/new",
				body,
			);
			console.log("[DEBUG] useNewSessionMutation response:", response);
			return response;
		},
		onSuccess: async () => {
			console.log(
				"[DEBUG] useNewSessionMutation success, invalidating queries",
			);
			// Refresh active sessions immediately
			await qc.invalidateQueries({ queryKey: queryKeys.sessions.active });
		},
	});
}

export function useSendTaskMutation() {
	return useMutation({
		mutationFn: (body: {
			session_id: string;
			text: string;
			task_mode?: "sync" | "async";
			task_type?: "repeat" | "chat";
		}) => postJson("/api/streaming/task", body),
	});
}

export function useStopSessionMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: { session_id: string }) =>
			postJson("/api/streaming/stop", body),
		onSuccess: async () => {
			// Refresh both active and history lists
			await Promise.all([
				qc.invalidateQueries({ queryKey: queryKeys.sessions.active }),
				qc.invalidateQueries({ queryKey: queryKeys.sessions.history() }),
			]);
		},
	});
}

export function useInterruptTaskMutation() {
	return useMutation({
		mutationFn: (body: { session_id: string }) =>
			postJson("/api/streaming/interrupt", body),
	});
}

export function useKeepAliveMutation() {
	return useMutation({
		mutationFn: (body: { session_id: string }) =>
			postJson("/api/streaming/keep-alive", body),
	});
}
