"use client";

import * as React from "react";
import { Mermaid } from "@/components/ui/mermaid";
import { useDataGridStore } from "@/lib/stores/dataGrid";

export type LiveMermaidChartProps = {
	className?: string;
	intervalMs?: number;
	seed?: number;
	showControls?: boolean;
	title?: string;
};

export function buildMockPipelineMermaid(tick: number, seed = 0) {
	const phase = tick + (seed % 37);
	const captured = 118 + ((phase * 13) % 54);
	const enriched = Math.max(80, captured - 18 + ((phase * 7) % 21));
	const qualified = Math.max(40, enriched - 32 + ((phase * 5) % 18));
	const booked = Math.max(12, qualified - 24 + ((phase * 3) % 12));
	const hotPercent = Math.min(98, Math.round((qualified / captured) * 100));

	return `flowchart LR
  intake["Capture ${captured}"]
  enrich["Enrich ${enriched}"]
  qualify["Qualify ${qualified}"]
  book["Book ${booked}"]
  alert["Hot ${hotPercent}%"]

  intake --> enrich
  enrich --> qualify
  qualify --> book
  qualify --> alert

  classDef active fill:#dbeafe,stroke:#2563eb,color:#0f172a;
  classDef good fill:#dcfce7,stroke:#16a34a,color:#0f172a;
  classDef hot fill:#fee2e2,stroke:#dc2626,color:#0f172a;
  class intake,enrich active;
  class qualify,book good;
  class alert hot;`;
}

export function LiveMermaidChart({
	className,
	intervalMs = 2500,
	seed,
	showControls = true,
	title = "Live Pipeline",
}: LiveMermaidChartProps) {
	const [tick, setTick] = React.useState(0);
	const seedRef = React.useRef(seed ?? Date.now());
	const addLiveMermaidChart = useDataGridStore(
		(state) => state.addLiveMermaidChart,
	);

	React.useEffect(() => {
		const interval = window.setInterval(() => {
			setTick((current) => current + 1);
		}, intervalMs);

		return () => window.clearInterval(interval);
	}, [intervalMs]);

	const chart = React.useMemo(
		() => buildMockPipelineMermaid(tick, seedRef.current),
		[tick],
	);

	return (
		<div className={className}>
			{title ? (
				<div className="mb-2 flex items-center justify-between gap-2 text-sm">
					<div className="font-medium text-muted-foreground">{title}</div>
					<div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
						Live mock data
					</div>
				</div>
			) : null}
			<Mermaid
				chart={chart}
				className={title ? "h-[22rem] min-h-0" : "h-full min-h-0"}
				showControls={showControls}
				onAddToGrid={() => {
					addLiveMermaidChart({ intervalMs, title });
				}}
			/>
		</div>
	);
}
