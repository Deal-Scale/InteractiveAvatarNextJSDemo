import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

export function generateId(prefix = "id"): string {
	const nanoid = customAlphabet(alphabet, 12);
	return `${prefix}_${nanoid()}`;
}

export interface IdGeneratorOptions {
	readonly prefix?: string;
}

export function createIdGenerator(options: IdGeneratorOptions = {}) {
	return () => generateId(options.prefix ?? "id");
}
