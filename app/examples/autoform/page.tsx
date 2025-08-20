"use client";
import dynamic from "next/dynamic";
import React from "react";

const ExampleForm = dynamic(
	() =>
		import(
			"@/components/external/zod-react-form-auto/src/examples/ExampleForm"
		),
	{ ssr: false },
);

export default function AutoformExamplePage() {
	return (
		<div className="p-6">
			<h1 className="mb-4 text-2xl font-bold">AutoForm Example</h1>
			<ExampleForm />
		</div>
	);
}
