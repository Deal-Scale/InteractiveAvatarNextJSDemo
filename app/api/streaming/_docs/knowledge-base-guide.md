# Knowledge Base Integration Guide

## Overview

This guide explains how to integrate and switch between knowledge bases in your HeyGen streaming avatar sessions.

## How Knowledge Base IDs Work

When starting an avatar session, you can provide a Knowledge Base ID that the avatar will use to answer questions with context from your knowledge base.

### Field Mapping

The system supports multiple field names for compatibility:
- `knowledgeId` (camelCase - used by SDK)
- `knowledge_base_id` (snake_case - used by HeyGen API)
- `knowledge_base_ids` (array format - for multiple KBs)

Both fields are automatically synchronized when you set the knowledge base in the UI.

## Setting Knowledge Base in UI

### Agent Settings Tab

1. Open the **Session Configuration Modal**
2. Navigate to the **Agent** tab
3. Find the **Knowledge Base ID** field
4. Enter your HeyGen Knowledge Base ID
5. Click **Save Settings**

The knowledge base ID is automatically:
- Saved to localStorage
- Applied to new sessions
- Synced between the agent store and session config

### Quick Start Card

You can also set the knowledge base when starting a session:

1. Click on the **Settings** icon in the avatar panel
2. Enter the **Knowledge Base ID** in the optional field
3. Click **Start Session**

## API Usage

### Creating a Session with Knowledge Base

```bash
POST /api/streaming/new
Content-Type: application/json

{
  "avatar_id": "your-avatar-id",
  "knowledge_base_id": "your-kb-id",
  "voice": {
    "rate": 1.5,
    "emotion": "Friendly"
  }
}
```

### Response

```json
{
  "session_id": "abc123...",
  "access_token": "xyz789...",
  "url": "wss://...",
  "knowledge_base_id": "your-kb-id"
}
```

## Switching Knowledge Bases

To switch knowledge bases between sessions:

1. **Stop the current session**
   ```typescript
   await stopSession();
   ```

2. **Update the agent configuration**
   ```typescript
   updateAgent({ knowledgeBaseId: 'new-kb-id' });
   ```

3. **Start a new session**
   ```typescript
   await startSession(config);
   ```

## Code Examples

### TypeScript/React

```typescript
import { useAgentStore } from '@/lib/stores/agent';
import { useStreamingAvatarSession } from '@/components/logic/useStreamingAvatarSession';

function MyComponent() {
  const { updateAgent } = useAgentStore();
  const { startAvatar, stopAvatar } = useStreamingAvatarSession();

  const switchKnowledgeBase = async (newKbId: string) => {
    // Stop current session
    await stopAvatar();
    
    // Update knowledge base
    updateAgent({ knowledgeBaseId: newKbId });
    
    // Start new session with updated KB
    await startAvatar({
      avatarName: 'avatar-id',
      knowledge_base_id: newKbId,
      quality: 'medium',
    });
  };

  return (
    <button onClick={() => switchKnowledgeBase('kb-123')}>
      Switch to KB 123
    </button>
  );
}
```

### Direct API Call

```typescript
// Get access token
const tokenRes = await fetch('/api/get-access-token', { 
  method: 'POST' 
});
const token = await tokenRes.text();

// Create session with knowledge base
const sessionRes = await fetch('/api/streaming/new', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    avatar_id: 'your-avatar-id',
    knowledge_base_id: 'your-kb-id',
    voice: {
      rate: 1.5,
      emotion: 'Friendly'
    }
  })
});

const session = await sessionRes.json();
console.log('Session started with KB:', session.knowledge_base_id);
```

## Debugging

### Browser Console

Check the browser console for knowledge base ID logs:

```
[DEBUG] Starting avatar session with config: {...}
[DEBUG] Knowledge Base ID: your-kb-id
```

### Server Logs

Check your server logs for the request body being sent to HeyGen:

```
[DEBUG] Request body: {
  "avatar_id": "...",
  "knowledge_base_id": "your-kb-id",
  ...
}
```

## Knowledge Base Management

### Creating Knowledge Bases

Knowledge bases are created and managed through the HeyGen platform:

1. Go to https://app.heygen.com/knowledge-base
2. Click **Create Knowledge Base**
3. Upload documents or add URLs
4. Copy the **Knowledge Base ID**
5. Use this ID in your avatar sessions

### Supported Content Types

- PDF documents
- Text files
- Web URLs
- Markdown files

## Best Practices

1. **Cache Knowledge Base IDs**: Store frequently used KB IDs in your app configuration
2. **Validate KB IDs**: Check that the KB ID exists before starting a session
3. **Handle Errors**: Implement proper error handling for invalid KB IDs
4. **Session Cleanup**: Always stop sessions before switching knowledge bases
5. **User Feedback**: Show loading states when switching knowledge bases

## Troubleshooting

### Knowledge Base Not Working

**Symptoms**: Avatar doesn't use knowledge base context

**Solutions**:
1. Verify the KB ID is correct
2. Check browser console for the KB ID in debug logs
3. Ensure the KB has been fully processed by HeyGen
4. Verify your API key has access to the knowledge base

### Session Fails with KB ID

**Symptoms**: Session creation fails when KB ID is provided

**Solutions**:
1. Check that the KB ID format is valid (usually alphanumeric)
2. Verify the knowledge base exists in your HeyGen account
3. Check API key permissions
4. Try creating a session without KB ID to isolate the issue

## Related APIs

- `POST /api/streaming/new` - Create session with KB
- `POST /api/get-access-token` - Get auth token
- `POST /api/streaming/task` - Send chat messages
- `POST /api/streaming/stop` - Stop session

## Additional Resources

- [HeyGen Knowledge Base Documentation](https://docs.heygen.com/reference/knowledge-base)
- [Agent Configuration Schema](../../../lib/schemas/agent.ts)
- [Session Config Utilities](../../../components/modals/session/utils.ts)

