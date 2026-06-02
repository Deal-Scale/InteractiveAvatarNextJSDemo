# Task MCP Runtime Capabilities

Kanban AI tasks can resolve MCP tools and resources while they are running. The runtime looks at the task itself, the attached workflow definition, and any explicit MCP markers in the task text.

## What It Resolves

The task runtime can execute:

- workflow tools listed in `mcpWorkflow.functions`
- workflow resources listed in `mcpWorkflow.resources`
- explicit inline references in task text
- plain-language references that clearly match a workflow tool or resource
- plain-language references that match the app catalog, including agents, assets, knowledge items, and connector tools such as GitHub, Notion, and Google Drive

## Supported Reference Forms

### Explicit Tool Marker

```text
[MCP:sms.send({"message":"Follow up"})]
```

### Explicit Resource Marker

```text
[MCPRESOURCE:/knowledge/pricing-guide]
```

### Plain-Language References

If the task text says something like:

- "send the SMS follow-up"
- "use the pricing guide resource"
- "run the voice call workflow"

the runtime will try to match those words against the task workflow's tool names, descriptions, signatures, and resource metadata.

## Matching Rules

The runtime resolves references from the task's own workflow definition, task text, and the current app catalog.

This keeps the behavior predictable and adaptive:

- exact bracket markers always win
- explicit workflow tools and resources are always included
- plain-language inference only fires when the wording clearly matches a workflow item
- app-catalog matches are limited to clear name or id matches, so unrelated items are not auto-called
- connector tools are only executed when the tool is marked connected in the app state; otherwise they stay visible as unavailable references
- the connector catalog comes from the live app registry, so renamed or reconfigured connectors are picked up automatically

## What Happens During Execution

When you start an AI task:

1. The task is marked running.
2. MCP references are collected.
3. Each referenced tool is called through the MCP tool endpoint.
4. Each referenced resource is read through the MCP resource endpoint.
5. App-catalog resources are recorded as resolved references and shown in the task summary.
6. Connector tools are only executed when the app has an active connection for that connector key.
7. A summary is written back to the task runtime state.

The task modal also shows the referenced tools and resources before you run it.

## Example

```text
Title: Send follow-up
Description: Use the SMS workflow and the pricing guide resource.
```

If the task workflow contains:

- tool: `sms.send`
- resource: `/knowledge/pricing-guide`

the runtime will resolve both while the task is running.

If the task text mentions a matching app-catalog item such as "Sales Assistant" or "Google Drive", the runtime will also surface that match while the task is running.
If "Google Drive" is not connected in the tool registry, it will still be detected, but it will not be executed until you connect it from the tool modal.
The same rule applies to GitHub, Notion, and any future connector added to `KB_CONNECTORS`.

## Testing

The reference collector is covered in:

- [components/kanban/utils/__tests__/mcpRuntime.test.ts](../components/kanban/utils/__tests__/mcpRuntime.test.ts)

Run it with:

```bash
pnpm exec vitest run components/kanban/utils/__tests__/mcpRuntime.test.ts --config vitest.config.mts
```

## Manual Test Prompts

Use these in a Kanban AI task or the chat composer to verify the connector flow.

### Connected Tool Test

```text
Run this task using Google Drive and then summarize the result.
```

Expected result:

- the runtime detects `Google Drive`
- if Google Drive is connected, the tool executes
- the task summary shows the connector as resolved

### Disconnected Tool Test

```text
Use GitHub to inspect the repository, then continue.
```

Expected result:

- the runtime detects `GitHub`
- if GitHub is not connected, it is shown as unavailable
- the tool is not executed until you connect it

### Adaptive Catalog Test

```text
Review the Sales Assistant agent and reference Notion, Google Drive, and the pricing guide knowledge base.
```

Expected result:

- the runtime resolves the agent, connector tools, and knowledge base items from the live app catalog
- connected connectors are executed
- disconnected connectors remain visible but inactive
- updated connector definitions are picked up automatically from the current registry
