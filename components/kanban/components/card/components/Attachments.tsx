"use client";

import { Download, Paperclip } from "lucide-react";

export function Attachments({
	attachments,
	title = "Attachments",
}: {
	attachments?: { filename: string; url: string }[];
	title?: string;
}) {
	if (!Array.isArray(attachments) || attachments.length === 0) return null;
	return (
		<div className="mt-3 min-w-0 max-w-full text-sm">
			<div className="mb-1 flex min-w-0 items-center gap-2 font-semibold">
				<Paperclip className="h-4 w-4" /> {title}
			</div>
			<div className="flex min-w-0 max-w-full flex-wrap gap-2">
				{attachments.map((att) => (
					<a
						key={att.url}
						href={att.url}
						download
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex min-w-0 max-w-full items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
					>
						<span className="max-w-[10rem] truncate" title={att.filename}>
							{att.filename}
						</span>
						<Download className="h-3 w-3" />
					</a>
				))}
			</div>
		</div>
	);
}
