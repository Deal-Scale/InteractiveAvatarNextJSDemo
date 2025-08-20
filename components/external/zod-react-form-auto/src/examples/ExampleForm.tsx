"use client";
import React from "react";
import { AppSchema, type AppValues, Role } from "./schema";
import { AutoForm } from "../AutoForm";
import { useZodForm } from "../utils/useZodForm";
import { SensitiveInput } from "../utils/fields";

export default function ExampleForm() {
	const leftForm = useZodForm(AppSchema, {
		defaultValues: {
			email: "alice@example.com",
			password: "hunter2",
			bio: "Short bio about Alice...",
			age: 30,
			birthday: undefined as any,
			termsAccepted: false,
			role: "user",
			favoriteFruit: "",
			apiKey: "",
			files: undefined as any,
			tags: ["react", "zod"],
			favoriteColors: ["red"],
		} satisfies Partial<AppValues>,
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
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Email</label>
							<input
								type="email"
								className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								{...rightForm.register("email")}
							/>
						</div>

						{/* Password (SensitiveInput) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Password</label>
							<SensitiveInput name="password" register={rightForm.register} />
						</div>

						{/* Bio (textarea) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Bio</label>
							<textarea
								rows={4}
								className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								{...rightForm.register("bio")}
							/>
						</div>

						{/* Age (slider) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Age</label>
							<input
								type="range"
								min={0}
								max={120}
								step={1}
								className="accent-primary"
								{...rightForm.register("age", { valueAsNumber: true })}
							/>
						</div>

						{/* Birthday (date input for demo) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Birthday</label>
							<input
								type="date"
								className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								{...rightForm.register("birthday", { valueAsDate: true })}
							/>
						</div>

						{/* Terms Accepted (select true/false) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">
								Accept Terms?
							</label>
							<select
								className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								value={(() => {
									const v = rightForm.watch("termsAccepted");
									return typeof v === "boolean" ? String(v) : "";
								})()}
								onChange={(e) =>
									rightForm.setValue(
										"termsAccepted",
										e.target.value === "true",
										{ shouldDirty: true, shouldValidate: true },
									)
								}
							>
								<option value="">-- choose --</option>
								<option value="true">Yes</option>
								<option value="false">No</option>
							</select>
						</div>

						{/* Role (enum select) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Role</label>
							<select
								className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								{...rightForm.register("role")}
							>
								{Role.options.map((v: string) => (
									<option key={v} value={v}>
										{v}
									</option>
								))}
							</select>
						</div>

						{/* Favorite Fruit (string select) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">
								Favorite Fruit
							</label>
							<select
								className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								{...rightForm.register("favoriteFruit")}
							>
								<option value="">-- choose --</option>
								<option value="apple">Apple</option>
								<option value="banana">Banana</option>
								<option value="orange">Orange</option>
							</select>
						</div>

						{/* API Key (SensitiveInput) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">API Key</label>
							<SensitiveInput name="apiKey" register={rightForm.register} />
						</div>

						{/* Files (file-upload) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Files</label>
							<input
								type="file"
								multiple
								accept="image/*,application/pdf"
								className="rounded-md border border-border bg-background px-3 py-2 text-foreground file:mr-4 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								onChange={(e) =>
									rightForm.setValue(
										"files",
										e.target.files ? Array.from(e.target.files) : [],
										{ shouldDirty: true, shouldValidate: true },
									)
								}
							/>
						</div>

						{/* Tags (array string via newline) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">Tags</label>
							<textarea
								rows={4}
								className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								value={(rightForm.watch("tags") ?? []).join("\n")}
								onChange={(e) =>
									rightForm.setValue(
										"tags",
										e.target.value
											.split("\n")
											.map((s) => s.trim())
											.filter(Boolean),
										{ shouldDirty: true, shouldValidate: true },
									)
								}
							/>
						</div>

						{/* Favorite Colors (multi-select enum) */}
						<div className="flex flex-col gap-1">
							<label className="text-sm text-muted-foreground">
								Favorite Colors
							</label>
							<select
								multiple
								className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
								value={rightForm.watch("favoriteColors") ?? []}
								onChange={(e) => {
									const opts = Array.from(e.target.selectedOptions).map(
										(o) => o.value,
									);
									rightForm.setValue("favoriteColors", opts, {
										shouldDirty: true,
										shouldValidate: true,
									});
								}}
							>
								<option value="red">red</option>
								<option value="green">green</option>
								<option value="blue">blue</option>
							</select>
						</div>

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
