import { Message, MessageSender } from "@/lib/types";

export const exampleSource: { message: Message } = {
  message: {
    id: "demo-source-1",
    sender: MessageSender.AVATAR,
    content: String.raw`# Source

Displays website sources used by AI-generated content, showing URL details, titles, and descriptions on hover.

---

## Examples

Below are Basic and Custom examples rendered with token-based theming.

### Basic Source

ibelick.com · google.com · figma.com · github.com · wikipedia.org

### Custom Source

12 · figma.com · G · Wikipedia

---

## Installation

Run:

~~~bash
npx shadcn add "https://prompt-kit.com/c/source.json"
~~~

---

## Component API

### Source
- href: string — The URL of the source
- children: React.ReactNode — The content to display

### SourceTrigger
- label?: string — The label to display
- showFavicon?: boolean = false — Whether to show the favicon
- className?: string — Additional CSS classes

### SourceContent
- title: string — The title to display
- description: string — The description to display
- className?: string — Additional CSS classes

---

ToolBlocks
`,
    jsx: String.raw`<div class="flex flex-col gap-4">
  {/* Basic usage (auto label from domain, no favicon) */}
  <Source href="https://nextjs.org/docs">
    <SourceTrigger />
    <SourceContent
      title="Next.js Documentation"
      description="Learn about the App Router, Data Fetching, and more."
    />
  </Source>

  {/* Basic group */}
  <div class="flex flex-wrap items-center gap-2">
    <Source href="https://ibelick.com"><SourceTrigger showFavicon /></Source>
    <Source href="https://google.com"><SourceTrigger showFavicon /></Source>
    <Source href="https://figma.com"><SourceTrigger showFavicon /></Source>
    <Source href="https://github.com"><SourceTrigger showFavicon /></Source>
    <Source href="https://wikipedia.org"><SourceTrigger showFavicon /></Source>
  </div>

  {/* Custom group */}
  <div class="flex flex-wrap items-center gap-2">
    <Source href="https://figma.com">
      <SourceTrigger label="12" />
      <SourceContent title="Mentions" description="Count of references" />
    </Source>
    <Source href="https://figma.com">
      <SourceTrigger label="figma.com" showFavicon />
      <SourceContent title="Figma" description="Interface design tool" />
    </Source>
    <Source href="https://google.com">
      <SourceTrigger label="G" showFavicon />
      <SourceContent title="Google" description="Search engine" />
    </Source>
    <Source href="https://wikipedia.org">
      <SourceTrigger label="Wikipedia" showFavicon />
      <SourceContent title="Wikipedia" description="Free encyclopedia" />
    </Source>
  </div>

  {/* Custom label */}
  <Source href="https://vercel.com/blog">
    <SourceTrigger label="Vercel Blog" />
    <SourceContent
      title="Engineering at Scale"
      description="Articles on performance, DX, and platform features."
    />
  </Source>

  {/* Show favicon */}
  <Source href="https://github.com/vercel/next.js">
    <SourceTrigger showFavicon label="vercel/next.js" />
    <SourceContent
      title="Next.js Repository"
      description="Issues, PRs, and releases for the framework."
    />
  </Source>

  {/* Compact row of sources */}
  <div class="flex flex-wrap items-center gap-2">
    <Source href="https://developer.mozilla.org">
      <SourceTrigger label="MDN" showFavicon />
      <SourceContent
        title="MDN Web Docs"
        description="Comprehensive resource for web platform docs."
      />
    </Source>
    <Source href="https://tailwindcss.com/docs">
      <SourceTrigger label="Tailwind" showFavicon />
      <SourceContent
        title="Tailwind CSS Documentation"
        description="Utility-first CSS framework documentation."
      />
    </Source>
    <Source href="https://shadcn.com/ui">
      <SourceTrigger label="shadcn/ui" showFavicon />
      <SourceContent
        title="shadcn/ui"
        description="Accessible, unstyled UI components for React."
      />
    </Source>
  </div>
</div>`,
  },
};
