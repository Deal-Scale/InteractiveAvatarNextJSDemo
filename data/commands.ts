import type { Command } from "@/types/commands";

function formatDate() {
	const d = new Date();
	return d.toLocaleDateString();
}

function formatTime() {
	const d = new Date();
	return d.toLocaleTimeString();
}

export const defaultCommands: Command[] = [
	{
		id: "insert-date",
		label: "Insert date",
		keywords: ["date", "today"],
		icon: "📅",
		description: "Insert today’s date",
		insertText: formatDate,
	},
	{
		id: "insert-time",
		label: "Insert time",
		keywords: ["time", "now"],
		icon: "⏰",
		description: "Insert current time",
		insertText: formatTime,
	},
	{
		id: "insert-snippet",
		label: "Insert snippet ▸",
		keywords: ["snippet", "templates"],
		icon: "✍️",
		description: "Quick text snippets",
		children: [
			{
				id: "snippet-greeting",
				label: "Greeting",
				icon: "💬",
				description: "Polite greeting",
				insertText: "Hello! How can I help you today?",
			},
			{
				id: "snippet-summary",
				label: "Summary",
				icon: "📝",
				description: "Bulleted summary",
				insertText: "Summary:\n- Point 1\n- Point 2\n- Point 3",
			},
			{
				id: "snippet-bug",
				label: "Bug report",
				icon: "🐞",
				description: "Bug template",
				insertText: "Bug report:\nExpected:\nActual:\nSteps to reproduce:\n",
			},
		],
	},
	{
		id: "insert-emoji",
		label: "Insert emoji ▸",
		keywords: ["emoji", "emote", "symbol"],
		icon: "😊",
		description: "Common emoji",
		children: [
			{
				id: "emoji-smile",
				label: "Smile",
				icon: "😊",
				description: "Happy face",
				insertText: "😊",
			},
			{
				id: "emoji-thumbs",
				label: "Thumbs up",
				icon: "👍",
				description: "Approve / like",
				insertText: "👍",
			},
			{
				id: "emoji-fire",
				label: "Fire",
				icon: "🔥",
				description: "Exciting / hot",
				insertText: "🔥",
			},
		],
	},
	{
		id: "start-voice",
		label: "Start voice chat",
		keywords: ["voice", "mic", "start"],
		icon: "🎙️",
		description: "Begin voice session",
		action: () => {},
	},
	{
		id: "stop-voice",
		label: "Stop voice chat",
		keywords: ["voice", "mic", "stop"],
		icon: "🛑",
		description: "End voice session",
		action: () => {},
	},
];
