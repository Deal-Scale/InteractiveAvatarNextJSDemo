import type { UseFormReturn } from "react-hook-form";

import React from "react";

import { AutoForm } from "@/components/forms/AutoForm";

interface GlobalSettingsTabProps {
	form: UseFormReturn<any>;
	schema: any;
	onSubmit: (values: any) => void;
}

export function GlobalSettingsTab({
	form,
	schema,
	onSubmit,
}: GlobalSettingsTabProps) {
	return (
		<div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
			<p className="text-sm text-muted-foreground">
				Configure app-wide options (theme, telemetry, API base URL). These
				persist locally in your browser.
			</p>
			<AutoForm
				className="space-y-3"
				form={form as any}
				schema={schema}
				submitLabel="Save Global Settings"
				onSubmit={onSubmit}
			/>
		</div>
	);
}
