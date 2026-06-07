import type React from "react";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";

interface PromptSuggestionsProps {
	chatInput: string;
	isVoiceChatActive: boolean;
	promptSuggestions: string[];
	onChatInputChange: (value: string) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({
	chatInput,
	isVoiceChatActive,
	promptSuggestions,
	onChatInputChange,
}) => {
	return (
		<>
			{chatInput.trim() === "" ? (
				<div className="flex flex-wrap gap-2 px-2 pt-2">
					{promptSuggestions.map((s) => (
						<PromptSuggestion
							key={s}
							className="rounded-full bg-accent/30 text-foreground hover:bg-accent/50 border-transparent"
							disabled={isVoiceChatActive}
							size="sm"
							variant="secondary"
							onClick={() => onChatInputChange(s)}
						>
							{s}
						</PromptSuggestion>
					))}
				</div>
			) : (
				<div className="px-2 pt-2">
					{(() => {
						const filtered = promptSuggestions
							.filter((s) =>
								s.toLowerCase().includes(chatInput.trim().toLowerCase()),
							)
							.slice(0, 6);
						if (filtered.length === 0) return null;
						return (
							<div
								className="flex max-h-40 flex-col gap-1 overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-1 text-slate-50 shadow-sm"
								data-overlay-surface="opaque"
							>
								{filtered.map((s) => (
									<PromptSuggestion
										key={s}
										className="rounded-lg"
										disabled={isVoiceChatActive}
										highlight={chatInput.trim()}
										size="sm"
										variant="ghost"
										onClick={() => onChatInputChange(s)}
									>
										{s}
									</PromptSuggestion>
								))}
							</div>
						);
					})()}
				</div>
			)}
		</>
	);
};
