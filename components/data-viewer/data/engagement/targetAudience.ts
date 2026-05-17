export interface DemographicData {
	malePercentage?: number;
	femalePercentage?: number;
	ageGroup?: { [key: string]: number };
	location?: { [key: string]: number };
}

export interface TargetAudienceData {
	name: string;
	demographics: DemographicData;
}

export const targetAudienceData: TargetAudienceData[] = [
	{
		name: "Instagram",
		demographics: {
			malePercentage: 32,
			femalePercentage: 68,
			ageGroup: { "18-24": 30, "25-34": 40 },
			location: { USA: 50, Canada: 20 },
		},
	},
	{
		name: "Google Ads",
		demographics: {
			malePercentage: 45,
			femalePercentage: 55,
			ageGroup: { "18-24": 20, "25-34": 50 },
			location: { USA: 40, Canada: 30 },
		},
	},
	{
		name: "Facebook Ads",
		demographics: {
			ageGroup: { "18-24": 25, "25-34": 35 },
			location: { USA: 60, Canada: 25 },
		},
	},
	{
		name: "Twitter",
		demographics: {
			malePercentage: 60,
			femalePercentage: 40,
			ageGroup: { "18-24": 15, "25-34": 25 },
			location: { USA: 70, Canada: 10 },
		},
	},
	{
		name: "LinkedIn",
		demographics: {
			ageGroup: { "18-24": 10, "25-34": 20 },
			location: { USA: 30, Canada: 15 },
		},
	},
];

export const predictAudienceData = (
	platform: TargetAudienceData,
): DemographicData => ({
	malePercentage: platform.demographics.malePercentage ?? 50,
	femalePercentage: platform.demographics.femalePercentage ?? 50,
	ageGroup: platform.demographics.ageGroup ?? { "18-24": 25, "25-34": 25 },
	location: platform.demographics.location ?? { USA: 30, Canada: 10 },
});
