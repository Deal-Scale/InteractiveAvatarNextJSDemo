"use client";

import { useState } from "react";

import { useBookmarkStore } from "@/lib/stores/bookmarks";

export default function useBookmarkModal() {
	const {
		bookmarkedIds,
		folders: bookmarkFolders,
		meta: bookmarkMeta,
		addBookmark: addBm,
		removeBookmark: removeBm,
		setBookmarkMeta: setBmMeta,
		clearBookmarkMeta: clearBmMeta,
		upsertFolder,
		moveFolder,
		deleteFolder,
	} = useBookmarkStore();

	const [bookmarkModalOpen, setBookmarkModalOpen] = useState<boolean>(false);
	const [bookmarkTargetId, setBookmarkTargetId] = useState<string | null>(null);
	const [draftTitle, setDraftTitle] = useState<string>("");
	const [draftFolderId, setDraftFolderId] = useState<string>("");
	const [draftNewFolder, setDraftNewFolder] = useState<string>("");
	const [draftTags, setDraftTags] = useState<string>("");

	const openBookmarkModal = (id: string) => {
		setBookmarkTargetId(id);
		const existing = bookmarkMeta[id];

		setDraftTitle(existing?.title ?? "");
		setDraftFolderId(existing?.folderId ?? "");
		setDraftNewFolder("");
		setDraftTags((existing?.tags ?? []).join(", "));
		setBookmarkModalOpen(true);
	};

	const close = () => setBookmarkModalOpen(false);

	const saveBookmark = () => {
		if (!bookmarkTargetId) return;
		let folderId = draftFolderId;

		if (!folderId && draftNewFolder.trim()) {
			folderId = upsertFolder(draftNewFolder);
		}
		const tags = draftTags
			.split(/[\n,]/)
			.map((t) => t.trim())
			.filter(Boolean);

		const id = bookmarkTargetId; // narrowed by the early return above
		addBm(id);
		setBmMeta(id, {
			folderId: folderId || undefined,
			tags,
			title: draftTitle.trim() || undefined,
		});
		setBookmarkModalOpen(false);
	};

	const handleRemoveBookmark = () => {
		if (!bookmarkTargetId) return;
		removeBm(bookmarkTargetId);
		clearBmMeta(bookmarkTargetId);
		setBookmarkModalOpen(false);
	};

	const deleteBookmark = (id: string) => {
		removeBm(id);
		clearBmMeta(id);
		if (bookmarkTargetId === id) {
			setBookmarkModalOpen(false);
		}
	};

	return {
		// store data
		bookmarkedIds,
		bookmarkFolders,
		bookmarkMeta,

		// modal state
		bookmarkModalOpen,
		bookmarkTargetId,
		draftTitle,
		draftFolderId,
		draftNewFolder,
		draftTags,

		// setters
		setBookmarkModalOpen,
		setDraftTitle,
		setDraftFolderId,
		setDraftNewFolder,
		setDraftTags,

		// actions
		openBookmarkModal,
		close,
		saveBookmark,
		handleRemoveBookmark,
		deleteBookmark,
		moveFolder,
		deleteFolder,
	} as const;
}
