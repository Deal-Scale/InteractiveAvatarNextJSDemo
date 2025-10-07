export type KBItem = {
	id: string;
	name: string;
	sourceType: "text" | "api";
	status?: "pending" | "syncing" | "synced" | "failed";
	description?: string;
};

export async function createTextKB(input: {
	name: string;
	description?: string;
	content: string;
}): Promise<KBItem> {
	const res = await fetch("/api/kb", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ type: "text", ...input }),
	});
	if (!res.ok) throw new Error("Failed to create KB");
	return res.json();
}

export async function testConnector(input: {
	connectorKey: string;
	config: Record<string, string>;
}): Promise<{ ok: boolean; message?: string }> {
	const res = await fetch("/api/kb/test-connection", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) return { ok: false, message: "Connection failed" };
	return res.json();
}

export async function connectKBSource(input: {
	connectorKey: string;
	config: Record<string, string>;
}): Promise<KBItem> {
	const res = await fetch("/api/kb/connect", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) throw new Error("Failed to connect source");
	return res.json();
}

export async function fetchKBs(): Promise<KBItem[]> {
	const res = await fetch("/api/kb", { method: "GET" });
	if (!res.ok) throw new Error("Failed to fetch KBs");
	return res.json();
}

export async function scheduleInitialSync(
	id: string,
): Promise<{ ok: boolean }> {
	const res = await fetch(`/api/kb/${id}/sync`, { method: "POST" });
	if (!res.ok) throw new Error("Failed to schedule sync");
	return res.json();
}
