"use client";

import React from "react";
import { useChatProviderStore } from "@/lib/stores/chatProvider";
import { Button } from "@/components/ui/button";

export const ProviderSwitcher: React.FC = () => {
	const mode = useChatProviderStore((s) => s.mode);
	const setMode = useChatProviderStore((s) => s.setMode);

	return (
		<div className="mb-3 flex items-center gap-2">
			<span className="text-xs text-muted-foreground">Chat provider:</span>
			<div className="flex rounded-md overflow-hidden border border-input">
				<Button
					type="button"
					size="sm"
					variant={mode === "heygen" ? "default" : "ghost"}
					onClick={() => setMode("heygen")}
					aria-pressed={mode === "heygen"}
				>
					Heygen
				</Button>
				<Button
					type="button"
					size="sm"
					variant={mode === "pollinations" ? "default" : "ghost"}
					onClick={() => setMode("pollinations")}
					aria-pressed={mode === "pollinations"}
				>
					Pollinations
				</Button>
			</div>
		</div>
	);
};
