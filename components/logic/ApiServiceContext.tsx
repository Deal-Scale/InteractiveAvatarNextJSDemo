import React, {
	createContext,
	useContext,
	ReactNode,
	Dispatch,
	SetStateAction,
} from "react";

import { ApiService } from "@/lib/services/api";

interface ApiServiceContextType {
	apiService: ApiService | null;
	setApiService: Dispatch<SetStateAction<ApiService | null>>;
}

const ApiServiceContext = createContext<ApiServiceContextType | undefined>(
	undefined,
);

export const useApiService = () => {
	const context = useContext(ApiServiceContext);

	if (context === undefined) {
		throw new Error("useApiService must be used within an ApiServiceProvider");
	}

	return context;
};

interface ApiServiceProviderProps {
	children: ReactNode;
	service: ApiService | null;
	setApiService: Dispatch<SetStateAction<ApiService | null>>;
}

export const ApiServiceProvider: React.FC<ApiServiceProviderProps> = ({
	children,
	service,
	setApiService,
}) => {
	return (
		<ApiServiceContext.Provider value={{ apiService: service, setApiService }}>
			{children}
		</ApiServiceContext.Provider>
	);
};
