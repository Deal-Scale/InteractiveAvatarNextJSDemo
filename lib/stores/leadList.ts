import { create } from "zustand";

export type EmbeddedLead = {
	id?: string;
	contactInfo?: {
		address?: string;
		firstName?: string;
		lastName?: string;
	};
	address1?: {
		fullStreetLine?: string;
	};
};

export type EmbeddedLeadList = {
	id: string;
	listName?: string;
	leads?: EmbeddedLead[];
};

type LeadListState = {
	leadLists: EmbeddedLeadList[];
	setLeadLists: (leadLists: EmbeddedLeadList[]) => void;
};

export const useLeadListStore = create<LeadListState>((set) => ({
	leadLists: [],
	setLeadLists: (leadLists) => set({ leadLists }),
}));
