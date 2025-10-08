import type { DynamicToolDefinition, ToolDefinition } from "../contracts";

export interface CreateToolOptions<TArgs, TResult> {
	readonly name: string;
	readonly description: string;
	readonly schema: { parse(data: unknown): TArgs };
	readonly handler: (args: TArgs) => Promise<TResult> | TResult;
}

export interface CreateDynamicToolOptions<TArgs, TResult> {
	readonly name: string;
	readonly description: string;
	readonly schema: { parse(data: unknown): TArgs };
	readonly resolver: () =>
		| Promise<ToolDefinition<TArgs, TResult>>
		| ToolDefinition<TArgs, TResult>;
}

export function createTool<TArgs, TResult>(
	options: CreateToolOptions<TArgs, TResult>,
): ToolDefinition<TArgs, TResult> {
	return { ...options };
}

export function createDynamicTool<TArgs, TResult>(
	options: CreateDynamicToolOptions<TArgs, TResult>,
): DynamicToolDefinition<TArgs, TResult> & {
	resolve: () => Promise<ToolDefinition<TArgs, TResult>>;
} {
	return {
		...options,
		async resolve() {
			const tool = await options.resolver();
			return tool;
		},
	};
}

export interface ToolRegistry {
	register(tool: ToolDefinition): void;
	list(): ToolDefinition[];
	get(name: string): ToolDefinition | undefined;
}

export function createToolRegistry(): ToolRegistry {
	const tools = new Map<string, ToolDefinition>();

	return {
		register(tool: ToolDefinition) {
			tools.set(tool.name, tool);
		},
		list() {
			return Array.from(tools.values());
		},
		get(name: string) {
			return tools.get(name);
		},
	};
}
