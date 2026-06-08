"use client";

import { XIcon } from "lucide-react";
import * as React from "react";

type VideoTourModalProps = {
	open: boolean;
	onClose: () => void;
};

const VIDEO_TOUR_URL =
	"https://app.supademo.com/embed/cmhjlwt7i0jk4u1hm0scmf39w?embed_v=2&utm_source=embed";

export default function VideoTourModal({ open, onClose }: VideoTourModalProps) {
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		if (!open) return;
		setLoading(true);
	}, [open]);

	React.useEffect(() => {
		if (!open) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose, open]);

	if (!open) return null;

	return (
		<div
			aria-modal="true"
			className="fixed inset-0 z-[2147483010] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
			data-tour-video-modal=""
			role="dialog"
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
		>
			<div className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
				<div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
					<div className="min-w-0">
						<h2 className="text-base font-semibold">Welcome To Deal Scale</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							Get help getting started with your lead generation platform.
						</p>
					</div>
					<button
						aria-label="Close video tour"
						className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
						type="button"
						onClick={onClose}
					>
						<XIcon className="h-4 w-4" />
					</button>
				</div>
				<div className="relative aspect-video w-full bg-background">
					{loading ? (
						<div className="absolute inset-0 z-10 flex items-center justify-center bg-card/70">
							<div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
						</div>
					) : null}
					<iframe
						allow="clipboard-write"
						allowFullScreen
						className="h-full w-full"
						frameBorder="0"
						loading="lazy"
						src={VIDEO_TOUR_URL}
						title="Deal Scale video tour"
						onLoad={() => setLoading(false)}
					/>
				</div>
				<div className="flex justify-end border-t border-border px-4 py-3">
					<button
						className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
						type="button"
						onClick={onClose}
					>
						Got it
					</button>
				</div>
			</div>
		</div>
	);
}
