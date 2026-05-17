"use client";

type ConfettiProps = {
	className?: string;
	options?: Record<string, unknown>;
	globalOptions?: Record<string, unknown>;
};

export function Confetti({ className }: ConfettiProps) {
	return (
		<div
			aria-hidden
			className={className}
			style={{
				background:
					"radial-gradient(circle at 20% 20%, hsl(var(--primary)) 0 2px, transparent 3px), radial-gradient(circle at 80% 30%, hsl(var(--accent)) 0 2px, transparent 3px), radial-gradient(circle at 45% 70%, hsl(var(--secondary)) 0 2px, transparent 3px)",
			}}
		/>
	);
}
