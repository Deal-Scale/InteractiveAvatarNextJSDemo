import React from "react";

import {
	FieldError,
	FieldLabel,
	TypeformRendererMap,
	TypeformRendererProps,
} from "./shared";

const renderSlider = (
	props: TypeformRendererProps,
	{
		min,
		max,
		step,
		labels,
	}: { min: number; max: number; step?: number; labels?: string[] },
) => {
	const { form, name, label, cfg, error } = props;
	const value = form.watch(name as any) ?? min;

	return (
		<div className="flex flex-col gap-2">
			<FieldLabel description={cfg.description} label={label} />
			<div className="flex items-center gap-3">
				<input
					className="flex-1"
					max={max}
					min={min}
					step={step ?? 1}
					type="range"
					value={value}
					onChange={(event) => {
						const next = Number(event.target.value);
						form.setValue(name as any, next as any, {
							shouldDirty: true,
							shouldValidate: true,
						});
					}}
				/>
				<span className="w-12 text-right text-sm font-medium">{value}</span>
			</div>
			{labels && labels.length === 2 ? (
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>{labels[0]}</span>
					<span>{labels[1]}</span>
				</div>
			) : null}
			<FieldError message={error} />
		</div>
	);
};

const renderNps = (props: TypeformRendererProps) => {
	const labels = cfgLabels(props.cfg) ?? ["Not likely", "Extremely likely"];
	return renderSlider(props, { min: 0, max: 10, labels });
};

const cfgLabels = (cfg: TypeformRendererProps["cfg"]) =>
	(cfg.questionSettings?.npsLabels as string[] | undefined) ?? undefined;

const renderOpinionScale = (props: TypeformRendererProps) => {
	const min = typeof props.cfg.min === "number" ? props.cfg.min : 0;
	const max = typeof props.cfg.max === "number" ? props.cfg.max : 10;
	return renderSlider(props, { min, max });
};

const renderRating = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const max = (cfg.questionSettings?.ratingMax as number | undefined) ?? 5;
	const value = form.watch(name as any) ?? 0;
	const icon = (cfg.questionSettings?.ratingIcon as string | undefined) ?? "★";

	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<div className="flex gap-1">
				{Array.from({ length: max }).map((_, index) => {
					const score = index + 1;
					const active = value >= score;
					return (
						<button
							key={score}
							className={`h-10 w-10 rounded-full border text-xl transition focus:outline-none focus:ring-2 focus:ring-primary ${
								active
									? "border-primary bg-primary text-primary-foreground"
									: "border-border bg-background"
							}`}
							onClick={(event) => {
								event.preventDefault();
								form.setValue(name as any, score as any, {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
							type="button"
						>
							{icon}
						</button>
					);
				})}
			</div>
			<FieldError message={error} />
		</div>
	);
};

export const scaleRenderers: TypeformRendererMap = {
	nps: renderNps,
	opinionScale: renderOpinionScale,
	rating: renderRating,
};
