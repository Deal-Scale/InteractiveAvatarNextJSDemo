# Markdown Debug Notes

- __Purpose__: Track and debug Markdown header visibility and copy UI in chat bubbles and reasoning panels.

## Where header is controlled
- __Component__: `components/ui/markdown.tsx` (`MarkdownComponent`)
  - Prop: `showHeader` (now controlled by caller; see below)
  - Prop: `headerLabel` (default "Markdown")
  - Dev console logs: prints `[Markdown] render` with `{ invoker, showHeader, headerLabel, preview }`
- __Wrapper__: `components/ui/message.tsx` (`MessageContent`)
  - For `markdown` messages, passes `showHeader={(props as any)?.showHeader ?? false}`
  - Default header is __false__ unless explicitly set by the caller
- __Chat item__: `components/AvatarSession/MessageItem.tsx`
  - Detects markdown using `isStrictMarkdown(content)`
  - Sets `markdown={isStrictMarkdown(content)}` on `MessageContent`
  - Sets header via: `showHeader = isStrictMarkdown(content)` (env flag no longer forces header)
  - Dev logs: `[MessageItem] markdown-detect { isStrictMarkdown, reason, ... }` where `reason` is one of `fence|table|null`
- __Chat list__: `components/AvatarSession/Chat.tsx`
  - Env flag: `NEXT_PUBLIC_MARKDOWN_HEADER_IN_BUBBLES` → `avatarMarkdownShowHeader`

## Current Markdown detection (strict)
- __Triggers only on__:
  - Fenced code blocks: ````` or `~~~`
  - Proper tables: a table row (e.g., `| a | b |`) AND a separator line (e.g., `| --- | --- |`)
- __Does NOT trigger on__:
  - Headings (`#`), lists, inline code, links/images, blockquotes, or horizontal rules

Short or simple sentences are treated as plain text.

### Quick test inputs
- Should trigger header:
  - Code fence:
    ```
    ```ts
    console.log('hi')
    ```
    ```
  - Proper table:
    |
    | Col A | Col B |
    | --- | --- |
    | a | b |
- Should NOT trigger header:
  - `# Title` (heading only)
  - `- item` (list only)
  - `Hi there` (plain text)

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

## Quick checks if header is incorrect
- __Env not applied__: ensure server restarted; check `process.env.NEXT_PUBLIC_MARKDOWN_HEADER_IN_BUBBLES` in `Chat.tsx`.
- __Header shows but content is plain__: `isLikelyMarkdown(content)` may be hitting weak signals. Verify content length (≥ 60) and the presence of multiple cues. Adjust heuristic if needed.
- __Header missing for real Markdown__: Ensure the message actually includes a strong signal (fences/headings/tables) or enough weak cues. Also confirm `MessageItem` is passing the correct content string.
- __Non-avatar messages__: user messages render as plain text; header not used there.
- __Empty content in JSX branch__: header is only considered if `message.content` exists.

## Console messages
- When `showHeader` is false, `markdown.tsx` logs:
  - `[Markdown] header hidden: showHeader is false. If this should be visible, pass showHeader or render Markdown directly.`

## Related files
- `components/ui/markdown.tsx`
- `components/ui/message.tsx`
- `components/AvatarSession/MessageItem.tsx`
- `components/AvatarSession/Chat.tsx`

## Recent fixes
- `MessageContent` now respects `showHeader` from callers instead of forcing it.
- Markdown detection heuristic added and tightened to reduce false positives.
- JSX parsing hardened in `components/ui/jsx-preview.tsx` (comment stripping, normalization).
- Mock JSX simplified in `components/AvatarSession/chat/_mock_data/example-jsx-preview.ts` to avoid parser errors.
