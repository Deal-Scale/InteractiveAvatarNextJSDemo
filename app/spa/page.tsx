"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Link,
	Outlet,
	RouterProvider,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { createHashHistory } from "@tanstack/history";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// --- Data hooks using React Query ---
function useStats() {
	return useQuery({
		queryKey: ["stats", "summary"],
		queryFn: async () => {
			const res = await fetch("/api/mock/stats/summary");
			if (!res.ok) throw new Error("Failed to load stats");
			return res.json() as Promise<{
				usersOnline: number;
				sessionsToday: number;
				cpuLoad: number;
			}>;
		},
	});
}

function useBookmarks() {
	return useQuery({
		queryKey: ["bookmarks", "list"],
		queryFn: async () => {
			const res = await fetch("/api/mock/bookmarks");
			if (!res.ok) throw new Error("Failed to load bookmarks");
			return res.json() as Promise<
				Array<{ id: string; title: string; tags: string[] }>
			>;
		},
	});
}

// --- Routes ---
const Root = createRootRoute({
	component: function RootComponent() {
		const qc = useQueryClient();

		return (
			<div className="p-4 max-w-3xl mx-auto">
				<header className="mb-6 flex items-center justify-between">
					<h1 className="text-xl font-semibold">SPA (TanStack Router)</h1>
					<nav className="flex gap-3 text-sm">
						<Link to="/" className="underline">
							Home
						</Link>
						<Link to="/dashboard" className="underline">
							Dashboard
						</Link>
						<Link to="/bookmarks" className="underline">
							Bookmarks
						</Link>
					</nav>
				</header>

				<div className="mb-4 text-xs text-muted-foreground">
					Hash routing ensures this SPA lives under Next.js route "/spa" without
					conflicts.
				</div>

				<div className="mb-4 flex gap-2 text-xs">
					<button
						type="button"
						className="rounded border px-2 py-1"
						onMouseEnter={() => {
							// Demonstrate prefetch on hover
							qc.prefetchQuery({
								queryKey: ["stats", "summary"],
								queryFn: () =>
									fetch("/api/mock/stats/summary").then((r) => r.json()),
							});
						}}
					>
						Prefetch stats
					</button>
					<button
						type="button"
						className="rounded border px-2 py-1"
						onClick={() => {
							qc.invalidateQueries({ queryKey: ["stats", "summary"] });
						}}
					>
						Invalidate stats
					</button>
				</div>

				<Outlet />

				<TanStackRouterDevtools position="bottom-right" />
			</div>
		);
	},
});

const Index = createRoute({
	getParentRoute: () => Root,
	path: "/",
	component: function IndexPage() {
		return (
			<div>
				<p className="mb-2">
					Welcome to the hash-based SPA. Navigate to Dashboard or Bookmarks.
				</p>
			</div>
		);
	},
});

const Dashboard = createRoute({
	getParentRoute: () => Root,
	path: "/dashboard",
	component: function DashboardPage() {
		const { data, isPending, error } = useStats();
		return (
			<div>
				<h2 className="mb-2 text-lg font-medium">Dashboard</h2>
				{isPending && <p>Loading…</p>}
				{error && (
					<p className="text-red-500">{String((error as Error).message)}</p>
				)}
				{data && (
					<div className="text-sm">
						<div>Users online: {data.usersOnline}</div>
						<div>Sessions today: {data.sessionsToday}</div>
						<div>CPU load: {(data.cpuLoad * 100).toFixed(1)}%</div>
					</div>
				)}
			</div>
		);
	},
});

const Bookmarks = createRoute({
	getParentRoute: () => Root,
	path: "/bookmarks",
	component: function BookmarksPage() {
		const { data, isPending, error } = useBookmarks();
		return (
			<div>
				<h2 className="mb-2 text-lg font-medium">Bookmarks</h2>
				{isPending && <p>Loading…</p>}
				{error && (
					<p className="text-red-500">{String((error as Error).message)}</p>
				)}
				{data && (
					<ul className="list-disc pl-5 text-sm">
						{data.map((b) => (
							<li key={b.id}>
								{b.title}{" "}
								{b.tags?.length ? (
									<span className="text-muted-foreground">
										({b.tags.join(", ")})
									</span>
								) : null}
							</li>
						))}
					</ul>
				)}
			</div>
		);
	},
});

const routeTree = Root.addChildren([Index, Dashboard, Bookmarks]);

const router = createRouter({
	routeTree,
	history: createHashHistory(),
});

function SpaApp() {
	return <RouterProvider router={router} />;
}

export default function Page() {
	// This Next.js page hosts the SPA at /spa; subnavigation is hash-based
	return <SpaApp />;
}
