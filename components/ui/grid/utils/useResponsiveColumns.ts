import React from "react";

export function useResponsiveColumns(
	minItemWidth: number,
	fallbackColumns: number,
) {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const [containerWidth, setContainerWidth] = React.useState(0);

	React.useEffect(() => {
		if (!containerRef.current) return;
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setContainerWidth(entry.contentRect.width);
			}
		});
		ro.observe(containerRef.current);
		return () => ro.disconnect();
	}, []);

	const columns = React.useMemo(() => {
		if (containerWidth > 0) {
			return Math.max(1, Math.floor(containerWidth / minItemWidth));
		}
		return Math.max(1, fallbackColumns);
	}, [containerWidth, minItemWidth, fallbackColumns]);

	const gridTemplate = React.useMemo(
		() => `repeat(${columns}, minmax(0, 1fr))`,
		[columns],
	);

	return { containerRef, columns, gridTemplate } as const;
}
