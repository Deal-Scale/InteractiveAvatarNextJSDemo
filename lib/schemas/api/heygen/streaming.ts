import { z } from "zod";

// Common
export const SessionIdSchema = z.string().min(1);
export const TimestampSchema = z.number(); // unix seconds

// 1) POST /api/streaming/new
export const NewSessionRequestSchema = z.object({
	avatar_id: z.string().min(1),
	voice_id: z.string().optional(),
	voice_lang: z.string().optional(),
	voice_speed: z.number().optional(),
	task_type: z.enum(["chat", "general"]).optional(),
	task_mode: z.enum(["sync", "async"]).optional(),
	knowledge_base_ids: z.array(z.string()).optional(),
	knowledge_base_base_urls: z.array(z.string().url()).optional(),
	knowledge_base: z
		.object({
			urls: z.array(z.string().url()).optional(),
			files: z.array(z.any()).optional(), // placeholder for file references if used later
		})
		.optional(),
	tts_streaming: z.boolean().optional(),
	interrupt_mode: z.string().optional(),
	normalize: z.boolean().optional(),
	activity_idle_timeout: z.number().optional(),
});

export const NewSessionResponseSchema = z.object({
	code: z.number(),
	message: z.string(),
	data: z.object({
		session_id: SessionIdSchema,
		url: z.string().url(),
		access_token: z.string(),
		session_duration_limit: z.number(),
		is_paid: z.boolean().optional(),
		realtime_endpoint: z.string().url().optional(),
	}),
});

// 2) GET /api/streaming/list
export const ActiveSessionsItemSchema = z.object({
	session_id: SessionIdSchema,
	status: z.string(),
	created_at: TimestampSchema,
});

export const ActiveSessionsResponseSchema = z.object({
	sessions: z.array(ActiveSessionsItemSchema),
});

// 3) GET /api/streaming/history
export const SessionsHistoryQuerySchema = z.object({
	page: z.coerce.number().int().positive().optional(),
	page_size: z.coerce.number().int().positive().optional(),
	pagination_token: z.string().optional(),
});

export const SessionsHistoryItemSchema = z.object({
	session_id: SessionIdSchema,
	status: z.string(),
	created_at: TimestampSchema,
	api_key_type: z.string().optional(),
	duration: z.number().optional(),
	avatar_id: z.string().optional(),
	voice_name: z.string().optional(),
});

export const SessionsHistoryResponseSchema = z.object({
	total: z.number(),
	page: z.number(),
	page_size: z.number(),
	next_pagination_token: z.string().optional(),
	data: z.array(SessionsHistoryItemSchema),
});

// 4) POST /api/streaming/task
export const SendTaskRequestSchema = z.object({
	session_id: SessionIdSchema,
	text: z.string().optional(),
	task_mode: z.enum(["sync", "async"]).optional(),
	task_type: z.enum(["chat", "general"]).optional(),
});

export const SendTaskResponseSchema = z.object({
	duration_ms: z.number().optional(),
	task_id: z.string().optional(),
});

// 5) POST /api/streaming/stop
export const StopSessionRequestSchema = z.object({
	session_id: SessionIdSchema,
});
export const StopSessionResponseSchema = z.object({
	status: z.string(),
});

// 6) POST /api/streaming/interrupt
export const InterruptRequestSchema = z.object({
	session_id: SessionIdSchema,
});
export const InterruptResponseSchema = z.object({
	status: z.string(),
});

// 7) POST /api/streaming/keep-alive
export const KeepAliveRequestSchema = z.object({
	session_id: SessionIdSchema,
});
export const KeepAliveResponseSchema = z.object({
	code: z.number(),
	message: z.string(),
});

export type NewSessionRequest = z.infer<typeof NewSessionRequestSchema>;
export type NewSessionResponse = z.infer<typeof NewSessionResponseSchema>;
export type ActiveSessionsResponse = z.infer<
	typeof ActiveSessionsResponseSchema
>;
export type SessionsHistoryQuery = z.infer<typeof SessionsHistoryQuerySchema>;
export type SessionsHistoryResponse = z.infer<
	typeof SessionsHistoryResponseSchema
>;
export type SendTaskRequest = z.infer<typeof SendTaskRequestSchema>;
export type SendTaskResponse = z.infer<typeof SendTaskResponseSchema>;
export type StopSessionRequest = z.infer<typeof StopSessionRequestSchema>;
export type StopSessionResponse = z.infer<typeof StopSessionResponseSchema>;
export type InterruptRequest = z.infer<typeof InterruptRequestSchema>;
export type InterruptResponse = z.infer<typeof InterruptResponseSchema>;
export type KeepAliveRequest = z.infer<typeof KeepAliveRequestSchema>;
export type KeepAliveResponse = z.infer<typeof KeepAliveResponseSchema>;
