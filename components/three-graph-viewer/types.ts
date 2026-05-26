export type NodeObjectDirect = object & {
	id?: string | number;
	index?: number;
	x?: number;
	y?: number;
	z?: number;
	vx?: number;
	vy?: number;
	vz?: number;
	fx?: number;
	fy?: number;
	fz?: number;
};

export type LinkObjectDirect = object & {
	source?: string | number | NodeObjectDirect;
	target?: string | number | NodeObjectDirect;
	index?: number;
};

export interface CustomLinkObject extends LinkObjectDirect {
	color?: string;
	value?: number;
}

export interface CustomNodeObject extends NodeObjectDirect {
	color?: string;
	name?: string;
	group?: string | number;
	val?: number;
}

export interface GraphData {
	nodes: CustomNodeObject[];
	links: CustomLinkObject[];
}
