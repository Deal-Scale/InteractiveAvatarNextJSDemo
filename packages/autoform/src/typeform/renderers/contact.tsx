import React from "react";

import { unwrapType } from "../../utils/utils";

import {
	FieldError,
	FieldLabel,
	TypeformRendererMap,
	TypeformRendererProps,
} from "./shared";

const primitiveInputType = (field: string) => {
	const lower = field.toLowerCase();
	if (lower.includes("email")) return "email";
	if (lower.includes("phone")) return "tel";
	if (lower.includes("website") || lower.includes("url")) return "url";
	return "text";
};

const renderTextField = (
	props: TypeformRendererProps,
	field: string,
	label: string,
	description?: string,
) => {
	const { form, name, error, cfg } = props;
	const fieldName = `${name}.${field}`;
	const fieldError = (form.formState.errors as any)?.[name]?.[field]?.message as
		| string
		| undefined;
	const fieldLabels =
		(cfg.questionSettings?.fieldLabels as Record<string, string> | undefined) ??
		{};
	const displayLabel = fieldLabels[field] ?? label;

	return (
		<div key={fieldName} className="flex flex-col gap-1">
			<FieldLabel description={description} label={displayLabel} />
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				type={primitiveInputType(field)}
				{...form.register(fieldName as any)}
			/>
			<FieldError message={fieldError} />
		</div>
	);
};

const renderAddressGrid = (props: TypeformRendererProps) => {
	const { form, name, cfg } = props;
	const addressCfg = (cfg.questionSettings?.addressFields as string[]) ?? [];
	const fields: Array<{ field: string; label: string }> = addressCfg.length
		? addressCfg.map((key) => ({ field: key, label: key }))
		: [
				{ field: "line1", label: "Address line 1" },
				{ field: "line2", label: "Address line 2" },
				{ field: "city", label: "City" },
				{ field: "state", label: "State" },
				{ field: "postalCode", label: "Postal code" },
				{ field: "country", label: "Country" },
			];

	return (
		<div className="grid gap-2 md:grid-cols-2">
			{fields.map((field) => {
				const fieldName = `${name}.${field.field}`;
				const fieldError = (form.formState.errors as any)?.[name]?.[field.field]
					?.message as string | undefined;

				return (
					<div key={fieldName} className="flex flex-col gap-1">
						<FieldLabel label={field.label} />
						<input
							className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
							{...form.register(fieldName as any)}
						/>
						<FieldError message={fieldError} />
					</div>
				);
			})}
		</div>
	);
};

const renderContactInfo = (props: TypeformRendererProps) => {
	const { base } = props;
	const shapeGetter = (base as any)?._def?.shape;
	const shape: Record<string, any> =
		typeof shapeGetter === "function"
			? shapeGetter()
			: ((base as any)?.shape ?? {});
	const preferredOrder = (props.cfg.questionSettings?.contactFields as
		| string[]
		| undefined) ?? [
		"firstName",
		"lastName",
		"email",
		"phone",
		"company",
		"website",
		"address",
	];
	const remaining = Object.keys(shape).filter(
		(key) => !preferredOrder.includes(key),
	);
	const order = [...preferredOrder, ...remaining];

	return (
		<div className="flex flex-col gap-2">
			{order.map((field) => {
				const def = shape[field];
				if (!def) return null;
				const childBase = unwrapType(def);
				const type =
					(childBase as any)?._def?.type ?? (childBase as any)?._def?.typeName;
				if (type === "object" || type === "ZodObject") {
					return (
						<div key={field} className="flex flex-col gap-2">
							<FieldLabel label={field} />
							{renderAddressGrid({ ...props, name: `${props.name}.${field}` })}
						</div>
					);
				}

				return renderTextField(props, field, field);
			})}
		</div>
	);
};

const renderPhoneNumber = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const pattern = (cfg.questionSettings as Record<string, unknown>)
		?.phonePattern as string | undefined;
	const placeholder =
		cfg.placeholder ??
		(pattern
			? "Enter phone number"
			: "Include country code e.g. +1 555 555 5555");

	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				pattern={pattern}
				placeholder={placeholder}
				type="tel"
				{...form.register(name as any)}
			/>
			<FieldError message={error} />
		</div>
	);
};

const renderEmail = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				placeholder={cfg.placeholder ?? "name@example.com"}
				type="email"
				{...form.register(name as any)}
			/>
			<FieldError message={error} />
		</div>
	);
};

const renderWebsite = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				placeholder={cfg.placeholder ?? "https://example.com"}
				type="url"
				{...form.register(name as any)}
			/>
			<FieldError message={error} />
		</div>
	);
};

const renderLegal = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const text =
		(cfg.questionSettings?.legalText as string | undefined) ??
		cfg.description ??
		"I agree to the terms and conditions.";
	return (
		<div className="flex flex-col gap-2 rounded-md border border-border bg-muted/20 p-3">
			<div className="text-sm text-muted-foreground">{text}</div>
			<label className="flex items-center gap-2 text-sm text-foreground">
				<input
					className="h-4 w-4 accent-primary"
					type="checkbox"
					{...form.register(name as any)}
				/>
				{label}
			</label>
			<FieldError message={error} />
		</div>
	);
};

const renderAddress = (props: TypeformRendererProps) => {
	return (
		<div className="flex flex-col gap-2">
			<FieldLabel label={props.label} description={props.cfg.description} />
			{renderAddressGrid(props)}
			<FieldError message={props.error} />
		</div>
	);
};

export const contactRenderers: TypeformRendererMap = {
	contactInfo: renderContactInfo,
	email: renderEmail,
	phoneNumber: renderPhoneNumber,
	address: renderAddress,
	website: renderWebsite,
	legal: renderLegal,
};
