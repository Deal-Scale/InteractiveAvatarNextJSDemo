export interface ApiKeyProviderOptions {
	readonly apiKey?: string;
	readonly envVar?: string;
	readonly resolve?: () => Promise<string | undefined> | string | undefined;
}

export function createApiKeyProvider(options: ApiKeyProviderOptions = {}) {
	return async (): Promise<string | undefined> => {
		if (options.apiKey) {
			return options.apiKey;
		}

		if (options.resolve) {
			const resolved = await options.resolve();
			if (resolved) {
				return resolved;
			}
		}

		if (options.envVar) {
			return process.env[options.envVar];
		}

		return undefined;
	};
}
