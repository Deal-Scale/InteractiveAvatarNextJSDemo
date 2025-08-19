interface FieldProps {
	label: string;
	children: React.ReactNode;
	tooltip?: string;
}

export const Field = (props: FieldProps) => {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-muted-foreground text-sm">{props.label}</span>
			{props.children}
		</div>
	);
};
