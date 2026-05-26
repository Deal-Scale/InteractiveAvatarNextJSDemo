// Pollinations MCP service helpers
// ! This module demonstrates how to call the Pollinations MCP server tools from this project
// * It relies on the shared MCP client wrapper at lib/services/mcp/client/mcpClient.ts
// ? Ensure your environment points to the correct MCP server:
//    - HTTP:   MCP_SERVER_URL, MCP_AUTH_TOKEN (or TEST_MCP_SERVER_URL/TEST_MCP_KEY in CI/tests)
//    - STDIO:  MCP_STDIO_COMMAND, MCP_STDIO_ARGS, REGISTRY_URL (falls back to prompt-kit registry)

import { mcpClient } from "./client/mcpClient";

// Types kept intentionally broad to avoid tight coupling with server impl details
export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [k: string]: JsonValue };

export interface MCPToolResult<T = unknown> {
	content?: T;
	[key: string]: unknown;
}

// Lightweight shapes for common responses
export interface PollinationsModel {
	id?: string;
	name?: string;
	type?: "image" | "text" | "audio" | string;
	[k: string]: unknown;
}

export interface PollinationsVoice {
	id?: string;
	name?: string;
	[k: string]: unknown;
}

// -------- General --------
export async function listModels(filter?: {
	type?: "image" | "text" | "audio";
}) {
	const res = (await mcpClient.callTool(
		"listModels",
		filter ?? {},
	)) as MCPToolResult;
	return res.content;
}

// -------- Text --------
export async function listTextModels() {
	const res = (await mcpClient.callTool("listTextModels", {})) as MCPToolResult;
	return res.content;
}

// -------- Image --------
export async function listImageModels() {
	const res = (await mcpClient.callTool(
		"listImageModels",
		{},
	)) as MCPToolResult<PollinationsModel[] | unknown>;
	return res.content as PollinationsModel[] | unknown;
}

export async function generateImageUrl(args: {
	prompt: string;
	width?: number;
	height?: number;
	model?: string;
	seed?: number;
	nologo?: boolean;
	enhance?: boolean;
}) {
	const res = (await mcpClient.callTool(
		"generateImageUrl",
		args,
	)) as MCPToolResult<{ url?: string }>;
	return res.content;
}

export async function generateImage(args: {
	prompt: string;
	width?: number;
	height?: number;
	model?: string;
	seed?: number;
	nologo?: boolean;
	enhance?: boolean;
}) {
	const res = (await mcpClient.callTool(
		"generateImage",
		args,
	)) as MCPToolResult<{ base64?: string; mime?: string }>;
	return res.content;
}

// -------- Audio --------
export async function listAudioVoices() {
	const res = (await mcpClient.callTool(
		"listAudioVoices",
		{},
	)) as MCPToolResult<PollinationsVoice[] | unknown>;
	return res.content as PollinationsVoice[] | unknown;
}

export async function respondAudio(args: { prompt: string; voice?: string }) {
	const res = (await mcpClient.callTool(
		"respondAudio",
		args,
	)) as MCPToolResult<{ base64?: string; mime?: string; url?: string }>;
	return res.content;
}

export async function sayText(args: { text: string; voice?: string }) {
	const res = (await mcpClient.callTool("sayText", args)) as MCPToolResult<{
		base64?: string;
		mime?: string;
		url?: string;
	}>;
	return res.content;
}

// -------- Convenience demo flows --------
export async function demoImageFlow(
	prompt = "A neon cyberpunk fox, 4k, detailed",
) {
	const models = (await listImageModels()) as PollinationsModel[] | unknown;
	const primaryModelId = Array.isArray(models)
		? (models as PollinationsModel[])[0]?.id
		: undefined;
	const urlResult = await generateImageUrl({
		prompt,
		width: 768,
		height: 512,
		model: primaryModelId,
	});
	return { models, urlResult };
}

export async function demoAudioFlow(
	text = "Hello from Pollinations MCP",
	voice = "alloy",
) {
	const voices = (await listAudioVoices()) as PollinationsVoice[] | unknown;
	const primaryVoiceId = Array.isArray(voices)
		? ((voices as PollinationsVoice[])[0]?.id ?? voice)
		: voice;
	const audio = await respondAudio({ prompt: text, voice: primaryVoiceId });
	return { voices, audio };
}
