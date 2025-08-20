import {
	GridQueryParams,
	GridResponse,
	GridItem,
} from "@/types/component-grid";

// Build URLSearchParams from GridQueryParams
export function buildGridQuery(params: GridQueryParams): URLSearchParams {
	const q = new URLSearchParams();
	q.set("page", String(params.page));
	q.set("page_size", String(params.pageSize));
	if (params.search) q.set("search", params.search);
	if (params.categories?.length)
		q.set("categories", params.categories.join(","));
	if (params.tags?.length) q.set("tags", params.tags.join(","));
	if (params.extras) {
		for (const [k, v] of Object.entries(params.extras)) {
			if (v === undefined || v === null) continue;
			q.set(k, typeof v === "string" ? v : JSON.stringify(v));
		}
	}
	return q;
}

export type FetchGridOptions = {
	endpoint: string; // absolute or relative API endpoint
	revalidateSeconds?: number; // ISR seconds; omit to default 60s; set 0 for no-store
	tags?: string[]; // Next.js cache tags
	headers?: HeadersInit; // extra headers
};

// Server-side fetch wrapper with Next.js caching guidance
export async function fetchGridData<TItem extends GridItem = GridItem>(
	params: GridQueryParams,
	options: FetchGridOptions,
): Promise<GridResponse<TItem>> {
	const { endpoint, revalidateSeconds = 60, tags = [], headers } = options;
	const query = buildGridQuery(params);
	const url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${query.toString()}`;

	const nextOpts: RequestInit & {
		next?: { revalidate?: number; tags?: string[] };
	} = {
		headers: {
			"content-type": "application/json",
			...(headers || {}),
		},
	};

	if (revalidateSeconds === 0) {
		// Highly dynamic
		nextOpts.cache = "no-store";
	} else {
		nextOpts.next = { revalidate: revalidateSeconds, tags };
	}

	const res = await fetch(url, nextOpts);
	if (!res.ok) {
		throw new Error(`Grid fetch failed (${res.status})`);
	}
	const data = (await res.json()) as GridResponse<TItem>;
	return data;
}
