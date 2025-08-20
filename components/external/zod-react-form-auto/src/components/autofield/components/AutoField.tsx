"use client";
import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { SelectField } from "./SelectField";
import { BooleanField } from "./BooleanField";
import { BooleanSelectField } from "./BooleanSelectField";
import { NumberField, NumberSliderField } from "./NumberField";
import { DateField } from "./DateField";
import { TextareaField, CollapsibleTextareaField } from "./TextareaField";
import { TextField } from "./TextField";
import { ArrayStringField } from "./ArrayStringField";
import { SensitiveInput } from "../../../utils/fields";
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
import { FileUploadField } from "./FileUploadField";

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
	const { formState, watch } = form;
	const cfg = (fields as any)[name] || {};
	const label = cfg.label ?? name;
	const error = (formState.errors as any)[name]?.message as string | undefined;
	const base = unwrapType(def);

	// explicit widgets first
	if ((cfg as any).widget === "select") {
		const opts = ((cfg as any).options ?? []) as Array<{
			value: string;
			label: string;
		}>;
		return (
			<SelectField
				name={name}
				label={label}
				error={error}
				opts={opts}
				multiple={Boolean((cfg as any).multiple)}
				form={form}
			/>
		);
	}
	if ((cfg as any).widget === "textarea") {
		return (
			<TextareaField
				name={name}
				label={label}
				error={error}
				rows={(cfg as any).rows}
				form={form}
			/>
		);
	}
	if ((cfg as any).widget === "password") {
		return (
			<div className="flex flex-col gap-1">
				<span className="text-sm text-muted-foreground">{label}</span>
				<SensitiveInput name={name} register={form.register} />
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
			<NumberSliderField
				name={name}
				label={label}
				error={error}
				min={(cfg as any).min}
				max={(cfg as any).max}
				step={(cfg as any).step}
				form={form}
			/>
		);
	}

	// enums -> select
	if (
		base instanceof z.ZodEnum ||
		(base as any)?._def?.values ||
		(base as any)?.options
	) {
		const values = enumStringValuesFromZodEnum(base as any);
		return (
			<SelectField
				name={name}
				label={label}
				error={error}
				opts={optionsFromStrings(values)}
				multiple={Boolean((cfg as any).multiple)}
				form={form}
			/>
		);
	}

	// union of enums/strings/literals -> select
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
			return (
				<SelectField
					name={name}
					label={label}
					error={error}
					opts={Array.from(new Set(stringVals)).map((v) => ({
						value: v,
						label: v,
					}))}
					multiple={Boolean((cfg as any).multiple)}
					form={form}
				/>
			);
	}

	// arrays
	if (base instanceof z.ZodArray) {
		const el = (base as any)?._def?.type as z.ZodTypeAny;
		if (
			el instanceof z.ZodEnum ||
			(el as any)?._def?.values ||
			(el as any)?.options
		) {
			const values = enumStringValuesFromZodEnum(el as any);
			return (
				<SelectField
					name={name}
					label={label}
					error={error}
					opts={optionsFromStrings(values)}
					multiple
					form={form}
				/>
			);
		}
		if (el instanceof z.ZodString && (cfg as any).options?.length)
			return (
				<SelectField
					name={name}
					label={label}
					error={error}
					opts={(cfg as any).options!}
					multiple
					form={form}
				/>
			);
		if (el instanceof z.ZodString)
			return (
				<ArrayStringField
					name={name}
					label={label}
					error={error}
					rows={(cfg as any).rows}
					placeholder={(cfg as any).placeholder}
					form={form}
				/>
			);
	}

	// boolean
	if (base instanceof z.ZodBoolean) {
		if ((cfg as any).widget === "select") {
			const current = watch(name as any) as any as boolean | undefined;
			const opts = booleanSelectOptions(
				(cfg as any).options as Array<{ value: string; label: string }>,
			);
			const value = typeof current === "boolean" ? String(current) : "";
			return (
				<BooleanSelectField
					name={name}
					label={label}
					error={error}
					opts={opts}
					form={form}
				/>
			);
		}
		return <BooleanField name={name} label={label} error={error} form={form} />;
	}

	// number
	if (base instanceof z.ZodNumber) {
		if ((cfg as any).widget === "slider")
			return (
				<NumberSliderField
					name={name}
					label={label}
					error={error}
					min={(cfg as any).min}
					max={(cfg as any).max}
					step={(cfg as any).step}
					form={form}
				/>
			);
		return <NumberField name={name} label={label} error={error} form={form} />;
	}

	// date
	if (base instanceof z.ZodDate)
		return <DateField name={name} label={label} error={error} form={form} />;

	// string
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
					{/* keep inlined to avoid exposing password value to props */}
					<SensitiveInput name={name} register={form.register} />
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
			return (
				<SelectField
					name={name}
					label={label}
					error={error}
					opts={opts}
					multiple={Boolean((cfg as any).multiple)}
					form={form}
				/>
			);
		}
		if (multiline)
			return (
				<CollapsibleTextareaField
					name={name}
					label={label}
					error={error}
					rows={(cfg as any).rows}
					form={form}
				/>
			);
		return (
			<TextField
				name={name}
				label={label}
				error={error}
				placeholder={(cfg as any).placeholder}
				pattern={regexCheck?.regex ? regexCheck.regex.source : undefined}
				type={isEmail ? "email" : "text"}
				form={form}
			/>
		);
	}

	// file-upload
	if (String((def as any).description ?? "").startsWith("file-upload")) {
		const fileCfg = parseFileUploadConfig((def as any)._def, cfg as any);
		return (
			<FileUploadField
				name={name}
				label={label}
				error={error}
				accept={fileCfg.accept}
				min={fileCfg.min}
				max={fileCfg.max}
				form={form}
			/>
		);
	}

	// fallback text
	return <TextField name={name} label={label} error={error} form={form} />;
};
