"use client";

import * as React from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { AutoForm } from "@/components/forms/AutoForm";
import { useZodForm } from "@/components/forms/useZodForm";
import type { FieldsConfig } from "@/components/forms/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

import { ResultPreview } from "./ResultPreview";

const profileSchema = z.object({
	email: z.string().email("Please provide a valid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	bio: z
		.string()
		.min(10, "Tell us a little more about yourself")
		.max(200, "Bio should be 200 characters or less"),
	age: z.number().int().min(18).max(80),
	birthday: z.string().regex(/\d{4}-\d{2}-\d{2}/, "Use the YYYY-MM-DD format"),
});

type ProfileSchema = typeof profileSchema;
type ProfileValues = z.infer<ProfileSchema>;

const profileDefaults: ProfileValues = {
	email: "name@example.com",
	password: "hunter422",
	bio: "I love exploring new UI patterns with AutoForm.",
	age: 30,
	birthday: "1995-01-01",
};
const autoFields: FieldsConfig<ProfileValues> = {
	email: { label: "Email", placeholder: "name@example.com" },
	password: { label: "Password", widget: "password" },
	bio: {
		label: "Bio",
		widget: "textarea",
		rows: 4,
		placeholder: "Tell us about yourself",
	},
	age: { label: "Age", widget: "slider", min: 18, max: 80, step: 1 },
	birthday: { label: "Birthday", placeholder: "YYYY-MM-DD" },
};

function ManualProfileForm({
	onSubmit,
	defaultValues,
}: {
	onSubmit: (values: ProfileValues) => void;
	defaultValues: ProfileValues;
}) {
	const form = useZodForm(profileSchema, {
		defaultValues,
	});

	return (
		<form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
			<div className="flex flex-col gap-1">
				<label className="text-sm text-muted-foreground" htmlFor="manual-email">
					Email
				</label>
				<Input
					id="manual-email"
					placeholder="name@example.com"
					type="email"
					{...form.register("email")}
				/>
				{form.formState.errors.email && (
					<p className="text-xs text-red-500">
						{form.formState.errors.email.message}
					</p>
				)}
			</div>
			<div className="flex flex-col gap-1">
				<label
					className="text-sm text-muted-foreground"
					htmlFor="manual-password"
				>
					Password
				</label>
				<Input
					id="manual-password"
					placeholder="Enter your password"
					type="password"
					{...form.register("password")}
				/>
				{form.formState.errors.password && (
					<p className="text-xs text-red-500">
						{form.formState.errors.password.message}
					</p>
				)}
			</div>
			<div className="flex flex-col gap-1">
				<label className="text-sm text-muted-foreground" htmlFor="manual-bio">
					Bio
				</label>
				<Textarea
					id="manual-bio"
					placeholder="Tell us about yourself"
					rows={4}
					{...form.register("bio")}
				/>
				{form.formState.errors.bio && (
					<p className="text-xs text-red-500">
						{form.formState.errors.bio.message}
					</p>
				)}
			</div>
			<Controller
				control={form.control}
				name="age"
				render={({ field }) => (
					<div className="flex flex-col gap-1">
						<label className="text-sm text-muted-foreground">
							Age
							<span className="ml-1 text-xs text-muted-foreground">
								(
								{typeof field.value === "number"
									? field.value
									: defaultValues.age}
								)
							</span>
						</label>
						<Slider
							max={80}
							min={18}
							step={1}
							value={[
								typeof field.value === "number"
									? field.value
									: defaultValues.age,
							]}
							onValueChange={(val) => field.onChange(val[0])}
						/>
						{form.formState.errors.age && (
							<p className="text-xs text-red-500">
								{form.formState.errors.age.message}
							</p>
						)}
					</div>
				)}
			/>
			<div className="flex flex-col gap-1">
				<label
					className="text-sm text-muted-foreground"
					htmlFor="manual-birthday"
				>
					Birthday
				</label>
				<Input
					id="manual-birthday"
					type="date"
					{...form.register("birthday")}
				/>
				{form.formState.errors.birthday && (
					<p className="text-xs text-red-500">
						{form.formState.errors.birthday.message}
					</p>
				)}
			</div>
			<Button
				className="w-full"
				disabled={!form.formState.isValid}
				type="submit"
			>
				Save profile
			</Button>
		</form>
	);
}

export function ProfileComparison() {
	const [autoResult, setAutoResult] = React.useState<ProfileValues | null>(
		null,
	);
	const [manualResult, setManualResult] = React.useState<ProfileValues | null>(
		null,
	);

	const autoForm = useZodForm(profileSchema, {
		defaultValues: profileDefaults,
	});

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>AutoForm (AutoField)</CardTitle>
					<CardDescription>
						Schema-driven rendering with zero manual layout code.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AutoForm
						fields={autoFields}
						form={autoForm}
						onSubmit={(values) => setAutoResult(values)}
						schema={profileSchema}
						submitLabel="Save profile"
					/>
					<ResultPreview title="AutoForm submission" values={autoResult} />
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Manual Fields (Reference)</CardTitle>
					<CardDescription>
						Hand-authored inputs wired to the same schema and resolver.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ManualProfileForm
						defaultValues={profileDefaults}
						onSubmit={(values) => setManualResult(values)}
					/>
					<ResultPreview title="Manual submission" values={manualResult} />
				</CardContent>
			</Card>
		</div>
	);
}
