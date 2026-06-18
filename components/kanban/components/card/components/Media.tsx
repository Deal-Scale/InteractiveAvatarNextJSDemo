"use client";

import { Youtube } from "lucide-react";

export function Media({
	youtubeUrl,
	outputVideoUrl,
}: {
	youtubeUrl?: string | null;
	outputVideoUrl?: string | null;
}) {
	return (
		<>
			{youtubeUrl && (
				<div className="mt-3 min-w-0 max-w-full text-sm">
					<div className="mb-1 flex min-w-0 items-center gap-2 font-semibold">
						<Youtube className="h-4 w-4 text-primary" /> Video
					</div>
					<a
						href={youtubeUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex min-w-0 max-w-full items-center gap-2 break-words text-primary underline"
					>
						Watch on YouTube
					</a>
				</div>
			)}

			{outputVideoUrl && (
				<div className="mt-3 min-w-0 max-w-full text-sm">
					<div className="mb-1 font-semibold">Output Video</div>
					{/* biome-ignore lint/a11y/useMediaCaption: Generated task videos do not include caption tracks. */}
					<video controls className="mt-1 max-h-64 w-full rounded border">
						<source src={outputVideoUrl} type="video/mp4" />
						Your browser does not support the video tag.
					</video>
				</div>
			)}
		</>
	);
}
