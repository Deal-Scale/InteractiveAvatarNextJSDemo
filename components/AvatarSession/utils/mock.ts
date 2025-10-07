export const mockOpenRouter = async (prompt: string): Promise<string> => {
	await new Promise((r) => setTimeout(r, 400));
	const tips = [
		"(mock) Here's a helpful answer.",
		"(mock) I can assist with that.",
		"(mock) Consider breaking the task into steps.",
	];

	const tip = tips[Math.floor(Math.random() * tips.length)];

	return `${tip}\n\nYou said: "${prompt.slice(0, 160)}"`;
};
