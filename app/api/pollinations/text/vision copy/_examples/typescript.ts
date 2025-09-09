// Example: Function Calling round-trip via local OpenAI-compatible proxy

interface ToolCall {
	id: string;
	type: "function";
	function: { name: string; arguments: string };
}

interface ChatMessage {
	role: "system" | "user" | "assistant" | "tool";
	content?: string;
	tool_calls?: ToolCall[];
	tool_call_id?: string;
	name?: string;
}

async function get_current_weather(
	location: string,
	unit: "celsius" | "fahrenheit" = "celsius",
) {
	return JSON.stringify({
		location,
		temperature: "15",
		unit,
		description: "Cloudy",
	});
}

export async function runFunctionCallingDemo() {
	const tools = [
		{
			type: "function",
			function: {
				name: "get_current_weather",
				description: "Get the current weather in a given location",
				parameters: {
					type: "object",
					properties: {
						location: { type: "string", description: "City and state" },
						unit: {
							type: "string",
							enum: ["celsius", "fahrenheit"],
							default: "celsius",
						},
					},
					required: ["location"],
				},
			},
		},
	];

	const messages: ChatMessage[] = [
		{ role: "user", content: "What's the weather in Tokyo?" },
	];

	const firstRes = await fetch("/api/pollinations/text/chat-completion", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model: "openai",
			messages,
			tools,
			tool_choice: "auto",
		}),
	});
	if (!firstRes.ok) throw new Error(await firstRes.text());
	const firstJson = await firstRes.json();

	const assistantMsg: ChatMessage | undefined =
		firstJson?.choices?.[0]?.message;
	const toolCalls: ToolCall[] | undefined = assistantMsg?.tool_calls;
	if (!assistantMsg) return firstJson;
	messages.push(assistantMsg);

	if (Array.isArray(toolCalls) && toolCalls.length > 0) {
		for (const call of toolCalls) {
			if (
				call.type === "function" &&
				call.function?.name === "get_current_weather"
			) {
				let args: { location?: string; unit?: "celsius" | "fahrenheit" } = {};
				try {
					args = JSON.parse(call.function.arguments || "{}");
				} catch {}
				const content = await get_current_weather(
					args.location ?? "",
					args.unit ?? "celsius",
				);
				messages.push({
					role: "tool",
					tool_call_id: call.id,
					name: call.function.name,
					content,
				});
			}
		}

		const secondRes = await fetch("/api/pollinations/text/chat-completion", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ model: "openai", messages }),
		});
		if (!secondRes.ok) throw new Error(await secondRes.text());
		const secondJson = await secondRes.json();
		return secondJson?.choices?.[0]?.message?.content as string | undefined;
	}

	return assistantMsg.content;
}
