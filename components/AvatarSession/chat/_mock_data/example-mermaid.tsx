import { Message, MessageSender } from "@/lib/types";

export const exampleMermaid: { message: Message } = {
  message: {
    id: "demo-mermaid-1",
    sender: MessageSender.AVATAR,
    content: String.raw`# Mermaid diagrams

Rendered via <Mermaid> inside JSXPreview.
`,
    jsx: String.raw`<div class="flex flex-col gap-6">
  <div>
    <div class="mb-2 text-sm font-medium text-muted-foreground">Flowchart</div>
    <Mermaid>
      flowchart LR
      A[Hard] --&gt;|Text| B(Round)
      B --&gt; C&#123;Decision&#125;
      C --&gt;|One| D[Result 1]
      C --&gt;|Two| E[Result 2]
    </Mermaid>
  </div>

  <div>
    <div class="mb-2 text-sm font-medium text-muted-foreground">Sequence</div>
    <Mermaid>
      sequenceDiagram
      Alice-&gt;&gt;John: Hello John, how are you?
      loop HealthCheck
          John-&gt;&gt;John: Fight against hypochondria
      end
      Note right of John: Rational thoughts!
      John--&gt;&gt;Alice: Great!
      John-&gt;&gt;Bob: How about you?
      Bob--&gt;&gt;John: Jolly good!
    </Mermaid>
  </div>

  <div>
    <div class="mb-2 text-sm font-medium text-muted-foreground">Git graph</div>
    <Mermaid>
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
    </Mermaid>
  </div>
</div>`,
  },
};
