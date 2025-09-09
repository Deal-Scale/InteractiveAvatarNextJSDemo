export class BadRequestError extends Error {
	status = 400 as const;
}

export class UpstreamError extends Error {
	status = 502 as const;
	constructor(
		message: string,
		public upstreamStatus?: number,
	) {
		super(message);
	}
}

export function jsonError(status: number, message: string): Response {
	return new Response(JSON.stringify({ error: { message } }), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}
