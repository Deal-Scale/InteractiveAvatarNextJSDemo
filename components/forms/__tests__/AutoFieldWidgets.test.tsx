import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { useForm, type UseFormReturn } from "react-hook-form";

import { AutoField } from "../AutoField";

describe("AutoField widgets", () => {
	it("keeps select fields synchronized with form state", async () => {
		const def = z.string();
		let formRef: UseFormReturn<{ provider: string }> | undefined;

		const Harness: React.FC = () => {
			const form = useForm<{ provider: string }>({
				defaultValues: { provider: "openai" },
			});
			formRef = form;

			return (
				<AutoField
					name="provider"
					def={def}
					form={form}
					fields={{
						provider: {
							label: "Model provider",
							widget: "select",
							options: [
								{ value: "openai", label: "OpenAI" },
								{ value: "anthropic", label: "Anthropic" },
								{ value: "groq", label: "Groq" },
							],
							helpText: "Select a provider.",
						},
					}}
				/>
			);
		};

		render(<Harness />);

		const select = screen.getByRole("combobox") as HTMLSelectElement;
		expect(select.value).toBe("openai");

		await userEvent.selectOptions(select, "anthropic");

		expect(formRef?.getValues().provider).toBe("anthropic");
		expect(select.value).toBe("anthropic");
		const helpText = screen.getByText("Select a provider.");
		expect(helpText.textContent).toBe("Select a provider.");
	});

	it("writes multi-select choices back to array fields", async () => {
		const def = z.array(z.string());
		let formRef: UseFormReturn<{ tags: string[] }> | undefined;

		const Harness: React.FC = () => {
			const form = useForm<{ tags: string[] }>({
				defaultValues: { tags: [] },
			});
			formRef = form;

			return (
				<AutoField
					name="tags"
					def={def}
					form={form}
					fields={{
						tags: {
							label: "Tags",
							widget: "select",
							multiple: true,
							options: [
								{ value: "alpha", label: "Alpha" },
								{ value: "beta", label: "Beta" },
								{ value: "gamma", label: "Gamma" },
							],
						},
					}}
				/>
			);
		};

		render(<Harness />);

		const listbox = screen.getByRole("listbox");
		await userEvent.selectOptions(listbox, ["alpha", "gamma"]);

		expect(formRef?.getValues().tags).toEqual(["alpha", "gamma"]);

		await userEvent.deselectOptions(listbox, "alpha");
		expect(formRef?.getValues().tags).toEqual(["gamma"]);
	});

	it("updates boolean switch widgets", async () => {
		const def = { _def: { typeName: "ZodBoolean" } } as z.ZodTypeAny;
		let formRef: UseFormReturn<{ monetize: boolean }> | undefined;

		const Harness: React.FC = () => {
			const form = useForm<{ monetize: boolean }>({
				defaultValues: { monetize: false },
			});
			formRef = form;

			return (
				<AutoField
					name="monetize"
					def={def}
					form={form}
					fields={{
						monetize: {
							label: "Monetize",
							widget: "switch",
						},
					}}
				/>
			);
		};

		render(<Harness />);

		const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
		expect(checkbox.checked).toBe(false);

		await userEvent.click(checkbox);

		expect(formRef?.getValues().monetize).toBe(true);
		expect(checkbox.checked).toBe(true);
	});
});
