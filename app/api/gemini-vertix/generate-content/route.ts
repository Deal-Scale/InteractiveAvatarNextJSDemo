import { generateContent } from "../modules/generate-content";

function invalidJsonResponse(): Response {
	return new Response(
		JSON.stringify({ code: 400, message: "Invalid JSON body" }),
		{
			status: 400,
			headers: { "Content-Type": "application/json" },
		},
	);
}

export async function POST(request: Request): Promise<Response> {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch (error) {
		console.error("Failed to parse generateContent request", error);
		return invalidJsonResponse();
	}

	const result = await generateContent(payload);

	if (result.ok) {
		return new Response(JSON.stringify(result.data), {
			status: result.status,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(JSON.stringify(result.error), {
		status: result.status,
		headers: { "Content-Type": "application/json" },
	});
}
