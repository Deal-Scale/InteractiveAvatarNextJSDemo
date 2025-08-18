import { Message, MessageSender } from "@/lib/types";

export const exampleJsxPreview: { message: Message } = {
  message: {
    id: "demo-jsx-preview-1",
    sender: MessageSender.AVATAR,
    content: String.raw`# JSX Preview

Render JSX strings as React components. Streaming supported with auto tag completion.
`,
    jsx: String.raw`<div class="flex flex-col gap-4">
  {/* Basic JSX using DataCard and MetricGrid */}
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
    <DataCard title="Users" value={"12,480"} hint="past 24h" />
    <DataCard title="Conversion" value={<span>3.9%</span>} hint="rolling 7d" />
  </div>

  <MetricGrid>
    <Metric label="Latency" value={<span>128ms</span>} />
    <Metric label="Cache hit" value={<span>94%</span>} />
    <Metric label="Errors" value={<span class='text-red-500'>0.12%</span>} />
  </MetricGrid>

  {/* Mixed: StatBadge inside JSXPreview */}
  <div class="flex items-center gap-2">
    <StatBadge label="Quality" value="A" hint="auto" />
    <StatBadge label="Freshness" value="98%" />
  </div>
</div>`,
  },
};
