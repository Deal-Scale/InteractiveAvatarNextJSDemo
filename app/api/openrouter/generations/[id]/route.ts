import { corsHeaders, proxyTo } from "../../_utils";

export async function OPTIONS(req: Request): Promise<Response> {
	const headers = corsHeaders(req.headers.get("origin") || undefined);
	return new Response(null, { status: 204, headers });
}

export async function GET(
	req: Request,
	{ params }: { params: { id: string } },
): Promise<Response> {
	return proxyTo(req, `/generations/${params.id}`);
}
