import * as React from "react";

const MERMAID_FENCE_PATTERN = /^```(?:mermaid|mmd|textmermaid)?(?:\s+.*)?$/i;
const MERMAID_PREAMBLE_PATTERN =
	/^(?:syntax\s+error\s+in\s+)?(?:textmermaid|mermaid|mmd)(?:\s+version\s+[\d.]+)?$/i;

function decodeHtmlEntities(value: string) {
	return value
		.replace(/&gt;/g, ">")
		.replace(/&lt;/g, "<")
		.replace(/&amp;/g, "&")
		.replace(/&#123;/g, "{")
		.replace(/&#125;/g, "}")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

function getNodeText(node: React.ReactNode): string {
	if (node === null || node === undefined || typeof node === "boolean") {
		return "";
	}

	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}

	if (Array.isArray(node)) {
		return node.map(getNodeText).join("");
	}

	if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
		return getNodeText(node.props.children);
	}

	return "";
}

export function normalizeMermaidSource(
	chart: string | undefined,
	children: React.ReactNode,
) {
	const source = chart ?? getNodeText(children);

	return decodeHtmlEntities(source)
		.split(/\r?\n/)
		.map((line) => line.trimEnd())
		.filter((line) => {
			const trimmed = line.trim();

			return (
				trimmed !== "```" &&
				!MERMAID_FENCE_PATTERN.test(trimmed) &&
				!MERMAID_PREAMBLE_PATTERN.test(trimmed)
			);
		})
		.join("\n")
		.trim();
}
