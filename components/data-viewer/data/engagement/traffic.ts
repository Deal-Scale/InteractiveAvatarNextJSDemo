export interface TrafficData {
	name: string;
	description: string;
	value: number;
	goal: number;
	trend: number[];
}

export const trafficData: TrafficData[] = [
	{
		name: "Instagram",
		description: "the most traffic platform",
		value: 7500,
		goal: 10000,
		trend: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
	},
	{
		name: "Google Ads",
		description: "popular for advertising",
		value: 4600,
		goal: 10000,
		trend: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95],
	},
	{
		name: "Facebook Ads",
		description: "widely used for social media ads",
		value: 3400,
		goal: 10000,
		trend: [7, 17, 27, 37, 47, 57, 67, 77, 87, 97],
	},
];
