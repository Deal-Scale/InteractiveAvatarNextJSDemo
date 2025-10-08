export const DEFAULT_VERTEX_ENDPOINT = "https://aiplatform.googleapis.com";

export type VertexEndpointConfig = {
	defaultEndpoint?: string | null;
	defaultRegion?: string | null;
};

const REGION_PATTERN = /^[a-z0-9-]+$/i;

export function sanitizeEndpoint(endpoint: string): string {
	const trimmed = endpoint.trim();
	return trimmed.replace(/\/+$/, "");
}

export function selectVertexEndpoint(
	config: VertexEndpointConfig,
	regionOverride?: string | null,
	explicitEndpoint?: string | null,
): string {
	if (explicitEndpoint && explicitEndpoint.trim().length > 0) {
		return sanitizeEndpoint(explicitEndpoint);
	}

	const normalizedRegion =
		regionOverride?.trim().toLowerCase() ||
		config.defaultRegion?.trim().toLowerCase();

	if (normalizedRegion && REGION_PATTERN.test(normalizedRegion)) {
		return `https://${normalizedRegion}-aiplatform.googleapis.com`;
	}

	const fallback = config.defaultEndpoint?.trim();

	if (fallback) {
		return sanitizeEndpoint(fallback);
	}

	return DEFAULT_VERTEX_ENDPOINT;
}

export function buildVertexTargetUrl(
	baseEndpoint: string,
	pathSegments: string[],
	search: string,
): string {
	if (!pathSegments.length) {
		throw new Error("Vertex API path is required");
	}

	const cleanedSegments = pathSegments.filter(Boolean);

	if (!cleanedSegments.length) {
		throw new Error("Vertex API path is required");
	}

	const base = sanitizeEndpoint(baseEndpoint);
	const normalizedSearch =
		search.startsWith("?") || search.length === 0 ? search : `?${search}`;

	return `${base}/${cleanedSegments.join("/")}${normalizedSearch}`;
}
