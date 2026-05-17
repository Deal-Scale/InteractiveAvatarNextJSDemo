import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DataGridMermaidChart = {
	id: string;
	title: string;
	code: string;
	createdAt: number;
	liveData?: {
		kind: "mockPipeline";
		intervalMs: number;
		seed: number;
	};
};

interface DataGridState {
	mermaidCharts: DataGridMermaidChart[];
	addMermaidChart: (input: { code: string; title?: string }) => string;
	addLiveMermaidChart: (input?: {
		title?: string;
		intervalMs?: number;
	}) => string;
	removeMermaidChart: (id: string) => void;
	clearMermaidCharts: () => void;
}

function createChartId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return `mermaid-${crypto.randomUUID()}`;
	}

	return `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getMermaidTitle(code: string, index: number) {
	const firstLine = code
		.split("\n")
		.map((line) => line.trim())
		.find(Boolean);

	if (!firstLine) return `Mermaid ${index}`;

	const type = firstLine.split(/\s+/)[0] || "Mermaid";
	return `${type[0]?.toUpperCase() ?? "M"}${type.slice(1)} ${index}`;
}

export const useDataGridStore = create<DataGridState>()(
	persist(
		(set) => ({
			mermaidCharts: [],
			addMermaidChart: ({ code, title }) => {
				const normalizedCode = code.trim();
				const id = createChartId();

				set((state) => ({
					mermaidCharts: [
						...state.mermaidCharts,
						{
							id,
							title:
								title ||
								getMermaidTitle(normalizedCode, state.mermaidCharts.length + 1),
							code: normalizedCode,
							createdAt: Date.now(),
						},
					],
				}));

				return id;
			},
			addLiveMermaidChart: (input) => {
				const id = createChartId();
				const intervalMs = input?.intervalMs ?? 2500;
				const seed = Date.now();

				set((state) => ({
					mermaidCharts: [
						...state.mermaidCharts,
						{
							id,
							title:
								input?.title ||
								`Live Mermaid ${state.mermaidCharts.length + 1}`,
							code: "",
							createdAt: Date.now(),
							liveData: {
								kind: "mockPipeline",
								intervalMs,
								seed,
							},
						},
					],
				}));

				return id;
			},
			removeMermaidChart: (id) =>
				set((state) => ({
					mermaidCharts: state.mermaidCharts.filter((chart) => chart.id !== id),
				})),
			clearMermaidCharts: () => set({ mermaidCharts: [] }),
		}),
		{
			name: "data-grid-store",
			storage: createJSONStorage(() => localStorage),
			version: 1,
		},
	),
);
