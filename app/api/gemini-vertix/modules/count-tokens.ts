import type { CountTokensResponse } from "../sdk";
import {
	ModuleError,
	ModuleOptions,
	ModuleSuccess,
	normaliseError,
	splitModuleOptions,
	validateCountTokensRequest,
} from "./shared";

export type CountTokensResult =
	| ModuleSuccess<CountTokensResponse>
	| ModuleError;

export async function countTokens(
	payload: unknown,
	options?: ModuleOptions,
): Promise<CountTokensResult> {
	try {
		const body = validateCountTokensRequest(payload);
		const { client, requestOptions } = splitModuleOptions(options);
		const data = await client.countTokens(body, requestOptions);
		return { ok: true, status: 200, data };
	} catch (error) {
		return normaliseError(error);
	}
}
