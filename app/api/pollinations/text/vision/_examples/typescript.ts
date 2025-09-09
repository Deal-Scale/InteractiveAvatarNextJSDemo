// Example: TypeScript client calling the local Pollinations Vision proxy route

async function analyzeImageUrl(
	imageUrl: string,
	question = "What is in this image?",
) {
	const body = {
		model: "openai",
		messages: [
			{
				role: "user",
				content: [
					{ type: "text", text: question },
					{ type: "image_url", image_url: { url: imageUrl } },
				],
			},
		],
		max_tokens: 300,
	};
	const res = await fetch("/api/pollinations/text/vision", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(await res.text());
	const json = await res.json();
	return json?.choices?.[0]?.message?.content as string | undefined;
}

// Usage
// void analyzeImageUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg").then(console.log);
