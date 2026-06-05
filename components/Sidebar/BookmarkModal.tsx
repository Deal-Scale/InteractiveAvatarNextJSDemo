"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const NO_FOLDER_VALUE = "__NO_FOLDER__";
type BookmarkFolderOption = { id: string; name: string; parentId?: string };

function buildFolderOptions(folders: BookmarkFolderOption[]) {
	const childrenByParent = new Map<string, BookmarkFolderOption[]>();

	for (const folder of folders) {
		const parentId = folder.parentId ?? "";
		const children = childrenByParent.get(parentId) ?? [];

		children.push(folder);
		childrenByParent.set(parentId, children);
	}
	for (const children of childrenByParent.values()) {
		children.sort((a, b) => a.name.localeCompare(b.name));
	}

	const result: Array<BookmarkFolderOption & { label: string }> = [];
	const walk = (parentId = "", depth = 0) => {
		for (const folder of childrenByParent.get(parentId) ?? []) {
			result.push({
				...folder,
				label: `${"  ".repeat(depth)}${depth > 0 ? "- " : ""}${folder.name}`,
			});
			walk(folder.id, depth + 1);
		}
	};

	walk();

	return result;
}

export default function BookmarkModal(props: {
	open: boolean;
	onClose: () => void;
	bookmarkedIds: Set<string>;
	bookmarkTargetId: string | null;
	bookmarkFolders: BookmarkFolderOption[];
	draftTitle: string;
	setDraftTitle: (v: string) => void;
	draftFolderId: string;
	setDraftFolderId: (v: string) => void;
	draftNewFolder: string;
	setDraftNewFolder: (v: string) => void;
	draftTags: string;
	setDraftTags: (v: string) => void;
	onRemove?: () => void;
	onSave: () => void;
}) {
	const {
		open,
		onClose,
		bookmarkedIds,
		bookmarkTargetId,
		bookmarkFolders,
		draftTitle,
		setDraftTitle,
		draftFolderId,
		setDraftFolderId,
		draftNewFolder,
		setDraftNewFolder,
		draftTags,
		setDraftTags,
		onRemove,
		onSave,
	} = props;
	const folderOptions = buildFolderOptions(bookmarkFolders);

	return (
		<Dialog
			modal={false}
			open={open}
			onOpenChange={(v) => {
				if (!v) onClose();
			}}
		>
			<DialogContent
				className="flex max-h-[90vh] w-[96vw] max-w-[96vw] flex-col bg-card p-4 text-foreground md:w-[560px] md:p-6"
				data-tour="bookmark-modal"
			>
				<DialogHeader>
					<DialogTitle className="font-medium text-sm">
						{bookmarkedIds.has(bookmarkTargetId || "")
							? "Edit bookmark"
							: "Add bookmark"}
					</DialogTitle>
					<DialogDescription className="sr-only">
						Manage bookmark folder and tags
					</DialogDescription>
				</DialogHeader>
				<div className="flex-1 space-y-3 overflow-y-auto">
					<div>
						<span className="mb-1 block text-muted-foreground text-xs">
							Bookmark name
						</span>
						<Input
							placeholder="Current chat"
							type="text"
							value={draftTitle}
							onChange={(e) => setDraftTitle(e.target.value)}
						/>
					</div>
					<div>
						<span className="mb-1 block text-muted-foreground text-xs">
							Folder
						</span>
						<Select
							value={draftFolderId || NO_FOLDER_VALUE}
							onValueChange={(value) =>
								setDraftFolderId(value === NO_FOLDER_VALUE ? "" : value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="No folder" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={NO_FOLDER_VALUE}>No folder</SelectItem>
								{folderOptions.map((f) => (
									<SelectItem key={f.id} value={f.id}>
										{f.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<span className="mb-1 block text-muted-foreground text-xs">
							Or create new folder
						</span>
						<Input
							placeholder="New folder name"
							type="text"
							value={draftNewFolder}
							onChange={(e) => setDraftNewFolder(e.target.value)}
						/>
					</div>
					<div>
						<span className="mb-1 block text-muted-foreground text-xs">
							Tags (comma separated)
						</span>
						<Textarea
							placeholder="e.g. roadmap, Q3, priority"
							rows={2}
							value={draftTags}
							onChange={(e) => setDraftTags(e.target.value)}
						/>
					</div>
				</div>
				<div className="mt-4 flex items-center justify-between gap-2">
					<div className="text-muted-foreground text-xs">
						{draftFolderId
							? `Folder: ${
									folderOptions.find((f) => f.id === draftFolderId)?.label ||
									"(new)"
								}`
							: draftNewFolder
								? `Folder: ${draftNewFolder}`
								: "No folder"}
					</div>
					<div className="flex items-center gap-2">
						{bookmarkedIds.has(bookmarkTargetId || "") && onRemove && (
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={onRemove}
							>
								Remove
							</Button>
						)}
						<Button type="button" size="sm" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="button" size="sm" onClick={onSave}>
							Save
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
