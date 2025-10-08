"use client";

import * as React from "react";
import { z } from "zod";

import { AutoForm } from "@/components/forms/AutoForm";
import { useZodForm } from "@/components/forms/useZodForm";
import type { FieldsConfig } from "@/components/forms/utils";
import { ResultPreview } from "./ResultPreview";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const onboardingSchema = z.object({
	name: z.string().min(2, "Name must contain at least 2 characters"),
	email: z.string().email("Enter a valid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.enum(["design", "engineering", "product", "marketing"], {
		required_error: "Select a primary role",
	}),
	bio: z
		.string()
		.min(20, "Tell us a bit more about your work")
		.max(300, "Bio should stay under 300 characters"),
	skills: z
		.array(z.string().min(1))
		.min(1, "Add at least one core skill")
		.describe("Comma separated skills"),
	age: z.number().int().min(18, "Must be at least 18").max(80),
	birthday: z.string().regex(/\d{4}-\d{2}-\d{2}/, "Use the YYYY-MM-DD format"),
	marketingOptIn: z.boolean().optional(),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const onboardingDefaults: OnboardingValues = {
	name: "Alex Johnson",
	email: "alex@example.com",
	password: "hunter422",
	role: "product",
	bio: "Product leader exploring AutoForm-powered onboarding flows for faster prototyping.",
	skills: ["React", "TypeScript", "UX"],
	age: 32,
	birthday: "1993-06-15",
	marketingOptIn: true,
};

const onboardingFields: FieldsConfig<OnboardingValues> = {
	name: { label: "Full name", placeholder: "Jane Doe" },
	email: { label: "Email", placeholder: "name@example.com" },
	password: { label: "Password", widget: "password" },
	role: {
		label: "Primary role",
		widget: "select",
		options: [
			{ value: "design", label: "Design" },
			{ value: "engineering", label: "Engineering" },
			{ value: "product", label: "Product" },
			{ value: "marketing", label: "Marketing" },
		],
	},
	bio: {
		label: "Professional bio",
		widget: "textarea",
		rows: 5,
		placeholder: "Share a short summary of your background",
	},
	skills: {
		label: "Key skills",
		placeholder: "Add a skill and press Enter",
	},
	age: {
		label: "Age",
		widget: "slider",
		min: 18,
		max: 80,
		step: 1,
	},
	birthday: {
		label: "Birthday",
		placeholder: "YYYY-MM-DD",
	},
	marketingOptIn: {
		label: "Send me product updates",
	},
};

export function OnboardingExample() {
	const [submitted, setSubmitted] = React.useState<OnboardingValues | null>(
		null,
	);
	const form = useZodForm(onboardingSchema, {
		defaultValues: onboardingDefaults,
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Foundational AutoForm</CardTitle>
				<CardDescription>
					Generated directly from the onboarding schema with zero manual layout
					code.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AutoForm
					fields={onboardingFields}
					form={form}
					onSubmit={async (values) => {
						setSubmitted(values);
					}}
					schema={onboardingSchema}
					submitLabel="Save profile"
				/>
				<ResultPreview title="Submission" values={submitted} />
			</CardContent>
		</Card>
	);
}
