import { BarChart3 } from "lucide-react";
import React, { useState } from "react";
import { TrafficData, trafficData } from "../data/engagement/traffic";

type TrafficListProps = {
	headerAction?: React.ReactNode;
};

const calculatePercentage = (value: number, goal: number): number =>
	Math.round((value / goal) * 100);

const TrafficCard: React.FC<{ data: TrafficData }> = ({ data }) => {
	const pct = calculatePercentage(data.value, data.goal);
	return (
		<div className="border-t border-border pt-4">
			<div className="mb-2">
				<h3 className="text-lg">
					{data.name} -{" "}
					<span className="text-sm text-muted-foreground">
						{data.description}
					</span>
				</h3>
			</div>
			<div className="mb-4 flex items-center justify-between">
				<span className="text-4xl font-bold">+{pct}%</span>
			</div>
			<div className="relative mb-4 h-1 w-full bg-muted">
				<div
					className="absolute left-0 top-0 h-1 bg-primary"
					style={{ width: `${pct}%` }}
				/>
			</div>
			<div className="flex justify-between">
				{data.trend.map((value, index) => (
					<div
						key={index}
						className="bg-primary"
						style={{ width: "2px", height: `${value}px` }}
					/>
				))}
			</div>
		</div>
	);
};

const TrafficList: React.FC<TrafficListProps> = ({ headerAction }) => {
	const [selectedTraffic, setSelectedTraffic] = useState<TrafficData>(
		trafficData[0],
	);

	return (
		<div className="h-full overflow-auto rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
			<div className="chart-grid-drag-handle mb-4 flex cursor-move items-center justify-between gap-2 text-sm font-medium">
				<div className="flex min-w-0 items-center gap-2">
					<BarChart3 className="h-4 w-4 shrink-0 text-primary" />
					<span className="min-w-0 break-words">Traffic</span>
				</div>
				{headerAction}
			</div>
			<div className="mb-4">
				<label htmlFor="traffic-select" className="mb-2 block text-sm">
					Select Traffic Platform:
				</label>
				<select
					id="traffic-select"
					onChange={(e) =>
						setSelectedTraffic(trafficData[e.target.selectedIndex])
					}
					className="w-full rounded-md border border-input bg-background p-2 text-foreground"
				>
					{trafficData.map((data, index) => (
						<option key={index} value={data.name}>
							{data.name}
						</option>
					))}
				</select>
			</div>
			<TrafficCard data={selectedTraffic} />
		</div>
	);
};

export default TrafficList;
