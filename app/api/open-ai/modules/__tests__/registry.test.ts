import { describe, expect, it, beforeEach } from "vitest";

import {
	buildOperationRegistry,
	matchOperationByPath,
} from "../operation-registry";
import { loadOpenAISpec, resetOpenAISpecCache } from "../spec-loader";
import { OpenAIClient } from "../../sdk/openai-client";

const LIST_ASSISTANTS_OPERATION = "listAssistants";

describe("OpenAI modular SDK", () => {
	beforeEach(() => {
		resetOpenAISpecCache();
	});

	it("builds a registry containing documented operations", async () => {
		const spec = await loadOpenAISpec();
		const registry = buildOperationRegistry(spec);

		expect(registry.byId.has(LIST_ASSISTANTS_OPERATION)).toBe(true);
	});

	it("exposes modules grouped by tag", async () => {
		const client = new OpenAIClient({ apiKey: "test" });
		const modules = await client.modules();

		expect(modules.assistants).toBeDefined();
		expect(modules.assistants.tag).toBe("Assistants");
		expect(typeof modules.assistants[LIST_ASSISTANTS_OPERATION]).toBe(
			"function",
		);
	});

	it("throws when calling unknown operations", async () => {
		const client = new OpenAIClient({ apiKey: "test" });

		await expect(client.call("unknownOperation")).rejects.toThrow(
			/Unknown OpenAI operation/,
		);
	});

	it("matches operations by method and path", async () => {
		const spec = await loadOpenAISpec();
		const registry = buildOperationRegistry(spec);

		const rootMatch = matchOperationByPath(registry, "get", "/assistants");
		expect(rootMatch?.operation.id).toBe(LIST_ASSISTANTS_OPERATION);

		const paramMatch = matchOperationByPath(
			registry,
			"get",
			"/assistants/asst_123",
		);

		expect(paramMatch?.operation.id).toBe("getAssistant");
		expect(paramMatch?.pathParams).toEqual({ assistant_id: "asst_123" });
	});

	it("resolves operations from the client by path", async () => {
		const client = new OpenAIClient({ apiKey: "test" });

		const resolved = await client.resolveOperation(
			"get",
			"/assistants/asst_abc123",
		);

		expect(resolved?.operation.id).toBe("getAssistant");
		expect(resolved?.pathParams.assistant_id).toBe("asst_abc123");
	});
});
