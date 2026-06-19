"use client";

import { Button } from "@/components/ui/button";

type MermaidPreviewModalProps = {
	isOpen: boolean;
	isRendering: boolean;
	renderedSvg: string;
	title?: string;
	onClose: () => void;
};

export function MermaidPreviewModal({
	isOpen,
	isRendering,
	renderedSvg,
	title,
	onClose,
}: MermaidPreviewModalProps) {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 p-4"
			role="dialog"
			aria-modal="true"
			aria-label="Mermaid diagram preview"
			onClick={onClose}
		>
			<div
				className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-md border border-slate-700 bg-slate-950 text-slate-50 shadow-2xl"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex items-center justify-between border-slate-800 border-b px-4 py-3">
					<div className="font-medium text-sm">
						{title || "Mermaid diagram"}
					</div>
					<Button
						className="h-8 border-slate-700 bg-slate-900 text-slate-50 hover:bg-slate-800"
						size="sm"
						type="button"
						variant="secondary"
						onClick={onClose}
					>
						Close
					</Button>
				</div>
				<div className="min-h-96 overflow-auto p-4">
					{renderedSvg ? (
						<div
							className="flex min-h-80 w-full items-center justify-center [&_svg]:max-h-[70vh] [&_svg]:max-w-full"
							dangerouslySetInnerHTML={{ __html: renderedSvg }}
						/>
					) : (
						<div className="flex min-h-80 items-center justify-center text-muted-foreground text-sm">
							{isRendering
								? "Rendering Mermaid diagram..."
								: "This Mermaid diagram could not be rendered."}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
