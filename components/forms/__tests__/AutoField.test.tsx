import { render, screen, waitFor } from "@testing-library/react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import React from "react";
import { z } from "zod";

import { AutoField } from "../AutoField";
import type { FieldConfig } from "../utils";

const videoOptions = [
	{ value: "720p", label: "720p" },
	{ value: "1080p", label: "1080p" },
];

const outputOptions = [
	{ value: "stereo", label: "Stereo" },
	{ value: "mono", label: "Mono" },
];

type HarnessProps = {
	name: string;
	def: z.ZodTypeAny;
	defaultValue: unknown;
	fieldConfig: FieldConfig;
	onReady?: (form: UseFormReturn<Record<string, unknown>>) => void;
};

function FieldHarness({
	name,
	def,
	defaultValue,
	fieldConfig,
	onReady,
}: HarnessProps) {
	const form = useForm<Record<string, unknown>>({
		defaultValues: {
			[name]: defaultValue,
		},
	});

	React.useEffect(() => {
		onReady?.(form);
	}, [form, onReady]);

	return (
		<form>
			<AutoField
				name={name}
				def={def}
				form={form as UseFormReturn<any>}
				fields={{ [name]: fieldConfig }}
			/>
		</form>
	);
}

describe("AutoField select normalization", () => {
	it("normalizes object default values for single selects", async () => {
		let formRef: UseFormReturn<Record<string, unknown>> | null = null;

		const { container } = render(
			<FieldHarness
				name="video.resolution"
				def={z.enum(["720p", "1080p"])}
				defaultValue={{ value: "1080p", label: "Full HD" }}
				fieldConfig={{ widget: "select", options: videoOptions }}
				onReady={(form) => {
					formRef = form;
				}}
			/>,
		);

		await waitFor(() => {
			expect(formRef).not.toBeNull();
		});

		await waitFor(() => {
			const select = container.querySelector(
				'select[name="video.resolution"]',
			) as HTMLSelectElement | null;
			expect(select).not.toBeNull();
			expect(select!.value).toBe("1080p");
		});

		expect(() => screen.getByDisplayValue("[object Object]")).toThrow();

		await waitFor(() => {
			expect(formRef?.getValues("video.resolution")).toBe("1080p");
		});
	});

	it("normalizes option objects for multi-select fields", async () => {
		let formRef: UseFormReturn<Record<string, unknown>> | null = null;

		const { container } = render(
			<FieldHarness
				name="audio.outputs"
				def={z.array(z.string())}
				defaultValue={[{ value: "stereo", label: "Stereo" }]}
				fieldConfig={{
					widget: "select",
					multiple: true,
					options: outputOptions,
				}}
				onReady={(form) => {
					formRef = form;
				}}
			/>,
		);

		await waitFor(() => {
			expect(formRef).not.toBeNull();
		});

		await waitFor(() => {
			const select = container.querySelector(
				'select[name="audio.outputs"]',
			) as HTMLSelectElement | null;
			expect(select).not.toBeNull();
			const selected = Array.from(select!.selectedOptions).map(
				(option) => option.value,
			);
			expect(selected).toEqual(["stereo"]);
		});

		await waitFor(() => {
			expect(formRef?.getValues("audio.outputs")).toEqual(["stereo"]);
		});
	});
});
