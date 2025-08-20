"use client";

import React, { useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KB_CONNECTORS, type KBConnector } from "./connectors";
import { useResponsiveColumns } from "@/components/ui/grid/utils/useResponsiveColumns";
import { useGridData } from "@/components/ui/hooks/useGridData";
import type { GridItem, GridResponse } from "@/types/component-grid";
import ComponentGridControls from "@/components/ui/grid/components/ComponentGridControls";

export type AddKBTab = "text" | "tool";

export interface AddKnowledgeBaseModalProps {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	onCreated?: (kb: {
		id: string;
		name: string;
		sourceType: "text" | "api";
	}) => void;
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
}

export default function AddKnowledgeBaseModal({
	open,
	onOpenChange,
	onCreated,
	onTestConnection,
	onConnect,
	onStartOAuth,
}: AddKnowledgeBaseModalProps) {
	const [active, setActive] = useState<AddKBTab>("text");

	// Text/Markdown form state
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [content, setContent] = useState("");
	const [creating, setCreating] = useState(false);

	// Tool connection state
	const [selectedConnector, setSelectedConnector] = useState<string | null>(
		null,
	);
	const [config, setConfig] = useState<Record<string, string>>({});
	const [testing, setTesting] = useState(false);
	const [testResult, setTestResult] = useState<string | null>(null);
	const [connecting, setConnecting] = useState(false);
	const canCreate = name.trim().length > 0 && content.trim().length > 0;

	const selectedMeta = useMemo<KBConnector | null>(
		() => KB_CONNECTORS.find((c) => c.key === selectedConnector) || null,
		[selectedConnector],
	);

	// Responsive columns for connector grid
	const { containerRef, gridTemplate } = useResponsiveColumns(220, 2);

	// Grid hook over static connector list for search/filter/sort
	type ConnectorItem = GridItem & KBConnector;
	const connectorCategories = ["OAuth", "API Key"];
	const connectorGrid = useGridData<ConnectorItem>({
		fetcher: async ({
			page,
			pageSize,
			search,
			categories,
		}): Promise<GridResponse<ConnectorItem>> => {
			const q = (search ?? "").trim().toLowerCase();
			const cats = categories ?? [];
			let items = KB_CONNECTORS.map((c) => ({ ...c })) as ConnectorItem[];
			if (q) {
				items = items.filter(
					(c) =>
						c.name.toLowerCase().includes(q) ||
						c.description.toLowerCase().includes(q) ||
						c.key.toLowerCase().includes(q),
				);
			}
			if (cats.length > 0) {
				const wantOAuth = cats.includes("OAuth");
				const wantApi = cats.includes("API Key");
				items = items.filter(
					(c) =>
						(wantOAuth && c.auth.type === "oauth") ||
						(wantApi && c.auth.type === "apiKey"),
				);
			}
			// Simple alpha sort by name
			items.sort((a, b) => a.name.localeCompare(b.name));
			const start = (page - 1) * pageSize;
			const paged = items.slice(start, start + pageSize);
			return {
				items: paged,
				total: items.length,
				page,
				pageSize,
			};
		},
		pageSize: 8,
		mode: "paged",
		initialPage: 1,
		queryKeyBase: ["kb-connectors"],
	});

	function resetDraft() {
		setName("");
		setDescription("");
		setContent("");
		setSelectedConnector(null);
		setConfig({});
		setTesting(false);
		setTestResult(null);
	}

	async function handleCreate() {
		if (!canCreate) return;
		try {
			setCreating(true);
			// Defer to caller; keep UI decoupled from data layer for now
			const id = `kb_${Date.now()}`;
			onCreated?.({ id, name: name.trim(), sourceType: "text" });
			onOpenChange(false);
		} finally {
			setCreating(false);
		}
	}

	async function handleTest() {
		if (!selectedConnector) return;
		try {
			setTesting(true);
			setTestResult(null);
			const res = await (onTestConnection?.(selectedConnector, config) ??
				Promise.resolve({ ok: true }));
			setTestResult(
				res.ok ? "Connection successful" : (res.message ?? "Connection failed"),
			);
		} finally {
			setTesting(false);
		}
	}

	async function handleConnect() {
		if (!selectedConnector) return;
		try {
			setConnecting(true);
			const res = await (onConnect?.(selectedConnector, config) ??
				Promise.resolve({
					id: `kb_${Date.now()}`,
					name: selectedMeta?.name || "API KB",
				}));
			onCreated?.({ id: res.id, name: res.name, sourceType: "api" });
			onOpenChange(false);
		} finally {
			setConnecting(false);
		}
	}

	async function handleOAuthStart(connector: KBConnector) {
		if (connector.auth.type !== "oauth") return;
		const result = await (onStartOAuth?.(
			connector.key,
			connector.auth.authUrl,
			connector.auth.scopes,
		) ?? Promise.resolve({ ok: true, code: "demo_code" }));
		if (result.ok) {
			setConfig({ oauth: "true", code: result.code ?? "demo_code" });
			await handleConnect();
		} else {
			setTestResult("OAuth failed");
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (!v) resetDraft();
				onOpenChange(v);
			}}
		>
			<DialogContent className="sm:max-w-xl max-h-[85dvh]">
				<DialogHeader>
					<DialogTitle>Add Knowledge Base</DialogTitle>
					<DialogDescription>
						Create from Text/Markdown or connect an external tool.
					</DialogDescription>
				</DialogHeader>

				{/* Tabs */}
				<div className="px-1 overflow-y-auto max-h-[calc(85dvh-6rem)]">
					<div
						role="tablist"
						className="mb-3 flex gap-1 border-b border-border"
					>
						<button
							role="tab"
							aria-selected={active === "text"}
							className={`-mb-px px-3 py-2 text-sm ${active === "text" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
							onClick={() => setActive("text")}
						>
							Text/Markdown
						</button>
						<button
							role="tab"
							aria-selected={active === "tool"}
							className={`-mb-px px-3 py-2 text-sm ${active === "tool" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
							onClick={() => setActive("tool")}
						>
							Tool Connection
						</button>
					</div>

					{active === "text" && (
						<div role="tabpanel" className="grid gap-3">
							<label className="grid gap-1 text-sm">
								<span className="text-muted-foreground">Name (required)</span>
								<input
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									placeholder="My Docs"
								/>
							</label>
							<label className="grid gap-1 text-sm">
								<span className="text-muted-foreground">
									Description (optional)
								</span>
								<input
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									placeholder="Short description"
								/>
							</label>
							<label className="grid gap-1 text-sm">
								<span className="text-muted-foreground">Text/Markdown</span>
								<textarea
									value={content}
									onChange={(e) => setContent(e.target.value)}
									rows={8}
									className="rounded-md border border-input bg-background p-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									placeholder="Paste or type content (no live preview)"
								/>
							</label>
							<div className="flex items-center justify-end gap-2 pt-1">
								<Button
									variant="ghost"
									type="button"
									onClick={() => resetDraft()}
								>
									Reset
								</Button>
								<Button
									type="button"
									disabled={!canCreate || creating}
									onClick={handleCreate}
								>
									{creating ? "Creating…" : "Create"}
								</Button>
							</div>
						</div>
					)}

					{active === "tool" && (
						<div role="tabpanel" className="grid gap-3">
							<ComponentGridControls
								search={connectorGrid.search}
								onSearchChange={connectorGrid.setSearch}
								categories={connectorCategories}
								selectedCategories={connectorGrid.categories}
								onCategoriesChange={connectorGrid.setCategories}
								mode="paged"
								onClearAll={connectorGrid.clearFilters}
							/>

							{/* connectors grid */}
							<div
								ref={containerRef}
								className="grid gap-2"
								style={{ gridTemplateColumns: gridTemplate }}
							>
								{connectorGrid.items.map((c) => (
									<button
										key={c.key as string}
										type="button"
										className={`rounded-md border border-input p-3 text-left text-sm hover:bg-accent ${selectedConnector === c.key ? "ring-2 ring-ring" : ""}`}
										onClick={() => setSelectedConnector(c.key)}
										aria-pressed={selectedConnector === c.key}
									>
										<div className="font-medium flex items-center justify-between">
											<span>{c.name}</span>
											<span className="text-[10px] rounded bg-muted px-1 py-0.5 text-muted-foreground">
												{c.auth.type === "oauth" ? "OAuth" : "API Key"}
											</span>
										</div>
										<div className="text-xs text-muted-foreground">
											{c.description}
										</div>
									</button>
								))}
							</div>

							{/* Paged controls minimal */}
							<div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
								<span>
									Page {connectorGrid.page} · {connectorGrid.total} items
								</span>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={connectorGrid.page <= 1}
										onClick={() =>
											connectorGrid.setPage(Math.max(1, connectorGrid.page - 1))
										}
									>
										Prev
									</Button>
									<Button
										variant="outline"
										size="sm"
										disabled={!connectorGrid.hasNextPage}
										onClick={() =>
											connectorGrid.setPage(connectorGrid.page + 1)
										}
									>
										Next
									</Button>
								</div>
							</div>
						</div>
					)}

					{selectedMeta && (
						<div className="mt-1 grid gap-2 rounded-md border border-dashed border-input p-3">
							<div className="text-sm font-medium">
								Configure {selectedMeta.name}
							</div>
							{selectedMeta.auth.type === "apiKey" && (
								<>
									{selectedMeta.auth.fields.map((f) => (
										<label key={f.key} className="grid gap-1 text-sm">
											<span className="text-muted-foreground">{f.label}</span>
											<input
												value={config[f.key] ?? ""}
												onChange={(e) =>
													setConfig((prev) => ({
														...prev,
														[f.key]: e.target.value,
													}))
												}
												className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
												placeholder={f.placeholder}
												type={f.secret ? "password" : "text"}
											/>
										</label>
									))}
									<div className="flex items-center gap-2 pt-1">
										<Button
											type="button"
											variant="outline"
											disabled={testing}
											onClick={handleTest}
										>
											{testing ? "Testing…" : "Test Connection"}
										</Button>
										{testResult && (
											<span className="text-xs text-muted-foreground">
												{testResult}
											</span>
										)}
										<div className="grow" />
										<Button
											type="button"
											disabled={connecting}
											onClick={handleConnect}
										>
											{connecting ? "Connecting…" : "Connect"}
										</Button>
									</div>
								</>
							)}
							{selectedMeta.auth.type === "oauth" && (
								<div className="flex items-center justify-between gap-2 pt-1">
									<div className="text-xs text-muted-foreground">
										OAuth via {new URL(selectedMeta.auth.authUrl).hostname}
									</div>
									<Button
										type="button"
										disabled={connecting}
										onClick={() => handleOAuthStart(selectedMeta)}
									>
										{connecting
											? "Connecting…"
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
