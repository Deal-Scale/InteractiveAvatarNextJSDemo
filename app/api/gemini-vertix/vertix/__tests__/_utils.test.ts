import { describe, expect, it } from "vitest";

import {
	DEFAULT_VERTEX_ENDPOINT,
	buildVertexTargetUrl,
	selectVertexEndpoint,
	sanitizeEndpoint,
	type VertexEndpointConfig,
} from "../_utils";

describe("selectVertexEndpoint", () => {
	const baseConfig: VertexEndpointConfig = {
		defaultEndpoint: DEFAULT_VERTEX_ENDPOINT,
		defaultRegion: "us-central1",
	};

	it("prefers an explicit endpoint override", () => {
		const endpoint = selectVertexEndpoint(
			baseConfig,
			null,
			"https://example.com/",
		);
		expect(endpoint).toBe("https://example.com");
	});

	it("builds a regional endpoint when a region override is provided", () => {
		const endpoint = selectVertexEndpoint(baseConfig, "europe-west4", null);
		expect(endpoint).toBe("https://europe-west4-aiplatform.googleapis.com");
	});

	it("falls back to the configured region when no override is provided", () => {
		const endpoint = selectVertexEndpoint(baseConfig, undefined, null);
		expect(endpoint).toBe("https://us-central1-aiplatform.googleapis.com");
	});

	it("falls back to the default endpoint when no region is available", () => {
		const endpoint = selectVertexEndpoint(
			{ defaultEndpoint: DEFAULT_VERTEX_ENDPOINT },
			null,
			null,
		);
		expect(endpoint).toBe(DEFAULT_VERTEX_ENDPOINT);
	});
});

describe("buildVertexTargetUrl", () => {
	it("joins path segments and preserves the search string", () => {
		const url = buildVertexTargetUrl(
			"https://us-central1-aiplatform.googleapis.com/",
			["v1", "projects", "demo"],
			"?foo=bar",
		);

		expect(url).toBe(
			"https://us-central1-aiplatform.googleapis.com/v1/projects/demo?foo=bar",
		);
	});

	it("throws when no path segments are provided", () => {
		expect(() => buildVertexTargetUrl(DEFAULT_VERTEX_ENDPOINT, [], "")).toThrow(
			/path is required/i,
		);
	});

	it("normalizes whitespace in the base endpoint", () => {
		const url = buildVertexTargetUrl(
			" https://api.example.com/ ",
			["v1", "items"],
			"",
		);
		expect(url).toBe("https://api.example.com/v1/items");
	});
});

describe("sanitizeEndpoint", () => {
	it("trims whitespace and trailing slashes", () => {
		expect(sanitizeEndpoint(" https://api.example.com/// ")).toBe(
			"https://api.example.com",
		);
	});
});
