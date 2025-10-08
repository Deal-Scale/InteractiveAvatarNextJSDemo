"use client";

import { OnboardingExample } from "@/components/examples/autoform/OnboardingExample";
import { ProfileComparison } from "@/components/examples/autoform/ProfileComparison";
import { TypeformShowcase } from "@/components/examples/autoform/TypeformShowcase";

export default function AutoformExamplePage() {
	return (
		<div className="container mx-auto space-y-10 p-6">
			<header className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">
					AutoForm Example Gallery
				</h1>
				<p className="max-w-3xl text-muted-foreground">
					Explore how AutoForm renders complex Zod schemas out-of-the-box, how
					the new Typeform widgets extend those capabilities, and how the
					generated experience compares to a hand-crafted React Hook Form
					implementation.
				</p>
			</header>

			<section className="space-y-4">
				<div className="space-y-1">
					<h2 className="text-2xl font-semibold tracking-tight">
						Foundational schema rendering
					</h2>
					<p className="max-w-2xl text-muted-foreground">
						The original onboarding demo highlights the baseline AutoForm
						experience with the core fields you rely on most—email, password,
						bio, sliders, and calendar inputs—restored in full.
					</p>
				</div>
				<OnboardingExample />
			</section>

			<section className="space-y-4">
				<div className="space-y-1">
					<h2 className="text-2xl font-semibold tracking-tight">
						Typeform-inspired widgets
					</h2>
					<p className="max-w-2xl text-muted-foreground">
						Powered by the new AutoField renderer registry, this showcase
						demonstrates contact info blocks, legal consent, rating scales, and
						other Typeform patterns inferred directly from schema metadata and
						field configuration.
					</p>
				</div>
				<TypeformShowcase />
			</section>

			<section className="space-y-4">
				<div className="space-y-1">
					<h2 className="text-2xl font-semibold tracking-tight">
						AutoForm vs. manual wiring
					</h2>
					<p className="max-w-2xl text-muted-foreground">
						Compare the declarative AutoForm output with a manually wired React
						Hook Form build using the same schema, resolver, and validation
						rules.
					</p>
				</div>
				<ProfileComparison />
			</section>
		</div>
	);
}
