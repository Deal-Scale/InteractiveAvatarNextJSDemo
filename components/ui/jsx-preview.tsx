import * as React from "react";
import JsxParser from "react-jsx-parser";

export type JSXPreviewProps = {
	jsx: string;
	isStreaming?: boolean;
	components?: Record<string, React.ComponentType<unknown>>;
} & React.HTMLAttributes<HTMLDivElement>;

function normalizePreviewJsx(jsx: string) {
	return jsx
		.replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
		.replace(/\sclass=/g, " className=");
}

function JSXPreview({
	jsx,
	className,
	components,
	isStreaming: _isStreaming,
	...props
}: JSXPreviewProps) {
	const [parseError, setParseError] = React.useState<Error | null>(null);
	const parserComponents = React.useMemo(() => components ?? {}, [components]);
	const normalizedJsx = React.useMemo(() => normalizePreviewJsx(jsx), [jsx]);

	React.useEffect(() => {
		setParseError(null);
	}, [normalizedJsx]);

	return (
		<div className={className} {...props}>
			{parseError ? (
				<pre className="whitespace-pre-wrap break-words text-xs">{jsx}</pre>
			) : (
				<JsxParser
					allowUnknownElements={false}
					autoCloseVoidElements
					components={parserComponents}
					jsx={normalizedJsx}
					onError={(error) => setParseError(error)}
				/>
			)}
		</div>
	);
}

export { JSXPreview };
