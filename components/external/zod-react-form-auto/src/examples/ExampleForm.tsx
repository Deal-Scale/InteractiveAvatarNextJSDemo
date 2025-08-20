"use client";
import React from "react";
import { AppSchema, type AppValues, Role } from "./schema";
import { AutoForm } from "../AutoForm";
import { useZodForm } from "../utils/useZodForm";
import { SensitiveInput } from "../utils/fields";
import { TextField } from "../components/autofield/components/TextField";
import { TextareaField } from "../components/autofield/components/TextareaField";
import { NumberSliderField } from "../components/autofield/components/NumberField";
import { DateField } from "../components/autofield/components/DateField";
import { BooleanSelectField } from "../components/autofield/components/BooleanSelectField";
import { SelectField } from "../components/autofield/components/SelectField";
import { FileUploadField } from "../components/autofield/components/FileUploadField";
import { ArrayStringField } from "../components/autofield/components/ArrayStringField";
import { RadioGroupField } from "../components/autofield/components/RadioGroupField";
import { CheckboxGroupField } from "../components/autofield/components/CheckboxGroupField";

export default function ExampleForm() {
	const today = React.useMemo(() => {
		const t = new Date();
		return new Date(t.getFullYear(), t.getMonth(), t.getDate());
	}, []);
	const leftForm = useZodForm(AppSchema, {
		defaultValues: {
			email: "alice@example.com",
			password: "hunter2",
			bio: "Short bio about Alice...",
			age: 30,
			birthday: undefined as any,
			termsAccepted: false,
			startDate: undefined as any,
			endDate: undefined as any,
			role: "user",
			favoriteFruit: "",
			apiKey: "",
			files: undefined as any,
			tags: ["react", "zod"],
			favoriteColors: ["red"],
		} as Partial<AppValues>,
	});

	const rightForm = useZodForm(AppSchema, {
		defaultValues: leftForm.getValues(),
	});

	const [leftOutput, setLeftOutput] = React.useState<any>(null);
	const [rightOutput, setRightOutput] = React.useState<any>(null);

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">
				AutoField vs Hand-crafted Fields
			</h2>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Left: AutoForm using AutoField */}
				<div className="space-y-3">
					<h3 className="text-lg font-medium">AutoForm (AutoField)</h3>
					<AutoForm
						form={leftForm}
						schema={AppSchema}
						fields={{
							age: {
								widget: "slider",
								min: 0,
								max: 120,
								step: 1,
								label: "Age",
							},
							birthday: { label: "Birthday" },
							startDate: { label: "Start Date (>= today)", minDate: today },
							endDate: {
								label: "End Date (>= start)",
								minDateField: "startDate",
							},
							password: { widget: "password", label: "Password" },
							bio: { widget: "textarea", rows: 4, label: "Bio" },
							termsAccepted: { widget: "select", label: "Accept Terms?" },
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
							role: { widget: "radios", label: "Role" },
							favoriteColors: {
								widget: "select",
								multiple: true,
								label: "Favorite Colors (multi-select)",
							},
						}}
						onSubmit={(vals) => setLeftOutput(vals)}
						submitLabel="Submit"
					/>
					<div className="rounded-md border p-3 text-sm">
						<div className="mb-2 font-medium">Submitted Values (AutoForm)</div>
						<pre className="whitespace-pre-wrap break-words">
							{leftOutput
								? JSON.stringify(leftOutput, null, 2)
								: "(submit to see output)"}
						</pre>
					</div>
				</div>

				{/* Right: Hand-crafted form mirroring fields */}
				<div className="space-y-3">
					<h3 className="text-lg font-medium">Manual Fields (Reference)</h3>
					<form
						onSubmit={rightForm.handleSubmit((vals) => setRightOutput(vals))}
						className="space-y-3"
					>
						{/* Email */}
						<TextField
							name="email"
							label="Email"
							type="email"
							form={rightForm}
						/>

						{/* Password (SensitiveInput) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Password</label>
							<SensitiveInput name="password" register={rightForm.register} />
						</div>

						{/* Bio (textarea) */}
						<TextareaField name="bio" label="Bio" rows={4} form={rightForm} />

						{/* Age (slider) */}
						<NumberSliderField
							name="age"
							label="Age"
							min={0}
							max={120}
							step={1}
							form={rightForm}
						/>

						{/* Birthday */}
						<DateField name="birthday" label="Birthday" form={rightForm} />

						{/* Start/End Dates with constraints */}
						<DateField
							name="startDate"
							label="Start Date (>= today)"
							form={rightForm}
							minDate={today}
						/>
						<DateField
							name="endDate"
							label="End Date (>= start)"
							form={rightForm}
							minDate={(rightForm.watch("startDate") as any) || today}
						/>

						{/* Terms Accepted (select true/false) */}
						<BooleanSelectField
							name="termsAccepted"
							label="Accept Terms?"
							opts={[
								{ value: "", label: "-- choose --" },
								{ value: "true", label: "Yes" },
								{ value: "false", label: "No" },
							]}
							form={rightForm}
						/>

						{/* Role (radios) */}
						<RadioGroupField
							name="role"
							label="Role"
							opts={Role.options.map((v: string) => ({ value: v, label: v }))}
							form={rightForm}
						/>

						{/* Favorite Fruit (string select) */}
						<SelectField
							name="favoriteFruit"
							label="Favorite Fruit"
							opts={[
								{ value: "", label: "-- choose --" },
								{ value: "apple", label: "Apple" },
								{ value: "banana", label: "Banana" },
								{ value: "orange", label: "Orange" },
							]}
							form={rightForm}
						/>

						{/* API Key (SensitiveInput) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">API Key</label>
							<SensitiveInput name="apiKey" register={rightForm.register} />
						</div>

						{/* Files (file-upload) */}
						<FileUploadField
							name="files"
							label="Files"
							accept="image/*,application/pdf"
							form={rightForm}
						/>

						{/* Tags (array string via newline) */}
						<ArrayStringField
							name="tags"
							label="Tags"
							rows={4}
							form={rightForm}
						/>

						{/* Favorite Colors (multi-select dropdown) */}
						<SelectField
							name="favoriteColors"
							label="Favorite Colors"
							multiple
							opts={[
								{ value: "red", label: "red" },
								{ value: "green", label: "green" },
								{ value: "blue", label: "blue" },
							]}
							form={rightForm}
						/>
						{/* Favorite Colors (checkboxes) */}
						<CheckboxGroupField
							name="favoriteColors"
							label="Favorite Colors (Checkboxes)"
							opts={[
								{ value: "red", label: "red" },
								{ value: "green", label: "green" },
								{ value: "blue", label: "blue" },
							]}
							form={rightForm}
						/>

						<button
							type="submit"
							className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
						>
							Submit
						</button>
					</form>

					<div className="rounded-md border p-3 text-sm">
						<div className="mb-2 font-medium">Submitted Values (Manual)</div>
						<pre className="whitespace-pre-wrap break-words">
							{rightOutput
								? JSON.stringify(rightOutput, null, 2)
								: "(submit to see output)"}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
