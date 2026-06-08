const IMPORT_EXPORT_LINE = /^(?:import\s|export\s+const\s+metadata\b)/;
const MDX_TAG_LINE =
	/^<\/?(?:Tabs|TabsList|TabsContent|Steps|ComponentCodePreview)\b[^>]*\/?>$/;
const CODE_BLOCK_TAG = /<CodeBlock\b([^>]*)\/>/;

function getAttr(source: string, name: string) {
	const match = source.match(new RegExp(`${name}="([^"]+)"`));

	return match?.[1];
}

function getCodeAttr(source: string) {
	const match = source.match(/code=\{`([\s\S]*?)`\}/);

	return match?.[1];
}

function stripMetadataBlock(lines: string[], startIndex: number) {
	let index = startIndex + 1;
	while (index < lines.length && !lines[index].trim().startsWith(")")) {
		index += 1;
	}

	return index + 1;
}

function collectTag(lines: string[], startIndex: number) {
	const tagLines = [lines[startIndex].trim()];
	let index = startIndex;
	while (index < lines.length && !lines[index].trim().endsWith("/>")) {
		index += 1;
		tagLines.push(lines[index]?.trim() ?? "");
	}

	return {
		nextIndex: index + 1,
		tag: tagLines.join(" "),
	};
}

function looksLikeCodeStart(line: string) {
	return (
		line === '"use client"' ||
		line.startsWith("import ") ||
		line.startsWith("export function ") ||
		line.startsWith("const ") ||
		line.startsWith("function ")
	);
}

function shouldCloseCodeBlock(line: string) {
	return (
		line.startsWith("#") ||
		line === "Installation" ||
		line === "Component API" ||
		line === "Prompt Suggestion" ||
		line === "Scroll Button"
	);
}

function normalizeFenceLine(rawLine: string) {
	const line = rawLine.trim();
	if (line.startsWith("~~~")) return rawLine.replace("~~~", "```");
	if (line.startsWith("```")) return rawLine;

	return null;
}

export function normalizeMarkdownContent(markdown: string) {
	const lines = markdown
		.replace(/\r\n/g, "\n")
		.replace(/<kbd>(.*?)<\/kbd>/g, "`$1`")
		.split("\n");
	const out: string[] = [];
	let inExplicitCodeFence = false;
	let inCode = false;
	let index = 0;

	while (index < lines.length) {
		const rawLine = lines[index];
		const line = rawLine.trim();

		const fenceLine = normalizeFenceLine(rawLine);
		if (fenceLine) {
			out.push(fenceLine);
			inExplicitCodeFence = !inExplicitCodeFence;
			index += 1;
			continue;
		}

		if (inExplicitCodeFence) {
			out.push(rawLine);
			index += 1;
			continue;
		}

		if (line.startsWith("export const metadata")) {
			index = stripMetadataBlock(lines, index);
			continue;
		}

		if (IMPORT_EXPORT_LINE.test(line)) {
			index += 1;
			continue;
		}

		const step = line.match(/^<Step>(.*)<\/Step>$/);
		if (step) {
			out.push(`- ${step[1]}`);
			index += 1;
			continue;
		}

		const codeTag = line.startsWith("<CodeBlock")
			? collectTag(lines, index)
			: null;
		const codeBlock = (codeTag?.tag ?? line).match(CODE_BLOCK_TAG);
		if (codeBlock) {
			const code = getCodeAttr(codeBlock[1]);
			const language = getAttr(codeBlock[1], "language") ?? "text";
			const filePath = getAttr(codeBlock[1], "filePath");
			out.push("```" + language);
			out.push(code ?? filePath ?? "");
			out.push("```");
			index = codeTag?.nextIndex ?? index + 1;
			continue;
		}

		if (MDX_TAG_LINE.test(line)) {
			index += 1;
			continue;
		}

		if (line.startsWith("<ComponentCodePreview")) {
			index = collectTag(lines, index).nextIndex;
			continue;
		}

		if (!inCode && looksLikeCodeStart(line)) {
			inCode = true;
			out.push("```tsx");
		} else if (inCode && shouldCloseCodeBlock(line)) {
			inCode = false;
			out.push("```");
			out.push("");
		}

		out.push(rawLine);
		index += 1;
	}

	if (inCode) out.push("```");

	return out.join("\n");
}
