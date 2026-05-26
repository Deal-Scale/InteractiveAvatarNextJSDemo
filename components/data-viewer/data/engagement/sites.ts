import { EngagementGroup } from "../../types";

export const mockPlatforms: EngagementGroup = {
	Likes: [
		{ name: "Instagram", value: 7500, goal: 10000 },
		{ name: "Google Ads", value: 4600, goal: 10000 },
		{ name: "Facebook Ads", value: 3400, goal: 10000 },
		{ name: "Twitter", value: 2300, goal: 10000 },
		{ name: "LinkedIn", value: 1200, goal: 10000 },
	],
	Comments: [
		{ name: "Instagram", value: 1500, goal: 5000 },
		{ name: "Google Ads", value: 900, goal: 5000 },
		{ name: "Facebook Ads", value: 700, goal: 5000 },
		{ name: "Twitter", value: 500, goal: 5000 },
		{ name: "LinkedIn", value: 300, goal: 5000 },
	],
	Shares: [
		{ name: "Instagram", value: 800, goal: 2000 },
		{ name: "Google Ads", value: 500, goal: 2000 },
		{ name: "Facebook Ads", value: 400, goal: 2000 },
		{ name: "Twitter", value: 300, goal: 2000 },
		{ name: "LinkedIn", value: 200, goal: 2000 },
	],
};
