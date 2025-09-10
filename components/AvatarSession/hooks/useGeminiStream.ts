"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GeminiSSEEvent } from "@/app/api/gemini-stream/_responses";

export interface UseGeminiStreamOptions {
	input: string | string[];
	model?: string;
	method?: "GET" | "POST"; // default POST
}

export interface UseGeminiStreamState<T = unknown> {
	open: boolean;
	events: GeminiSSEEvent[];
	last?: GeminiSSEEvent;
	data?: T;
	error?: string;
	start: () => void;
	stop: () => void;
	running: boolean;
}

/**
 * Consume the Gemini SSE endpoint with a small typed hook.
 * - Default is POST to allow request bodies.
 * - You can choose GET to use EventSource with query params.
 */
export function useGeminiStream<T = unknown>(
	opts: UseGeminiStreamOptions,
): UseGeminiStreamState<T> {
	const { input, model, method = "POST" } = opts;
	const [open, setOpen] = useState(false);
	const [events, setEvents] = useState<GeminiSSEEvent[]>([]);
	const [last, setLast] = useState<GeminiSSEEvent | undefined>(undefined);
	const [data, setData] = useState<T | undefined>(undefined);
	const [error, setError] = useState<string | undefined>(undefined);
	const [running, setRunning] = useState(false);

	const controllerRef = useRef<AbortController | null>(null);
	const esRef = useRef<EventSource | null>(null);

	const inputsArray = useMemo(
		() => (Array.isArray(input) ? input : [input]),
		[input],
	);

	const reset = useCallback(() => {
		setOpen(false);
		setEvents([]);
		setLast(undefined);
		setData(undefined);
		setError(undefined);
		setRunning(false);
	}, []);

	const stop = useCallback(() => {
		try {
			controllerRef.current?.abort();
		} catch {}
		try {
			esRef.current?.close();
		} catch {}
		controllerRef.current = null;
		esRef.current = null;
		setRunning(false);
	}, []);

	const start = useCallback(() => {
		stop();
		reset();
		setRunning(true);

		if (method === "GET") {
			const params = new URLSearchParams();
			for (const turn of inputsArray) params.append("input", turn);
			if (model) params.append("model", model);
			const es = new EventSource(`/api/gemini-stream?${params.toString()}`);
			esRef.current = es;
			es.onmessage = (ev) => {
				try {
					const evt = JSON.parse(ev.data) as GeminiSSEEvent;
					setEvents((prev) => [...prev, evt]);
					setLast(evt);
					if (evt.type === "open") setOpen(true);
					if (evt.type === "end" || evt.type === "close") stop();
				} catch (e) {
					setError((e as Error).message);
				}
			};
			es.onerror = () => {
				setError("SSE connection error");
				stop();
			};
			return;
		}

		// POST streaming via fetch
		const controller = new AbortController();
		controllerRef.current = controller;

		fetch("/api/gemini-stream", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ input: inputsArray, model }),
			signal: controller.signal,
		})
			.then(async (res) => {
				if (!res.ok || !res.body) {
					throw new Error(`Request failed: ${res.status}`);
				}
				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					const idx = buffer.indexOf("\n\n");
					if (idx === -1) break;
					let idx2 = idx;
					while (true) {
						idx2 = buffer.indexOf("\n\n", idx2 + 2);
						if (idx2 === -1) break;
						const frame = buffer.slice(idx2 + 2, idx2 + 4).trim();
						buffer = buffer.slice(idx2 + 4);
						if (!frame.startsWith("data:")) continue;
						const payload = frame.slice("data:".length).trim();
						if (!payload) continue;
						try {
							const evt = JSON.parse(payload) as GeminiSSEEvent;
							setEvents((prev) => [...prev, evt]);
							setLast(evt);
							if (evt.type === "open") setOpen(true);
							if (evt.type === "end" || evt.type === "close") stop();
						} catch (e) {
							setError((e as Error).message);
						}
					}
				}
			})
			.catch((e) => {
				setError((e as Error).message);
				stop();
			});
	}, [inputsArray, method, model, reset, stop]);

	return { open, events, last, data, error, start, stop, running } as const;
}
