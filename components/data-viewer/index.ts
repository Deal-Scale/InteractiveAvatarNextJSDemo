// Types
export * from "./types";

// Viewer
export { default as DataViewer } from "./DataViewer";

// Graph data utilities
export {
	transformNodeTreeToGraphData,
	defaultNodeTree,
	defaultGraphData,
} from "./data/graphUtils";

// Context
export {
	DataViewerProvider,
	useDataViewerContext,
	setNodeTree,
	deepClone,
} from "./data/context";
export type { GraphContextState } from "./data/context";

// Analytics components
export { default as PlatformList } from "./analytics/PlatformList";
export { default as TrafficList } from "./analytics/TrafficList";
export { default as TargetAudienceList } from "./analytics/TargetAudienceList";

// Raw mock data
export { mockPlatforms } from "./data/engagement/sites";
export { trafficData } from "./data/engagement/traffic";
export {
	targetAudienceData,
	predictAudienceData,
} from "./data/engagement/targetAudience";
export type { TrafficData } from "./data/engagement/traffic";
export type {
	TargetAudienceData,
	DemographicData,
} from "./data/engagement/targetAudience";
