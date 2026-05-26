import ForceGraph3D, { type ForceGraph3DInstance } from "3d-force-graph";
import { type MutableRefObject, useCallback, useEffect } from "react";
import type {
	CustomLinkObject,
	CustomNodeObject,
	GraphData,
	NodeObjectDirect,
} from "./types";

interface VectorGraphPreferences {
	nodeLabel?: string;
	nodeAutoColorBy?: string;
	linkAutoColorBy?: string;
	linkDirectionalParticles?: number;
	linkDirectionalParticleSpeed?: number;
	backgroundColor?: string;
	threeDeeResolution?: {
		lg?: {
			x?: number;
			y?: number;
		};
	};
}

type ForceGraphFactory = (options?: {
	controlType?: "trackball" | "orbit" | "fly";
}) => (element: HTMLElement) => ForceGraph3DInstance;

type DisposableGraphInstance = ForceGraph3DInstance & {
	_destructor?: () => void;
};

const defaultNodeLabel = "name";
const defaultNodeAutoColorBy = "group";
const defaultLinkDirectionalParticles = 4;
const defaultLinkDirectionalParticleSpeed = 0.01;
const defaultBackgroundColor = "#000011";
const defaultNodeResolution = 20;
const defaultLinkResolution = 8;
const defaultNodeColor = "#ff0000";
const defaultLinkColor = "#000011";

export const useHandleResize = (
	graphRef: MutableRefObject<HTMLDivElement | null>,
	graphInstanceRef: MutableRefObject<ForceGraph3DInstance | null>,
) => {
	return useCallback(() => {
		if (graphRef.current) {
			const { offsetWidth, offsetHeight } = graphRef.current;
			if (graphInstanceRef.current) {
				graphInstanceRef.current.width(offsetWidth);
				graphInstanceRef.current.height(offsetHeight);
				graphInstanceRef.current.refresh();
			}
		}
	}, []);
};

export const useInitializeGraph = (
	graphRef: MutableRefObject<HTMLDivElement | null>,
	graphInstanceRef: MutableRefObject<ForceGraph3DInstance | null>,
	graphData: GraphData,
	vectorGraphPreferences: VectorGraphPreferences | null | undefined,
	setLoading: (value: boolean) => void,
	setAnimationPaused: (value: boolean) => void,
	handleResize: () => void,
	LARGE_NODE_COUNT: number,
	hasAnimated: MutableRefObject<boolean>,
) => {
	useEffect(() => {
		const graphElement = graphRef.current;

		if (graphElement) {
			setLoading(true);
			setAnimationPaused(true);

			const createForceGraph3D = ForceGraph3D as unknown as ForceGraphFactory;
			const myGraph = createForceGraph3D({
				controlType: "orbit",
			})(graphElement)
				.graphData(graphData || { nodes: [], links: [] })
				.nodeLabel(vectorGraphPreferences?.nodeLabel || defaultNodeLabel)
				.nodeAutoColorBy(
					vectorGraphPreferences?.nodeAutoColorBy || defaultNodeAutoColorBy,
				)
				.linkAutoColorBy(
					vectorGraphPreferences?.linkAutoColorBy || defaultNodeAutoColorBy,
				)
				.linkDirectionalParticles(
					vectorGraphPreferences?.linkDirectionalParticles ||
						defaultLinkDirectionalParticles,
				)
				.linkDirectionalParticleSpeed(
					vectorGraphPreferences?.linkDirectionalParticleSpeed ||
						defaultLinkDirectionalParticleSpeed,
				)
				.backgroundColor(
					vectorGraphPreferences?.backgroundColor || defaultBackgroundColor,
				)
				.nodeResolution(
					vectorGraphPreferences?.threeDeeResolution?.lg?.x ||
						defaultNodeResolution,
				)
				.linkResolution(
					vectorGraphPreferences?.threeDeeResolution?.lg?.y ||
						defaultLinkResolution,
				)
				.nodeColor((node: CustomNodeObject) => node.color || defaultNodeColor)
				.linkColor((link: CustomLinkObject) => link.color || defaultLinkColor)
				.onEngineStop(() => setLoading(false));

			graphInstanceRef.current = myGraph;

			myGraph.cameraPosition({ z: 300 });

			if (
				!hasAnimated.current &&
				graphData?.nodes?.length <= LARGE_NODE_COUNT
			) {
				let angle = 0;
				const animate = () => {
					angle += 0.01;
					const camera = myGraph.camera();
					camera.position.x = 300 * Math.sin(angle);
					camera.position.z = 300 * Math.cos(angle);
					camera.lookAt(0, 0, 0);
					if (angle < 2 * Math.PI) {
						requestAnimationFrame(animate);
					}
				};
				animate();
				hasAnimated.current = true;
			}

			if (graphData?.nodes?.length > LARGE_NODE_COUNT) {
				setLoading(true);
				setTimeout(() => setLoading(false), 2000);
			}
			handleResize();

			return () => {
				const graphInstance =
					graphInstanceRef.current as DisposableGraphInstance | null;
				if (graphInstance) {
					graphInstance._destructor?.();
					graphInstanceRef.current = null;
				}
				if (graphElement) {
					graphElement.innerHTML = "";
				}
			};
		}
	}, [
		graphData,
		handleResize,
		vectorGraphPreferences,
		LARGE_NODE_COUNT,
		setAnimationPaused,
		setLoading,
	]);
};

export const useHandleZoomToFit = (
	graphInstanceRef: MutableRefObject<ForceGraph3DInstance | null>,
) => {
	return useCallback(() => {
		if (graphInstanceRef.current) {
			graphInstanceRef.current.pauseAnimation();
			graphInstanceRef.current.zoomToFit(400);
			graphInstanceRef.current.resumeAnimation();
		}
	}, []);
};

const isNodeObject = (node: unknown): node is NodeObjectDirect => {
	return typeof node === "object" && node !== null && "id" in node;
};

const getNodeId = (
	node: string | number | NodeObjectDirect | undefined,
): string | number | undefined => {
	if (isNodeObject(node)) {
		const nodeId = node.id;
		return typeof nodeId === "string" || typeof nodeId === "number"
			? nodeId
			: undefined;
	}
	return node as string | number;
};

export const useHighlightNodes = (
	graphInstanceRef: MutableRefObject<ForceGraph3DInstance | null>,
	nodeIdsToHighlight: (string | number)[],
) => {
	useEffect(() => {
		if (graphInstanceRef.current) {
			const graph = graphInstanceRef.current;
			const highlightNodes = new Set<string | number>(
				nodeIdsToHighlight.map(String),
			);

			graph.nodeColor((node: CustomNodeObject) =>
				highlightNodes.has(String(node.id)) ? "red" : "green",
			);

			const isHighlightedLink = (link: CustomLinkObject) => {
				const sourceId = getNodeId(link.source);
				const targetId = getNodeId(link.target);
				return (
					(sourceId !== undefined && highlightNodes.has(String(sourceId))) ||
					(targetId !== undefined && highlightNodes.has(String(targetId)))
				);
			};

			graph.linkWidth((link: CustomLinkObject) =>
				isHighlightedLink(link) ? 5 : 1,
			);

			graph.linkDirectionalParticles((link: CustomLinkObject) =>
				isHighlightedLink(link) ? 4 : 0,
			);

			graph.linkColor((link: CustomLinkObject) =>
				isHighlightedLink(link) ? "orange" : "gray",
			);

			graph.refresh();
		}
	}, [graphInstanceRef, nodeIdsToHighlight]);
};

export const useFullscreen = (
	graphRef: MutableRefObject<HTMLDivElement | null>,
	isFullscreen: boolean,
	setIsFullscreen: (value: boolean | ((prev: boolean) => boolean)) => void,
	handleResize: () => void,
) => {
	const handleEscKey = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape" && document.fullscreenElement) {
				setIsFullscreen(false);
				document.exitFullscreen?.();
			}
		},
		[setIsFullscreen],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleEscKey);
		return () => {
			window.removeEventListener("keydown", handleEscKey);
		};
	}, [handleEscKey]);

	useEffect(() => {
		const handleFullscreenChange = () => {
			if (!document.fullscreenElement) {
				setIsFullscreen(false);
			}
			handleResize();
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, [handleResize, setIsFullscreen]);

	return useCallback(() => {
		if (graphRef.current) {
			if (!isFullscreen) {
				setIsFullscreen(true);
				return graphRef.current.requestFullscreen?.().then(handleResize);
			} else {
				setIsFullscreen(false);
				return document.exitFullscreen?.().then(handleResize);
			}
		}
	}, [isFullscreen, handleResize]);
};

export const useToggleAnimation = (
	graphInstanceRef: MutableRefObject<ForceGraph3DInstance | null>,
	animationPaused: boolean,
	setAnimationPaused: (value: boolean | ((prev: boolean) => boolean)) => void,
	handleResize: () => void,
) => {
	return useCallback(() => {
		if (graphInstanceRef.current) {
			if (animationPaused) {
				graphInstanceRef.current.resumeAnimation();
			} else {
				graphInstanceRef.current.pauseAnimation();
			}
			setAnimationPaused((prev: boolean) => !prev);
			handleResize();
		}
	}, [animationPaused, handleResize]);
};

export const useFullscreenChangeListener = (
	handleResize: () => void,
	loading: boolean,
	animationPaused: boolean,
) => {
	useEffect(() => {
		if (!loading && !animationPaused) {
			const handleFullscreenChange = () => {
				handleResize();
			};

			document.addEventListener("fullscreenchange", handleFullscreenChange);
			return () => {
				document.removeEventListener(
					"fullscreenchange",
					handleFullscreenChange,
				);
			};
		}
	}, [handleResize, loading, animationPaused]);
};
