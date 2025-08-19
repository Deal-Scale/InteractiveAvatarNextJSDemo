import type React from "react";

export type Command = {
	id: string;
	label: string;
	keywords?: string[];
	icon?: React.ReactNode;
	description?: string;
	insertText?: string | (() => string);
	/**
	 * When provided, selecting this command should generate a `/mcp <prompt>` text.
	 * We only insert the text into the input; sending is handled by the normal submit flow.
	 */
	mcpPrompt?: string | (() => string);
	action?: () => void;
	children?: Command[];
};
