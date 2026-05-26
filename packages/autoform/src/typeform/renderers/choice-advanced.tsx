import React from "react";

import {
	FieldError,
	FieldLabel,
	TypeformRendererMap,
	TypeformRendererProps,
	ensureArray,
	getOptions,
} from "./shared";

const renderRanking = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const options = getOptions(cfg);
	const value = ensureArray<string>(form.watch(name as any));
	const ordered = React.useMemo(() => {
		const missing = options.filter((opt) => !value.includes(opt.value));
		return [...value, ...missing.map((opt) => opt.value)];
	}, [options, value]);

	const move = (index: number, delta: number) => {
		const next = [...ordered];
		const target = index + delta;
		if (target < 0 || target >= next.length) return;
		const [item] = next.splice(index, 1);
		next.splice(target, 0, item);
		form.setValue(name as any, next as any, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	return (
		<div className="flex flex-col gap-2">
			<FieldLabel description={cfg.description} label={label} />
			<ul className="space-y-2">
				{ordered.map((valueKey, index) => {
					const option = options.find((opt) => opt.value === valueKey) ?? {
						label: valueKey,
						value: valueKey,
					};
					return (
						<li
							key={valueKey}
							className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
						>
							<span>
								<span className="mr-2 text-xs text-muted-foreground">
									{index + 1}.
								</span>
								{option.label}
							</span>
							<div className="flex gap-1">
								<button
									className="rounded border border-border px-2 py-1 text-xs"
									onClick={(event) => {
										event.preventDefault();
										move(index, -1);
									}}
									type="button"
								>
									↑
								</button>
								<button
									className="rounded border border-border px-2 py-1 text-xs"
									onClick={(event) => {
										event.preventDefault();
										move(index, 1);
									}}
									type="button"
								>
									↓
								</button>
							</div>
						</li>
					);
				})}
			</ul>
			<FieldError message={error} />
		</div>
	);
};

const renderMatrix = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const matrix = cfg.questionSettings?.matrix as
		| { rows: string[]; columns: string[]; multiSelect?: boolean }
		| undefined;
	if (!matrix) return undefined;
	const value =
		(form.watch(name as any) as Record<string, string | string[]>) ?? {};

	const handleSelect = (row: string, column: string) => {
		if (matrix.multiSelect) {
			const current = ensureArray<string>(value[row]);
			const next = current.includes(column)
				? current.filter((c) => c !== column)
				: [...current, column];
			form.setValue(name as any, { ...value, [row]: next } as any, {
				shouldDirty: true,
				shouldValidate: true,
			});
			return;
		}
		form.setValue(name as any, { ...value, [row]: column } as any, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	return (
		<div className="flex flex-col gap-2 overflow-x-auto">
			<FieldLabel description={cfg.description} label={label} />
			<table className="min-w-full border border-border text-sm">
				<thead className="bg-muted/40">
					<tr>
						<th className="px-3 py-2 text-left" />
						{matrix.columns.map((column) => (
							<th key={column} className="px-3 py-2 text-left font-medium">
								{column}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{matrix.rows.map((row) => {
						const rowValue = value[row];
						return (
							<tr key={row} className="border-t border-border">
								<th className="px-3 py-2 text-left font-medium">{row}</th>
								{matrix.columns.map((column) => {
									const selected = matrix.multiSelect
										? ensureArray(rowValue).includes(column)
										: rowValue === column;
									return (
										<td key={column} className="px-3 py-2">
											<button
												className={`h-8 w-8 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-primary ${
													selected
														? "border-primary bg-primary text-primary-foreground"
														: "border-border"
												}`}
												onClick={(event) => {
													event.preventDefault();
													handleSelect(row, column);
												}}
												type="button"
											>
												{selected ? "✓" : ""}
											</button>
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
			<FieldError message={error} />
		</div>
	);
};

export const advancedChoiceRenderers: TypeformRendererMap = {
	ranking: renderRanking,
	matrix: renderMatrix,
};
