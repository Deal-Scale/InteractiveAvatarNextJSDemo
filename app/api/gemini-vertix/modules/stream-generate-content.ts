import {
	ModuleError,
	ModuleOptions,
	ModuleStreamSuccess,
	normaliseError,
	splitModuleOptions,
	validateGenerateContentRequest,
} from "./shared";

export type StreamGenerateContentResult = ModuleStreamSuccess | ModuleError;

export async function streamGenerateContent(
	payload: unknown,
	options?: ModuleOptions,
): Promise<StreamGenerateContentResult> {
	try {
		const body = validateGenerateContentRequest(payload);
		const { client, requestOptions } = splitModuleOptions(options);
		const stream = client.streamGenerateContent(body, requestOptions);
		return { ok: true, status: 200, stream };
	} catch (error) {
		return normaliseError(error);
	}
}
