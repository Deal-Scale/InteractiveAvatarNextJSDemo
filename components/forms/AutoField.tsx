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
} from "./utils";
import { SensitiveInput } from "./fields";
import { ArrayStringField } from "@/components/external/zod-react-form-auto/components/autofield/components/ArrayStringField";

// Dev-only: one-time console clear and reminder banner
let __AF_DEBUG_ONCE = false;
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
	if (!__AF_DEBUG_ONCE) {
		try {
			console.clear();
			// eslint-disable-next-line no-console
			console.info(
				"%c[AutoForm Debug] Verbose detection logs ENABLED (temporary) — remember to remove after fixing tags chips.",
				"color:#0ea5e9;font-weight:bold;",
			);
		} catch {}
		__AF_DEBUG_ONCE = true;
	}
}

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
	const { register, formState, setValue, getValues } = form;

	const cfg = (fields as any)[name] || {};
	const label = cfg.label ?? name;
	const error = (formState.errors as any)[name]?.message as string | undefined;

	// Normalize vague Zod errors like "Invalid input" to a clearer, field-specific message
	const normError = React.useMemo(() => {
		if (!error) return undefined;
		const trimmed = String(error).trim();
		if (trimmed.toLowerCase() === "invalid input") {
			return `${label} is required`;
		}
		return error;
	}, [error, label]);

	// Helper to render a select (single or multi)
	const renderSelect = (
		opts: Array<{ value: string; label: string }>,
		multiple = false,
	) => {
		if (multiple) {
			const current = (getValues() as any)[name] ?? [];

			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					<select
						multiple
						className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						value={current as string[]}
						onChange={(e) => {
							const selected = Array.from(e.target.selectedOptions).map(
								(o) => o.value,
							);

							setValue(name as any, selected as any, {
								shouldValidate: true,
								shouldDirty: true,
							});
						}}
					>
						{opts.map((o) => (
							<option key={o.value} value={o.value}>
								{o.label}
							</option>
						))}
					</select>
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
						</span>
					)}
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<select
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					defaultValue=""
					{...register(name as any)}
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
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
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
					placeholder={(cfg as any).placeholder}
					{...register(name as any)}
				/>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
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
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
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
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
			</div>
		);
	}

	const base = unwrapType(def);

	// Dev-only structured debug helper
	const devLog = (
		label: string,
		data: Record<string, unknown> | undefined = undefined,
	) => {
		if (process.env.NODE_ENV !== "production") {
			try {
				// eslint-disable-next-line no-console
				console.log(`[AFDetect][${name}] ${label}`, data ?? {});
			} catch {}
		}
	};

	if (process.env.NODE_ENV !== "production") {
		devLog("base-type", {
			baseType: (base as any)?._def?.typeName,
			defType: (def as any)?._def?.typeName,
			cfgWidget: (fields as any)[name]?.widget,
		});
	}

	// Enum
	if ((base as any)?._def?.typeName === "ZodEnum") {
		const values = enumStringValuesFromZodEnum((base as any).options);
		const opts = optionsFromStrings(values);

		return renderSelect(opts, Boolean((cfg as any).multiple));
	}

	// Union of enums/strings/literals -> select
	if ((base as any)._def?.typeName === "ZodUnion") {
		const options: z.ZodTypeAny[] = (base as any)._def?.options ?? [];
		const stringVals: string[] = [];

		for (const opt of options) {
			if ((opt as any)?._def?.typeName === "ZodEnum") {
				const raw = (opt as any).options;
				const vals: unknown[] = Array.isArray(raw)
					? raw
					: Object.values(raw ?? {});

				for (const v of vals) if (typeof v === "string") stringVals.push(v);
			} else if ((opt as any)._def?.typeName === "ZodNativeEnum") {
				const enumObj = (opt as any).enum as Record<string, string | number>;

				for (const v of Object.values(enumObj))
					if (typeof v === "string") stringVals.push(v);
			} else if ((opt as any)._def?.typeName === "ZodLiteral") {
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

	// Native enum
	if ((base as any)._def?.typeName === "ZodNativeEnum") {
		const enumObj = (base as any).enum as Record<string, string | number>;
		const values = Object.values(enumObj).filter(
			(v): v is string => typeof v === "string",
		);
		const opts = optionsFromStrings(values);

		return renderSelect(opts, Boolean((cfg as any).multiple));
	}

	// Array -> multi select or textarea/chips
	if ((base as any)._def?.typeName === "ZodArray") {
		const el = (base as any)._def.type as z.ZodTypeAny;
		devLog("array:detected", {
			elType: (el as any)?._def?.typeName,
			cfgHasOptions: Boolean((cfg as any).options?.length),
		});

		if ((el as any)?._def?.typeName === "ZodEnum") {
			const values = enumStringValuesFromZodEnum((el as any).options);
			const opts = optionsFromStrings(values);
			devLog("array:enum -> multi-select", { optionCount: opts.length });
			return renderSelect(opts, true);
		}
		if ((el as any)._def?.typeName === "ZodNativeEnum") {
			const enumObj = (el as any).enum as Record<string, string | number>;
			const values = Object.values(enumObj).filter(
				(v): v is string => typeof v === "string",
			);
			const opts = optionsFromStrings(values);
			devLog("array:native-enum -> multi-select", { optionCount: opts.length });
			return renderSelect(opts, true);
		}
		if (
			(el as any)._def?.typeName === "ZodString" &&
			(cfg as any).options?.length
		) {
			devLog("array:string + cfg.options -> multi-select", {
				optionCount: (cfg as any).options.length,
			});
			return renderSelect((cfg as any).options!, true);
		}
		if ((el as any)._def?.typeName === "ZodString") {
			devLog("array:string -> chips", {
				reason: "no options provided; using ArrayStringField",
			});
			return (
				<ArrayStringField
					name={name}
					label={label}
					error={normError}
					placeholder={cfg.placeholder}
					form={form as unknown as UseFormReturn<any>}
				/>
			);
		}
	}

	// Boolean
	if ((base as any)._def?.typeName === "ZodBoolean") {
		if ((cfg as any).widget === "select") {
			const current = (getValues() as any)[name] as boolean | undefined;
			const opts = booleanSelectOptions(
				(cfg as any).options as Array<{ value: string; label: string }>,
			);
			const value = typeof current === "boolean" ? String(current) : "";

			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
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
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
						</span>
					)}
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-1">
				<label className="flex items-center justify-between gap-3">
					<span className="text-sm text-muted-foreground">{label}</span>
					<input
						className="h-4 w-4 accent-primary"
						type="checkbox"
						{...register(name as any)}
					/>
				</label>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
			</div>
		);
	}

	// Number
	if ((base as any)._def?.typeName === "ZodNumber") {
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
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
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
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
			</div>
		);
	}

	// String
	if ((base as any)._def?.typeName === "ZodString") {
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
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
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
								placeholder={(cfg as any).placeholder}
								{...register(name as any)}
							/>
						</div>
					</details>
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
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
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
			</div>
		);
	}

	// File upload marker
	if ((def as any).description === "file-upload") {
		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<input
					multiple
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground file:mr-4 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					type="file"
					{...register(name as any)}
				/>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
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
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{
						__html: `console.warn("AutoField fallback:text", ${JSON.stringify({
							name,
							cfg,
							baseType: (base as any)?._def?.typeName,
							defType: (def as any)?._def?.typeName,
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
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
			</div>
		</>
	);
};
