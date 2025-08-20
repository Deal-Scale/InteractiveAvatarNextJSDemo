"use client";
import React from "react";

export type ComponentGridControlsProps = {
	// Search
	search: string;
	onSearchChange: (v: string) => void;
	// Categories (multi-select OR semantics)
	categories?: string[];
	selectedCategories: string[];
	onCategoriesChange: (values: string[]) => void;
	// Mode
	mode: "infinite" | "paged";
	onModeChange?: (m: "infinite" | "paged") => void;
	// Misc
	onClearAll?: () => void;
	className?: string;
};

export default function ComponentGridControls({
	search,
	onSearchChange,
	categories = [],
	selectedCategories,
	onCategoriesChange,
	mode,
	onModeChange,
	onClearAll,
	className,
}: ComponentGridControlsProps) {
	const toggleCategory = (c: string) => {
		if (!onCategoriesChange) return;
		const exists = selectedCategories.includes(c);
		const next = exists
			? selectedCategories.filter((x) => x !== c)
			: [...selectedCategories, c];
		onCategoriesChange(next);
	};

	return (
		<div
			className={"flex flex-col gap-3 " + (className ?? "")}
			aria-label="Grid Controls"
			role="group"
		>
			<div className="flex items-center gap-2">
				<input
					aria-label="Search"
					placeholder="Search..."
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
				/>
				{onClearAll && (
					<button
						type="button"
						onClick={onClearAll}
						className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
						aria-label="Clear filters"
					>
						Clear
					</button>
				)}
			</div>

			{categories.length > 0 && (
				<div
					className="flex flex-wrap items-center gap-3"
					aria-label="Category Filters"
				>
					{categories.map((c) => (
						<label key={c} className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={selectedCategories.includes(c)}
								onChange={() => toggleCategory(c)}
								aria-label={`Filter by ${c}`}
							/>
							<span>{c}</span>
						</label>
					))}
				</div>
			)}

			{onModeChange && (
				<div className="flex items-center gap-3" aria-label="Paging Mode">
					<label className="flex items-center gap-2 text-sm">
						<input
							type="radio"
							name="grid-mode"
							checked={mode === "infinite"}
							onChange={() => onModeChange("infinite")}
						/>
						<span>Infinite</span>
					</label>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="radio"
							name="grid-mode"
							checked={mode === "paged"}
							onChange={() => onModeChange("paged")}
						/>
						<span>Paged</span>
					</label>
				</div>
			)}
		</div>
	);
}
