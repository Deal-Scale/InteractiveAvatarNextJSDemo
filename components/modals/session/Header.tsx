import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function SessionConfigHeader() {
	return (
		<div className="px-6 py-5 border-b border-border">
			<DialogHeader>
				<DialogTitle className="text-lg md:text-xl font-semibold">
					Chat Settings
				</DialogTitle>
				<DialogDescription className="text-sm text-muted-foreground">
					Adjust your user preferences and application settings.
				</DialogDescription>
			</DialogHeader>
		</div>
	);
}
