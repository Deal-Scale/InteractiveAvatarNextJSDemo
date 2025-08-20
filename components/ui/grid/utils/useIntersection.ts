import React from "react";

export function useIntersection(
	ref: React.RefObject<Element | null>,
	options?: IntersectionObserverInit,
) {
	const [isIntersecting, setIntersecting] = React.useState(false);
	React.useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver((entries) => {
			const entry = entries[0];
			setIntersecting(entry.isIntersecting);
		}, options);
		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [ref, options]);
	return isIntersecting;
}
