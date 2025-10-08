import { describe, expect, it } from "vitest";

import { smoothStream } from "@/app/api/grok/sdk/stream";

async function* generator() {
	yield { text: "a" };
	yield { text: "" };
	yield { text: "b" };
}

describe("smoothStream", () => {
	it("filters empty chunks", async () => {
		const result: string[] = [];
		for await (const chunk of smoothStream(generator(), {
			filterEmpty: true,
		})) {
			result.push(chunk.text);
		}

		expect(result).toEqual(["a", "b"]);
	});
});
