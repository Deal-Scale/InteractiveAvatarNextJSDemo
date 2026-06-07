"use client";

import * as React from "react";

import { Mermaid } from "@/components/ui/mermaid";

export type LiveMermaidChartProps = {
	className?: string;
	intervalMs?: number;
	seed?: number;
	showControls?: boolean;
	title?: string;
};

export function buildMockPipelineMermaid(tick: number, seed = 0) {
	const phase = tick + (seed % 37);
	return `flowchart LR
  intake["Capture ${118 + ((phase * 13) % 54)}"]
  enrich["Enrich ${100 + ((phase * 7) % 40)}"]
  qualify["Qualify ${80 + ((phase * 5) % 30)}"]
  book["Book ${40 + ((phase * 3) % 20)}"]

  intake --> enrich
  enrich --> qualify
  qualify --> book;`;
}

export function LiveMermaidChart({
	className,
	intervalMs = 2500,
	seed,
	showControls,
	title = "Live Pipeline",
}: LiveMermaidChartProps) {
	const [tick, setTick] = React.useState(0);
	const seedRef = React.useRef(seed ?? Date.now());

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
			{title ? <div className="mb-2 text-sm font-medium">{title}</div> : null}
			<Mermaid
				chart={chart}
				liveData={{
					kind: "mockPipeline",
					intervalMs,
					seed: seedRef.current,
				}}
				showControls={showControls}
				title={title}
			/>
		</div>
	);
}
