import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { useForm, type UseFormReturn } from "react-hook-form";

import { AutoForm } from "../AutoForm";

vi.mock(
	"@/components/ui/tooltip",
	() => ({
		Tooltip: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="tooltip">{children}</div>
		),
		TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
			<>{children}</>
		),
		TooltipContent: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="tooltip-content">{children}</div>
		),
		TooltipProvider: ({ children }: { children: React.ReactNode }) => (
			<>{children}</>
		),
	}),
	{ virtual: true },
);

describe("AutoForm", () => {
	it("flattens nested field errors into a normalized summary", async () => {
		const schema = z.object({
			profile: z.object({
				name: z.string(),
				usage: z.enum(["personal", "commercial"]),
			}),
		});
		let formRef:
			| UseFormReturn<{
					profile: { name: string; usage: "personal" | "commercial" };
			  }>
			| undefined;

		const Harness: React.FC = () => {
			const form = useForm<{
				profile: { name: string; usage: "personal" | "commercial" };
			}>({
				defaultValues: {
					profile: { name: "", usage: "personal" },
				},
				mode: "onChange",
			});
			formRef = form;

			return (
				<AutoForm
					schema={schema}
					form={form}
					fields={
						{
							"profile.name": { label: "Display name" },
							"profile.usage": { label: "Usage tier" },
						} as any
					}
					onSubmit={vi.fn()}
					submitLabel="Save"
				/>
			);
		};

		render(<Harness />);

		act(() => {
			formRef?.setError("profile.name" as any, {
				type: "required",
				message: "Invalid input",
			});
			formRef?.setError("profile.usage" as any, {
				type: "required",
				message: "Usage selection missing",
			});
		});

		const summaryHeading = await screen.findByText(/need attention/);
		expect(summaryHeading.textContent).toContain("need attention");

		const items = screen.getAllByRole("listitem");
		expect(items.length).toBe(2);
		const normalized = items.find((item) =>
			item.textContent?.includes("Display name"),
		);
		expect(normalized?.textContent).toContain(
			"Display name: Display name is required",
		);
		const usageItem = items.find((item) =>
			item.textContent?.includes("Usage tier"),
		);
		expect(usageItem?.textContent).toContain(
			"Usage tier: Usage selection missing",
		);
	});
});
