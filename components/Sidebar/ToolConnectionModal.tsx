"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
	KB_CONNECTORS,
	type KBConnector,
} from "../KnowledgeBase/connectors";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 6;
type ToolCategoryFilter = "all" | "oauth" | "apiKey";

type ConnectedTool = {
	id: string;
	name: string;
	connectedAt: number;
};

export default function ToolConnectionModal(props: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialConnectorKey?: string;
	onTestConnection?: (
		connectorKey: string,
		cfg: Record<string, string>,
	) => Promise<{ ok: boolean; message?: string }>;
	onConnect?: (
		connectorKey: string,
		cfg: Record<string, string>,
	) => Promise<{ id: string; name: string }>;
	onStartOAuth?: (
		connectorKey: string,
		authUrl: string,
		scopes?: string[],
	) => Promise<{ ok: boolean; code?: string }>;
}) {
	const {
		open,
		onOpenChange,
		initialConnectorKey,
		onTestConnection,
		onConnect,
		onStartOAuth,
	} = props;
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [category, setCategory] = useState<ToolCategoryFilter>("all");
	const [selectedConnector, setSelectedConnector] = useState<string | null>(
		null,
	);
	const [config, setConfig] = useState<Record<string, string>>({});
	const [testing, setTesting] = useState(false);
	const [connecting, setConnecting] = useState(false);
	const [status, setStatus] = useState<string | null>(null);
	const [connectedTools, setConnectedTools] = useState<
		Record<string, ConnectedTool | undefined>
	>({});

	const filteredTools = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return KB_CONNECTORS.filter((connector) => {
			if (category !== "all" && connector.auth.type !== category) return false;
			if (!needle) return true;
			return (
				connector.name.toLowerCase().includes(needle) ||
				connector.description.toLowerCase().includes(needle) ||
				connector.key.toLowerCase().includes(needle)
			);
		});
	}, [category, query]);

	const categoryFilters: Array<{ value: ToolCategoryFilter; label: string }> = [
		{ value: "all", label: "All" },
		{ value: "oauth", label: "OAuth" },
		{ value: "apiKey", label: "API Key" },
	];

	function updateCategory(nextCategory: ToolCategoryFilter) {
		setCategory(nextCategory);
		setPage(1);
	}
	const pageCount = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));
	const visibleTools = filteredTools.slice(
		(page - 1) * PAGE_SIZE,
		page * PAGE_SIZE,
	);
	const selectedMeta = useMemo<KBConnector | null>(
		() =>
			KB_CONNECTORS.find((connector) => connector.key === selectedConnector) ??
			null,
		[selectedConnector],
	);
	const selectedConnection = selectedConnector
		? connectedTools[selectedConnector]
		: undefined;

	useEffect(() => {
		if (!open) return;
		setSelectedConnector(initialConnectorKey ?? null);
		setConfig({});
		setStatus(null);
		setQuery("");
		setCategory("all");
		setPage(1);
	}, [initialConnectorKey, open]);

	useEffect(() => {
		setPage((current) => Math.min(current, pageCount));
	}, [pageCount]);

	async function handleTest() {
		if (!selectedConnector) return;
		try {
			setTesting(true);
			setStatus(null);
			const result = await (onTestConnection?.(selectedConnector, config) ??
				Promise.resolve({ ok: true }));
			setStatus(
				result.ok
					? "Connection successful"
					: (result.message ?? "Connection failed"),
			);
		} finally {
			setTesting(false);
		}
	}

	async function handleConnect() {
		if (!selectedConnector) return;
		try {
			setConnecting(true);
			const result = await (onConnect?.(selectedConnector, config) ??
				Promise.resolve({
					id: `tool_${Date.now()}`,
					name: selectedMeta?.name ?? "Connected tool",
				}));
			setConnectedTools((prev) => ({
				...prev,
				[selectedConnector]: {
					id: result.id,
					name: result.name,
					connectedAt: Date.now(),
				},
			}));
			setStatus(`Connected ${result.name}`);
		} finally {
			setConnecting(false);
		}
	}

	function handleDisconnect() {
		if (!selectedConnector || !selectedMeta) return;
		setConnectedTools((prev) => {
			const next = { ...prev };
			delete next[selectedConnector];
			return next;
		});
		setConfig({});
		setStatus(`Disconnected ${selectedMeta.name}`);
	}

	async function handleOAuthStart(connector: KBConnector) {
		if (connector.auth.type !== "oauth") return;
		try {
			setConnecting(true);
			const result = await (onStartOAuth?.(
				connector.key,
				connector.auth.authUrl,
				connector.auth.scopes,
			) ?? Promise.resolve({ ok: true, code: "demo_code" }));
			if (!result.ok) {
				setStatus("OAuth failed");
				return;
			}
			setConfig({ oauth: "true", code: result.code ?? "demo_code" });
			const connected = await (onConnect?.(connector.key, {
				oauth: "true",
				code: result.code ?? "demo_code",
			}) ??
				Promise.resolve({
					id: `tool_${Date.now()}`,
					name: connector.name,
				}));
			setConnectedTools((prev) => ({
				...prev,
				[connector.key]: {
					id: connected.id,
					name: connected.name,
					connectedAt: Date.now(),
				},
			}));
			setStatus(`Connected ${connected.name}`);
		} finally {
			setConnecting(false);
		}
	}

	return (
		<Dialog modal={false} open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="w-[96vw] max-w-[96vw] bg-card text-foreground sm:max-w-2xl max-h-[86dvh]"
				data-tour="tool-connect-modal"
				onInteractOutside={(event) => event.preventDefault()}
			>
				<DialogHeader className="pr-10">
					<DialogTitle>Connect Tool</DialogTitle>
					<DialogDescription>
						Search, select, and configure an external tool connection.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 overflow-y-auto pr-1 max-h-[calc(86dvh-6rem)]">
					<div className="relative">
						<Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={query}
							onChange={(event) => {
								setQuery(event.target.value);
								setPage(1);
							}}
							placeholder="Search tools"
							className="pl-8"
						/>
					</div>

					<div className="flex flex-wrap gap-2">
						{categoryFilters.map((filter) => (
							<Button
								key={filter.value}
								type="button"
								variant={category === filter.value ? "default" : "outline"}
								size="sm"
								onClick={() => updateCategory(filter.value)}
							>
								{filter.label}
							</Button>
						))}
					</div>

					<div className="grid gap-2 sm:grid-cols-2">
						{visibleTools.map((connector) => {
							const connection = connectedTools[connector.key];

							return (
								<button
									key={connector.key}
									type="button"
									className={`rounded-md border p-3 text-left hover:bg-accent ${
										selectedConnector === connector.key
											? "border-sky-400 bg-sky-500/10 ring-1 ring-sky-400"
											: "border-input bg-background"
									}`}
									onClick={() => {
										setSelectedConnector(connector.key);
										setConfig({});
										setStatus(null);
									}}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0">
											<div className="truncate text-sm font-medium">
												{connector.name}
											</div>
											<div className="line-clamp-2 text-xs text-muted-foreground">
												{connector.description}
											</div>
										</div>
										<div className="flex shrink-0 flex-col items-end gap-1">
											<span className="rounded border border-border bg-card px-1.5 py-0.5 text-[0.62rem] uppercase leading-none text-muted-foreground">
												{connector.auth.type === "oauth" ? "OAuth" : "Key"}
											</span>
											{connection && (
												<span className="rounded border border-emerald-400/40 bg-emerald-500/10 px-1.5 py-0.5 text-[0.62rem] uppercase leading-none text-emerald-700 dark:text-emerald-300">
													Connected
												</span>
											)}
										</div>
									</div>
								</button>
							);
						})}
					</div>

					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>
							Page {page} of {pageCount} - {filteredTools.length} tools
						</span>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={page <= 1}
								onClick={() => setPage((current) => Math.max(1, current - 1))}
							>
								Prev
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={page >= pageCount}
								onClick={() =>
									setPage((current) => Math.min(pageCount, current + 1))
								}
							>
								Next
							</Button>
						</div>
					</div>

					{selectedMeta && (
						<div className="grid gap-3 rounded-md border border-sky-400/25 bg-sky-500/5 p-3">
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<div className="text-sm font-medium">
										Configure {selectedMeta.name}
									</div>
									{selectedConnection && (
										<span className="rounded border border-emerald-400/40 bg-emerald-500/10 px-1.5 py-0.5 text-[0.68rem] uppercase leading-none text-emerald-700 dark:text-emerald-300">
											Connected
										</span>
									)}
								</div>
								<div className="text-xs text-muted-foreground">
									{selectedConnection
										? `Connected as ${selectedConnection.name}`
										: selectedMeta.description}
								</div>
							</div>

							{selectedMeta.auth.type === "apiKey" ? (
								<>
									{selectedMeta.auth.fields.map((field) => (
										<label key={field.key} className="grid gap-1 text-sm">
											<span className="text-muted-foreground">
												{field.label}
											</span>
											<Input
												value={config[field.key] ?? ""}
												onChange={(event) =>
													setConfig((prev) => ({
														...prev,
														[field.key]: event.target.value,
													}))
												}
												placeholder={field.placeholder}
												type={field.secret ? "password" : "text"}
											/>
										</label>
									))}
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="outline"
											disabled={testing}
											onClick={handleTest}
										>
											{testing ? "Testing..." : "Test Connection"}
										</Button>
										{status && (
											<span className="text-xs text-muted-foreground">
												{status}
											</span>
										)}
										<div className="grow" />
										{selectedConnection && (
											<Button
												type="button"
												variant="outline"
												className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
												onClick={handleDisconnect}
											>
												Disconnect
											</Button>
										)}
										<Button
											type="button"
											disabled={connecting}
											onClick={handleConnect}
										>
											{connecting
												? "Connecting..."
												: selectedConnection
													? "Reconnect"
													: "Connect"}
										</Button>
									</div>
								</>
							) : (
								<div className="flex items-center justify-between gap-3">
									<div className="text-xs text-muted-foreground">
										{selectedConnection
											? `Connected as ${selectedConnection.name}`
											: `OAuth via ${new URL(selectedMeta.auth.authUrl).hostname}`}
									</div>
									<div className="flex items-center gap-2">
										{selectedConnection && (
											<Button
												type="button"
												variant="outline"
												className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
												onClick={handleDisconnect}
											>
												Disconnect
											</Button>
										)}
										<Button
											type="button"
											disabled={connecting}
											onClick={() => handleOAuthStart(selectedMeta)}
										>
											{connecting
												? "Connecting..."
												: selectedConnection
													? `Reconnect ${selectedMeta.name}`
													: `Connect ${selectedMeta.name}`}
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
