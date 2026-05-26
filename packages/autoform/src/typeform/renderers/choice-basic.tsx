import React from "react";

import {
	FieldError,
	FieldLabel,
	TypeformRendererMap,
	TypeformRendererProps,
	ensureArray,
	getOptions,
} from "./shared";

const renderMultipleChoice = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const options = getOptions(cfg);
	const allowMultiple = Boolean(cfg.multiple);

	if (allowMultiple) {
		const selected = ensureArray(form.watch(name as any));
		const toggle = (value: string) => {
			const next = selected.includes(value)
				? selected.filter((v) => v !== value)
				: [...selected, value];
			form.setValue(name as any, next as any, {
				shouldDirty: true,
				shouldValidate: true,
			});
		};

		return (
			<div className="flex flex-col gap-2">
				<FieldLabel description={cfg.description} label={label} />
				<div className="grid gap-2 sm:grid-cols-2">
					{options.map((opt) => {
						const checked = selected.includes(opt.value);
						return (
							<button
								key={opt.value}
								className={`rounded-md border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primary ${
									checked
										? "border-primary bg-primary/10"
										: "border-border bg-background"
								}`}
								onClick={(event) => {
									event.preventDefault();
									toggle(opt.value);
								}}
								type="button"
							>
								<div className="font-medium">{opt.label}</div>
								{opt.description ? (
									<div className="text-xs text-muted-foreground">
										{opt.description}
									</div>
								) : null}
							</button>
						);
					})}
				</div>
				<FieldError message={error} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<FieldLabel description={cfg.description} label={label} />
			<div className="space-y-2">
				{options.map((opt) => (
					<label key={opt.value} className="flex items-center gap-2 text-sm">
						<input
							className="h-4 w-4 accent-primary"
							type="radio"
							value={opt.value}
							{...form.register(name as any)}
						/>
						<span>{opt.label}</span>
					</label>
				))}
			</div>
			<FieldError message={error} />
		</div>
	);
};

const renderDropdown = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const options = getOptions(cfg);

	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<select
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				defaultValue=""
				{...form.register(name as any)}
			>
				<option disabled value="">
					Select an option
				</option>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			<FieldError message={error} />
		</div>
	);
};

const renderYesNo = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const current = form.watch(name as any);

	return (
		<div className="flex flex-col gap-2">
			<FieldLabel description={cfg.description} label={label} />
			<div className="flex gap-2">
				{[true, false].map((value) => {
					const active = current === value;
					return (
						<button
							key={String(value)}
							className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary ${
								active
									? "border-primary bg-primary text-primary-foreground"
									: "border-border bg-background"
							}`}
							onClick={(event) => {
								event.preventDefault();
								form.setValue(name as any, value as any, {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
							type="button"
						>
							{value ? "Yes" : "No"}
						</button>
					);
				})}
			</div>
			<FieldError message={error} />
		</div>
	);
};

const renderCheckbox = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	return (
		<label className="flex items-center gap-3 text-sm text-foreground">
			<input
				className="h-4 w-4 accent-primary"
				type="checkbox"
				{...form.register(name as any)}
			/>
			<span>
				{label}
				{cfg.description ? (
					<span className="ml-2 text-xs text-muted-foreground">
						{cfg.description}
					</span>
				) : null}
			</span>
			<FieldError message={error} />
		</label>
	);
};

const renderPictureChoice = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const options = getOptions(cfg);
	const current = form.watch(name as any) as string | undefined;

	const choose = (value: string) => {
		form.setValue(name as any, value as any, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	return (
		<div className="flex flex-col gap-2">
			<FieldLabel description={cfg.description} label={label} />
			<div className="grid gap-3 md:grid-cols-2">
				{options.map((opt) => {
					const active = current === opt.value;
					return (
						<button
							key={opt.value}
							className={`overflow-hidden rounded-lg border text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary ${
								active ? "border-primary" : "border-border"
							}`}
							onClick={(event) => {
								event.preventDefault();
								choose(opt.value);
							}}
							type="button"
						>
							{opt.imageUrl ? (
								<img
									alt={opt.label}
									className="h-32 w-full object-cover"
									src={opt.imageUrl}
								/>
							) : null}
							<div className="p-3">
								<div className="font-medium">{opt.label}</div>
								{opt.description ? (
									<div className="text-xs text-muted-foreground">
										{opt.description}
									</div>
								) : null}
							</div>
						</button>
					);
				})}
			</div>
			<FieldError message={error} />
		</div>
	);
};

export const basicChoiceRenderers: TypeformRendererMap = {
	multipleChoice: renderMultipleChoice,
	dropdown: renderDropdown,
	yesNo: renderYesNo,
	checkbox: renderCheckbox,
	pictureChoice: renderPictureChoice,
};
