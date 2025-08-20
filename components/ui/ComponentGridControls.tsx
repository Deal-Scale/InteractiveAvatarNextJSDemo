"use client";
import React, { useMemo, useState } from "react";

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
	const [catOpen, setCatOpen] = useState(false);
	const [catQuery, setCatQuery] = useState("");
	const toggleCategory = (c: string) => {
		if (!onCategoriesChange) return;
		const exists = selectedCategories.includes(c);
		const next = exists
			? selectedCategories.filter((x) => x !== c)
			: [...selectedCategories, c];
		onCategoriesChange(next);
	};

	const filteredCategories = useMemo(() => {
		const q = catQuery.trim().toLowerCase();
		if (!q) return categories;
		return categories.filter((c) => c.toLowerCase().includes(q));
	}, [categories, catQuery]);

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
				<div className="relative" aria-label="Category Filters">
					<button
						type="button"
						className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-gray-50"
						onClick={() => setCatOpen((v) => !v)}
						aria-haspopup="listbox"
						aria-expanded={catOpen}
					>
						<span className="mr-2 font-medium">Categories</span>
						<span className="text-xs text-gray-500">
							{selectedCategories.length > 0
								? `${selectedCategories.length} selected`
								: "All"}
						</span>
					</button>
					{catOpen && (
						<div
							role="listbox"
							aria-label="Select categories"
							className="absolute z-20 mt-1 w-full rounded-md border bg-white p-2 shadow-lg"
						>
							<input
								aria-label="Filter categories"
								placeholder="Search categories..."
								value={catQuery}
								onChange={(e) => setCatQuery(e.target.value)}
								className="mb-2 w-full rounded-md border px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
							/>
							<div className="max-h-56 overflow-auto pr-1">
								{filteredCategories.length === 0 && (
									<div className="px-2 py-3 text-sm text-gray-500">
										No matches
									</div>
								)}
								{filteredCategories.map((c) => (
									<label
										key={c}
										className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50"
									>
										<input
											type="checkbox"
											checked={selectedCategories.includes(c)}
											onChange={() => toggleCategory(c)}
											aria-label={`Filter by ${c}`}
										/>
										<span className="truncate">{c}</span>
									</label>
								))}
							</div>
							<div className="mt-2 flex items-center justify-between">
								<button
									type="button"
									className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
									onClick={() => onCategoriesChange([])}
								>
									Clear
								</button>
								<button
									type="button"
									className="rounded-md bg-gray-900 px-2 py-1 text-xs text-white hover:bg-black"
									onClick={() => setCatOpen(false)}
								>
									Done
								</button>
							</div>
						</div>
					)}
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
