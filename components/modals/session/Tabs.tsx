import React from "react";

import type { ConfigModalTab } from "@/lib/stores/session";

export type TabKey = ConfigModalTab;

interface TabsHeaderProps {
	activeTab: TabKey;
	setActiveTab: (k: TabKey) => void;
}

export function TabsHeader({ activeTab, setActiveTab }: TabsHeaderProps) {
	const tabs: { key: TabKey; label: string }[] = [
		{ key: "session", label: "Session" },
		{ key: "global", label: "Global Settings" },
		{ key: "user", label: "User Settings" },
		{ key: "agent", label: "Agent" },
	];

	return (
		<div className="sticky top-0 z-10 bg-card">
			<div
				aria-label="Session configuration sections"
				className="flex gap-1 border-b border-border px-4 md:px-6"
				role="tablist"
			>
				{tabs.map((t) => (
					<button
						key={t.key}
						aria-selected={activeTab === t.key}
						className={`relative -mb-px px-3 md:px-4 py-3 text-sm font-medium outline-none transition-colors ${
							activeTab === t.key
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
						role="tab"
						type="button"
						onClick={() => setActiveTab(t.key)}
					>
						{t.label}
						<span
							className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-opacity ${
								activeTab === t.key ? "bg-primary opacity-100" : "opacity-0"
							}`}
						/>
					</button>
				))}
			</div>
		</div>
	);
}
