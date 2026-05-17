"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { ForceGraph3DInstance } from "3d-force-graph";
import { ExpandIcon, EyeIcon, Highlighter, ZoomIn } from "lucide-react";
import { GraphData } from "./types";
import {
	useFullscreen,
	useFullscreenChangeListener,
	useHandleResize,
	useHandleZoomToFit,
	useHighlightNodes,
	useInitializeGraph,
	useToggleAnimation,
} from "./hooks";

export interface ThreeGraphViewerProps {
	graphData: GraphData;
	isEditing?: boolean;
	vectorGraphPreferences?: any;
	loadingFallback?: React.ReactNode;
	nodesToHighlight?: (string | number)[];
	onHighlightToggle?: () => void;
	isHighlightActive?: boolean;
}

export const ThreeGraphViewer: React.FC<ThreeGraphViewerProps> = ({
	graphData,
	isEditing = false,
	vectorGraphPreferences = null,
	loadingFallback = <div>Loading Graph...</div>,
	nodesToHighlight = [],
	onHighlightToggle,
	isHighlightActive = false,
}) => {
	const graphRef = useRef<HTMLDivElement>(null);
	const graphInstanceRef = useRef<ForceGraph3DInstance | null>(null);
	const hasAnimated = useRef(false);

	const [isFullscreen, setIsFullscreen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [animationPaused, setAnimationPaused] = useState(false); // Start with animation running

	const LARGE_NODE_COUNT = 500;

	const handleResize = useHandleResize(graphRef, graphInstanceRef);
	const handleFullscreen = useFullscreen(
		graphRef,
		isFullscreen,
		setIsFullscreen,
		handleResize,
	);
	useFullscreenChangeListener(handleResize, loading, animationPaused);
	const handleToggleAnimation = useToggleAnimation(
		graphInstanceRef,
		animationPaused,
		setAnimationPaused,
		handleResize,
	);
	const handleZoomToFit = useHandleZoomToFit(graphInstanceRef);

	useInitializeGraph(
		graphRef,
		graphInstanceRef,
		graphData,
		vectorGraphPreferences,
		setLoading,
		setAnimationPaused,
		handleResize,
		LARGE_NODE_COUNT,
		hasAnimated,
	);

	useEffect(() => {
		if (graphInstanceRef.current) {
			if (isEditing || loading) {
				graphInstanceRef.current.pauseAnimation();
				setAnimationPaused(true);
			} else {
				graphInstanceRef.current.resumeAnimation();
				setAnimationPaused(false);
				graphInstanceRef.current.onEngineStop(() => setLoading(false));
			}
		}
		handleResize();
	}, [isEditing, loading, graphData, handleResize]);

	useHighlightNodes(
		graphInstanceRef,
		isHighlightActive ? nodesToHighlight : [],
	);

	return (
		<Suspense fallback={loadingFallback}>
			<div style={{ position: "relative", width: "100%", height: "100%" }}>
				<div
					ref={graphRef}
					style={{
						width: "100%",
						height: "100%",
						backgroundColor: "#000011",
						visibility: "visible",
					}}
				/>
				{animationPaused && (
					<div
						className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20"
						style={{ pointerEvents: "none" }}
					>
						<button
							onClick={handleToggleAnimation}
							className="px-4 py-2 bg-purple-500 text-white rounded hide-vector-eye"
							style={{ pointerEvents: "auto" }}
						>
							<EyeIcon />
						</button>
					</div>
				)}
				{!animationPaused && (
					<div
						className="absolute top-16 left-1/2 transform -translate-x-1/2 flex space-x-4"
						style={{ zIndex: 20, pointerEvents: "none" }}
					>
						<button
							onClick={handleFullscreen}
							className="px-4 py-2 bg-blue-500 text-white rounded transition-opacity duration-300 hover:opacity-100"
							style={{ opacity: "0.7", pointerEvents: "auto" }}
							title="Full Screen Vector"
						>
							<ExpandIcon />
						</button>
						<button
							onClick={handleZoomToFit}
							className="px-4 py-2 bg-green-500 text-white rounded transition-opacity duration-300 hover:opacity-100"
							style={{ opacity: "0.7", pointerEvents: "auto" }}
							title="Recenter Vector"
						>
							<ZoomIn />
						</button>
						{onHighlightToggle && (
							<button
								onClick={onHighlightToggle}
								className="px-4 py-2 bg-yellow-500 text-white rounded transition-opacity duration-300 hover:opacity-100"
								style={{ opacity: "0.7", pointerEvents: "auto" }}
								title="Toggle Highlight"
							>
								<Highlighter />
							</button>
						)}
					</div>
				)}

				<div
					style={{
						position: "absolute",
						bottom: 0,
						width: "100%",
						textAlign: "center",
						color: "#ffffff",
						fontSize: "12px",
						backgroundColor: "#000011",
						padding: "5px 0",
						pointerEvents: "none",
					}}
				>
					Left-click: rotate, Mouse-wheel/middle-click: zoom, Right-click: pan
				</div>
			</div>
		</Suspense>
	);
};
