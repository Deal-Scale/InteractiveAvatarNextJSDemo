import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	UseGridDataOptions,
	UseGridDataResult,
	GridItem,
	GridResponse,
	GridQueryParams,
} from "@/types/component-grid";
import {
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

function useDebouncedValue<T>(value: T, delay = 250) {
	const [debounced, setDebounced] = useState(value);
	const timeoutRef = useRef<number | null>(null);
	useEffect(() => {
		// Only run on client
		// Clear any pending timeout
		if (timeoutRef.current) {
			window.clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = window.setTimeout(() => {
			setDebounced(value);
		}, delay);
		return () => {
			if (timeoutRef.current) {
				window.clearTimeout(timeoutRef.current);
			}
		};
	}, [value, delay]);
	return debounced;
}

export function useGridData<TItem extends GridItem = GridItem>(
	options: UseGridDataOptions<TItem>,
): UseGridDataResult<TItem> {
	const {
		fetcher,
		pageSize = 24,
		mode = "infinite",
		debounceMs = 250,
		initialSearch = "",
		initialCategories = [],
		initialTags = [],
		initialPage = 1,
		enabled = true,
		queryKeyBase = [],
	} = options;

	const qc = useQueryClient();

	// Local UI state
	const [page, setPage] = useState<number>(initialPage);
	const [search, setSearch] = useState<string>(initialSearch);
	const [categories, setCategories] = useState<string[]>(initialCategories);
	const [tags, setTags] = useState<string[]>(initialTags);

	// Debounced search to reduce network load
	const debouncedSearch = useDebouncedValue(search, debounceMs);

	// Query key partitions cache by feature + static base + parameters except page for infinite
	const baseKey = useMemo<(string | number)[]>(
		() => [
			"grid",
			...queryKeyBase,
			pageSize,
			mode,
			debouncedSearch || "",
			categories && categories.length ? categories.join(",") : "",
			tags && tags.length ? tags.join(",") : "",
		],
		[queryKeyBase, pageSize, mode, debouncedSearch, categories, tags],
	);

	const queryKey = useMemo<(string | number)[]>(
		() => (mode === "paged" ? [...baseKey, page] : baseKey),
		[baseKey, mode, page],
	);

	const makeParams = useCallback(
		(p: number): GridQueryParams => ({
			page: p,
			pageSize,
			search: debouncedSearch || undefined,
			categories: categories.length ? categories : undefined,
			tags: tags.length ? tags : undefined,
		}),
		[pageSize, debouncedSearch, categories, tags],
	);

	// Fetcher wrappers
	const fetchPage = useCallback(
		async (p: number): Promise<GridResponse<TItem>> => fetcher(makeParams(p)),
		[fetcher, makeParams],
	);

	// Paged mode: useQuery with keepPreviousData
	const pagedQuery = useQuery({
		queryKey,
		queryFn: () => fetchPage(page),
		enabled: enabled && mode === "paged",
		placeholderData: (previous) => previous, // keepPreviousData behavior
		refetchOnWindowFocus: true,
	});

	// When search/categories/tags change, reset paged mode to page 1
	useEffect(() => {
		if (mode !== "paged") return;
		setPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, debouncedSearch, categories, tags]);

	// Prefetch first page for new search/category/tag combinations
	useEffect(() => {
		// Warm the cache so switching feels instant
		qc.prefetchQuery({
			queryKey: [...baseKey, 1],
			queryFn: () => fetchPage(1),
		});
	}, [qc, baseKey, fetchPage]);

	// Infinite mode: useInfiniteQuery
	const infiniteQuery = useInfiniteQuery({
		queryKey: baseKey,
		queryFn: ({ pageParam = 1 }) => fetchPage(pageParam),
		enabled: enabled && mode === "infinite",
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const totalPages = Math.ceil((lastPage?.total ?? 0) / pageSize) || 0;
			const next = (lastPage?.page ?? 1) + 1;
			return next <= totalPages ? next : undefined;
		},
		refetchOnWindowFocus: true,
		// Keep prior data visible while new params (search/filters) are being fetched
		placeholderData: (previous) => previous,
		staleTime: 30_000,
	});

	// Derived values
	const items = useMemo<TItem[]>(() => {
		if (mode === "paged") {
			return (pagedQuery.data?.items as TItem[]) ?? [];
		}
		const pages = infiniteQuery.data?.pages ?? [];
		return pages.flatMap((p) => (p?.items as TItem[]) ?? []);
	}, [mode, pagedQuery.data, infiniteQuery.data]);

	const total = useMemo(() => {
		if (mode === "paged") {
			return pagedQuery.data?.total ?? 0;
		}
		// In infinite mode, prefer the last page's total
		const pages = infiniteQuery.data?.pages ?? [];
		return pages[pages.length - 1]?.total ?? 0;
	}, [mode, pagedQuery.data, infiniteQuery.data]);

	const currentPage =
		mode === "paged"
			? page
			: (infiniteQuery.data?.pages?.slice(-1)[0]?.page ?? 1);

	const hasNextPage = useMemo(() => {
		const totalPages = Math.ceil(total / pageSize) || 0;
		return currentPage < totalPages;
	}, [total, pageSize, currentPage]);

	// Controls
	const clearFilters = useCallback(() => {
		setSearch("");
		setCategories([]);
		setTags([]);
		setPage(1);
	}, []);

	const fetchNextPage = useCallback(() => {
		if (mode === "infinite") return infiniteQuery.fetchNextPage();
	}, [mode, infiniteQuery]);

	const refetch = useCallback(() => {
		if (mode === "paged") return pagedQuery.refetch();
		return infiniteQuery.refetch();
	}, [mode, pagedQuery, infiniteQuery]);

	// Pre-cache when moving pages in paged mode for smoother UX
	const prefetchPage = useCallback(
		async (p: number) => {
			if (mode !== "paged") return;
			await qc.prefetchQuery({
				queryKey: [...baseKey, p],
				queryFn: () => fetchPage(p),
			});
		},
		[mode, qc, baseKey, fetchPage],
	);

	return {
		// State
		items,
		total,
		page: currentPage,
		pageSize,
		hasNextPage,
		// Current query inputs
		search,
		categories,
		tags,

		// Status
		isLoading:
			mode === "paged" ? pagedQuery.isLoading : infiniteQuery.isLoading,
		isFetching:
			mode === "paged" ? pagedQuery.isFetching : infiniteQuery.isFetching,
		isFetchingNextPage:
			mode === "infinite" ? !!infiniteQuery.isFetchingNextPage : false,
		isError: mode === "paged" ? !!pagedQuery.isError : !!infiniteQuery.isError,
		error: mode === "paged" ? pagedQuery.error : infiniteQuery.error,

		// Controls
		setPage: (p: number) => {
			setPage(p);
			prefetchPage(p + 1).catch(() => void 0);
		},
		setSearch,
		setCategories,
		setTags,
		clearFilters,
		fetchNextPage,
		refetch,

		// Debug
		queryKey,
	} as UseGridDataResult<TItem>;
}
