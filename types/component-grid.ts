// Shared types for the reusable Component Grid

export type GridMode = "infinite" | "paged";

export type GridQueryParams = {
	page: number;
	pageSize: number;
	search?: string;
	categories?: string[]; // OR semantics by default
	tags?: string[]; // Optional tag filters (AND semantics can be implemented by server)
	extras?: Record<string, unknown>; // Extensibility for downstream consumers
};

export type GridItem = Record<string, unknown> & {
	id?: string | number;
};

export type GridResponse<TItem extends GridItem = GridItem> = {
	items: TItem[];
	total: number; // total matching items across all pages
	page: number;
	pageSize: number;
};

export type GridFetcher<TItem extends GridItem = GridItem> = (
	params: GridQueryParams,
) => Promise<GridResponse<TItem>>;

export type UseGridDataOptions<TItem extends GridItem = GridItem> = {
	fetcher: GridFetcher<TItem>; // required fetcher to retrieve items
	pageSize?: number; // default 24
	mode?: GridMode; // default "infinite"
	debounceMs?: number; // default 250ms
	initialSearch?: string;
	initialCategories?: string[];
	initialTags?: string[];
	initialPage?: number; // default 1
	enabled?: boolean; // default true
	queryKeyBase?: (string | number)[]; // for React Query cache partitioning
};

export type UseGridDataResult<TItem extends GridItem = GridItem> = {
	// State
	items: TItem[];
	total: number;
	page: number;
	pageSize: number;
	hasNextPage: boolean;
	// Current query inputs
	search: string;
	categories: string[];
	tags: string[];

	// Status
	isLoading: boolean;
	isFetching: boolean;
	isFetchingNextPage: boolean;
	isError: boolean;
	error: unknown;

	// Controls
	setPage: (p: number) => void;
	setSearch: (s: string) => void;
	setCategories: (c: string[]) => void;
	setTags: (t: string[]) => void;
	clearFilters: () => void;
	fetchNextPage: () => Promise<unknown> | void;
	refetch: () => Promise<unknown>;

	// Debug/advanced
	queryKey: (string | number)[];
};
