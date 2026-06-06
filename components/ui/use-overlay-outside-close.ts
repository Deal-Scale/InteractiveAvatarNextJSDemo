"use client";

import * as React from "react";

export function setForwardedRef<T>(
	ref: React.ForwardedRef<T>,
	value: T | null,
) {
	if (typeof ref === "function") {
		ref(value);
		return;
	}

	if (ref) {
		(ref as React.MutableRefObject<T | null>).current = value;
	}
}

export function useOutsidePointerClose<T extends HTMLElement>(
	close: (() => void) | null,
	ignoredRefs: Array<React.RefObject<HTMLElement | null>> = [],
) {
	const contentRef = React.useRef<T | null>(null);

	React.useEffect(() => {
		if (!close) {
			return;
		}

		let closeTimer: number | undefined;
		let listenTimer: number | undefined;
		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;

			if (!(target instanceof Node)) {
				return;
			}

			if (contentRef.current?.contains(target)) {
				return;
			}

			if (
				ignoredRefs.some((ignoredRef) => ignoredRef.current?.contains(target))
			) {
				return;
			}

			closeTimer = window.setTimeout(close, 0);
		};

		listenTimer = window.setTimeout(() => {
			document.addEventListener("pointerdown", handlePointerDown, true);
		}, 0);

		return () => {
			if (listenTimer !== undefined) {
				window.clearTimeout(listenTimer);
			}
			document.removeEventListener("pointerdown", handlePointerDown, true);
			if (closeTimer !== undefined) {
				window.clearTimeout(closeTimer);
			}
		};
	}, [close, ignoredRefs]);

	return contentRef;
}

export function useReleaseBodyPointerEvents(enabled: boolean) {
	React.useEffect(() => {
		if (!enabled) {
			return;
		}

		let timer: number | undefined;
		const releasePointerLock = () => {
			if (document.body.style.pointerEvents === "none") {
				document.body.style.pointerEvents = "";
			}
		};

		timer = window.setTimeout(releasePointerLock, 120);

		return () => {
			if (timer !== undefined) {
				window.clearTimeout(timer);
			}
			releasePointerLock();
		};
	}, [enabled]);
}
