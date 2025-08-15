export const formatAttachmentSummary = (files: File[]) =>
  files
    .map((f) => `${f.name} (${Math.max(1, Math.round(f.size / 1024))} KB)`)
    .join(", ");
