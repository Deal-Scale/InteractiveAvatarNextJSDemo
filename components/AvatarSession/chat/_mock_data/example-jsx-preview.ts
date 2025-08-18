import { Message, MessageSender } from "@/lib/types";

export const exampleJsxPreview: { message: Message } = {
  message: {
    id: "demo-jsx-preview-1",
    sender: MessageSender.AVATAR,
    content: String.raw`# JSX Preview

Render JSX strings as React components. Streaming supported with auto tag completion.
`,
    jsx: String.raw`<div class="flex flex-col gap-4">
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
    <DataCard title="Users" value="12,480" hint="past 24h" />
    <DataCard title="Conversion" value="3.9%" hint="rolling 7d" />
  </div>

  <MetricGrid>
    <Metric label="Latency" value="128ms" />
    <Metric label="Cache hit" value="94%" />
    <Metric label="Errors" value="0.12%" />
  </MetricGrid>

  <div class="flex items-center gap-2">
    <StatBadge label="Quality" value="A" hint="auto" />
    <StatBadge label="Freshness" value="98%" />
  </div>
</div>`,
  },
};
