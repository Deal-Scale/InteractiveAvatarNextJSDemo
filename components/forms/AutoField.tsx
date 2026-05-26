"use client";
import clsx from "clsx";
import { ExternalLink, Info, Pause, Play, Upload } from "lucide-react";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { SensitiveInput } from "./fields";
import {
	booleanSelectOptions,
	enumStringValuesFromZodEnum,
	type FieldsConfig,
	isMultilineString,
	isSensitiveString,
	optionsFromStrings,
	type SelectOption,
	unwrapType,
} from "./utils";

const MCP_DOCS_URL =
	"https://modelcontextprotocol.io/docs/develop/build-server";

const fieldBadgeClassName = (tone: string | undefined) => {
	if (tone === "video") {
		return "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200";
	}
	if (tone === "voice") {
		return "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200";
	}
	if (tone === "tools") {
		return "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-200";
	}
	return "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200";
};

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
const SELECT_LABEL_KEYS = [
	"label",
	"name",
	"title",
	"displayName",
	"display_name",
	"id",
] as const;

const zodKind = (value: unknown): string | undefined =>
	((value as any)?._def?.typeName ?? (value as any)?._def?.type) as
		| string
		| undefined;

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

function coerceOptionLabel(raw: unknown, fallback: string): string {
	if (typeof raw === "string") return raw;
	if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
	if (raw && typeof raw === "object") {
		for (const key of SELECT_LABEL_KEYS) {
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
	return fallback;
}

function normalizeSelectOptions(
	options: Array<{ value: unknown; label?: unknown } & Record<string, unknown>>,
): SelectOption[] {
	return options
		.map((option): SelectOption | undefined => {
			const value = coerceSelectValue(option?.value ?? option);
			if (!value) return undefined;
			const normalized: SelectOption = {
				value,
				label: coerceOptionLabel(option?.label ?? option, value),
			};

			if (typeof option.description === "string") {
				normalized.description = option.description;
			}
			if (Array.isArray(option.capabilities)) {
				normalized.capabilities = option.capabilities
					.map((capability) => coerceOptionLabel(capability, ""))
					.filter(Boolean);
			}
			if (typeof option.docsUrl === "string")
				normalized.docsUrl = option.docsUrl;
			if (typeof option.previewUrl === "string")
				normalized.previewUrl = option.previewUrl;
			if (typeof option.transport === "string") {
				normalized.transport = option.transport;
			}
			if (typeof option.command === "string")
				normalized.command = option.command;
			if (typeof option.url === "string") normalized.url = option.url;

			return normalized;
		})
		.filter((option): option is SelectOption => Boolean(option));
}

function parseMcpConfigOptions(config: unknown): SelectOption[] {
	const configObject =
		config && typeof config === "object"
			? (config as Record<string, unknown>)
			: undefined;
	const rawServers =
		configObject?.mcpServers ??
		configObject?.servers ??
		configObject?.mcp_servers;

	if (!rawServers) return [];

	const entries = Array.isArray(rawServers)
		? rawServers
				.map((server) => {
					if (!server || typeof server !== "object") return undefined;
					const objectServer = server as Record<string, unknown>;
					const id = coerceSelectValue(
						objectServer.id ?? objectServer.name ?? objectServer.label,
					);
					return id ? ([id, objectServer] as const) : undefined;
				})
				.filter((entry): entry is readonly [string, Record<string, unknown>] =>
					Boolean(entry),
				)
		: typeof rawServers === "object"
			? Object.entries(rawServers as Record<string, unknown>).filter(
					(entry): entry is [string, Record<string, unknown>] =>
						Boolean(entry[0]) &&
						Boolean(entry[1]) &&
						typeof entry[1] === "object",
				)
			: [];

	return entries.map(([id, server]) => {
		const command = coerceSelectValue(server.command);
		const url = coerceSelectValue(server.url ?? server.endpoint);
		const args = Array.isArray(server.args)
			? server.args.map((arg) => coerceOptionLabel(arg, "")).filter(Boolean)
			: [];
		const envKeys =
			server.env && typeof server.env === "object"
				? Object.keys(server.env as Record<string, unknown>)
				: [];
		const capabilities = [
			url ? "http" : command ? "stdio" : "configured",
			command,
			...args.slice(0, 2),
			...envKeys.map((key) => `env:${key}`).slice(0, 3),
		].filter((capability): capability is string => Boolean(capability));

		return {
			value: id,
			label: coerceOptionLabel(server.name ?? server.label, id),
			description: coerceOptionLabel(
				server.description,
				url
					? `Remote MCP server at ${url}`
					: command
						? `Local MCP server launched with ${command}`
						: "Imported from MCP config",
			),
			capabilities,
			docsUrl: MCP_DOCS_URL,
			transport: url ? "http" : command ? "stdio" : undefined,
			command,
			url,
		};
	});
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
	const { register, formState, setValue, watch } = form;

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

	const renderLabel = () => (
		<span className="inline-flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
			<span>{label}</span>
			{(cfg as any).badge?.label ? (
				<span
					className={clsx(
						"rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
						fieldBadgeClassName((cfg as any).badge?.tone),
					)}
				>
					{(cfg as any).badge.label}
				</span>
			) : null}
			{(cfg as any).required ? (
				<span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
					Required
				</span>
			) : null}
		</span>
	);

	const renderSlider = () => {
		const value = watch(name as any);
		const numericValue =
			typeof value === "number" && Number.isFinite(value) ? value : undefined;
		const step = Number((cfg as any).step ?? 1);
		const digits = step > 0 && step < 1 ? 1 : 0;
		const fallbackValue = Number((cfg as any).min ?? 0);

		return (
			<div className="flex flex-col gap-1">
				<div className="flex items-center justify-between gap-3">
					{renderLabel()}
					<span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
						{typeof numericValue === "number"
							? numericValue.toFixed(digits)
							: fallbackValue.toFixed(digits)}
					</span>
				</div>
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
	};

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
					{renderLabel()}
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
							registration.onChange?.({
								target: {
									name: registration.name,
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
				{renderLabel()}
				<select
					name={registration.name}
					ref={registration.ref}
					onBlur={registration.onBlur}
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					value={normalized}
					onChange={(e) => {
						const next = e.target.value;
						const payload =
							next === "" ? undefined : isBooleanField ? next === "true" : next;

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
	const baseTypeName = zodKind(base);
	const isBooleanField =
		baseTypeName === "ZodBoolean" || baseTypeName === "boolean";

	const configuredSelect = (cfg as any).widget === "select";
	const configuredModeButtons = (cfg as any).widget === "mode-buttons";
	const configuredMcpBadges = (cfg as any).widget === "mcp-badges";
	const configuredVoiceSelect = (cfg as any).widget === "voice-select";
	const configuredTags = (cfg as any).widget === "tags";
	const configuredAvatarUrl = (cfg as any).widget === "avatar-url";
	const configuredOptions = React.useMemo(
		() =>
			normalizeSelectOptions(
				((cfg as any).options ?? []) as Array<
					{
						value: unknown;
						label?: unknown;
					} & Record<string, unknown>
				>,
			),
		[cfg],
	);
	const [uploadedMcpOptions, setUploadedMcpOptions] = React.useState<
		SelectOption[]
	>([]);
	const mergedMcpOptions = React.useMemo(() => {
		if (!uploadedMcpOptions.length) return configuredOptions;
		return Array.from(
			new Map(
				[...configuredOptions, ...uploadedMcpOptions].map((option) => [
					option.value,
					option,
				]),
			).values(),
		);
	}, [configuredOptions, uploadedMcpOptions]);
	const audioRef = React.useRef<HTMLAudioElement | null>(null);
	const [playingPreview, setPlayingPreview] = React.useState<string | null>(
		null,
	);
	const [previewError, setPreviewError] = React.useState<string | null>(null);
	const [tagDrafts, setTagDrafts] = React.useState<Record<string, string>>({});
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
		return normalizeSelectOptions(
			((cfg as any).options ?? []) as Array<{
				value: unknown;
				label?: unknown;
			}>,
		);
	}, [arrayElementTypeName, cfg]);

	const selectNormalization = React.useMemo(
		() => ({
			enabled:
				(configuredSelect && !isBooleanField) ||
				configuredVoiceSelect ||
				configuredModeButtons ||
				configuredMcpBadges ||
				Boolean(enumValues) ||
				Boolean(nativeEnumValues) ||
				Boolean(unionStringValues) ||
				Boolean(arrayEnumValues) ||
				Boolean(arrayNativeEnumValues) ||
				Boolean(arrayStringSelectOptions),
			multiple: configuredModeButtons
				? true
				: configuredMcpBadges
					? true
					: configuredSelect || configuredVoiceSelect
						? configuredMultiple
						: arrayEnumValues ||
								arrayNativeEnumValues ||
								arrayStringSelectOptions
							? true
							: Boolean(configuredMultiple),
		}),
		[
			arrayEnumValues,
			arrayNativeEnumValues,
			arrayStringSelectOptions,
			configuredMultiple,
			configuredModeButtons,
			configuredMcpBadges,
			configuredSelect,
			configuredVoiceSelect,
			enumValues,
			isBooleanField,
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
	if (configuredAvatarUrl) {
		const selectedValue = stringValue(form.watch(name as any));
		const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			const objectUrl = URL.createObjectURL(file);
			setValue(name as any, objectUrl as any, {
				shouldValidate: true,
				shouldDirty: true,
			});
			event.target.value = "";
		};

		return (
			<div className="flex flex-col gap-2">
				{renderLabel()}
				{selectedValue ? (
					<div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-2">
						<img
							alt=""
							className="h-12 w-12 rounded-md object-cover"
							src={selectedValue}
						/>
						<div className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
							{selectedValue}
						</div>
					</div>
				) : null}
				<div className="grid gap-2 sm:grid-cols-[1fr_auto]">
					<input
						className="min-w-0 rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						placeholder={(cfg as any).placeholder}
						value={selectedValue}
						disabled={(cfg as any).disabled}
						onChange={(event) => {
							setValue(name as any, event.target.value as any, {
								shouldValidate: true,
								shouldDirty: true,
							});
						}}
					/>
					<label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
						Upload
						<input
							accept="image/*"
							className="sr-only"
							onChange={handleFile}
							type="file"
						/>
					</label>
				</div>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
			</div>
		);
	}

	if (configuredTags) {
		const selected = coerceSelectArray(form.watch(name as any));
		const draftTag = tagDrafts[name] ?? "";
		const setDraftTag = (value: string) => {
			setTagDrafts((current) => ({ ...current, [name]: value }));
		};
		const addTags = (raw: string) => {
			const nextTags = raw
				.split(/,|\n/)
				.map((tag) => tag.trim())
				.filter(Boolean);

			if (nextTags.length === 0) return;

			const next = Array.from(new Set([...selected, ...nextTags]));
			setValue(name as any, next as any, {
				shouldValidate: true,
				shouldDirty: true,
			});
			setDraftTag("");
		};
		const removeTag = (tag: string) => {
			setValue(name as any, selected.filter((value) => value !== tag) as any, {
				shouldValidate: true,
				shouldDirty: true,
			});
		};

		return (
			<div className="flex flex-col gap-2">
				{renderLabel()}
				<div className="flex flex-wrap gap-1.5">
					{selected.map((tag) => (
						<button
							key={tag}
							type="button"
							className="rounded-full border border-border bg-muted px-2 py-1 text-xs text-foreground hover:bg-muted/80"
							onClick={() => removeTag(tag)}
							title="Remove tag"
						>
							{tag}
							<span className="ml-1 text-muted-foreground">x</span>
						</button>
					))}
				</div>
				<input
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					placeholder={(cfg as any).placeholder ?? "Add tags"}
					value={draftTag}
					disabled={(cfg as any).disabled}
					onChange={(event) => {
						const value = event.target.value;

						if (value.includes(",")) {
							addTags(value);
							return;
						}

						setDraftTag(value);
					}}
					onBlur={() => addTags(draftTag)}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === ",") {
							event.preventDefault();
							addTags(draftTag);
						}
						if (event.key === "Backspace" && !draftTag && selected.length > 0) {
							removeTag(selected[selected.length - 1]);
						}
					}}
				/>
				<span className="text-xs text-muted-foreground">
					Type a tag, then press Enter or comma.
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

	if (configuredVoiceSelect) {
		const registration = register(name as any);
		const selectedValue = coerceSelectValue(form.watch(name as any)) ?? "";
		const selectedOption = configuredOptions.find(
			(option) => option.value === selectedValue,
		);
		const previewUrl = selectedOption?.previewUrl;
		const previewDocsUrl = selectedOption?.docsUrl;
		const isPlaying = Boolean(previewUrl && playingPreview === selectedValue);

		const stopPreview = () => {
			audioRef.current?.pause();
			audioRef.current = null;
			setPlayingPreview(null);
		};

		const togglePreview = async () => {
			if (!previewUrl || !selectedValue) return;

			if (isPlaying) {
				stopPreview();
				return;
			}

			setPreviewError(null);
			stopPreview();
			const audio = new Audio(previewUrl);
			audioRef.current = audio;
			audio.onended = () => setPlayingPreview(null);
			audio.onerror = () => {
				setPreviewError("Unable to play this voice preview.");
				setPlayingPreview(null);
			};
			setPlayingPreview(selectedValue);
			try {
				await audio.play();
			} catch {
				setPreviewError("Unable to play this voice preview.");
				setPlayingPreview(null);
			}
		};

		return (
			<div className="flex flex-col gap-1">
				{renderLabel()}
				<div className="flex gap-2">
					<select
						name={registration.name}
						ref={registration.ref}
						onBlur={registration.onBlur}
						className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						value={selectedValue}
						disabled={(cfg as any).disabled}
						onChange={(e) => {
							stopPreview();
							setPreviewError(null);
							setValue(name as any, e.target.value as any, {
								shouldValidate: true,
								shouldDirty: true,
							});
							registration.onChange?.({
								target: {
									name: registration.name,
									value: e.target.value,
								},
								type: "change",
							} as any);
						}}
					>
						<option value="">
							{configuredPlaceholder ?? `Select ${label}`}
						</option>
						{configuredOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<button
						type="button"
						className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
						disabled={!previewUrl || (cfg as any).disabled}
						title={
							previewUrl
								? isPlaying
									? "Pause voice preview"
									: "Play voice preview"
								: "No voice preview available"
						}
						onClick={togglePreview}
					>
						{isPlaying ? (
							<Pause className="h-4 w-4" aria-hidden="true" />
						) : (
							<Play className="h-4 w-4" aria-hidden="true" />
						)}
						<span className="sr-only">
							{isPlaying ? "Pause voice preview" : "Play voice preview"}
						</span>
					</button>
				</div>
				{previewUrl || previewDocsUrl || !selectedValue ? null : (
					<span className="text-xs text-muted-foreground">
						No playable preview audio is available for this voice.
					</span>
				)}
				{previewError ? (
					<span className="text-xs text-red-500 dark:text-red-400">
						{previewError}
					</span>
				) : null}
				{selectedValue && previewDocsUrl ? (
					<a
						className="inline-flex w-fit items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
						href={previewDocsUrl}
						rel="noreferrer"
						target="_blank"
					>
						Preview
						<ExternalLink className="h-3 w-3" aria-hidden="true" />
					</a>
				) : null}
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
			</div>
		);
	}

	if (configuredMcpBadges) {
		const selected = coerceSelectArray(form.watch(name as any));
		const selectedSet = new Set(selected);
		const optionsToRender = mergedMcpOptions;
		const selectedWithoutMissing = selected.filter((value) =>
			optionsToRender.some((option) => option.value === value),
		);

		const toggleValue = (value: string) => {
			const next = selectedSet.has(value)
				? selected.filter((selectedValue) => selectedValue !== value)
				: [...selected, value];

			setValue(name as any, next as any, {
				shouldValidate: true,
				shouldDirty: true,
			});
		};

		const handleConfigUpload = async (
			event: React.ChangeEvent<HTMLInputElement>,
		) => {
			const file = event.target.files?.[0];
			if (!file) return;

			try {
				const text = await file.text();
				const importedOptions = parseMcpConfigOptions(JSON.parse(text));

				if (importedOptions.length === 0) {
					setValue(name as any, selectedWithoutMissing as any, {
						shouldValidate: true,
						shouldDirty: true,
					});
					return;
				}

				setUploadedMcpOptions((previous) =>
					Array.from(
						new Map(
							[...previous, ...importedOptions].map((option) => [
								option.value,
								option,
							]),
						).values(),
					),
				);

				const next = Array.from(
					new Set([
						...selected,
						...importedOptions.map((option) => option.value),
					]),
				);
				setValue(name as any, next as any, {
					shouldValidate: true,
					shouldDirty: true,
				});
			} catch {
				setValue(name as any, selectedWithoutMissing as any, {
					shouldValidate: true,
					shouldDirty: true,
				});
			} finally {
				event.target.value = "";
			}
		};

		return (
			<TooltipProvider delayDuration={150}>
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-3">
						{renderLabel()}
						<label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
							<Upload className="h-3.5 w-3.5" aria-hidden="true" />
							Upload config
							<input
								accept="application/json,.json"
								className="sr-only"
								onChange={handleConfigUpload}
								type="file"
							/>
						</label>
					</div>
					{optionsToRender.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{optionsToRender.map((option) => {
								const active = selectedSet.has(option.value);
								const capabilityList = option.capabilities?.length
									? option.capabilities
									: [
											option.transport,
											option.command,
											option.url,
											"Tools discovered at runtime",
										].filter((capability): capability is string =>
											Boolean(capability),
										);

								return (
									<div
										key={option.value}
										className={clsx(
											"inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
											active
												? "border-primary bg-primary text-primary-foreground"
												: "border-border bg-background text-foreground hover:bg-muted",
										)}
									>
										<button
											type="button"
											aria-pressed={active}
											className="font-medium"
											onClick={() => toggleValue(option.value)}
										>
											{option.label}
										</button>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="inline-flex rounded-full p-0.5"
													aria-label={`${option.label} capabilities`}
												>
													<Info
														className="h-3.5 w-3.5 opacity-80"
														aria-hidden="true"
													/>
												</button>
											</TooltipTrigger>
											<TooltipContent
												side="top"
												align="center"
												sideOffset={8}
												className="z-[10000] w-72 border border-border bg-popover p-3 text-left text-xs text-popover-foreground shadow-lg"
											>
												<span className="block font-medium">
													{option.label}
												</span>
												{option.description && (
													<span className="mt-1 block text-muted-foreground">
														{option.description}
													</span>
												)}
												<span className="mt-2 block font-medium">
													Capabilities
												</span>
												<span className="mt-1 flex flex-wrap gap-1">
													{capabilityList.slice(0, 8).map((capability) => (
														<span
															key={capability}
															className="rounded border border-border bg-muted px-1.5 py-0.5 text-[0.7rem]"
														>
															{capability}
														</span>
													))}
												</span>
												<a
													className="mt-2 inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
													href={option.docsUrl ?? MCP_DOCS_URL}
													rel="noreferrer"
													target="_blank"
												>
													Learn more
													<ExternalLink
														className="h-3 w-3"
														aria-hidden="true"
													/>
												</a>
											</TooltipContent>
										</Tooltip>
									</div>
								);
							})}
						</div>
					) : (
						<div className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
							Upload an MCP config JSON or connect an MCP server endpoint to
							show selectable servers.
						</div>
					)}
					{normError && (
						<span className="text-xs text-red-500 dark:text-red-400">
							{normError}
						</span>
					)}
					{renderHelpText()}
				</div>
			</TooltipProvider>
		);
	}

	if (configuredModeButtons) {
		const selected = coerceSelectArray(form.watch(name as any));
		const selectedSet = new Set(selected);
		const normalizeModeSelection = (next: string[], toggledValue: string) => {
			if (toggledValue === "video" && next.includes("video")) {
				return ["video"];
			}
			const withoutVideo = next.filter((value) => value !== "video");
			return withoutVideo.length > 0 ? withoutVideo : ["text"];
		};

		return (
			<div className="flex flex-col gap-2">
				{renderLabel()}
				<div className="grid grid-cols-3 gap-2">
					{configuredOptions.map((option) => {
						const active = selectedSet.has(option.value);

						return (
							<button
								key={option.value}
								type="button"
								aria-pressed={active}
								className={clsx(
									"rounded-md border px-3 py-2 text-sm font-medium transition-colors",
									active
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-background text-foreground hover:bg-muted",
								)}
								onClick={() => {
									const next = active
										? selected.filter((value) => value !== option.value)
										: [...selected, option.value];

									setValue(
										name as any,
										normalizeModeSelection(next, option.value) as any,
										{
											shouldValidate: true,
											shouldDirty: true,
										},
									);
								}}
							>
								{option.label}
							</button>
						);
					})}
				</div>
				{normError && (
					<span className="text-xs text-red-500 dark:text-red-400">
						{normError}
					</span>
				)}
				{renderHelpText()}
			</div>
		);
	}
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
				{renderLabel()}
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
				{renderLabel()}
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
		return renderSlider();
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
					{renderLabel()}
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
	if (isBooleanField) {
		if (widget === "switch") {
			const current = Boolean(watch(name as any));
			const registerProps = register(name as any);

			return (
				<div className="flex flex-col gap-1">
					<label className="flex items-center justify-between gap-3">
						{renderLabel()}
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
					{renderLabel()}
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
					{renderLabel()}
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
			return renderSlider();
		}

		return (
			<div className="flex flex-col gap-1">
				{renderLabel()}
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
					{renderLabel()}
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
					{renderLabel()}
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
				{renderLabel()}
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
				{renderLabel()}
				<input
					multiple
					className="rounded-md border border-border bg-background px-3 py-2 text-foreground file:mr-4 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					type="file"
					accept={(cfg as any).accept}
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

	if (baseTypeName === "ZodObject" || baseTypeName === "object") {
		return null;
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
					// biome-ignore lint/security/noDangerouslySetInnerHtml: dev-only fallback diagnostic
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
				{renderLabel()}
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
