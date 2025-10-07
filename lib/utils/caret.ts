// Simple caret positioning helper for a textarea.
// Note: This is an approximation that positions the popover near the bottom-left of the textarea
// when precise caret rect is not available. You can improve this with a mirror measurement if needed.
export function getTextareaAnchorRect(textarea: HTMLTextAreaElement): DOMRect {
	const rect = textarea.getBoundingClientRect();
	// Place anchor slightly above the bottom-left padding area
	const x = rect.left + 12; // padding-left approx
	const y = rect.bottom - 8; // a bit above bottom
	return new DOMRect(x, y, 0, 0);
}
