"use client";

import * as React from "react";
import { z } from "zod";

import {
	AutoForm as TypeformAutoForm,
	useZodForm as useTypeformZodForm,
} from "@/packages/autoform/src";
import type { FieldsConfig } from "@/packages/autoform/src";
import { ResultPreview } from "./ResultPreview";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const engagementSchema = z.object({
	contact: z
		.object({
			firstName: z.string().min(1, "Required"),
			lastName: z.string().min(1, "Required"),
			email: z.string().email("Enter a valid email"),
			phone: z.string().min(7, "Include a phone number"),
			address: z.object({
				line1: z.string().min(1, "Required"),
				line2: z.string().optional(),
				city: z.string().min(1, "Required"),
				state: z.string().optional(),
				postalCode: z.string().min(2, "Required"),
				country: z.string().min(2, "Required"),
			}),
		})
		.describe("typeform:contact-info"),
	website: z.string().url("Enter a valid URL").describe("typeform:website"),
	productFocus: z.enum([
		"lead-generation",
		"support",
		"research",
		"operations",
	]),
	evaluationThemes: z
		.array(z.string())
		.min(1, "Select at least one theme")
		.describe("Multiple choice evaluation areas"),
	satisfaction: z
		.number()
		.min(0)
		.max(10)
		.describe("nps: Likelihood to recommend AutoForm"),
	fitRating: z.number().min(1).max(5).describe("typeform:rating"),
	launchDate: z
		.string()
		.regex(/\d{4}-\d{2}-\d{2}/, "Use YYYY-MM-DD")
		.describe("typeform:date"),
	consent: z.boolean().describe("legal"),
	summary: z
		.string()
		.min(30, "Share a short summary")
		.describe("Long text overview"),
});

type EngagementValues = z.infer<typeof engagementSchema>;

const engagementDefaults: EngagementValues = {
	contact: {
		firstName: "Jamie",
		lastName: "Rivera",
		email: "jamie@example.com",
		phone: "+1 415 555 0198",
		address: {
			line1: "500 Howard St",
			line2: "Suite 300",
			city: "San Francisco",
			state: "CA",
			postalCode: "94105",
			country: "US",
		},
	},
	website: "https://example-product.io",
	productFocus: "lead-generation",
	evaluationThemes: ["dynamic-content", "workflow-automation"],
	satisfaction: 8,
	fitRating: 4,
	launchDate: "2025-03-15",
	consent: true,
	summary:
		"We are evaluating AutoForm to accelerate personalized lead capture for upcoming campaigns.",
};

const engagementFields: FieldsConfig<EngagementValues> = {
	contact: {
		label: "Contact info",
		questionType: "contactInfo",
		questionSettings: {
			contactFields: ["firstName", "lastName", "email", "phone", "address"],
			fieldLabels: {
				firstName: "First name",
				lastName: "Last name",
				phone: "Phone number",
				address: "Mailing address",
			},
		},
	},
	website: {
		label: "Company website",
		questionType: "website",
		placeholder: "https://",
	},
	productFocus: {
		label: "Primary use case",
		widget: "select",
		questionType: "dropdown",
		options: [
			{ value: "lead-generation", label: "Lead generation" },
			{ value: "support", label: "Support automation" },
			{ value: "research", label: "Customer research" },
			{ value: "operations", label: "Operations" },
		],
	},
	evaluationThemes: {
		label: "Focus areas",
		multiple: true,
		questionType: "multipleChoice",
		options: [
			{ value: "dynamic-content", label: "Dynamic content" },
			{ value: "workflow-automation", label: "Workflow automation" },
			{ value: "analytics", label: "Analytics & reporting" },
			{ value: "integrations", label: "Integrations" },
		],
	},
	satisfaction: {
		label: "NPS score",
		questionType: "nps",
		questionSettings: {
			npsLabels: ["Not at all", "Neutral", "Extremely likely"],
		},
	},
	fitRating: {
		label: "Feature fit",
		questionType: "rating",
		questionSettings: {
			ratingMax: 5,
			ratingIcon: "star",
		},
	},
	launchDate: {
		label: "Target launch date",
		questionType: "date",
		questionSettings: {
			captionLayout: "dropdown",
			fromYear: 2024,
			toYear: 2027,
		},
	},
	consent: {
		label: "Marketing consent",
		questionType: "legal",
		questionSettings: {
			legalText: "I agree to receive onboarding resources and product updates.",
		},
	},
	summary: {
		label: "Project summary",
		widget: "textarea",
		rows: 5,
		questionType: "longText",
		placeholder: "Share goals, success metrics, or constraints",
	},
};

export function TypeformShowcase() {
	const [submitted, setSubmitted] = React.useState<EngagementValues | null>(
		null,
	);
	const form = useTypeformZodForm(engagementSchema, {
		defaultValues: engagementDefaults,
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Typeform widgets showcase</CardTitle>
				<CardDescription>
					Highlights the new AutoField renderers for contact info, dropdown,
					rating, and legal consent blocks.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<TypeformAutoForm
					fields={engagementFields}
					form={form}
					onSubmit={async (values) => setSubmitted(values)}
					schema={engagementSchema}
					submitLabel="Save engagement"
				/>
				<div className="h-px w-full bg-border" />
				<ResultPreview title="Submission" values={submitted} />
			</CardContent>
		</Card>
	);
}
