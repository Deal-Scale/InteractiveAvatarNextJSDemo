"use client";
import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

import {
	unwrapType,
	enumStringValuesFromZodEnum,
	optionsFromStrings,
	booleanSelectOptions,
	isSensitiveString,
	isMultilineString,
	type FieldsConfig,
	parseFileUploadConfig,
} from "./utils/utils";
import { SensitiveInput } from "./utils/fields";

export type AutoFieldProps = {
	name: string;
	def: z.ZodTypeAny;
	form: UseFormReturn<any>;
	fields?: FieldsConfig<any>;
};

export const AutoField: React.FC<AutoFieldProps> = ({
	name,
	def,
	form,
	fields = {},
}) => {
	const { register, formState, setValue, getValues, watch } = form;

	const cfg = (fields as any)[name] || {};
	const label = cfg.label ?? name;
	const error = (formState.errors as any)[name]?.message as string | undefined;

	// Helper to render a select (single or multi)
	const renderSelect = (
		opts: Array<{ value: string; label: string }>,
		multiple = false,
	) => {
		if (multiple) {
			const currentRaw = watch(name as any) as any;
			let current = Array.isArray(currentRaw) ? (currentRaw as string[]) : [];
			// Sanitize against available options to avoid stale/invalid values
			const allowed = new Set(opts.map((o) => o.value));
			const sanitized = current.filter((v) => allowed.has(v));
			if (process.env.NODE_ENV !== "production") {
				try {
					console.debug("[AutoFormDebug] multi-select pre", {
						name,
						current,
						sanitized,
						allowed: Array.from(allowed),
						opts,
						getValues: getValues(name as any),
					});
				} catch {}
			}
			if (sanitized.length !== current.length) {
				current = sanitized;
				setValue(name as any, sanitized as any, {
					shouldValidate: true,
					shouldDirty: true,
					shouldTouch: true,
				});
				if (process.env.NODE_ENV !== "production") {
					try {
						console.warn(
							"[AutoFormDebug] multi-select sanitized mismatch fixed",
							{
								name,
								applied: sanitized,
							},
						);
					} catch {}
				}
			}

			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					{/* Ensure RHF knows about this field when we fully control it */}
					<input type="hidden" {...register(name as any)} />
					<select
						multiple
						className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						value={current as string[]}
						onChange={(e) => {
							const selected = Array.from(e.target.selectedOptions).map((o) =>
								String(o.value),
							);
							setValue(name as any, selected as any, {
								shouldValidate: true,
								shouldDirty: true,
								shouldTouch: true,
							});
							if (process.env.NODE_ENV !== "production") {
								try {
									console.debug("[AutoFormDebug] multi-select change", {
										name,
										selected,
									});
								} catch {}
							}
						}}
					>
						{opts.map((o) => (
							<option key={o.value} value={o.value}>
								{o.label}
							</option>
						))}
					</select>
					{error && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{error}
						</span>
					)}
				</div>
			);
		}

		const current = (watch(name as any) as any) ?? "";

		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				{/* Hidden register so RHF tracks field when we control value */}
				<input type="hidden" {...register(name as any)} />
				<select
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					value={current as string}
					onChange={(e) => {
						setValue(name as any, e.target.value as any, {
							shouldValidate: true,
							shouldDirty: true,
						});
					}}
				>
					<option disabled value="">
						Select {label}
					</option>
					{opts.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
				{error && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{error}
					</span>
				)}
			</div>
		);
	};

	// If the fields config explicitly requests a widget, honor it first
	if ((cfg as any).widget === "select") {
		const opts = ((cfg as any).options ?? []) as Array<{
			value: string;
			label: string;
		}>;
		return (function renderConfiguredSelect() {
			return renderSelect(opts, Boolean((cfg as any).multiple));
		})();
	}
	if ((cfg as any).widget === "textarea") {
		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<textarea
					className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					rows={(cfg as any).rows ?? 5}
					{...register(name as any)}
				/>
				{error && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{error}
					</span>
				)}
			</div>
		);
	}
	if ((cfg as any).widget === "password") {
		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<SensitiveInput name={name} register={register} />
				{error && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{error}
					</span>
				)}
			</div>
		);
	}
	if ((cfg as any).widget === "slider") {
		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<input
					className="w-full accent-primary"
					max={(cfg as any).max}
					min={(cfg as any).min}
					step={(cfg as any).step}
					type="range"
					{...register(name as any, { valueAsNumber: true })}
				/>
				{error && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{error}
					</span>
				)}
			</div>
		);
	}

	const base = unwrapType(def);

	if (process.env.NODE_ENV !== "production") {
		try {
			console.debug("AutoField detect", {
				name,
				typeName: (base as any)?._def?.typeName,
				ctor: (base as any)?.constructor?.name,
			});
		} catch {}
	}

	// Enum (includes nativeEnum in classic build)
	if (
		base instanceof z.ZodEnum ||
		(base as any)?._def?.values ||
		(base as any)?.options
	) {
		const values = enumStringValuesFromZodEnum(base as any);
		const opts = optionsFromStrings(values);

		return renderSelect(opts, Boolean((cfg as any).multiple));
	}

	// Union of enums/strings/literals -> select
	if (
		base instanceof z.ZodUnion ||
		Array.isArray((base as any)?._def?.options)
	) {
		const options: z.ZodTypeAny[] = (base as any)?._def?.options ?? [];
		const stringVals: string[] = [];

		for (const opt of options) {
			if (
				opt instanceof z.ZodEnum ||
				(opt as any)?._def?.values ||
				(opt as any)?.options
			) {
				const vals = enumStringValuesFromZodEnum(opt as any);
				for (const v of vals) if (typeof v === "string") stringVals.push(v);
			} else if ((opt as any)?._def?.typeName === "ZodLiteral") {
				const litVal = (opt as any)._def?.value;

				if (typeof litVal === "string") stringVals.push(litVal);
			}
		}
		if (stringVals.length) {
			const opts = Array.from(new Set(stringVals)).map((v) => ({
				value: v,
				label: v,
			}));

			return renderSelect(opts, Boolean((cfg as any).multiple));
		}
	}

	// Native enum handled by the ZodEnum branch above

	// Array -> multi select or textarea
	if (base instanceof z.ZodArray) {
		const el = (base as any)?._def?.type as z.ZodTypeAny;

		if (
			el instanceof z.ZodEnum ||
			(el as any)?._def?.values ||
			(el as any)?.options
		) {
			const values = enumStringValuesFromZodEnum(el as any);
			const opts = optionsFromStrings(values);

			return renderSelect(opts, true);
		}
		if (el instanceof z.ZodString && (cfg as any).options?.length) {
			return renderSelect((cfg as any).options!, true);
		}
		if (el instanceof z.ZodString) {
			const currentRaw = watch(name as any) as any;
			const current = Array.isArray(currentRaw)
				? (currentRaw as string[])
				: undefined;

			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					{/* Register hidden so RHF knows about this array field */}
					<input type="hidden" {...register(name as any)} />
					<textarea
						className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						placeholder={cfg.placeholder ?? "Enter values, one per line"}
						rows={cfg.rows ?? 5}
						value={(current ?? []).join("\n")}
						onChange={(e) => {
							const arr = e.target.value
								.split("\n")
								.map((s) => s.trim())
								.filter(Boolean);

							setValue(name as any, arr as any, {
								shouldValidate: true,
								shouldDirty: true,
							});
						}}
					/>
					{error && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{error}
						</span>
					)}
				</div>
			);
		}
	}

	// Boolean
	if (base instanceof z.ZodBoolean) {
		if ((cfg as any).widget === "select") {
			const current = watch(name as any) as any as boolean | undefined;
			const opts = booleanSelectOptions(
				(cfg as any).options as Array<{ value: string; label: string }>,
			);
			const value = typeof current === "boolean" ? String(current) : "";

			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					{/* Register hidden so RHF tracks boolean select */}
					<input type="hidden" {...register(name as any)} />
					<select
						className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						value={value}
						onChange={(e) => {
							const v = e.target.value;
							const boolVal =
								v === "true" ? true : v === "false" ? false : undefined;

							setValue(name as any, boolVal as any, {
								shouldValidate: true,
								shouldDirty: true,
							});
						}}
					>
						<option disabled value="">
							Select {label}
						</option>
						{opts.map((o) => (
							<option key={o.value} value={o.value}>
								{o.label}
							</option>
						))}
					</select>
					{error && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{error}
						</span>
					)}
				</div>
			);
		}

		return (
			<label className="flex items-center justify-between gap-3">
				<span className="text-sm text-muted-foreground">{label}</span>
				<input
					className="h-4 w-4 accent-primary"
					type="checkbox"
					{...register(name as any)}
				/>
			</label>
		);
	}

	// Number
	if (base instanceof z.ZodNumber) {
		if ((cfg as any).widget === "slider") {
			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					<input
						className="w-full accent-primary"
						max={(cfg as any).max}
						min={(cfg as any).min}
						step={(cfg as any).step}
						type="range"
						{...register(name as any, { valueAsNumber: true })}
					/>
					{error && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{error}
						</span>
					)}
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<input
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					type="number"
					{...register(name as any, { valueAsNumber: true })}
				/>
				{error && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{error}
					</span>
				)}
			</div>
		);
	}

	// String
	if (base instanceof z.ZodString) {
		const stringDef = (def as any)._def as {
			description?: string;
			checks?: Array<{ kind: string; regex?: RegExp }>;
		};
		const checks = stringDef.checks ?? [];
		const regexCheck = checks.find((c) => c.kind === "regex" && c.regex);
		const isEmail = checks.some((c) => c.kind === "email");
		const sensitive = isSensitiveString(stringDef, cfg as any);
		const multiline = isMultilineString(stringDef, cfg as any);

		if (sensitive) {
			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					<SensitiveInput name={name} register={register} />
					{error && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{error}
						</span>
					)}
				</div>
			);
		}

		if ((cfg as any).widget === "select" || (cfg as any).options?.length) {
			const opts = (cfg as any).options ?? [];

			return renderSelect(opts, Boolean((cfg as any).multiple));
		}

		if (multiline) {
			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					<details className="rounded-md border border-border open:bg-card">
						<summary className="cursor-pointer select-none bg-muted px-2 py-1 text-xs text-muted-foreground">
							{`Edit ${label}`}
						</summary>
						<div className="p-2">
							<textarea
								className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								rows={(cfg as any).rows ?? 5}
								{...register(name as any)}
							/>
						</div>
					</details>
					{error && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{error}
						</span>
					)}
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<input
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					pattern={regexCheck?.regex ? regexCheck.regex.source : undefined}
					placeholder={(cfg as any).placeholder}
					title={regexCheck?.regex ? regexCheck.regex.toString() : undefined}
					type={isEmail ? "email" : "text"}
					{...register(name as any)}
				/>
				{error && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{error}
					</span>
				)}
			</div>
		);
	}

	// File upload marker (supports accept/min/max with previews)
	if (String((def as any).description ?? "").startsWith("file-upload")) {
		const fileCfg = parseFileUploadConfig((def as any)._def, cfg as any);
		const value = watch(name as any) as any as File[] | undefined;
		const files: File[] = Array.isArray(value)
			? value
			: typeof FileList !== "undefined" && value && value.length != null
				? Array.from(value as any)
				: [];

		const tooMany =
			typeof fileCfg.max === "number" && files.length > fileCfg.max;
		const tooFew =
			typeof fileCfg.min === "number" && files.length < fileCfg.min;

		return (
			<div className="flex flex-col gap-2">
				<span className="text-sm text-muted-foreground">{label}</span>
				{/* Register hidden so RHF tracks this field */}
				<input type="hidden" {...register(name as any)} />
				<input
					accept={fileCfg.accept}
					multiple={typeof fileCfg.max !== "number" || fileCfg.max > 1}
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground file:mr-4 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					type="file"
					onChange={(e) => {
						const list = e.target.files ? Array.from(e.target.files) : [];
						const next =
							typeof fileCfg.max === "number"
								? list.slice(0, fileCfg.max)
								: list;
						setValue(name as any, next as any, {
							shouldValidate: true,
							shouldDirty: true,
						});
					}}
				/>
				{files.length > 0 && (
					<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
						{files.map((f, idx) => {
							const isImg =
								typeof f.type === "string" && f.type.startsWith("image/");
							const url = isImg ? URL.createObjectURL(f) : undefined;
							return (
								<div
									key={`${f.name}-${idx}`}
									className="relative rounded-md border border-border p-2"
								>
									<button
										type="button"
										className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
										onClick={() => {
											const next = files.filter((_, i) => i !== idx);
											setValue(name as any, next as any, {
												shouldValidate: true,
												shouldDirty: true,
												shouldTouch: true,
											});
										}}
										aria-label="Remove file"
									>
										×
									</button>
									{isImg ? (
										<img
											src={url}
											alt={f.name}
											className="h-24 w-full rounded object-cover"
										/>
									) : (
										<div className="flex h-24 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
											{f.name}
										</div>
									)}
									<div
										className="mt-1 truncate text-xs text-muted-foreground"
										title={`${f.name} • ${(f.size / 1024).toFixed(1)} KB`}
									>
										{f.name} • {(f.size / 1024).toFixed(1)} KB
									</div>
								</div>
							);
						})}
					</div>
				)}
				<div className="flex items-center gap-2 text-xs">
					{typeof fileCfg.min === "number" && (
						<span className="text-muted-foreground">Min: {fileCfg.min}</span>
					)}
					{typeof fileCfg.max === "number" && (
						<span className="text-muted-foreground">Max: {fileCfg.max}</span>
					)}
				</div>
				{(tooMany || tooFew) && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{tooMany
							? `You can upload at most ${fileCfg.max} file(s).`
							: `Please upload at least ${fileCfg.min} file(s).`}
					</span>
				)}
				{error && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{error}
					</span>
				)}
			</div>
		);
	}

	// Default text input
	return (
		// In dev, surface a diagnostic when we fall back to generic text input
		// so we can see which typeName we failed to map.
		// This helps catch regressions where everything renders as text.
		<>
			{process.env.NODE_ENV !== "production" && (
				<script
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html: `console.warn("AutoField fallback:text", ${JSON.stringify({
							name,
							cfg,
							baseType: (base as any)?.constructor?.name,
							defType: (def as any)?.constructor?.name,
						})}});`,
					}}
				/>
			)}
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<input
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					type="text"
					{...register(name as any)}
				/>
				{error && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{error}
					</span>
				)}
			</div>
		</>
	);
};
