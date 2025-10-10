"use client";
import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import clsx from "clsx";

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

const SELECT_VALUE_KEYS = ["value", "id", "key", "name"] as const;

function coerceSelectValue(raw: unknown): string | undefined {
	if (raw == null) return undefined;
	if (typeof raw === "string") return raw;
	if (typeof raw === "number" || typeof raw === "boolean") {
		return String(raw);
	}
	if (typeof raw === "object") {
		for (const key of SELECT_VALUE_KEYS) {
			const candidate = (raw as Record<string, unknown>)[key];
			if (
				typeof candidate === "string" ||
				typeof candidate === "number" ||
				typeof candidate === "boolean"
			) {
				const str = String(candidate);
				if (str.length > 0) return str;
			}
		}
	}

	return undefined;
}

function coerceSelectArray(raw: unknown): string[] {
	if (Array.isArray(raw)) {
		return raw
			.map((entry) => coerceSelectValue(entry))
			.filter(
				(value): value is string =>
					typeof value === "string" && value.length > 0,
			);
	}

	const single = coerceSelectValue(raw);
	return single ? [single] : [];
}

function arraysShallowEqual(a: string[], b: string[]) {
	if (a.length !== b.length) return false;
	return a.every((value, index) => value === b[index]);
}

function useNormalizeSelectValue(
	form: UseFormReturn<any>,
	name: string,
	multiple: boolean,
	enabled: boolean,
) {
	React.useEffect(() => {
		if (!enabled) return;

		const current = form.getValues(name as any);

		if (multiple) {
			const normalized = coerceSelectArray(current);
			const isStringArray =
				Array.isArray(current) &&
				current.every((item) => typeof item === "string");

			if (
				isStringArray &&
				arraysShallowEqual(current as string[], normalized)
			) {
				return;
			}

			if (
				normalized.length === 0 &&
				(current == null || (Array.isArray(current) && current.length === 0))
			) {
				return;
			}

			form.setValue(name as any, normalized as any, {
				shouldDirty: false,
				shouldTouch: false,
				shouldValidate: false,
			});
			return;
		}

		const normalized = coerceSelectValue(current);
		const isPrimitive =
			typeof current === "string" ||
			typeof current === "number" ||
			typeof current === "boolean";

		if (normalized == null) {
			if (current == null || current === "") {
				return;
			}

			form.setValue(name as any, undefined, {
				shouldDirty: false,
				shouldTouch: false,
				shouldValidate: false,
			});
			return;
		}

		if (isPrimitive && String(current) === normalized) {
			return;
		}

		form.setValue(name as any, normalized as any, {
			shouldDirty: false,
			shouldTouch: false,
			shouldValidate: false,
		});
	}, [enabled, form, multiple, name]);
}

export const AutoField: React.FC<AutoFieldProps> = ({
	name,
	def,
	form,
	fields = {},
}) => {
	const { register, formState, setValue } = form;

	const cfg = (fields as any)[name] || {};
	const label = cfg.label ?? name;
	const error = (formState.errors as any)[name]?.message as string | undefined;
	const helpText =
		typeof (cfg as any).helpText === "string"
			? (cfg as any).helpText
			: undefined;
	const widget = (cfg as any).widget;

	// Normalize vague Zod errors like "Invalid input" to a clearer, field-specific message
	const normError = React.useMemo(() => {
		if (!error) return undefined;
		const trimmed = String(error).trim();
		if (trimmed.toLowerCase() === "invalid input") {
			return `${label} is required`;
		}
		return error;
	}, [error, label]);

	const stringValue = (value: unknown) => {
		if (value == null) return "";
		if (typeof value === "string") return value;
		if (typeof value === "number" || typeof value === "boolean") {
			return String(value);
		}
		return "";
	};

	const renderHelpText = () =>
		helpText ? (
			<span className="text-xs text-muted-foreground">{helpText}</span>
		) : null;

	// Helper to render a select (single or multi)
	const renderSelect = (
		opts: Array<{ value: string; label: string }>,
		multiple = false,
		placeholderText?: string,
	) => {
		const registration = register(name as any);

		if (multiple) {
			const normalized = coerceSelectArray(form.watch(name as any));

			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					<select
						multiple
						name={registration.name}
						ref={registration.ref}
						onBlur={registration.onBlur}
						className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						value={normalized}
						onChange={(e) => {
							const selected = Array.from(e.target.selectedOptions).map(
								(o) => o.value,
							);

							setValue(name as any, selected as any, {
								shouldValidate: true,
								shouldDirty: true,
							});
							registerProps.onChange?.({
								target: {
									name: registerProps.name,
									value: selected,
								},
								type: "change",
							} as any);
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
					{renderHelpText()}
				</div>
			);
		}

		const normalized = coerceSelectValue(form.watch(name as any)) ?? "";
		const placeholder = placeholderText ?? `Select ${label}`;

		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<select
					name={registration.name}
					ref={registration.ref}
					onBlur={registration.onBlur}
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					value={normalized}
					onChange={(e) => {
						const next = e.target.value;
						const payload = next === "" ? undefined : next;

						setValue(name as any, payload as any, {
							shouldValidate: true,
							shouldDirty: true,
						});
					}}
				>
					<option disabled value="">
						{placeholder}
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
				{renderHelpText()}
			</div>
		);
	};

	const base = unwrapType(def);
	const baseTypeName = (base as any)?._def?.typeName as string | undefined;

	const configuredSelect = (cfg as any).widget === "select";
	const configuredOptions = ((cfg as any).options ?? []) as Array<{
		value: string;
		label: string;
	}>;
	const configuredMultiple = Boolean((cfg as any).multiple);
	const configuredPlaceholder = (cfg as any).placeholder as string | undefined;

	const unionStringValues = React.useMemo(() => {
		if (baseTypeName !== "ZodUnion") return null;
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

		if (stringVals.length === 0) return null;
		return Array.from(new Set(stringVals));
	}, [base, baseTypeName]);

	const arrayElement =
		baseTypeName === "ZodArray"
			? ((base as any)._def?.type as z.ZodTypeAny | undefined)
			: undefined;
	const arrayElementTypeName = (arrayElement as any)?._def?.typeName as
		| string
		| undefined;

	const enumValues = React.useMemo(() => {
		if (baseTypeName !== "ZodEnum") return null;
		return enumStringValuesFromZodEnum((base as any).options);
	}, [base, baseTypeName]);

	const nativeEnumValues = React.useMemo(() => {
		if (baseTypeName !== "ZodNativeEnum") return null;
		const enumObj = (base as any).enum as Record<string, string | number>;
		return Object.values(enumObj).filter(
			(v): v is string => typeof v === "string",
		);
	}, [base, baseTypeName]);

	const arrayEnumValues = React.useMemo(() => {
		if (arrayElementTypeName !== "ZodEnum") return null;
		return enumStringValuesFromZodEnum((arrayElement as any).options);
	}, [arrayElement, arrayElementTypeName]);

	const arrayNativeEnumValues = React.useMemo(() => {
		if (arrayElementTypeName !== "ZodNativeEnum") return null;
		const enumObj = (arrayElement as any).enum as Record<
			string,
			string | number
		>;
		return Object.values(enumObj).filter(
			(v): v is string => typeof v === "string",
		);
	}, [arrayElement, arrayElementTypeName]);

	const arrayStringSelectOptions = React.useMemo(() => {
		if (arrayElementTypeName !== "ZodString") return null;
		if (!(cfg as any).options?.length) return null;
		return ((cfg as any).options ?? []) as Array<{
			value: string;
			label: string;
		}>;
	}, [arrayElementTypeName, cfg]);

	const selectNormalization = React.useMemo(
		() => ({
			enabled:
				configuredSelect ||
				Boolean(enumValues) ||
				Boolean(nativeEnumValues) ||
				Boolean(unionStringValues) ||
				Boolean(arrayEnumValues) ||
				Boolean(arrayNativeEnumValues) ||
				Boolean(arrayStringSelectOptions),
			multiple: configuredSelect
				? configuredMultiple
				: arrayEnumValues || arrayNativeEnumValues || arrayStringSelectOptions
					? true
					: Boolean(configuredMultiple),
		}),
		[
			arrayEnumValues,
			arrayNativeEnumValues,
			arrayStringSelectOptions,
			configuredMultiple,
			configuredSelect,
			enumValues,
			nativeEnumValues,
			unionStringValues,
		],
	);

	useNormalizeSelectValue(
		form,
		name,
		selectNormalization.multiple,
		selectNormalization.enabled,
	);

	// If the fields config explicitly requests a widget, honor it first
	if (configuredSelect) {
		return renderSelect(
			configuredOptions,
			configuredMultiple,
			configuredPlaceholder,
		);
	}
	if ((cfg as any).widget === "textarea") {
		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<textarea
					className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					rows={(cfg as any).rows ?? 5}
					placeholder={(cfg as any).placeholder}
					disabled={(cfg as any).disabled}
					{...register(name as any)}
				/>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
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
				{renderHelpText()}
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
					disabled={(cfg as any).disabled}
					{...register(name as any, { valueAsNumber: true })}
				/>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
			</div>
		);
	}

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
	if (enumValues) {
		const opts = optionsFromStrings(enumValues);

		return renderSelect(opts, configuredMultiple);
	}

	// Union of enums/strings/literals -> select
	if (unionStringValues) {
		const opts = unionStringValues.map((v) => ({ value: v, label: v }));

		return renderSelect(opts, configuredMultiple);
	}

	// Native enum
	if (nativeEnumValues) {
		const opts = optionsFromStrings(nativeEnumValues);

		return renderSelect(opts, configuredMultiple);
	}

	// Array -> multi select or textarea/chips
	if (baseTypeName === "ZodArray") {
		const el = arrayElement as z.ZodTypeAny;
		devLog("array:detected", {
			elType: (el as any)?._def?.typeName,
			cfgHasOptions: Boolean((cfg as any).options?.length),
		});

		if (arrayEnumValues) {
			const opts = optionsFromStrings(arrayEnumValues);
			devLog("array:enum -> multi-select", { optionCount: opts.length });
			return renderSelect(opts, true);
		}
		if (arrayNativeEnumValues) {
			const opts = optionsFromStrings(arrayNativeEnumValues);
			devLog("array:native-enum -> multi-select", { optionCount: opts.length });
			return renderSelect(opts, true);
		}
		if (arrayStringSelectOptions) {
			devLog("array:string + cfg.options -> multi-select", {
				optionCount: arrayStringSelectOptions.length,
			});
			return renderSelect(arrayStringSelectOptions, true);
		}
		if ((el as any)._def?.typeName === "ZodString") {
			devLog("array:string -> textarea", {
				reason: "no options provided; falling back to newline textarea",
			});
			const current = form.watch(name as any) as string[] | undefined;
			const defaultValue = Array.isArray(current) ? current.join("\n") : "";

			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					<textarea
						className="min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						placeholder={cfg.placeholder as string | undefined}
						disabled={(cfg as any).disabled}
						defaultValue={defaultValue}
						{...register(name as any, {
							setValueAs: (value) => {
								if (typeof value !== "string") {
									return [] as string[];
								}

								return value
									.split(/\n+/)
									.map((part) => part.trim())
									.filter(Boolean);
							},
						})}
					/>
					<span className="text-xs text-muted-foreground">
						Enter one value per line.
					</span>
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
						</span>
					)}
					{renderHelpText()}
				</div>
			);
		}
	}

	// Boolean
	if ((base as any)._def?.typeName === "ZodBoolean") {
		if (widget === "switch") {
			const current = Boolean(watch(name as any));
			const registerProps = register(name as any);

			return (
				<div className="flex flex-col gap-1">
					<label className="flex items-center justify-between gap-3">
						<span className="text-sm text-muted-foreground">{label}</span>
						<span className="relative inline-flex h-6 w-11 items-center">
							<input
								type="checkbox"
								name={registerProps.name}
								ref={registerProps.ref}
								onBlur={registerProps.onBlur}
								onChange={(event) => {
									registerProps.onChange?.(event);
									setValue(name as any, event.target.checked as any, {
										shouldValidate: true,
										shouldDirty: true,
									});
								}}
								checked={current}
								disabled={(cfg as any).disabled}
								className="peer sr-only"
							/>
							<span
								aria-hidden="true"
								className={clsx(
									"h-6 w-11 rounded-full transition-colors",
									current ? "bg-primary" : "bg-muted",
									(cfg as any).disabled ? "opacity-60" : "opacity-100",
								)}
							/>
							<span
								aria-hidden="true"
								className={clsx(
									"pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-background transition-transform",
									current ? "translate-x-5" : "translate-x-0",
								)}
							/>
						</span>
					</label>
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
						</span>
					)}
					{renderHelpText()}
				</div>
			);
		}

		if ((cfg as any).widget === "select") {
			const current = watch(name as any) as boolean | undefined;
			const opts = booleanSelectOptions(
				(cfg as any).options as Array<{ value: string; label: string }>,
			);
			const value = typeof current === "boolean" ? String(current) : "";
			const registerProps = register(name as any);

			return (
				<div className="flex flex-col gap-1">
					<span className="text-sm text-muted-foreground">{label}</span>
					<select
						name={registerProps.name}
						ref={registerProps.ref}
						onBlur={registerProps.onBlur}
						className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						value={value}
						disabled={(cfg as any).disabled}
						onChange={(e) => {
							const v = e.target.value;
							const boolVal =
								v === "true" ? true : v === "false" ? false : undefined;

							setValue(name as any, boolVal as any, {
								shouldValidate: true,
								shouldDirty: true,
							});
							registerProps.onChange?.({
								target: {
									name: registerProps.name,
									value: boolVal,
								},
								type: "change",
							} as any);
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
					{renderHelpText()}
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
						disabled={(cfg as any).disabled}
						{...register(name as any)}
					/>
				</label>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
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
						disabled={(cfg as any).disabled}
						{...register(name as any, { valueAsNumber: true })}
					/>
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
						</span>
					)}
					{renderHelpText()}
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<input
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					type="number"
					disabled={(cfg as any).disabled}
					{...register(name as any, { valueAsNumber: true })}
				/>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
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
					{renderHelpText()}
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
								disabled={(cfg as any).disabled}
								{...register(name as any)}
							/>
						</div>
					</details>
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
						</span>
					)}
					{renderHelpText()}
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
					disabled={(cfg as any).disabled}
					{...register(name as any)}
				/>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
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
					disabled={(cfg as any).disabled}
					{...register(name as any)}
				/>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
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
					disabled={(cfg as any).disabled}
					{...register(name as any)}
				/>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
			</div>
		</>
	);
};
