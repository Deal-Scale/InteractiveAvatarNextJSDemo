import React, {
	createContext,
	useReducer,
	useContext,
	ReactNode,
	useEffect,
} from "react";
import { MNode } from "../types";
import { defaultNodeTree } from "./graphUtils";

export const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export interface GraphContextState {
	selectedSite: "CRM" | "CMS";
	theme: "dark" | "light";
	selectedNodeTree: MNode;
}

type Action =
	| { type: "SET_SELECTED_SITE"; payload: "CRM" | "CMS" }
	| { type: "SET_THEME"; payload: "dark" | "light" }
	| { type: "SET_NODE_TREE"; payload: MNode };

const initialState: GraphContextState = {
	selectedSite: "CRM",
	theme: "dark",
	selectedNodeTree: deepClone(defaultNodeTree),
};

const reducer = (
	state: GraphContextState,
	action: Action,
): GraphContextState => {
	switch (action.type) {
		case "SET_SELECTED_SITE":
			return { ...state, selectedSite: action.payload };
		case "SET_THEME":
			return { ...state, theme: action.payload };
		case "SET_NODE_TREE":
			return { ...state, selectedNodeTree: deepClone(action.payload) };
		default:
			return state;
	}
};

const DataViewerContext = createContext<{
	state: GraphContextState;
	dispatch: React.Dispatch<Action>;
}>({
	state: initialState,
	dispatch: () => null,
});

DataViewerContext.displayName = "DataViewerContext";

interface DataViewerProviderProps {
	children: ReactNode;
	// Optional: host app can inject its own initial node tree
	initialNodeTree?: MNode;
}

export const DataViewerProvider: React.FC<DataViewerProviderProps> = ({
	children,
	initialNodeTree,
}) => {
	const [state, dispatch] = useReducer(reducer, {
		...initialState,
		selectedNodeTree: initialNodeTree
			? deepClone(initialNodeTree)
			: deepClone(defaultNodeTree),
	});

	// Re-sync if host app passes a new node tree
	useEffect(() => {
		if (initialNodeTree) {
			dispatch({ type: "SET_NODE_TREE", payload: initialNodeTree });
		}
	}, [initialNodeTree]);

	return (
		<DataViewerContext.Provider value={{ state, dispatch }}>
			{children}
		</DataViewerContext.Provider>
	);
};

export const useDataViewerContext = () => useContext(DataViewerContext);

export const setNodeTree = (
	dispatch: React.Dispatch<Action>,
	nodeTree: MNode,
) => {
	dispatch({ type: "SET_NODE_TREE", payload: nodeTree });
};
