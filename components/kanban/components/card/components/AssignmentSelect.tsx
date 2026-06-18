"use client";

import { mockTeamMembers } from "../../../utils/mocks";

export function AssignmentSelect({
	value,
	onChange,
}: {
	value: string;
	onChange: (val: string) => void;
}) {
	return (
		<div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-sm">
			<span className="my-2 font-semibold">Assigned To: </span>
			<select
				value={value || ""}
				onChange={(e) => onChange(e.target.value)}
				className="min-w-0 max-w-full flex-1 rounded border p-1"
			>
				<option value="" disabled>
					Select team member
				</option>
				{mockTeamMembers.map((member) => (
					<option key={member.id} value={member.id}>
						{`${member.firstName} ${member.lastName}`}
					</option>
				))}
			</select>
		</div>
	);
}
