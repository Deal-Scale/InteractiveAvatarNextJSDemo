import type React from "react";

interface InputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"onChange" | "value" | "type"
	> {
	value: string | undefined | null;
	onChange: (value: string) => void;
	className?: string;
}

export const Input = (props: InputProps) => {
	const { className, placeholder, value, onChange, ...rest } = props;
	return (
		<input
			{...rest}
			className={`w-full text-foreground text-sm bg-muted py-2 px-6 rounded-lg outline-none ${className ?? ""}`}
			placeholder={placeholder}
			type="text"
			value={value ?? ""}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
};
