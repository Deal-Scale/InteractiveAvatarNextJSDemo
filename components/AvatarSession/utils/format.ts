export const formatAttachmentSummary = (files: File[]) =>
	files
		.map((f) => `${f.name} (${Math.max(1, Math.round(f.size / 1024))} KB)`)
		.join(", ");

export const formatAsCodeBlock = (obj: unknown): string => {
	try {
		return `\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``;
	} catch {
		return String(obj);
	}
};

export const parseJsonArgs = (maybeJson: string | undefined) => {
	if (!maybeJson) return undefined;
	try {
		return JSON.parse(maybeJson);
	} catch {
		return undefined;
	}
};
