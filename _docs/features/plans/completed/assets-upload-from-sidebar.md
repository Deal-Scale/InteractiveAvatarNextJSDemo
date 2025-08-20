# Plan: Upload and Attach Assets from Assets Sidebar

## Summary
Enable users to upload images/files from the sidebar and attach them into chat messages. Items appear in an Assets panel (with previews/metadata) and can be inserted into the composer via drag-and-drop or click-to-attach.

## Scope
- Frontend: Sidebar assets panel UI, upload flow, progress, error handling, previews, attach-to-message interaction.
- Backend: Simple upload API, storage location (local dev folder), metadata response, size/type limits.
- Chat composer: show attached assets as chips with remove controls.

## Non-Goals
- External storage providers (S3/GCS) — follow-up.
- Image processing (thumb generation server-side) — out-of-scope; rely on browser previews.

## Relevant Code
- Sidebar UI: `components/Sidebar/`
- File tree/preview: `components/magicui/file-tree.tsx`
- Chat session: `components/AvatarSession.tsx`
- API routes: `app/api/`

## UX Flow
1) User clicks “Upload” in Assets sidebar or drags files onto the sidebar drop zone.
2) Files upload with a progress indicator. On success, asset appears in the list with name, size, type, and preview (if image).
3) User attaches to the chat composer by:
   - Dragging asset into the composer, or
   - Clicking an “Attach” button on the asset row/card.
4) Composer shows chips (thumbnail + filename). Sending a message includes attached asset references.

## Data Model (frontend)
```ts
export type AssetItem = {
  id: string;           // uuid
  name: string;
  type: string;         // mime
  size: number;         // bytes
  url: string;          // public path for preview/download
  createdAt: number;    // epoch ms
};
```

## API
- POST `app/api/uploads/route.ts` — multipart form-data
  - Request: files[]
  - Response: `{ assets: AssetItem[] }`
- GET `app/api/uploads/[id]/route.ts` (optional for metadata)
- Static serving from `/public/uploads/{id-filename}` in dev

Validation
- Max files per request: 5
- Max size per file: 10MB
- Allowed types: images (png, jpg, jpeg, webp, gif), pdf, txt, md

## Tech Plan
- Sidebar
  - Create `components/Sidebar/AssetsSection.tsx` that lists `AssetItem`s with upload button + drop zone.
  - Reuse/extend `components/magicui/file-tree.tsx` for listing where feasible.
  - Progress UI, error toasts.
- State
  - `lib/stores/` add `assets.ts` (Zustand) to cache list per session.
  - On mount, hydrate from localStorage; after upload, push new items.
- Upload
  - Implement `lib/services/api.ts` helper `uploadAssets(files: File[])` -> `AssetItem[]`.
  - API route saves to `/public/uploads/` with safe filenames; returns metadata + URL.
- Composer integration
  - Add attach target to `components/AvatarSession.tsx` input area.
  - Support drag-over styling; on drop, either upload ad-hoc or attach from existing `AssetItem`.
  - Show attached chips with remove.
- Message payload
  - Extend existing send function to include `assets: AssetItem[]` alongside text.

## User Story
As a user, I want to upload files in the sidebar and quickly attach them to my chat message so that I can share visual context without leaving the conversation.

## Gherkin Acceptance Criteria
```gherkin
Feature: Upload and attach assets from the Assets sidebar

  Scenario: Upload succeeds and asset appears
    Given I am viewing the Assets sidebar
    When I upload a valid image file under 10MB
    Then I see an upload progress indicator
    And when the upload completes
    Then the asset appears in the list with a preview and size

  Scenario: Attach asset to composer
    Given an asset is visible in the Assets sidebar
    When I click Attach on that asset
    Then the composer shows the asset as an attached chip

  Scenario: Drag and drop to composer
    Given I have the composer visible
    When I drag an asset from the sidebar into the composer
    Then the composer shows the asset as an attached chip

  Scenario: Validation error on large file
    Given I try to upload a file larger than 10MB
    Then I see an error toast explaining the size limit

  Scenario: Send message with attachment
    Given I have one or more assets attached in the composer
    When I send the message
    Then the message payload includes the assets metadata
```

## Edge Cases
- Duplicate filenames: prefix with UUIDs; always unique `id`.
- Unsupported MIME: surface clear error.
- Aborted upload: allow retry.

## QA Checklist
- Upload png/jpg/webp/pdf/txt.
- Attach via click and drag-and-drop.
- Remove chip restores composer state.
- Mobile drag disabled (see mobile plan); fallback to tap-to-attach.
