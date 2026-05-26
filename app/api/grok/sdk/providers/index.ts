import type { ProviderDefinition } from "../contracts";

export interface ProviderRegistry {
	register(provider: ProviderDefinition): void;
	list(): ProviderDefinition[];
	find(name: string): ProviderDefinition | undefined;
}

export function createCustomProvider(
	provider: ProviderDefinition,
): ProviderDefinition {
	return provider;
}

export function createProviderRegistry(): ProviderRegistry {
	const providers = new Map<string, ProviderDefinition>();

	return {
		register(provider: ProviderDefinition) {
			providers.set(provider.name, provider);
		},
		list() {
			return Array.from(providers.values());
		},
		find(name: string) {
			return providers.get(name);
		},
	};
}
