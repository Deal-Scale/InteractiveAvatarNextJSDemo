"use client";
import React from "react";
import { AppSchema, type AppValues } from "./schema";
import { AutoForm } from "../AutoForm";
import { useZodForm } from "../utils/useZodForm";

export default function ExampleForm() {
	const form = useZodForm(AppSchema, {
		defaultValues: {
			email: "",
			password: "",
			bio: "",
			age: 30,
			birthday: undefined as any,
			termsAccepted: false,
			role: "user",
			favoriteFruit: "",
			apiKey: "",
			files: undefined as any,
			tags: [],
			favoriteColors: [],
		} satisfies Partial<AppValues>,
	});

	const [output, setOutput] = React.useState<any>(null);

	return (
		<div className="max-w-xl space-y-4">
			<h2 className="text-xl font-semibold">zod-react-form-auto Example</h2>
			<AutoForm
				form={form}
				schema={AppSchema}
				fields={{
					age: { widget: "slider", min: 0, max: 120, step: 1, label: "Age" },
					birthday: { label: "Birthday" },
					password: { widget: "password", label: "Password" },
					bio: { widget: "textarea", rows: 4, label: "Bio" },
					termsAccepted: {
						widget: "select",
						label: "Accept Terms?",
					},
					favoriteFruit: {
						widget: "select",
						label: "Favorite Fruit",
						options: [
							{ value: "", label: "-- choose --" },
							{ value: "apple", label: "Apple" },
							{ value: "banana", label: "Banana" },
							{ value: "orange", label: "Orange" },
						],
					},
					apiKey: { widget: "password", label: "API Key" },
				}}
				onSubmit={(vals) => setOutput(vals)}
				submitLabel="Submit"
			/>

			<div className="rounded-md border p-3 text-sm">
				<div className="mb-2 font-medium">Submitted Values</div>
				<pre className="whitespace-pre-wrap break-words">
					{output ? JSON.stringify(output, null, 2) : "(submit to see output)"}
				</pre>
			</div>
		</div>
	);
}
