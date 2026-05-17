import React, { useState } from "react";
import { Network } from "lucide-react";
import { mockPlatforms } from "../data/engagement/sites";
import { Platform } from "../types";

const calculatePercentage = (value: number, goal: number): number =>
	(value / goal) * 100;

const PlatformList: React.FC = () => {
	const [selectedEngagement, setSelectedEngagement] = useState<string>("Likes");
	const engagementTypes = Object.keys(mockPlatforms);

	return (
		<div className="h-full overflow-auto rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
			<div className="chart-grid-drag-handle mb-4 flex cursor-move items-center gap-2 text-sm font-medium">
				<Network className="h-4 w-4 text-primary" />
				<span>Platforms</span>
			</div>
			<div className="mb-4">
				<label htmlFor="engagement-select" className="block text-sm mb-2">
					Select Engagement Type:
				</label>
				<select
					id="engagement-select"
					value={selectedEngagement}
					onChange={(e) => setSelectedEngagement(e.target.value)}
					className="w-full rounded-md border border-input bg-background p-2 text-foreground"
				>
					{engagementTypes.map((type, idx) => (
						<option key={idx} value={type}>
							{type}
						</option>
					))}
				</select>
			</div>
			<h3 className="mb-4 text-lg">{`List of platforms (${selectedEngagement})`}</h3>
			{mockPlatforms[selectedEngagement]
				.slice(0, 3)
				.map((platform: Platform, index: number) => (
					<div key={index} className="mb-2">
						<div className="flex justify-between py-1 hover:text-primary">
							<span>{platform.name}</span>
							<span>{platform.value.toLocaleString()}</span>
						</div>
						<div className="relative h-1 w-full bg-muted mb-2">
							<div
								className="absolute top-0 left-0 h-1 bg-primary"
								style={{
									width: `${calculatePercentage(platform.value, platform.goal)}%`,
								}}
							/>
						</div>
					</div>
				))}
			{mockPlatforms[selectedEngagement].length > 3 && (
				<div className="mt-2 flex items-center">
					<span>+{mockPlatforms[selectedEngagement].length - 3} more</span>
					<button className="ml-2 rounded-md border border-border bg-background px-2 py-1 hover:bg-muted">
						View all
					</button>
				</div>
			)}
		</div>
	);
};

export default PlatformList;
