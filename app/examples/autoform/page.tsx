"use client";
import React from "react";
import ExampleForm from "@/components/external/zod-react-form-auto/src/examples/ExampleForm";

export default function AutoformExamplePage() {
	return (
		<div className="p-6">
			<h1 className="mb-4 text-2xl font-bold">AutoForm Example</h1>
			<ExampleForm />
		</div>
	);
}
