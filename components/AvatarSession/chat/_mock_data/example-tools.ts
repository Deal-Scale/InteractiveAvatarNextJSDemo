import { Message, MessageSender } from "@/lib/types";

export const exampleTools: {
  message: Message;
} = {
  message: {
    id: "demo-tools-1",
    sender: MessageSender.AVATAR,
    content: "Invoked several tools (including MCP) to fulfill your request. Details below:",
    toolParts: [
      {
        type: "web.search",
        state: "input-streaming",
        input: { query: "latest news about Next.js 15" },
        toolCallId: "tool-call-001",
      },
      {
        type: "web.search",
        state: "input-available",
        input: { query: "latest news about Next.js 15" },
        toolCallId: "tool-call-001",
      },
      {
        type: "web.fetch",
        state: "output-available",
        input: { url: "https://nextjs.org/blog" },
        output: {
          status: 200,
          title: "Next.js Blog",
          count: 10,
        },
        toolCallId: "tool-call-002",
      },
      {
        type: "summarize.extract",
        state: "output-error",
        input: { maxTokens: 256 },
        errorText: "Rate limit exceeded. Please retry in a moment.",
        toolCallId: "tool-call-003",
      },
      // Additional states and tools
      {
        type: "github.search_issues",
        state: "input-available",
        input: { repo: "vercel/next.js", q: "label:bug state:open" },
        toolCallId: "tool-call-004",
      },
      {
        type: "db.query",
        state: "input-streaming",
        input: { sql: "SELECT id, title FROM posts LIMIT 3" },
        toolCallId: "tool-call-005",
      },
      {
        type: "db.query",
        state: "output-available",
        input: { sql: "SELECT id, title FROM posts LIMIT 3" },
        output: {
          rows: [
            { id: 1, title: "Hello World" },
            { id: 2, title: "Using MCP" },
            { id: 3, title: "Tooling Demo" },
          ],
          rowCount: 3,
        },
        toolCallId: "tool-call-005",
      },
      // MCP-specific examples
      {
        type: "mcp.list_resources",
        state: "output-available",
        input: {},
        output: {
          resources: [
            { uri: "file:///README.md", mimeType: "text/markdown" },
            { uri: "env://OPENAI_API_KEY", mimeType: "text/plain" },
          ],
        },
        toolCallId: "tool-call-006",
      },
      {
        type: "mcp.tool.call",
        state: "output-available",
        input: { name: "search_web", args: { query: "nextjs app dir docs" } },
        output: { hits: 5, top: { title: "App Router", url: "https://nextjs.org/docs/app" } },
        toolCallId: "tool-call-007",
      },
      {
        type: "mcp.tool.call",
        state: "output-error",
        input: { name: "secret_action", args: {} },
        errorText: "Unauthorized: missing scope 'admin:write'",
        toolCallId: "tool-call-008",
      },
    ],
    sources: [
      {
        href: "https://nextjs.org/blog",
        title: "Next.js Blog",
        description: "Official announcements and release notes.",
      },
    ],
  },
};
