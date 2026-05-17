import { MNode, GraphData, GraphNodeData, GraphLinkData } from "../types";

// Simple helper to create nodes
const createNode = (
	id: string,
	name: string,
	value: number,
	children: MNode[] = [],
): MNode => ({
	id,
	name,
	value,
	children,
});

// Default mock tree — works out-of-the-box with no external data
export const defaultNodeTree: MNode = createNode("root", "Root", 5, [
	createNode("a", "Alpha", 3, [
		createNode("a1", "Alpha-1", 2),
		createNode("a2", "Alpha-2", 1),
	]),
	createNode("b", "Beta", 4, [createNode("b1", "Beta-1", 2)]),
	createNode("c", "Gamma", 3, [
		createNode("c1", "Gamma-1", 1),
		createNode("c2", "Gamma-2", 2),
	]),
]);

// Transform a nested MNode tree into flat graph data for use with 3d-force-graph
export const transformNodeTreeToGraphData = (node: MNode): GraphData => {
	const nodes: GraphNodeData[] = [];
	const links: GraphLinkData[] = [];

	const traverse = (currentNode: MNode, parentNode?: MNode) => {
		nodes.push({
			id: currentNode.id,
			name: currentNode.name,
			val: currentNode.value,
			color: "green",
		});
		if (parentNode) {
			links.push({
				source: parentNode.id,
				target: currentNode.id,
				color: "gray",
			});
		}
		currentNode.children?.forEach((child) => traverse(child, currentNode));
	};

	traverse(node);
	return { nodes, links };
};

// Ready-to-use default graph data
export const defaultGraphData: GraphData =
	transformNodeTreeToGraphData(defaultNodeTree);
