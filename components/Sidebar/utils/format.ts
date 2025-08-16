export const compactNumberFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return compactNumberFormatter.format(n);
}
