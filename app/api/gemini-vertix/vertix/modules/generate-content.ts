import type { GenerateContentResponse } from "../sdk";
import {
	ModuleError,
	ModuleOptions,
	ModuleSuccess,
	normaliseError,
	splitModuleOptions,
	validateGenerateContentRequest,
} from "./shared";

export type GenerateContentResult =
	| ModuleSuccess<GenerateContentResponse>
	| ModuleError;

export async function generateContent(
	payload: unknown,
	options?: ModuleOptions,
): Promise<GenerateContentResult> {
	try {
		const body = validateGenerateContentRequest(payload);
		const { client, requestOptions } = splitModuleOptions(options);
		const data = await client.generateContent(body, requestOptions);
		return { ok: true, status: 200, data };
	} catch (error) {
		return normaliseError(error);
	}
}
