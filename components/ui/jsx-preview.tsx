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
  // Normalize HTML-ish attributes to JSX-compatible ones and complete tags during streaming
  const processedJsx = React.useMemo(() => {
    const base = isStreaming ? completeJsxTag(jsx) : jsx;
    // Remove JSX block comments which react-jsx-parser may not handle reliably in strings
    const withoutComments = base
      // Remove JSX block comments
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
      // Remove HTML comments
      .replace(/<!--([\s\S]*?)-->/g, "");
    // Replace attribute names only when used as attributes (followed by =) to avoid replacing text content
    let out = withoutComments
      .replace(/\bclass=/g, "className=")
      .replace(/\bfor=/g, "htmlFor=");
    // Expand boolean shorthand for known attributes that may confuse the parser
    // e.g., <SourceTrigger showFavicon /> -> <SourceTrigger showFavicon={true} />
    out = out.replace(/\bshowFavicon(\s*)(\/?>)/g, (_m, ws: string, tail: string) => `showFavicon={true}${ws}${tail}`);
    return out;
  }, [jsx, isStreaming]);

  // Cast JsxParser to any to work around the type incompatibility
  const Parser = JsxParser as unknown as React.ComponentType<JsxParserProps>;

  const forwarded: Partial<JsxParserProps> = {
    ...(props as unknown as Partial<JsxParserProps>),
    components: components as any,
    jsx: processedJsx,
    // Be permissive: our JSX comes from models/mock data and may include unknown tags/attrs
    allowUnknownElements: true,
    autoCloseVoidElements: true,
    renderInWrapper: false,
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
