// Analytics component types
export interface Platform {
	name: string;
	value: number;
	goal: number;
}

export interface EngagementGroup {
	[key: string]: Platform[];
}

// Target audience types
export interface AudienceMetric {
	platform: string;
	demographic: string;
	value: string | number;
	description: string;
}

// Traffic types
export interface TrafficSource {
	name: string;
	value: number;
	change: number;
}

// Graph node tree types
export interface MNode {
	id: string;
	name: string;
	value: number;
	children?: MNode[];
}

export interface GraphNodeData {
	id: string;
	name: string;
	val?: number;
	color?: string;
}

export interface GraphLinkData {
	source: string;
	target: string;
	color?: string;
}

export interface GraphData {
	nodes: GraphNodeData[];
	links: GraphLinkData[];
}
