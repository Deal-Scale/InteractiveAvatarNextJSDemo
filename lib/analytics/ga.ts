"use client";

import ReactGA, { ReactGAImplementation } from "react-ga4";

let _initialized = false;

export type GAInitOptions = {
	ids: string[]; // one or more GA4 measurement IDs
	gaOptions?: Parameters<typeof ReactGA.initialize>[1];
	gtagUrl?: string;
};

export function initGA(options: GAInitOptions) {
	if (typeof window === "undefined") return;
	if (_initialized) return;
	const trackers = options.ids.map((id) => ({
		trackingId: id,
		gaOptions: options.gaOptions as any,
		...(options.gtagUrl ? { gtagUrl: options.gtagUrl } : {}),
	}));
	ReactGA.initialize(trackers as any);
	_initialized = true;
}

export function sendPageview(path?: string, title?: string) {
	if (!_initialized) return;
	ReactGA.send({ hitType: "pageview", page: path, title });
}

export function gaEvent(options: Parameters<typeof ReactGA.event>[0]) {
	if (!_initialized) return;
	// react-ga4 supports both GA4-style (name, params) and UA-style options object
	// Here we assume options object style per README
	ReactGA.event(options as any);
}

export function gaSet(fields: Record<string, any>) {
	if (!_initialized) return;
	ReactGA.set(fields as any);
}
