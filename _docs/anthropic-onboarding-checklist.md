# Claude API Onboarding Checklist

Use this checklist when onboarding engineers to the Anthropic integration. Keep the list updated alongside `docs/anthropic-api-guide.md`.

## Access & Secrets
- [ ] Confirm Anthropic account approval and add the engineer to the Claude workspace.
- [ ] Provision a scoped API key and share via 1Password.
- [ ] Configure `.env.local` with `ANTHROPIC_API_KEY`, `ANTHROPIC_VERSION`, and optional `ANTHROPIC_BETA`.

## Local Environment
- [ ] Run `pnpm install` to sync dependencies.
- [ ] Copy sample fixtures into MSW by running `pnpm vitest run app/api/anthropic/tests/anthropic-client.test.ts`.
- [ ] Verify `pnpm dev` bootstraps without missing env warnings.

## Development Workflow
- [ ] Review `app/api/anthropic/client.ts` and `zod-schemas.ts` for validation rules.
- [ ] Practice sending a message using the mock request in `mocks/anthropic/messages-basic-request.json`.
- [ ] Trigger the streaming example via `client.streamMessage` and inspect chunk ordering.

## Observability & Safety
- [ ] Confirm log sanitization (no raw prompts) in local output.
- [ ] Review retry/backoff strategy in the calling service.
- [ ] Walk through rate limit monitoring dashboards.

## Compliance
- [ ] Acknowledge Anthropic acceptable use policies.
- [ ] Document data retention expectations for any cached responses.
- [ ] Schedule quarterly key rotation reminders.

## Sign-off
- [ ] Open a PR updating the `README` with any new learnings.
- [ ] Add the engineer to the Claude integration PagerDuty rotation.
- [ ] Schedule a follow-up pairing session after the first production change.
