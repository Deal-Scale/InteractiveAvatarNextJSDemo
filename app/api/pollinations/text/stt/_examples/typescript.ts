// Example: TypeScript client calling the local Pollinations STT proxy route

async function transcribe(base64: string, fmt: "wav" | "mp3" = "wav") {
	const body = {
		model: "openai-audio",
		messages: [
			{
				role: "user",
				content: [
					{ type: "text", text: "Transcribe this:" },
					{ type: "input_audio", input_audio: { data: base64, format: fmt } },
				],
			},
		],
	};

	const res = await fetch("/api/pollinations/text/stt", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(await res.text());
	const json = await res.json();
	return json?.choices?.[0]?.message?.content as string | undefined;
}

// Usage (provide your own base64 audio string)
// void transcribe("<base64>", "wav").then(console.log);
