import React from "react";

import {
	FieldError,
	FieldLabel,
	TypeformRendererMap,
	TypeformRendererProps,
} from "./shared";

const renderNumber = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				min={cfg.min}
				max={cfg.max}
				step={cfg.step ?? 1}
				type="number"
				{...form.register(name as any, { valueAsNumber: true })}
			/>
			<FieldError message={error} />
		</div>
	);
};

const renderPayment = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const settings = cfg.questionSettings?.payment as
		| { currency?: string; minimum?: number; maximum?: number }
		| undefined;
	const currency = settings?.currency ?? "USD";

	return (
		<div className="flex flex-col gap-2">
			<FieldLabel description={cfg.description} label={label} />
			<div className="flex items-center gap-2">
				<span className="rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium">
					{currency}
				</span>
				<input
					className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
					min={settings?.minimum}
					max={settings?.maximum}
					step="0.01"
					type="number"
					{...form.register(name as any, { valueAsNumber: true })}
				/>
			</div>
			<FieldError message={error} />
		</div>
	);
};

const renderFileUpload = (props: TypeformRendererProps, label: string) => {
	const { form, name, cfg, error } = props;
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground file:mr-4 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				multiple
				type="file"
				{...form.register(name as any)}
			/>
			<FieldError message={error} />
		</div>
	);
};

const renderDate = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				type="date"
				{...form.register(name as any)}
			/>
			<FieldError message={error} />
		</div>
	);
};

const renderCalendly = (props: TypeformRendererProps) => {
	const { cfg, label } = props;
	const url =
		(cfg.questionSettings?.calendlyUrl as string | undefined) ??
		"https://calendly.com/";
	return (
		<div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
			<div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground/80">
				Calendly
			</div>
			<div className="mb-2">{label}</div>
			<a
				className="inline-flex items-center gap-2 text-primary underline"
				href={url}
				rel="noreferrer"
				target="_blank"
			>
				Schedule via Calendly
			</a>
		</div>
	);
};

export const otherRenderers: TypeformRendererMap = {
	number: renderNumber,
	payment: renderPayment,
	fileUpload: (props) => renderFileUpload(props, props.label),
	googleDrive: (props) =>
		renderFileUpload(props, `${props.label} (Google Drive)`),
	date: renderDate,
	calendly: renderCalendly,
};
