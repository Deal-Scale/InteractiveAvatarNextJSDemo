import * as React from "react";

export type JSXPreviewProps = {
	jsx: string;
	isStreaming?: boolean;
	components?: Record<string, React.ComponentType<unknown>>;
} & React.HTMLAttributes<HTMLDivElement>;

function JSXPreview({ jsx, className, ...props }: JSXPreviewProps) {
	return (
		<div className={className} {...props}>
			<pre className="whitespace-pre-wrap break-words text-xs">{jsx}</pre>
		</div>
	);
}

export { JSXPreview };
