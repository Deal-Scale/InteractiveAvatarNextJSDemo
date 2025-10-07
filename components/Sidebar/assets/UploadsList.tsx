"use client";

import React from "react";

export type UploadItem = {
	id: string;
	name: string;
	status: "pending" | "uploading" | "error" | "done";
	progress?: number;
	error?: string;
};

export default function UploadsList(props: { uploads: UploadItem[] }) {
	const { uploads } = props;
	if (!uploads?.length) return null;
	return (
		<div className="mb-2 space-y-1 px-1">
			{uploads.map((u) => (
				<div
					key={u.id}
					className="flex items-center gap-2 text-xs text-muted-foreground"
				>
					<div className="min-w-0 flex-1 truncate">{u.name}</div>
					<div className="w-24">
						<div className="h-1.5 w-full overflow-hidden rounded bg-muted">
							<div
								className={`h-full ${u.status === "error" ? "bg-destructive" : "bg-primary"}`}
								style={{ width: `${Math.round((u.progress ?? 0) * 100)}%` }}
							/>
						</div>
					</div>
					<div className="w-14 text-right">
						{u.status === "uploading" && "Uploading"}
						{u.status === "pending" && "Queued"}
						{u.status === "error" && "Error"}
					</div>
				</div>
			))}
		</div>
	);
}
