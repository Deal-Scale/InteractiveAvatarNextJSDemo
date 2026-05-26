import { NextResponse } from "next/server";
import {
	getLiveAvatarAuthErrorMessage,
	getLiveAvatarErrorMessage,
	LIVEAVATAR_API_KEY,
	LIVEAVATAR_BASE,
	liveAvatarHeaders,
	missingLiveAvatarKeyResponse,
} from "@/lib/server/liveavatar";

const ELEVENLABS_API_KEY =
	process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY =
	process.env.GOOGLE_API_KEY ||
	process.env.GEMINI_API_KEY ||
	process.env.GOOGLE_GENAI_API_KEY;
const OPENAI_TTS_PREVIEW_MODEL =
	process.env.OPENAI_TTS_PREVIEW_MODEL || "gpt-4o-mini-tts";
const GEMINI_TTS_PREVIEW_MODEL =
	process.env.GEMINI_TTS_PREVIEW_MODEL || "gemini-3.1-flash-tts-preview";
const VOICE_PREVIEW_TEXT =
	"Hi, this is a short preview of how this voice sounds.";

const createWavBuffer = (
	pcmData: Uint8Array,
	channels = 1,
	sampleRate = 24000,
	bitsPerSample = 16,
) => {
	const byteRate = (sampleRate * channels * bitsPerSample) / 8;
	const blockAlign = (channels * bitsPerSample) / 8;
	const bytes = new Uint8Array(44 + pcmData.length);
	const view = new DataView(bytes.buffer);
	const writeAscii = (offset: number, value: string) => {
		for (let index = 0; index < value.length; index += 1) {
			bytes[offset + index] = value.charCodeAt(index);
		}
	};

	writeAscii(0, "RIFF");
	view.setUint32(4, 36 + pcmData.length, true);
	writeAscii(8, "WAVE");
	writeAscii(12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, channels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, byteRate, true);
	view.setUint16(32, blockAlign, true);
	view.setUint16(34, bitsPerSample, true);
	writeAscii(36, "data");
	view.setUint32(40, pcmData.length, true);
	bytes.set(pcmData, 44);

	return bytes;
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
	bytes.buffer.slice(
		bytes.byteOffset,
		bytes.byteOffset + bytes.byteLength,
	) as ArrayBuffer;

const ALLOWED_PREVIEW_HOSTS = new Set(["storage.googleapis.com", "cdn.elevenlabs.io"]);

const getValidatedPreviewUrl = (value: string): URL | null => {
	let parsed: URL;
	try {
		parsed = new URL(value);
	} catch {
		return null;
	}

	if (parsed.protocol !== "https:") return null;
	if (!ALLOWED_PREVIEW_HOSTS.has(parsed.hostname)) return null;
	return parsed;
};

const proxyAudioResponse = async (url: URL) => {
	const upstream = await fetch(url.toString(), { method: "GET", cache: "no-store" });
	const contentType =
		upstream.headers.get("content-type") ?? "application/octet-stream";

	if (!upstream.ok) {
		const body = await upstream.text().catch(() => "");
		return NextResponse.json(
			{ error: "Failed to fetch voice preview audio", upstream: body },
			{ status: upstream.status },
		);
	}

	return new Response(upstream.body, {
		status: 200,
		headers: {
			"Content-Type": contentType,
			"Cache-Control": "private, max-age=300",
		},
	});
};

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ voiceId: string }> },
) {
	const { voiceId } = await params;

	if (!voiceId) {
		return NextResponse.json({ error: "Missing voiceId" }, { status: 400 });
	}

	try {
		const url = new URL(request.url);
		const provider = url.searchParams.get("provider") ?? "liveavatar";

		if (provider === "elevenlabs") {
			const previewUrl = url.searchParams.get("preview_url");
			if (previewUrl) {
				const validatedPreviewUrl = getValidatedPreviewUrl(previewUrl);
				if (!validatedPreviewUrl) {
					return NextResponse.json(
						{ error: "Invalid preview_url" },
						{ status: 400 },
					);
				}
				return proxyAudioResponse(validatedPreviewUrl);
			}

			const metadataRes = await fetch(
				`https://api.elevenlabs.io/v1/voices/${encodeURIComponent(voiceId)}`,
				{
					method: "GET",
					headers: ELEVENLABS_API_KEY
						? { "xi-api-key": ELEVENLABS_API_KEY }
						: undefined,
					cache: "no-store",
				},
			);
			const metadata = await metadataRes.json().catch(() => ({}));
			const metadataPreviewUrl =
				typeof metadata?.preview_url === "string" ? metadata.preview_url : "";

			if (!metadataRes.ok || !metadataPreviewUrl) {
				return NextResponse.json(
					{
						error: "No ElevenLabs preview audio is available for this voice",
						upstream: metadata,
					},
					{ status: metadataRes.ok ? 404 : metadataRes.status },
				);
			}

			const validatedMetadataPreviewUrl = getValidatedPreviewUrl(metadataPreviewUrl);
			if (!validatedMetadataPreviewUrl) {
				return NextResponse.json(
					{ error: "Invalid ElevenLabs preview URL" },
					{ status: 502 },
				);
			}

			return proxyAudioResponse(validatedMetadataPreviewUrl);
		}

		if (provider === "openai") {
			const enableOpenAiPreview =
				url.searchParams.get("generate") === "1" ||
				process.env.ENABLE_OPENAI_VOICE_PREVIEWS === "true";
			if (!enableOpenAiPreview) {
				return NextResponse.json(
					{
						error:
							"OpenAI does not provide static voice preview audio. Generated previews are disabled by default to avoid quota usage.",
					},
					{ status: 404 },
				);
			}

			if (!OPENAI_API_KEY) {
				return NextResponse.json(
					{ error: "Missing OPENAI_API_KEY" },
					{ status: 500 },
				);
			}

			const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${OPENAI_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: OPENAI_TTS_PREVIEW_MODEL,
					voice: voiceId,
					input: VOICE_PREVIEW_TEXT,
					response_format: "mp3",
				}),
				cache: "no-store",
			});

			if (!upstream.ok) {
				const body = await upstream.text().catch(() => "");
				return NextResponse.json(
					{ error: "Failed to generate OpenAI voice preview", upstream: body },
					{ status: upstream.status },
				);
			}

			return new Response(upstream.body, {
				status: 200,
				headers: {
					"Content-Type": upstream.headers.get("content-type") ?? "audio/mpeg",
					"Cache-Control": "private, max-age=300",
				},
			});
		}

		if (provider === "gemini") {
			if (!GEMINI_API_KEY) {
				return NextResponse.json(
					{
						error:
							"Missing GOOGLE_API_KEY, GEMINI_API_KEY, or GOOGLE_GENAI_API_KEY",
					},
					{ status: 500 },
				);
			}

			const upstream = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_TTS_PREVIEW_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contents: [{ parts: [{ text: VOICE_PREVIEW_TEXT }] }],
						generationConfig: {
							responseModalities: ["AUDIO"],
							speechConfig: {
								voiceConfig: {
									prebuiltVoiceConfig: { voiceName: voiceId },
								},
							},
						},
					}),
					cache: "no-store",
				},
			);
			const data = await upstream.json().catch(() => ({}));
			const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
			const audioBase64 =
				typeof inlineData?.data === "string" ? inlineData.data : "";
			const mimeType =
				typeof inlineData?.mimeType === "string" ? inlineData.mimeType : "";

			if (!upstream.ok || !audioBase64) {
				return NextResponse.json(
					{ error: "Failed to generate Gemini voice preview", upstream: data },
					{ status: upstream.ok ? 404 : upstream.status },
				);
			}

			const audioBuffer = Uint8Array.from(Buffer.from(audioBase64, "base64"));
			const playableBuffer = mimeType.includes("wav")
				? audioBuffer
				: createWavBuffer(audioBuffer);

			return new Response(toArrayBuffer(playableBuffer), {
				status: 200,
				headers: {
					"Content-Type": "audio/wav",
					"Cache-Control": "private, max-age=300",
				},
			});
		}

		if (provider !== "liveavatar") {
			return NextResponse.json(
				{ error: `Voice previews are not available for ${provider}` },
				{ status: 404 },
			);
		}

		if (!LIVEAVATAR_API_KEY) {
			return missingLiveAvatarKeyResponse();
		}

		const upstream = await fetch(
			`${LIVEAVATAR_BASE}/v1/voices/${encodeURIComponent(voiceId)}/preview`,
			{
				method: "GET",
				headers: liveAvatarHeaders(),
				cache: "no-store",
			},
		);

		const contentType =
			upstream.headers.get("content-type") ?? "application/octet-stream";

		if (!upstream.ok) {
			let body: unknown = null;
			try {
				body = await upstream.json();
			} catch {
				body = await upstream.text();
			}

			const isAuthError = upstream.status === 401 || upstream.status === 403;

			return NextResponse.json(
				{
					error: isAuthError
						? getLiveAvatarAuthErrorMessage(body)
						: getLiveAvatarErrorMessage(
								body,
								"Failed to fetch LiveAvatar voice preview",
							),
					upstream: body,
				},
				{ status: upstream.status },
			);
		}

		return new Response(upstream.body, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "private, max-age=300",
			},
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
