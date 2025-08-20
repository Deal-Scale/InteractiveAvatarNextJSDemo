Feature: Tags (array of strings) and Multi-Select UI debugging

Context:
- Goal: Ensure tags render as chip-style input and multi-select fields render with correct options and support multiple selection.
- Environment: Next.js + React 19 + react-hook-form + zod.

Primary files (external autoform package):
- components/external/zod-react-form-auto/src/utils/utils.ts
  - unwrapType logic; verified to unwrap only known wrappers.
- components/external/zod-react-form-auto/src/components/autofield/components/AutoField.tsx
  - Base type detection + rendering logic for enums, arrays, booleans, strings, etc.
- components/external/zod-react-form-auto/src/components/autofield/components/ArrayStringField.tsx
  - Chip-style input for string arrays; debug moved to useEffect to avoid invalid React child errors.
- components/external/zod-react-form-auto/src/components/autofield/components/SelectField.tsx
  - SimpleSelect and MultiSelect handling with RHF integration.
- components/external/zod-react-form-auto/src/components/autofield/utils/select.tsx
  - Low-level MultiSelect implementation using <select multiple>.

Secondary files (local forms layer):
- components/forms/utils.ts
  - Local unwrapType aligned to only unwrap wrappers.
- components/forms/AutoField.tsx
  - Alternative AutoField implementation with textarea fallback for array<string>.

Observed issues/notes:
- Past error: "Objects are not valid as a React child" caused by rendering non-React object in JSX (fixed by moving debug).
- Inconsistent unwrapType across paths caused arrays to be misdetected as strings in some flows.
- Multi-select should: for array<enum|string> with options, render MultiSelect and keep value in sync via RHF setValue.
- Tags should: render chips (ArrayStringField) with proper add/remove; verify no direct form object render in JSX.

Recent changes:
- Updated unwrapType in external and packages/autoform to unwrap only known wrappers.
- Ensured ArrayStringField logs are not rendered in JSX.

Pending validation:
- Verify tags chip add/remove works without React child errors.
- Verify favoriteColors multi-select displays options and supports multiple selection.
- Full page reload to clear any stale module cache.

Test entry points:
- components/external/zod-react-form-auto/src/examples/ExampleForm.tsx
  - Left: AutoForm - tags and favoriteColors via widgets
  - Right: Manual fields reference

Next ideas if issues persist:
- Add explicit widget mapping for array<string> to chips in AutoField path when options are absent.
- Strengthen guards in AutoField to never render non-React objects.
- Add unit tests for unwrapType against wrapped arrays and strings.
