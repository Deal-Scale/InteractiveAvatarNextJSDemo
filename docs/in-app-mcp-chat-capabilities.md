# In-App MCP Chat Capabilities

This app supports a small set of in-app MCP-style actions from the basic chat. Use this guide to manually test tab switching and Kanban task creation from chat.

## What Is Available

The chat can execute these app capabilities:

| Capability | What it does |
| --- | --- |
| `switch_workspace_tab` | Switches the top workspace to `video`, `brain`, `data`, or `actions`. |
| `create_kanban_task` | Creates a task in the Actions Kanban board and switches to Actions. |
| `search_chat_resources` | Searches assets, knowledge bases, agents, or tools for chat usage. |
| `add_chat_resource` | Adds a matched resource to the chat composer. |
| `reference_chat_resource` | References a matched resource in the chat composer. |

There are two ways to trigger them:

1. Direct slash commands typed by you.
2. AI responses that include a fenced `app-action` block.

## Before Testing

1. Start the app with `pnpm run dev`.
2. Open `http://localhost:3000`.
3. Use basic chat mode.
4. Make sure the text provider is Pollinations in chat settings.

The app now defaults the text provider to Pollinations for testing. If an old browser session still shows OpenRouter, hard refresh or clear the old local storage key named `chat_provider_mode:text`.

## Direct Slash Commands

Open the chat input and try these commands.

### List App Capabilities

```text
/mcp app tools
```

Expected result: the chat replies with the supported app MCP commands.

### Switch Workspace Tabs

```text
/mcp app tab brain
```

```text
/mcp app tab data
```

```text
/mcp app tab actions
```

```text
/mcp app tab video
```

Expected result: the top workspace switches to the requested tab.
The bottom chat automatically stays open in a compact height so you can see the selected workspace while keeping chat available.

### Create a Kanban Task

```text
/mcp app task {"title":"Manual MCP test task","description":"Created from the chat command","dueDate":"2026-05-25","assignedToTeamMember":"Tyriq"}
```

Expected result: the app switches to Actions and creates the task on the Kanban board.

### Use the Generic Tool Command

```text
/mcp app tool switch_workspace_tab {"tab":"data"}
```

```text
/mcp app tool create_kanban_task {"title":"Generic tool task","description":"Created through /mcp app tool","dueDate":"2026-05-25"}
```

Expected result: same behavior as the shortcut commands.

## AI-Generated App Actions

Pollinations can also return structured action blocks. The chat strips the hidden action block from the visible answer, executes the action, and shows the user-facing response.

### Ask AI to Switch Tabs

Paste this into chat:

```text
Switch the workspace to the Brain tab using an app-action block.
```

Expected result: the app switches to Brain. A good model response should internally include something like:

````markdown
Opening Brain.

```app-action
{"tool":"switch_workspace_tab","args":{"tab":"brain"}}
```
````

### Ask AI to Create a Task

Paste this into chat:

```text
Create a Kanban task called "Follow up on MCP testing" due today, then open Actions.
```

Expected result: the app switches to Actions and adds a task. A good model response should internally include something like:

````markdown
I created the task and opened Actions.

```app-action
{"tool":"create_kanban_task","args":{"title":"Follow up on MCP testing","description":"Manual Pollinations MCP capability test","dueDate":"2026-05-25","priority":"medium"}}
```
````

### Ask AI to Execute Multiple Actions

Paste this into chat:

```text
Create a Kanban task named "Review Brain graph" and then switch me to the Brain tab.
```

Expected app-action shape:

````markdown
Done.

```app-action
[
  {
    "tool": "create_kanban_task",
    "args": {
      "title": "Review Brain graph",
      "description": "Check the graph view after MCP testing",
      "dueDate": "2026-05-25"
    }
  },
  {
    "tool": "switch_workspace_tab",
    "args": {
      "tab": "brain"
    }
  }
]
```
````

Expected result: the task is created, then the workspace ends on Brain.

## Supported JSON Shapes

### `switch_workspace_tab`

```json
{
  "tool": "switch_workspace_tab",
  "args": {
    "tab": "brain"
  }
}
```

Allowed `tab` values:

```text
video
brain
data
actions
```

### `create_kanban_task`

```json
{
  "tool": "create_kanban_task",
  "args": {
    "title": "Task title",
    "description": "Task details",
    "dueDate": "2026-05-25",
    "assignedToTeamMember": "Optional assignee",
    "priority": "medium"
  }
}
```

Required:

```text
title
```

Optional:

```text
description
dueDate
assignedToTeamMember
priority
```

If `dueDate` is missing, the app uses today.

## Troubleshooting

### Chat still uses OpenRouter

This usually means the browser has stale provider state from earlier testing. Fix it by doing one of these:

```js
localStorage.removeItem("chat_provider_mode:text")
localStorage.removeItem("chat_provider_mode:text:v2")
```

Then refresh the page. The default should be Pollinations.

### The AI describes an action but nothing happens

Check that the AI response includes a fenced block named `app-action` and valid JSON:

````markdown
```app-action
{"tool":"switch_workspace_tab","args":{"tab":"data"}}
```
````

The block must use one of these fence labels:

```text
app-action
app_action
app-actions
app_actions
```

### The slash command replies with usage help

The JSON was probably malformed. Keep the JSON on one line for manual tests:

```text
/mcp app task {"title":"One-line JSON works"}
```

### Task created but priority did not visibly change

The app-action prompt accepts `priority`, but the current Kanban store call only persists title, description, assignee, and due date. Treat priority as future metadata unless the Kanban schema is expanded.

## Source Files

- App capability parser and executor: `lib/app-capabilities.ts`
- Slash command handling: `components/AvatarSession/hooks/useMcpCommands.ts`
- Provider response execution: `components/AvatarSession/hooks/useChatController.ts`
- Regression tests: `lib/services/_tests/appCapabilities.test.ts`
- Chat resource capability guide: `docs/chat-resource-capabilities.md`
