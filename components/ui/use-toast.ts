import type React from "react";

import { useToast as useAppToast } from "@/components/ui/toaster";

type ToastInput = {
	title?: React.ReactNode;
	description?: React.ReactNode;
	variant?: "default" | "destructive";
};

export function useToast() {
	const { publish } = useAppToast();

	return {
		toast: ({ title, description, variant = "default" }: ToastInput) =>
			publish({
				title,
				description,
				variant: variant === "destructive" ? "error" : "default",
			}),
	};
}
