"use client";

import React from "react";
import clsx from "clsx";

import {
	calculateMonetizedRate,
	type AgentUsageProfile,
} from "@/lib/agents/monetization";

const formatCurrency = (value: number, currency: string) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		maximumFractionDigits: 2,
	}).format(value);

type AgentMonetizationSummaryProps = {
	enabled: boolean;
	profile: AgentUsageProfile;
	multiplier: number;
};

export function AgentMonetizationSummary({
	enabled,
	profile,
	multiplier,
}: AgentMonetizationSummaryProps) {
	const { baseAmount, currency, description, label, usageStates } = profile;
	const effectiveMultiplier = enabled ? multiplier : 1;
	const totalRate = calculateMonetizedRate(baseAmount, effectiveMultiplier);

	const summaryNote = enabled
		? `${formatCurrency(baseAmount, currency)} base × ${effectiveMultiplier.toFixed(2)}x`
		: `${formatCurrency(baseAmount, currency)} base rate`;

	return (
		<section
			aria-label="Monetization summary"
			className={clsx(
				"mt-4 space-y-3 rounded-md border border-border p-3 text-sm transition-opacity",
				enabled ? "opacity-100" : "opacity-75",
			)}
		>
			<header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h3 className="text-base font-semibold text-foreground">{label}</h3>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
				<div className="text-right">
					<div className="text-xs uppercase tracking-wide text-muted-foreground">
						Estimated payout
					</div>
					<div className="text-lg font-semibold text-foreground">
						{formatCurrency(totalRate, currency)}
					</div>
					<div className="text-xs text-muted-foreground">{summaryNote}</div>
				</div>
			</header>

			<dl className="grid gap-2 text-xs sm:grid-cols-2">
				{usageStates.map((state) => (
					<div
						key={`${state.label}-${state.value}`}
						className="rounded-md bg-muted/50 px-3 py-2"
					>
						<dt className="font-medium text-foreground">{state.label}</dt>
						<dd className="text-muted-foreground">{state.value}</dd>
					</div>
				))}
			</dl>

			{!enabled && (
				<p className="text-xs text-muted-foreground">
					Toggle monetization to apply your multiplier and publish this pricing
					guidance.
				</p>
			)}
		</section>
	);
}
