export type KnowledgeTreeElement = {
	id: string;
	name: string;
	children?: KnowledgeTreeElement[];
};

export type KnowledgeItem = {
	id: string;
	name: string;
};

export const DEFAULT_KNOWLEDGE_TREE: KnowledgeTreeElement[] = [
	{
		id: "kb-guides",
		name: "Guides",
		children: [
			{ id: "kb-getting-started", name: "Getting Started" },
			{ id: "kb-integrations", name: "Integrations" },
		],
	},
	{
		id: "kb-faq",
		name: "FAQ",
		children: [{ id: "kb-general", name: "General" }],
	},
];

export function buildKnowledgeTree(
	createdKnowledgeItems: KnowledgeItem[],
): KnowledgeTreeElement[] {
	return [
		...DEFAULT_KNOWLEDGE_TREE,
		...(createdKnowledgeItems.length
			? [
					{
						id: "kb-created",
						name: "Added Knowledge",
						children: createdKnowledgeItems,
					},
				]
			: []),
	];
}

export function flattenKnowledgeTree(
	nodes: KnowledgeTreeElement[],
): KnowledgeItem[] {
	const out: KnowledgeItem[] = [];
	const walk = (node: KnowledgeTreeElement) => {
		if (node.children?.length) {
			for (const child of node.children) walk(child);
			return;
		}
		out.push({ id: node.id, name: node.name });
	};
	for (const node of nodes) walk(node);
	return out;
}
