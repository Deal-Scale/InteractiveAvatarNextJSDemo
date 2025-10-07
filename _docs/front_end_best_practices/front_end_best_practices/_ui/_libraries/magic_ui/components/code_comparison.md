Code Comparison

A component which compares two code snippets.

import { CodeComparison } from "@/registry/magicui/code-comparison";

const beforeCode = `import { NextRequest } from 'next/server';

export const middleware = async (req: NextRequest) => {
let user = undefined;
let team = undefined;
const token = req.headers.get('token');

if(req.nextUrl.pathname.startsWith('/auth')) {
user = await getUserByToken(token);

    if(!user) {
      return NextResponse.redirect('/login');
    }

}

if(req.nextUrl.pathname.startsWith('/team')) {
user = await getUserByToken(token);

    if(!user) {
      return NextResponse.redirect('/login');
    }

    const slug = req.nextUrl.query.slug;
    team = await getTeamBySlug(slug); // [!code highlight]

    if(!team) { // [!code highlight]
      return NextResponse.redirect('/'); // [!code highlight]
    } // [!code highlight]

} // [!code highlight]

return NextResponse.next(); // [!code highlight]
}

export const config = {
matcher: ['/((?!\_next/|\_static|\_vercel|[\\w-]+\\.\\w+).\*)'], // [!code highlight]
};`;

const afterCode = `import { createMiddleware, type MiddlewareFunctionProps } from '@app/(auth)/auth/\_middleware';
import { auth } from '@/app/(auth)/auth/\_middleware'; // [!code --]
import { auth } from '@/app/(auth)/auth/\_middleware'; // [!code ++]
import { team } from '@/app/(team)/team/\_middleware';

const middlewares = {
'/auth{/:path?}': auth,
'/team{/:slug?}': [ auth, team ],
};

export const middleware = createMiddleware(middlewares); // [!code focus]

export const config = {
matcher: ['/((?!\_next/|\_static|\_vercel|[\\w-]+\\.\\w+).\*)'],
};`;

export function CodeComparisonDemo() {
return (
<CodeComparison
      beforeCode={beforeCode}
      afterCode={afterCode}
      language="typescript"
      filename="middleware.ts"
      lightTheme="github-light"
      darkTheme="github-dark"
      highlightColor="rgba(101, 117, 133, 0.16)"
    />
);
}

Installation
Copy and paste the following code into your project.

"use client";

import { cn } from "@/lib/_utils";

import {
transformerNotationDiff,
transformerNotationFocus,
} from "@shikijs/transformers";
import { FileIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";

interface CodeComparisonProps {
beforeCode: string;
afterCode: string;
language: string;
filename: string;
lightTheme: string;
darkTheme: string;
highlightColor?: string;
}

export function CodeComparison({
beforeCode,
afterCode,
language,
filename,
lightTheme,
darkTheme,
highlightColor = "#ff3333",
}: CodeComparisonProps) {
const { theme, systemTheme } = useTheme();
const [highlightedBefore, setHighlightedBefore] = useState("");
const [highlightedAfter, setHighlightedAfter] = useState("");
const [hasLeftFocus, setHasLeftFocus] = useState(false);
const [hasRightFocus, setHasRightFocus] = useState(false);

const selectedTheme = useMemo(() => {
const currentTheme = theme === "system" ? systemTheme : theme;
return currentTheme === "dark" ? darkTheme : lightTheme;
}, [theme, systemTheme, darkTheme, lightTheme]);

useEffect(() => {
if (highlightedBefore || highlightedAfter) {
setHasLeftFocus(highlightedBefore.includes('class="line focused"'));
setHasRightFocus(highlightedAfter.includes('class="line focused"'));
}
}, [highlightedBefore, highlightedAfter]);

useEffect(() => {
async function highlightCode() {
try {
const { codeToHtml } = await import("shiki");
const { transformerNotationHighlight } = await import(
"@shikijs/transformers"
);

        const before = await codeToHtml(beforeCode, {
          lang: language,
          theme: selectedTheme,
          transformers: [
            transformerNotationHighlight({ matchAlgorithm: "v3" }),
            transformerNotationDiff({ matchAlgorithm: "v3" }),
            transformerNotationFocus({ matchAlgorithm: "v3" }),
          ],
        });
        const after = await codeToHtml(afterCode, {
          lang: language,
          theme: selectedTheme,
          transformers: [
            transformerNotationHighlight({ matchAlgorithm: "v3" }),
            transformerNotationDiff({ matchAlgorithm: "v3" }),
            transformerNotationFocus({ matchAlgorithm: "v3" }),
          ],
        });
        setHighlightedBefore(before);
        setHighlightedAfter(after);
      } catch (error) {
        console.error("Error highlighting code:", error);
        setHighlightedBefore(`<pre>${beforeCode}</pre>`);
        setHighlightedAfter(`<pre>${afterCode}</pre>`);
      }
    }
    highlightCode();

}, [beforeCode, afterCode, language, selectedTheme]);

const renderCode = (code: string, highlighted: string) => {
if (highlighted) {
return (
<div
style={{ "--highlight-color": highlightColor } as React.CSSProperties}
          className={cn(
            "h-full w-full overflow-auto bg-background font-mono text-xs",
            "[&>pre]:h-full [&>pre]:!w-screen [&>pre]:py-2",
            "[&>pre>code]:!inline-block [&>pre>code]:!w-full",
            "[&>pre>code>span]:!inline-block [&>pre>code>span]:w-full [&>pre>code>span]:px-4 [&>pre>code>span]:py-0.5",
            "[&>pre>code>.highlighted]:inline-block [&>pre>code>.highlighted]:w-full [&>pre>code>.highlighted]:!bg-[var(--highlight-color)]",
            "group-hover/left:[&>pre>code>:not(.focused)]:!opacity-100 group-hover/left:[&>pre>code>:not(.focused)]:!blur-none",
            "group-hover/right:[&>pre>code>:not(.focused)]:!opacity-100 group-hover/right:[&>pre>code>:not(.focused)]:!blur-none",
            "[&>pre>code>.add]:bg-[rgba(16,185,129,.16)] [&>pre>code>.remove]:bg-[rgba(244,63,94,.16)]",
            "group-hover/left:[&>pre>code>:not(.focused)]:transition-all group-hover/left:[&>pre>code>:not(.focused)]:duration-300",
            "group-hover/right:[&>pre>code>:not(.focused)]:transition-all group-hover/right:[&>pre>code>:not(.focused)]:duration-300",
          )}
          dangerouslySetInnerHTML={{ __html: highlighted }}
/>
);
} else {
return (
<pre className="h-full overflow-auto break-all bg-background p-4 font-mono text-xs text-foreground">
{code}
</pre>
);
}
};

return (
<div className="mx-auto w-full max-w-5xl">
<div className="group relative w-full overflow-hidden rounded-md border border-border">
<div className="relative grid md:grid-cols-2">
<div
className={cn(
"leftside group/left border-primary/20 md:border-r",
hasLeftFocus &&
"[&>div>pre>code>:not(.focused)]:!opacity-50 [&>div>pre>code>:not(.focused)]:!blur-[0.095rem]",
"[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300",
)} >
<div className="flex items-center border-b border-primary/20 bg-accent p-2 text-sm text-foreground">
<FileIcon className="mr-2 h-4 w-4" />
{filename}
<span className="ml-auto hidden md:block">before</span>
</div>
{renderCode(beforeCode, highlightedBefore)}
</div>
<div
className={cn(
"rightside group/right border-t border-primary/20 md:border-t-0",
hasRightFocus &&
"[&>div>pre>code>:not(.focused)]:!opacity-50 [&>div>pre>code>:not(.focused)]:!blur-[0.095rem]",
"[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300",
)} >
<div className="flex items-center border-b border-primary/20 bg-accent p-2 text-sm text-foreground">
<FileIcon className="mr-2 h-4 w-4" />
{filename}
<span className="ml-auto hidden md:block">after</span>
</div>
{renderCode(afterCode, highlightedAfter)}
</div>
</div>
<div className="absolute left-1/2 top-1/2 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-primary/20 bg-accent text-xs text-foreground md:flex">
VS
</div>
</div>
</div>
);
}

Usage

import { CodeComparison } from "@/components/magicui/code-comparison";

<CodeComparison beforeCode={beforeCode} afterCode={afterCode} />

Props
Prop Type Default Description
className string - The class name to be applied to the component
beforeCode string - The code snippet to display in the "before" section
afterCode string - The code snippet to display in the "after" section
language string - The language of the code snippets (e.g., "typescript")
filename string - The filename to display for the code snippets
lightTheme string github-light The theme to use for light mode
darkTheme string github-dark The theme to use for dark mode
highlightColor string rgba(101, 117, 133, 0.16) The color to use for highlighting the code snippets
