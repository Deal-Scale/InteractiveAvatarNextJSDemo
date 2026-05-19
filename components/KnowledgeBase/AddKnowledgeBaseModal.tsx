"use client";

import { ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import ComponentGridControls from "@/components/ui/grid/components/ComponentGridControls";
import { useResponsiveColumns } from "@/components/ui/grid/utils/useResponsiveColumns";
import { useGridData } from "@/components/ui/hooks/useGridData";
import type { GridItem, GridResponse } from "@/types/component-grid";
import { KB_CONNECTORS, type KBConnector } from "./connectors";

const NO_FOLDER_VALUE = "__NO_FOLDER__";

type KnowledgeFolderOption = { id: string; name: string; parentId?: string };

function buildFolderOptions(folders: KnowledgeFolderOption[]) {
	const childrenByParent = new Map<string, KnowledgeFolderOption[]>();

	for (const folder of folders) {
		const parentId = folder.parentId ?? "";
		const children = childrenByParent.get(parentId) ?? [];
		children.push(folder);
		childrenByParent.set(parentId, children);
	}

	for (const children of childrenByParent.values()) {
		children.sort((a, b) => a.name.localeCompare(b.name));
	}

	const result: Array<KnowledgeFolderOption & { label: string }> = [];
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

export interface AddKnowledgeBaseModalProps {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	initialToolsOpen?: boolean;
	onCreated?: (kb: {
		id: string;
		name: string;
		sourceType: "text" | "api";
		folderId?: string;
		description?: string;
		content?: string;
		files?: File[];
	}) => void;
	folders?: KnowledgeFolderOption[];
	onCreateFolder?: (
		name: string,
		parentId?: string,
	) => KnowledgeFolderOption | void;
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
	initialToolsOpen = false,
	onCreated,
	folders = [],
	onCreateFolder,
	onTestConnection,
	onConnect,
	onStartOAuth,
}: AddKnowledgeBaseModalProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [content, setContent] = useState("");
	const [folderId, setFolderId] = useState("");
	const [newFolder, setNewFolder] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [creating, setCreating] = useState(false);
	const [toolsOpen, setToolsOpen] = useState(false);

	const [selectedConnector, setSelectedConnector] = useState<string | null>(
		null,
	);
	const [config, setConfig] = useState<Record<string, string>>({});
	const [testing, setTesting] = useState(false);
	const [testResult, setTestResult] = useState<string | null>(null);
	const [connecting, setConnecting] = useState(false);

	const canCreate =
		name.trim().length > 0 && (content.trim().length > 0 || files.length > 0);
	const folderOptions = useMemo(() => buildFolderOptions(folders), [folders]);

	const selectedMeta = useMemo<KBConnector | null>(
		() => KB_CONNECTORS.find((c) => c.key === selectedConnector) || null,
		[selectedConnector],
	);

	const { containerRef, gridTemplate } = useResponsiveColumns(220, 2);

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

	useEffect(() => {
		if (open) setToolsOpen(initialToolsOpen);
	}, [initialToolsOpen, open]);

	function resetDraft() {
		setName("");
		setDescription("");
		setContent("");
		setFolderId("");
		setNewFolder("");
		setFiles([]);
		setSelectedConnector(null);
		setConfig({});
		setTesting(false);
		setTestResult(null);
		setToolsOpen(false);
	}

	async function handleCreate() {
		if (!canCreate) return;
		try {
			setCreating(true);
			let resolvedFolderId = folderId || undefined;
			const trimmedFolder = newFolder.trim();
			if (trimmedFolder) {
				const created = onCreateFolder?.(trimmedFolder);
				resolvedFolderId = created?.id ?? resolvedFolderId;
			}
			const id = `kb_${Date.now()}`;
			onCreated?.({
				id,
				name: name.trim(),
				sourceType: "text",
				folderId: resolvedFolderId,
				description: description.trim(),
				content,
				files,
			});
			onOpenChange(false);
		} finally {
			setCreating(false);
		}
	}

	async function handleFilesSelected(fileList: FileList | null) {
		const selected = Array.from(fileList ?? []);
		setFiles(selected);
		if (selected.length === 0) return;

		const textFiles = selected.filter((file) => {
			const lowerName = file.name.toLowerCase();
			return (
				file.type.startsWith("text/") ||
				/\.(txt|md|markdown|csv|json|jsonl|xml|yaml|yml|tsv)$/i.test(lowerName)
			);
		});
		const chunks = await Promise.all(
			textFiles.map(async (file) => {
				try {
					const text = await file.text();
					return `\n\n# ${file.name}\n\n${text}`;
				} catch {
					return "";
				}
			}),
		);
		const appended = chunks.join("").trim();
		if (appended) {
			setContent((prev) =>
				[prev.trim(), appended].filter(Boolean).join("\n\n"),
			);
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
			<DialogContent className="w-[96vw] max-w-[96vw] bg-card text-foreground sm:max-w-xl max-h-[85dvh]">
				<DialogHeader>
					<DialogTitle>Add Knowledge Base</DialogTitle>
					<DialogDescription>
						Create from text, files, or connect an external tool.
					</DialogDescription>
				</DialogHeader>

				<div className="px-1 overflow-y-auto max-h-[calc(85dvh-6rem)]">
					<div className="grid gap-3">
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
							<span className="text-muted-foreground">Folder</span>
							<select
								value={folderId || NO_FOLDER_VALUE}
								onChange={(e) =>
									setFolderId(
										e.target.value === NO_FOLDER_VALUE ? "" : e.target.value,
									)
								}
								className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<option value={NO_FOLDER_VALUE}>Knowledge Items</option>
								{folderOptions.map((folder) => (
									<option key={folder.id} value={folder.id}>
										{folder.label}
									</option>
								))}
							</select>
						</label>
						<label className="grid gap-1 text-sm">
							<span className="text-muted-foreground">
								Or create new folder
							</span>
							<input
								value={newFolder}
								onChange={(e) => setNewFolder(e.target.value)}
								className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								placeholder="New folder name"
							/>
						</label>
						<label className="grid gap-1 text-sm">
							<span className="text-muted-foreground">Text document files</span>
							<input
								type="file"
								multiple
								accept=".txt,.md,.markdown,.csv,.json,.jsonl,.xml,.yaml,.yml,.tsv,text/plain,text/markdown,text/csv,application/json"
								className="rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs file:text-foreground"
								onChange={(e) => handleFilesSelected(e.target.files)}
							/>
							{files.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{files.map((file) => (
										<span
											key={`${file.name}-${file.size}`}
											className="rounded border border-border bg-muted px-1.5 py-0.5 text-[0.68rem] leading-none text-foreground"
										>
											{file.name}
										</span>
									))}
								</div>
							)}
						</label>
						<label className="grid gap-1 text-sm">
							<span className="text-muted-foreground">Text/Markdown</span>
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								rows={8}
								className="rounded-md border border-input bg-background p-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								placeholder="Paste, type, or upload text content"
							/>
						</label>
						<div className="flex items-center justify-end gap-2 pt-1">
							<Button variant="ghost" type="button" onClick={resetDraft}>
								Reset
							</Button>
							<Button
								type="button"
								disabled={!canCreate || creating}
								onClick={handleCreate}
							>
								{creating ? "Creating..." : "Create"}
							</Button>
						</div>
					</div>

					<div className="mt-4 rounded-md border border-sky-400/25 bg-sky-500/5">
						<button
							type="button"
							className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-sky-700 hover:bg-sky-500/10 dark:text-sky-300"
							onClick={() => setToolsOpen((value) => !value)}
						>
							<span>Tools</span>
							<ChevronRight
								className={`size-4 transition-transform ${toolsOpen ? "rotate-90" : ""}`}
							/>
						</button>
						{toolsOpen && (
							<div className="grid gap-3 border-t border-sky-400/20 p-3">
								<ComponentGridControls
									search={connectorGrid.search}
									onSearchChange={connectorGrid.setSearch}
									categories={connectorCategories}
									selectedCategories={connectorGrid.categories}
									onCategoriesChange={connectorGrid.setCategories}
									mode="paged"
									onClearAll={connectorGrid.clearFilters}
								/>

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

								<div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
									<span>
										Page {connectorGrid.page} - {connectorGrid.total} items
									</span>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											disabled={connectorGrid.page <= 1}
											onClick={() =>
												connectorGrid.setPage(
													Math.max(1, connectorGrid.page - 1),
												)
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
					</div>

					{selectedMeta && (
						<div className="mt-3 grid gap-2 rounded-md border border-dashed border-input p-3">
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
											{testing ? "Testing..." : "Test Connection"}
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
											{connecting ? "Connecting..." : "Connect"}
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
