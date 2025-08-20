"use client";
import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import {
	SimpleSelect,
	MultiSelect,
	type SelectOption,
} from "../../utils/select";
import {
	unwrapType,
	enumStringValuesFromZodEnum,
	optionsFromStrings,
	booleanSelectOptions,
	isSensitiveString,
	isMultilineString,
	type FieldsConfig,
	parseFileUploadConfig,
} from "../../../utils/utils";
import { SensitiveInput } from "../../../utils/fields";
import { Calendar } from "../../../../../../ui/calendar";

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

	const base = unwrapType(def);

	const renderSelect = (opts: SelectOption[], multiple = false) => {
		if (multiple) {
			const raw = watch(name as any) as any;
			const current = Array.isArray(raw) ? (raw as string[]) : [];
			const allowed = new Set(opts.map((o) => o.value));
			const sanitized = current.filter((v) => allowed.has(v));
			if (sanitized.length !== current.length) {
				setValue(name as any, sanitized as any, {
					shouldValidate: true,
					shouldDirty: true,
					shouldTouch: true,
				});
			}
			return (
				<MultiSelect
					name={name}
					label={label}
					value={sanitized}
					opts={opts}
					error={error}
					register={register}
					onChange={(v) =>
						setValue(name as any, v as any, {
							shouldValidate: true,
							shouldDirty: true,
							shouldTouch: true,
						})
					}
				/>
			);
		}
		const current = (watch(name as any) as any) ?? "";
		return (
			<SimpleSelect
				name={name}
				label={label}
				value={current as string}
				opts={opts}
				error={error}
				register={register}
				onChange={(v) =>
					setValue(name as any, v as any, {
						shouldValidate: true,
						shouldDirty: true,
					})
				}
			/>
		);
	};

	// Configured widgets
	if ((cfg as any).widget === "select") {
		const opts = ((cfg as any).options ?? []) as SelectOption[];
		return renderSelect(opts, Boolean((cfg as any).multiple));
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

	// Enums -> select
	if (
		base instanceof z.ZodEnum ||
		(base as any)?._def?.values ||
		(base as any)?.options
	) {
		const values = enumStringValuesFromZodEnum(base as any);
		return renderSelect(
			optionsFromStrings(values),
			Boolean((cfg as any).multiple),
		);
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
				for (const v of enumStringValuesFromZodEnum(opt as any))
					if (typeof v === "string") stringVals.push(v);
			} else if ((opt as any)?._def?.typeName === "ZodLiteral") {
				const litVal = (opt as any)._def?.value;
				if (typeof litVal === "string") stringVals.push(litVal);
			}
		}
		if (stringVals.length)
			return renderSelect(
				Array.from(new Set(stringVals)).map((v) => ({ value: v, label: v })),
				Boolean((cfg as any).multiple),
			);
	}

	// Array -> multi select or textarea
	if (base instanceof z.ZodArray) {
		const el = (base as any)?._def?.type as z.ZodTypeAny;
		if (
			el instanceof z.ZodEnum ||
			(el as any)?._def?.values ||
			(el as any)?.options
		) {
			const values = enumStringValuesFromZodEnum(el as any);
			return renderSelect(optionsFromStrings(values), true);
		}
		if (el instanceof z.ZodString && (cfg as any).options?.length)
			return renderSelect((cfg as any).options!, true);
		if (el instanceof z.ZodString) {
			const currentRaw = watch(name as any) as any;
			const current = Array.isArray(currentRaw)
				? (currentRaw as string[])
				: undefined;
			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
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
			const opts = booleanSelectOptions((cfg as any).options as SelectOption[]);
			const value = typeof current === "boolean" ? String(current) : "";
			return (
				<SimpleSelect
					name={name}
					label={label}
					value={value}
					opts={opts}
					error={error}
					register={register}
					onChange={(v) =>
						setValue(
							name as any,
							(v === "true" ? true : v === "false" ? false : undefined) as any,
							{ shouldValidate: true, shouldDirty: true },
						)
					}
				/>
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

	// Date
	if (base instanceof z.ZodDate) {
		const current = watch(name as any) as any as Date | undefined;
		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<input type="hidden" {...register(name as any)} />
				<div className="rounded-md border border-border p-2">
					<Calendar
						mode="single"
						selected={current}
						onSelect={(d) =>
							setValue(name as any, (d ?? undefined) as any, {
								shouldValidate: true,
								shouldDirty: true,
								shouldTouch: true,
							})
						}
						initialFocus
					/>
				</div>
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
						<summary className="cursor-pointer select-none bg-muted px-2 py-1 text-xs text-muted-foreground">{`Edit ${label}`}</summary>
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

	// File upload
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

	// Fallback text input
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				type="text"
				{...register(name as any)}
			/>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
};
