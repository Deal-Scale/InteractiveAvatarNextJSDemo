import React, { useState } from "react";
import { Users } from "lucide-react";
import {
	targetAudienceData,
	predictAudienceData,
	TargetAudienceData,
} from "../data/engagement/targetAudience";

const demographicTypes = ["Gender", "Age Group", "Location"];

const TargetAudienceCard: React.FC<{
	data: TargetAudienceData;
	demographicType: string;
}> = ({ data, demographicType }) => {
	const demographics = predictAudienceData(data);

	const renderDemographicData = () => {
		switch (demographicType) {
			case "Gender":
				return (
					<div className="flex justify-between">
						<div className="text-center">
							<span className="text-4xl font-bold">
								{demographics.malePercentage}%
							</span>
							<span className="block text-sm text-muted-foreground">male</span>
						</div>
						<div className="text-center">
							<span className="text-4xl font-bold">
								{demographics.femalePercentage}%
							</span>
							<span className="block text-sm text-muted-foreground">
								female
							</span>
						</div>
					</div>
				);
			case "Age Group":
				return (
					<div>
						{Object.entries(demographics.ageGroup!).map(([ageRange, pct]) => (
							<div key={ageRange} className="flex justify-between">
								<span>{ageRange}</span>
								<span>{pct}%</span>
							</div>
						))}
					</div>
				);
			case "Location":
				return (
					<div>
						{Object.entries(demographics.location!).map(([loc, pct]) => (
							<div key={loc} className="flex justify-between">
								<span>{loc}</span>
								<span>{pct}%</span>
							</div>
						))}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="border-t border-border pt-4">
			<div className="mb-2">
				<h3 className="text-lg">
					Predicted {demographicType.toLowerCase()} of clients
				</h3>
			</div>
			{renderDemographicData()}
		</div>
	);
};

const TargetAudienceList: React.FC = () => {
	const [selectedAudience, setSelectedAudience] = useState<TargetAudienceData>(
		targetAudienceData[0],
	);
	const [selectedDemographic, setSelectedDemographic] = useState<string>(
		demographicTypes[0],
	);

	return (
		<div className="h-full overflow-auto rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
			<div className="chart-grid-drag-handle mb-4 flex cursor-move items-center gap-2 text-sm font-medium">
				<Users className="h-4 w-4 text-primary" />
				<span>Audience</span>
			</div>
			<div className="mb-4">
				<label htmlFor="audience-select" className="block text-sm mb-2">
					Select Audience Platform:
				</label>
				<select
					id="audience-select"
					onChange={(e) =>
						setSelectedAudience(targetAudienceData[e.target.selectedIndex])
					}
					className="w-full rounded-md border border-input bg-background p-2 text-foreground"
				>
					{targetAudienceData.map((data, index) => (
						<option key={index} value={data.name}>
							{data.name}
						</option>
					))}
				</select>
			</div>
			<div className="mb-4">
				<label htmlFor="demographic-select" className="block text-sm mb-2">
					Select Demographic:
				</label>
				<select
					id="demographic-select"
					onChange={(e) => setSelectedDemographic(e.target.value)}
					className="w-full rounded-md border border-input bg-background p-2 text-foreground"
				>
					{demographicTypes.map((type, index) => (
						<option key={index} value={type}>
							{type}
						</option>
					))}
				</select>
			</div>
			<TargetAudienceCard
				data={selectedAudience}
				demographicType={selectedDemographic}
			/>
		</div>
	);
};

export default TargetAudienceList;
