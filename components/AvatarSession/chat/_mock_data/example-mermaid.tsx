import { Message, MessageSender } from "@/lib/types";

export const exampleMermaid: { message: Message } = {
  message: {
    id: "demo-mermaid-1",
    sender: MessageSender.AVATAR,
    content: String.raw`# Mermaid (diagrams)

Render diagrams from markdown-like text inside JSX using the <Mermaid> component.

---

## Examples

- Flowchart
- Sequence diagram
- Git graph

---

Installation:

~~~bash
pnpm add mermaid
~~~
`,
    jsx: String.raw`<div className="flex flex-col gap-6">
  {/* Flowchart */}
  <div>
    <div className="mb-2 text-sm font-medium text-muted-foreground">Flowchart</div>
    <Mermaid>{\`
      flowchart LR
      A[Hard] -->|Text| B(Round)
      B --> C{Decision}
      C -->|One| D[Result 1]
      C -->|Two| E[Result 2]
    \`}</Mermaid>
  </div>

  {/* Sequence diagram */}
  <div>
    <div className="mb-2 text-sm font-medium text-muted-foreground">Sequence</div>
    <Mermaid>{\`
      sequenceDiagram
      Alice->>John: Hello John, how are you?
      loop HealthCheck
          John->>John: Fight against hypochondria
      end
      Note right of John: Rational thoughts!
      John-->>Alice: Great!
      John->>Bob: How about you?
      Bob-->>John: Jolly good!
    \`}</Mermaid>
  </div>

  {/* Git graph */}
  <div>
    <div className="mb-2 text-sm font-medium text-muted-foreground">Git graph</div>
    <Mermaid>{\`
      gitGraph
        commit
        commit
        branch develop
        checkout develop
        commit
        commit
        checkout main
        merge develop
        commit
        commit
    \`}</Mermaid>
  </div>
</div>`,
  },
};
