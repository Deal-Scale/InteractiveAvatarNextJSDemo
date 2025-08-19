"use client";

import type {
	Conversation,
	ConversationGroup,
} from "@/components/Sidebar/types";

import { useEffect, useMemo, useState } from "react";

import {
	loadFromCache,
	saveToCache,
	fetchConversations,
} from "@/components/Sidebar/utils/cache";

export default function useConversations() {
	const [groups, setGroups] = useState<ConversationGroup[] | null>(() =>
		loadFromCache(),
	);
	const [loading, setLoading] = useState<boolean>(!groups);
	const [query, setQuery] = useState("");
	const [selectionMode, setSelectionMode] = useState<boolean>(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [archivedIds, setArchivedIds] = useState<Set<string>>(() => {
		if (typeof window === "undefined") return new Set();
		try {
			const raw = localStorage.getItem("sidebar.archived.v1");

			if (!raw) return new Set();

			return new Set<string>(JSON.parse(raw));
		} catch {
			return new Set();
		}
	});

	// Persist archived ids
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			localStorage.setItem(
				"sidebar.archived.v1",
				JSON.stringify(Array.from(archivedIds)),
			);
		} catch {}
	}, [archivedIds]);

	// Initial lazy load with cache

	useEffect(() => {
		let mounted = true;

		if (!groups) {
			fetchConversations().then((data) => {
				if (!mounted) return;
				setGroups(data);
				saveToCache(data);
				setLoading(false);
			});
		}

		return () => {
			mounted = false;
		};
	}, [groups]);

	// Derived values
	const filteredGroups = useMemo(() => {
		if (!groups) return null;
		const q = query.trim().toLowerCase();

		if (!q) return groups;

		return groups
			.map((g) => ({
				...g,
				conversations: g.conversations.filter(
					(c) =>
						!archivedIds.has(c.id) &&
						(c.title.toLowerCase().includes(q) ||
							c.lastMessage.toLowerCase().includes(q)),
				),
			}))
			.filter((g) => g.conversations.length > 0);
	}, [groups, query, archivedIds]);

	const archivedList = useMemo(() => {
		if (!groups) return [] as Conversation[];
		const all = groups.flatMap((g) => g.conversations);

		return all.filter((c) => archivedIds.has(c.id));
	}, [groups, archivedIds]);

	const visibleConversationIds = useMemo(() => {
		const base = (filteredGroups ?? groups) || [];
		const all = base.flatMap((g) => g.conversations);

		return all.filter((c) => !archivedIds.has(c.id)).map((c) => c.id);
	}, [filteredGroups, groups, archivedIds]);

	const totalCount = useMemo(
		() => groups?.reduce((acc, g) => acc + g.conversations.length, 0) ?? 0,
		[groups],
	);

	// Selection handlers
	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);

			if (next.has(id)) next.delete(id);
			else next.add(id);

			return next;
		});
	};
	const clearSelection = () => setSelectedIds(new Set());
	const selectAllVisible = () => {
		if (!visibleConversationIds.length) return;
		setSelectedIds(new Set(visibleConversationIds));
	};

	// Bulk actions
	const deleteSelected = () => {
		if (!groups || selectedIds.size === 0) return;
		const nextGroups = groups.map((g) => ({
			...g,
			conversations: g.conversations.filter((c) => !selectedIds.has(c.id)),
		}));

		setGroups(nextGroups);
		saveToCache(nextGroups);
		clearSelection();
		setSelectionMode(false);
	};

	const archiveSelected = () => {
		if (selectedIds.size === 0) return;
		setArchivedIds(
			(prev) => new Set([...Array.from(prev), ...Array.from(selectedIds)]),
		);
		clearSelection();
		setSelectionMode(false);
	};

	return {
		// state
		groups,
		setGroups,
		loading,
		setLoading,
		query,
		setQuery,
		selectionMode,
		setSelectionMode,
		selectedIds,
		setSelectedIds,
		archivedIds,
		setArchivedIds,
		// derived
		filteredGroups,
		archivedList,
		visibleConversationIds,
		totalCount,
		// handlers
		toggleSelect,
		clearSelection,
		selectAllVisible,
		deleteSelected,
		archiveSelected,
	} as const;
}
