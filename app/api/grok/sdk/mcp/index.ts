import type { MCPTransport } from "../contracts";

export interface Experimental_StdioMCPTransport<
	Request = unknown,
	Response = unknown,
> extends MCPTransport<Request, Response> {}

export interface MCPClientOptions<Request, Response> {
	readonly transport: Experimental_StdioMCPTransport<Request, Response>;
}

export function experimental_createMCPClient<Request, Response>(
	options: MCPClientOptions<Request, Response>,
) {
	const { transport } = options;

	return {
		send(payload: Request) {
			return transport.send(payload);
		},
		async close() {
			await transport.close?.();
		},
	};
}
