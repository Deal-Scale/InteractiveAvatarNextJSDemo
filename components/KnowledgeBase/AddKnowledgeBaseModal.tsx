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
import { KB_CONNECTORS } from "./connectors";

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
}

export default function AddKnowledgeBaseModal({
	open,
	onOpenChange,
	onCreated,
	onTestConnection,
	onConnect,
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
	const [apiKey, setApiKey] = useState("");
	const [apiSecret, setApiSecret] = useState("");
	const [testing, setTesting] = useState(false);
	const [testResult, setTestResult] = useState<string | null>(null);
	const [connecting, setConnecting] = useState(false);
	const canCreate = name.trim().length > 0 && content.trim().length > 0;

	const selectedMeta = useMemo(
		() => KB_CONNECTORS.find((c) => c.key === selectedConnector) || null,
		[selectedConnector],
	);

	function resetDraft() {
		setName("");
		setDescription("");
		setContent("");
		setSelectedConnector(null);
		setApiKey("");
		setApiSecret("");
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
			const res = await (onTestConnection?.(selectedConnector, {
				apiKey,
				apiSecret,
			}) ?? Promise.resolve({ ok: true }));
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
			const res = await (onConnect?.(selectedConnector, {
				apiKey,
				apiSecret,
			}) ??
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

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (!v) resetDraft();
				onOpenChange(v);
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Knowledge Base</DialogTitle>
					<DialogDescription>
						Create from Text/Markdown or connect an external tool.
					</DialogDescription>
				</DialogHeader>

				{/* Tabs */}
				<div className="px-1">
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
							{/* connectors grid */}
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
								{KB_CONNECTORS.map((c) => (
									<button
										key={c.key}
										type="button"
										className={`rounded-md border border-input p-3 text-left text-sm hover:bg-accent ${selectedConnector === c.key ? "ring-2 ring-ring" : ""}`}
										onClick={() => setSelectedConnector(c.key)}
										aria-pressed={selectedConnector === c.key}
									>
										<div className="font-medium">{c.name}</div>
										<div className="text-xs text-muted-foreground">
											{c.description}
										</div>
									</button>
								))}
							</div>

							{/* simple config form when selected */}
							{selectedMeta && (
								<div className="mt-1 grid gap-2 rounded-md border border-dashed border-input p-3">
									<div className="text-sm font-medium">
										Configure {selectedMeta.name}
									</div>
									<label className="grid gap-1 text-sm">
										<span className="text-muted-foreground">API Key</span>
										<input
											value={apiKey}
											onChange={(e) => setApiKey(e.target.value)}
											className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
											placeholder="Enter API key"
										/>
									</label>
									<label className="grid gap-1 text-sm">
										<span className="text-muted-foreground">API Secret</span>
										<input
											value={apiSecret}
											onChange={(e) => setApiSecret(e.target.value)}
											className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
											placeholder="Enter API secret"
										/>
									</label>
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
								</div>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
