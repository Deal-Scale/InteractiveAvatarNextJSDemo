"use client";

import Plausible, { Options as PlausibleOptions } from "plausible-tracker";

let _client: ReturnType<typeof Plausible> | null = null;

export type InitOptions = PlausibleOptions;

export function init(options?: InitOptions) {
	if (typeof window === "undefined") return null;
	if (_client) return _client;
	const client = Plausible(options ?? {});
	_client = client;
	return _client;
}

function getClient() {
	if (!_client && typeof window !== "undefined") {
		init();
	}
	return _client;
}

export function trackPageview(
	opts?: Parameters<ReturnType<typeof Plausible>["trackPageview"]>[0],
	extra?: Parameters<ReturnType<typeof Plausible>["trackPageview"]>[1],
) {
	const c = getClient();
	return c?.trackPageview(opts as any, extra as any);
}

export function trackEvent(
	name: string,
	opts?: Parameters<ReturnType<typeof Plausible>["trackEvent"]>[1],
	overrides?: Parameters<ReturnType<typeof Plausible>["trackEvent"]>[2],
) {
	const c = getClient();
	return c?.trackEvent(name, opts as any, overrides as any);
}

export function enableAutoPageviews() {
	const c = getClient();
	if (!c) return () => {};
	return c.enableAutoPageviews();
}

export function enableAutoOutboundTracking() {
	const c = getClient();
	if (!c || !c.enableAutoOutboundTracking) return () => {};
	return c.enableAutoOutboundTracking();
}
