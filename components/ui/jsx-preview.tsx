import type { TProps as JsxParserProps } from "react-jsx-parser";

import * as React from "react";
import JsxParser from "react-jsx-parser";

function matchJsxTag(code: string) {
  if (code.trim() === "") {
    return null;
  }

  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\s*([^>]*?)(\/)?>/;
  const match = code.match(tagRegex);

  if (!match || typeof match.index === "undefined") {
    return null;
  }

  const [fullMatch, tagName, attributes, selfClosing] = match;

  const type = selfClosing
    ? "self-closing"
    : fullMatch.startsWith("</")
      ? "closing"
      : "opening";

  return {
    tag: fullMatch,
    tagName,
    type,
    attributes: attributes.trim(),
    startIndex: match.index,
    endIndex: match.index + fullMatch.length,
  };
}

function completeJsxTag(code: string) {
  const stack: string[] = [];
  let result = "";
  let currentPosition = 0;

  while (currentPosition < code.length) {
    const match = matchJsxTag(code.slice(currentPosition));

    if (!match) break;
    const { tagName, type, endIndex } = match;

    if (type === "opening") {
      stack.push(tagName);
    } else if (type === "closing") {
      stack.pop();
    }

    result += code.slice(currentPosition, currentPosition + endIndex);
    currentPosition += endIndex;
  }

  // Append any trailing text that appears after the last parsed tag
  if (currentPosition < code.length) {
    result += code.slice(currentPosition);
  }

  // Auto-close any still-open tags to keep DOM valid during streaming
  return result + stack.reverse().map((tag) => `</${tag}>`).join("");
}

export type JSXPreviewProps = {
  jsx: string;
  isStreaming?: boolean;
  // Allow loose component typing to avoid React type incompatibilities across module boundaries
  components?: Record<string, React.ComponentType<any>>;
} & Omit<JsxParserProps, "components" | "jsx">;

function JSXPreview({ jsx, isStreaming = false, components, ...props }: JSXPreviewProps) {
  const processedJsx = React.useMemo(
    () => (isStreaming ? completeJsxTag(jsx) : jsx),
    [jsx, isStreaming],
  );

  // Cast JsxParser to any to work around the type incompatibility
  const Parser = JsxParser as unknown as React.ComponentType<JsxParserProps>;

  const forwarded: Partial<JsxParserProps> = {
    ...(props as unknown as Partial<JsxParserProps>),
    components: components as any,
    jsx: processedJsx,
    showWarnings: true,
    onError: (err: unknown) => (
      <pre className="text-xs text-red-500 whitespace-pre-wrap">
        {`JSX parse error: ${String(err)}`}
      </pre>
    ),
  };

  return <Parser {...(forwarded as JsxParserProps)} />;
}

export { JSXPreview };
