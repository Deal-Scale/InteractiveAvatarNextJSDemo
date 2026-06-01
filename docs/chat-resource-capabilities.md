# Chat Resource MCP Capabilities

The chat can search for app resources and attach them directly to the composer through structured MCP-style actions.

## Supported Capabilities

| Capability | What it does |
| --- | --- |
| `search_chat_resources` | Searches assets, knowledge bases, agents, or tools and returns matching resources. |
| `add_chat_resource` | Adds a matched resource to the chat composer as an attachment badge. |
| `reference_chat_resource` | Adds a resource as a chat reference using the same composer attachment path. |

## Resource Types

The capability layer can search and attach these resource types:

- `asset`
- `knowledge`
- `agent`
- `tool`
- `all`

## How To Use

You can trigger these capabilities from a model response by returning a fenced `app-action` block.

### Search For A Resource

````markdown
Find the Sales assistant and attach it to the chat.

```app-action
{"tool":"search_chat_resources","args":{"resourceType":"agent","query":"Sales","limit":5}}
```
````

Expected result: the app searches the local resource catalog and returns matching agents.

### Add A Resource To Chat

````markdown
Add the pricing guide knowledge base to the message composer.

```app-action
{"tool":"add_chat_resource","args":{"resourceType":"knowledge","query":"pricing guide"}}
```
````

Expected result: the resource is attached to the chat composer as a badge.

### Reference A Resource

````markdown
Reference the demo image asset in this reply.

```app-action
{"tool":"reference_chat_resource","args":{"resourceType":"asset","id":"asset-1"}}
```
````

Expected result: the matching asset is attached in the composer so the chat can reference it.

## Recommended Flow

1. Use `search_chat_resources` when the resource name is ambiguous.
2. Use `add_chat_resource` when the user wants the item attached to the chat.
3. Use `reference_chat_resource` when the user wants the item cited or referenced in the conversation.

## Data Sources

The search catalog is built from the same local state used by the UI:

- assets from the assets store
- knowledge bases and folders from the session store
- configured agents from the agent store
- available tools from the connector catalog

## Testing

The behavior is covered in [lib/services/_tests/appCapabilities.test.ts](../lib/services/_tests/appCapabilities.test.ts).

Run the test file directly:

```bash
pnpm exec vitest run lib/services/_tests/appCapabilities.test.ts --config vitest.config.mts
```
