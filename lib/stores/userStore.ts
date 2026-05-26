import { create } from "zustand";

type CreditBucket = {
	allotted: number;
	used: number;
};

type UserStoreState = {
	credits: {
		ai: CreditBucket;
		video: CreditBucket;
		leads: CreditBucket;
		skipTraces: CreditBucket;
	};
};

export const useUserStore = create<UserStoreState>(() => ({
	credits: {
		ai: { allotted: 100, used: 0 },
		video: { allotted: 100, used: 0 },
		leads: { allotted: 100, used: 0 },
		skipTraces: { allotted: 100, used: 0 },
	},
}));
