import React from "react";

import {
	FieldError,
	FieldLabel,
	TypeformRendererMap,
	TypeformRendererProps,
} from "./shared";

const renderLongText = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<textarea
				className="min-h-32 rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				rows={cfg.rows ?? 5}
				{...form.register(name as any)}
			/>
			<FieldError message={error} />
		</div>
	);
};

const renderShortText = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				placeholder={cfg.placeholder}
				type="text"
				{...form.register(name as any)}
			/>
			<FieldError message={error} />
		</div>
	);
};

const renderVideo = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const accept =
		(cfg.questionSettings?.videoAccept as string | undefined) ?? "video/*";
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel description={cfg.description} label={label} />
			<input
				accept={accept}
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground file:mr-4 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				type="file"
				{...form.register(name as any)}
			/>
			<FieldError message={error} />
		</div>
	);
};

const renderClarifyWithAI = (props: TypeformRendererProps) => {
	const { form, name, label, cfg, error } = props;
	const helper =
		(cfg.questionSettings?.clarifyPrompt as string | undefined) ??
		"Our AI assistant will ask follow-up questions based on your answer.";
	return (
		<div className="flex flex-col gap-2">
			<FieldLabel description={cfg.description} label={label} />
			<textarea
				className="min-h-32 rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				{...form.register(name as any)}
			/>
			<div className="text-xs text-muted-foreground">{helper}</div>
			<FieldError message={error} />
		</div>
	);
};

const renderStaticBlock = (props: TypeformRendererProps, variant: string) => {
	const { cfg, label } = props;
	const content =
		(cfg.questionSettings?.content as string | undefined) ??
		cfg.description ??
		label;
	return (
		<div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
			<div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground/80">
				{variant}
			</div>
			<div>{content}</div>
		</div>
	);
};

export const textRenderers: TypeformRendererMap = {
	longText: renderLongText,
	shortText: renderShortText,
	video: renderVideo,
	clarifyWithAI: renderClarifyWithAI,
	statement: (props) => renderStaticBlock(props, "Statement"),
	welcomeScreen: (props) => renderStaticBlock(props, "Welcome"),
	endScreen: (props) => renderStaticBlock(props, "End Screen"),
	questionGroup: (props) => renderStaticBlock(props, "Group"),
	multiQuestionPage: (props) => renderStaticBlock(props, "Section"),
};
