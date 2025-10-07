# AutoForm/AutoField Debug Log

This document tracks what we tried, what worked, what didn’t, and how to collect logs to diagnose the “all fields render as single-line input” issue.

## What we changed

- AutoForm (`components/forms/AutoForm.tsx`)
  - Marked as client component: "use client"
  - Zod shape access handles both forms:
    - `schema._def.shape()` (function)
    - `schema.shape` (object)
  - Dev logs per field: `console.debug('AutoForm field', key, def?._def?.typeName)`
- AutoField (`components/forms/AutoField.tsx`)
  - Marked as client component: "use client"
  - Detection uses `._def.typeName` (avoids instanceof issues)
  - Dev logs per field: `console.debug('AutoField detect', { name, typeName })`
- Utils (`components/forms/utils.ts`)
  - `unwrapType()` logs unwrapping trace: wrappers encountered and final base type

## How to capture logs

1) Open the app and navigate to the Session Config modal → Agent tab.
2) Open the browser devtools console.
3) You should see logs similar to:
   - `AutoForm field temperature ZodNumber`
   - `AutoField detect { name: 'temperature', typeName: 'ZodNumber' }`
   - `unwrapType trace { wrappers: ['ZodOptional'], base: 'ZodNumber' }`
4) Copy the first 15–25 lines and paste them into the task thread.

## What we expect by field

- temperature → ZodNumber (widget: slider)
- quality → ZodNativeEnum
- voiceChatTransport → ZodNativeEnum
- language → ZodString (with options → select)
- mcpServers → ZodArray(el: ZodString) (with options → multi-select)
- systemPrompt → ZodString described as multiline → textarea
- disableIdleTimeout → ZodBoolean (render select when widget==='select')

## If everything still shows as ZodString

- Hypothesis: we might be receiving pre-parsed form schema (string-coerced) or unresolved shape. Next steps:
  - Confirm the schema being passed to AutoForm is exactly `AgentConfigSchema`.
  - Check for mismatched Zod instances or duplicate installs.
  - Normalize zod import in `lib/schemas/agent.ts` to `import { z } from 'zod'`.

## Triage checklist (next)

- [ ] Collect console logs for a few fields (temperature, quality, voiceChatTransport, language)
- [ ] If typeNames are wrong, trace via `unwrapType trace` to see wrappers
- [ ] If typeNames are right but rendering is wrong, inspect rendering branches in `AutoField.tsx`
- [ ] If shape is undefined, log `schema` and confirm `_def.shape()` vs `.shape`

## Findings (fill this in as we go)

- Observation:
- Suspected cause:
- Fix applied:
- Result:

