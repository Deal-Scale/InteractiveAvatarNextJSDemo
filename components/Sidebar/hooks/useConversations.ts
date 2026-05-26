"use client";

import { useEffect, useMemo, useState } from "react";

import type {
	Conversation,
	ConversationGroup,
} from "@/components/Sidebar/types";
import {
	fetchConversations,
	loadFromCache,
	saveToCache,
} from "@/components/Sidebar/utils/cache";
import { useSessionStore } from "@/lib/stores/session";

const DAY_MS = 24 * 60 * 60 * 1000;
const CHAT_GROUPS = [
	"Today",
	"Yesterday",
	"Last 7 days",
	"Last month",
	"More than a month ago",
] as const;

function getChatPeriod(timestamp: number, now = Date.now()) {
	const age = now - timestamp;

	if (age < DAY_MS) return "Today";
	if (age < 2 * DAY_MS) return "Yesterday";
	if (age < 7 * DAY_MS) return "Last 7 days";
	if (age < 30 * DAY_MS) return "Last month";
	return "More than a month ago";
}

function normalizeConversationGroups(
	groups: ConversationGroup[],
): ConversationGroup[] {
	const now = Date.now();
	const byPeriod = new Map<string, Conversation[]>(
		CHAT_GROUPS.map((period) => [period, []]),
	);

	for (const conversation of groups.flatMap((g) => g.conversations)) {
		const period = getChatPeriod(conversation.timestamp, now);

		byPeriod.get(period)?.push(conversation);
	}

	return CHAT_GROUPS.map((period) => ({
		period,
		conversations: (byPeriod.get(period) ?? []).sort(
			(a, b) => b.timestamp - a.timestamp,
		),
	})).filter((group) => group.conversations.length > 0);
}

export default function useConversations() {
	const [groups, setGroups] = useState<ConversationGroup[] | null>(() => {
		const cached = loadFromCache();

		return cached ? normalizeConversationGroups(cached) : null;
	});
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
	const chatFolders = useSessionStore((state) => state.chatFolders);
	const chatFolderAssignments = useSessionStore(
		(state) => state.chatFolderAssignments,
	);

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
				const normalized = normalizeConversationGroups(data);

				setGroups(normalized);
				saveToCache(normalized);
				setLoading(false);
			});
		}

		return () => {
			mounted = false;
		};
	}, [groups]);

	// Derived values
	const organizedGroups = useMemo(() => {
		if (!groups) return null;
		const folderGroups = chatFolders
			.map((folder) => ({
				period: folder.name,
				conversations: groups
					.flatMap((group) => group.conversations)
					.filter(
						(conversation) =>
							chatFolderAssignments[conversation.id] === folder.id,
					),
			}))
			.filter((group) => group.conversations.length > 0);
		const assignedIds = new Set(
			Object.entries(chatFolderAssignments)
				.filter(([, folderId]) => Boolean(folderId))
				.map(([conversationId]) => conversationId),
		);
		const unassignedGroups = groups
			.map((group) => ({
				...group,
				conversations: group.conversations.filter(
					(conversation) => !assignedIds.has(conversation.id),
				),
			}))
			.filter((group) => group.conversations.length > 0);

		return [...folderGroups, ...unassignedGroups];
	}, [chatFolderAssignments, chatFolders, groups]);

	const filteredGroups = useMemo(() => {
		if (!organizedGroups) return null;
		const q = query.trim().toLowerCase();

		if (!q) return organizedGroups;

		return organizedGroups
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
	}, [organizedGroups, query, archivedIds]);

	const archivedList = useMemo(() => {
		if (!groups) return [] as Conversation[];
		const all = groups.flatMap((g) => g.conversations);

		return all.filter((c) => archivedIds.has(c.id));
	}, [groups, archivedIds]);

	const visibleConversationIds = useMemo(() => {
		const base = (filteredGroups ?? organizedGroups ?? groups) || [];
		const all = base.flatMap((g) => g.conversations);

		return all.filter((c) => !archivedIds.has(c.id)).map((c) => c.id);
	}, [filteredGroups, organizedGroups, groups, archivedIds]);

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
