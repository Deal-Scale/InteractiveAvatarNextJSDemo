# Markdown Debug Notes

- __Purpose__: Track and debug Markdown header visibility and copy UI in chat bubbles and reasoning panels.

## Where header is controlled
- __Component__: `components/ui/markdown.tsx` (`MarkdownComponent`)
  - Prop: `showHeader` (default true in component itself; callers may override)
  - Prop: `headerLabel` (default "Markdown")
  - Dev console logs: prints `[Markdown] render` with `{ invoker, showHeader, headerLabel, preview }`
- __Wrapper__: `components/ui/message.tsx` (`MessageContent`)
  - For `markdown` messages, passes `showHeader={(props as any)?.showHeader ?? false}`
  - Default is false inside bubbles unless explicitly set
- __Chat item__: `components/AvatarSession/MessageItem.tsx`
  - Passes `showHeader={avatarMarkdownShowHeader}` (from parent) to `MessageContent`
- __Chat list__: `components/AvatarSession/Chat.tsx`
  - Env flag: `NEXT_PUBLIC_MARKDOWN_HEADER_IN_BUBBLES` → `avatarMarkdownShowHeader`

## Enable header in bubbles
1. Set in `.env`:
   ```bash
   NEXT_PUBLIC_MARKDOWN_HEADER_IN_BUBBLES=true
   ```
2. Restart dev server to pick up env changes.
3. Check console for:
   - `[Markdown] render { invoker: "MessageContent", showHeader: true, headerLabel: "Markdown", ... }`

## Expected UI when enabled
- A small bar above the content with label (default: "Markdown") and a Copy button.

## Quick checks if header missing
- __Env not applied__: ensure server restarted; check `process.env.NEXT_PUBLIC_MARKDOWN_HEADER_IN_BUBBLES` in `Chat.tsx`.
- __Non-avatar messages__: user messages don’t render markdown with header.
- __Empty content in JSX branch__: header is only rendered if `message.content` exists.

## Console messages
- When `showHeader` is false, `markdown.tsx` logs:
  - `[Markdown] header hidden: showHeader is false. If this should be visible, pass showHeader or render Markdown directly.`

## Related files
- `components/ui/markdown.tsx`
- `components/ui/message.tsx`
- `components/AvatarSession/MessageItem.tsx`
- `components/AvatarSession/Chat.tsx`

## Recent fixes
- JSX parsing hardened in `components/ui/jsx-preview.tsx` (comment stripping, normalization).
- Mock JSX simplified in `components/AvatarSession/chat/_mock_data/example-jsx-preview.ts` to avoid parser errors.
