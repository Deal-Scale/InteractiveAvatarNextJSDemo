"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Download as DownloadIcon } from "lucide-react";

export type PreviewAsset = {
	id: string;
	name: string;
	thumbnailUrl?: string;
	url?: string;
};

export default function PreviewDialog(props: {
	asset: PreviewAsset | null | undefined;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { asset, open, onOpenChange } = props;
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				{asset && (
					<>
						<DialogHeader>
							<DialogTitle>{asset.name}</DialogTitle>
						</DialogHeader>
						<div className="max-h-[70vh] w-full overflow-auto">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								alt={asset.name}
								src={asset.url || asset.thumbnailUrl}
								className="mx-auto h-auto max-h-[70vh] w-auto max-w-full"
							/>
						</div>
						{asset.url && (
							<div className="flex justify-end">
								<Button asChild title="Download" variant="outline">
									<a aria-label="Download file" download href={asset.url}>
										<DownloadIcon className="size-4" />
										<span className="sr-only">Download</span>
									</a>
								</Button>
							</div>
						)}
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
