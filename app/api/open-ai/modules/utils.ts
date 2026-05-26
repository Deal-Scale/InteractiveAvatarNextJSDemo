export function isPlainObject(
	value: unknown,
): value is Record<string, unknown> {
	return (
		value !== null &&
		typeof value === "object" &&
		(value as Record<string, unknown>).constructor === Object
	);
}

export function applyPathParams(
	path: string,
	params: Record<string, unknown> = {},
): string {
	return path.replace(/\{(.*?)\}/g, (_, key: string) => {
		if (!(key in params)) {
			throw new Error(`Missing required path parameter: ${key}`);
		}

		return encodeURIComponent(String(params[key]));
	});
}

export function extractQueryParams(
	parameters: readonly { in: string; name: string }[],
	provided: Record<string, unknown> = {},
): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const parameter of parameters) {
		if (parameter.in !== "query") {
			continue;
		}

		if (parameter.name in provided) {
			result[parameter.name] = provided[parameter.name];
		}
	}

	return result;
}

export function extractHeaderParams(
	parameters: readonly { in: string; name: string }[],
	provided: Record<string, unknown> = {},
): Record<string, string> {
	const result: Record<string, string> = {};

	for (const parameter of parameters) {
		if (parameter.in !== "header") {
			continue;
		}

		if (parameter.name in provided) {
			result[parameter.name] = String(provided[parameter.name]);
		}
	}

	return result;
}
