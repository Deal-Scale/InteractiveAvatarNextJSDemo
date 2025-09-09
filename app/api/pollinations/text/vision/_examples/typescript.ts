// Example: TypeScript client calling the local Pollinations proxy route

async function chatCompletion(
	messages: { role: string; content: unknown }[],
	stream = false,
) {
	const res = await fetch("/api/pollinations/text/chat-completion", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ model: "openai", messages, stream }),
	});

	if (!stream) {
		const json = await res.json();
		return json.choices?.[0]?.message?.content as string | undefined;
	}

	// Streaming example (SSE). Here we just read chunks as text
	const reader = res.body?.getReader();
	const decoder = new TextDecoder();
	if (!reader) return;

	let full = "";
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		const chunk = decoder.decode(value);
		// Parse `data: ...` lines here if needed; this demo just concatenates
		full += chunk;
	}
	return full;
}

// Usage
chatCompletion([
	{ role: "system", content: "You are a helpful assistant." },
	{ role: "user", content: "Say hi in one sentence." },
]).then(console.log);
