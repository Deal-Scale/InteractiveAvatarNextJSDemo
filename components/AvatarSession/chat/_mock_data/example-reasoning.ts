import { Message, MessageSender } from "@/lib/types";

export const exampleReasoning = {
  message: {
    id: "demo-reasoning-1",
    sender: MessageSender.AVATAR,
    content:
      "Here's an example response with hidden chain-of-thought available in the Reasoning panel.",
    sources: [
      {
        href: "#",
        title: "Reasoning Demo",
        description: "Synthetic example with chain-of-thought UI",
      },
    ],
  } as Message,
  reasoningMarkdown: true,
  reasoning: `### Chain of Thought (condensed)

- Parsed the user's question for key entities and intents.
- Selected the appropriate tool and parameters.
- Evaluated two candidate answers; picked the one with higher confidence.
- Justified the final output and noted assumptions.

---

#### Tool calls
- fetchRelatedDocs(query="theming tokens")
- rankByRelevance(topK=3)

#### Notes
- Prioritized accessibility and token-based design per guidelines.
`,
};
