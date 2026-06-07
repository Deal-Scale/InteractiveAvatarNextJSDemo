import * as React from "react";
import JsxParser from "react-jsx-parser";

export type JSXPreviewProps = {
	jsx: string;
	isStreaming?: boolean;
	components?: Record<string, React.ComponentType<unknown>>;
} & React.HTMLAttributes<HTMLDivElement>;

function JSXPreview({
	jsx,
	className,
	components,
	isStreaming: _isStreaming,
	...props
}: JSXPreviewProps) {
	const [parseError, setParseError] = React.useState<Error | null>(null);
	const parserComponents = React.useMemo(
		() => components ?? {},
		[components],
	);

	return (
		<div className={className} {...props}>
			{parseError ? (
				<pre className="whitespace-pre-wrap break-words text-xs">{jsx}</pre>
			) : (
				<JsxParser
					allowUnknownElements={false}
					autoCloseVoidElements
					components={parserComponents}
					jsx={jsx}
					onError={(error) => setParseError(error)}
				/>
			)}
		</div>
	);
}

export { JSXPreview };
