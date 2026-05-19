"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
	KB_CONNECTORS,
	type KBConnector,
} from "@/components/KnowledgeBase/connectors";
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
	const [selectedConnector, setSelectedConnector] = useState<string | null>(
		null,
	);
	const [config, setConfig] = useState<Record<string, string>>({});
	const [testing, setTesting] = useState(false);
	const [connecting, setConnecting] = useState(false);
	const [status, setStatus] = useState<string | null>(null);

	const filteredTools = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return KB_CONNECTORS;

		return KB_CONNECTORS.filter(
			(connector) =>
				connector.name.toLowerCase().includes(needle) ||
				connector.description.toLowerCase().includes(needle) ||
				connector.key.toLowerCase().includes(needle),
		);
	}, [query]);
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

	useEffect(() => {
		if (!open) return;
		setSelectedConnector(initialConnectorKey ?? null);
		setConfig({});
		setStatus(null);
		setQuery("");
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
			setStatus(`Connected ${result.name}`);
			onOpenChange(false);
		} finally {
			setConnecting(false);
		}
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
			setStatus(`Connected ${connected.name}`);
			onOpenChange(false);
		} finally {
			setConnecting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[96vw] max-w-[96vw] bg-card text-foreground sm:max-w-2xl max-h-[86dvh]">
				<DialogHeader>
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

					<div className="grid gap-2 sm:grid-cols-2">
						{visibleTools.map((connector) => (
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
									<span className="shrink-0 rounded border border-border bg-card px-1.5 py-0.5 text-[0.62rem] uppercase leading-none text-muted-foreground">
										{connector.auth.type === "oauth" ? "OAuth" : "Key"}
									</span>
								</div>
							</button>
						))}
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
								<div className="text-sm font-medium">
									Configure {selectedMeta.name}
								</div>
								<div className="text-xs text-muted-foreground">
									{selectedMeta.description}
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
										<Button
											type="button"
											disabled={connecting}
											onClick={handleConnect}
										>
											{connecting ? "Connecting..." : "Connect"}
										</Button>
									</div>
								</>
							) : (
								<div className="flex items-center justify-between gap-3">
									<div className="text-xs text-muted-foreground">
										OAuth via {new URL(selectedMeta.auth.authUrl).hostname}
									</div>
									<Button
										type="button"
										disabled={connecting}
										onClick={() => handleOAuthStart(selectedMeta)}
									>
										{connecting
											? "Connecting..."
											: `Connect ${selectedMeta.name}`}
									</Button>
								</div>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
