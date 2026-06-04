import React, { useState } from "react";
import { Users } from "lucide-react";
import {
	targetAudienceData,
	predictAudienceData,
	TargetAudienceData,
} from "../data/engagement/targetAudience";

const demographicTypes = ["Gender", "Age Group", "Location"];

// Mini donut chart (SVG) for gender split
function GenderDonut({ male, female }: { male: number; female: number }) {
	const size = 110;
	const radius = 42;
	const cx = size / 2;
	const cy = size / 2;
	const circumference = 2 * Math.PI * radius;
	const maleFraction = male / 100;
	const maleDash = maleFraction * circumference;
	const femaleDash = circumference - maleDash;

	return (
		<div className="flex flex-col items-center gap-3">
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				{/* Background circle */}
				<circle
					cx={cx}
					cy={cy}
					r={radius}
					fill="none"
					stroke="hsl(var(--muted))"
					strokeWidth={16}
				/>
				{/* Female arc (background) */}
				<circle
					cx={cx}
					cy={cy}
					r={radius}
					fill="none"
					stroke="hsl(var(--primary)/0.25)"
					strokeWidth={16}
					strokeDasharray={`${femaleDash} ${maleDash}`}
					strokeDashoffset={-maleDash}
					strokeLinecap="round"
					style={{ transition: "stroke-dasharray 0.5s ease" }}
				/>
				{/* Male arc */}
				<circle
					cx={cx}
					cy={cy}
					r={radius}
					fill="none"
					stroke="hsl(var(--primary))"
					strokeWidth={16}
					strokeDasharray={`${maleDash} ${femaleDash}`}
					strokeDashoffset="0"
					strokeLinecap="round"
					style={{ transition: "stroke-dasharray 0.5s ease" }}
					transform={`rotate(-90 ${cx} ${cy})`}
				/>
				<text
					x={cx}
					y={cy - 4}
					textAnchor="middle"
					className="fill-foreground"
					style={{ fontSize: 14, fontWeight: 700, fill: "currentColor" }}
				>
					{male}%
				</text>
				<text
					x={cx}
					y={cy + 14}
					textAnchor="middle"
					style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
				>
					male
				</text>
			</svg>
			<div className="flex flex-wrap items-center justify-center gap-2 text-xs">
				<span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 shadow-sm">
					<span className="block h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
					<span className="font-medium text-foreground">{male}% male</span>
				</span>
				<span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 shadow-sm">
					<span
						className="block h-2 w-2 flex-shrink-0 rounded-full"
						style={{ backgroundColor: "hsl(var(--primary) / 0.5)" }}
					/>
					<span className="font-medium text-foreground">{female}% female</span>
				</span>
			</div>
		</div>
	);
}

// Horizontal bar chart row
function BarRow({ label, value }: { label: string; value: number }) {
	return (
		<div className="mb-2">
			<div className="mb-0.5 flex items-center justify-between text-xs">
				<span className="text-muted-foreground">{label}</span>
				<span className="font-semibold text-foreground">{value}%</span>
			</div>
			<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
				<div
					className="h-2 rounded-full bg-primary transition-all duration-500 ease-out"
					style={{ width: `${value}%` }}
				/>
			</div>
		</div>
	);
}

const TargetAudienceCard: React.FC<{
	data: TargetAudienceData;
	demographicType: string;
}> = ({ data, demographicType }) => {
	const demographics = predictAudienceData(data);

	const renderDemographicData = () => {
		switch (demographicType) {
			case "Gender":
				return (
					<GenderDonut
						male={demographics.malePercentage ?? 50}
						female={demographics.femalePercentage ?? 50}
					/>
				);
			case "Age Group":
				return (
					<div className="mt-2 space-y-1">
						{Object.entries(demographics.ageGroup!).map(([ageRange, pct]) => (
							<BarRow key={ageRange} label={ageRange} value={pct} />
						))}
					</div>
				);
			case "Location":
				return (
					<div className="mt-2 space-y-1">
						{Object.entries(demographics.location!).map(([loc, pct]) => (
							<BarRow key={loc} label={loc} value={pct} />
						))}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="border-t border-border pt-4">
			<h3 className="mb-3 text-sm font-semibold text-foreground">
				Predicted {demographicType.toLowerCase()} of clients
			</h3>
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
			<div className="mb-3">
				<label
					htmlFor="audience-select"
					className="block text-xs mb-1.5 text-muted-foreground"
				>
					Select Audience Platform:
				</label>
				<select
					id="audience-select"
					onChange={(e) =>
						setSelectedAudience(targetAudienceData[e.target.selectedIndex])
					}
					className="w-full rounded-md border border-input bg-background p-2 text-foreground text-sm"
				>
					{targetAudienceData.map((data, index) => (
						<option key={index} value={data.name}>
							{data.name}
						</option>
					))}
				</select>
			</div>
			<div className="mb-4">
				<label
					htmlFor="demographic-select"
					className="block text-xs mb-1.5 text-muted-foreground"
				>
					Select Demographic:
				</label>
				<select
					id="demographic-select"
					onChange={(e) => setSelectedDemographic(e.target.value)}
					className="w-full rounded-md border border-input bg-background p-2 text-foreground text-sm"
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
