import { create } from "zustand";

export type EmbeddedUserLead = {
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

type UserLeadsState = {
	leads: EmbeddedUserLead[];
	setLeads: (leads: EmbeddedUserLead[]) => void;
};

export const useUserLeadsStore = create<UserLeadsState>((set) => ({
	leads: [],
	setLeads: (leads) => set({ leads }),
}));
