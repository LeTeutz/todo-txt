/**
 * getTextareaCaretRect — compute the viewport-relative bounding rect
 * of the caret at a given index inside a <textarea>. Used to anchor
 * floating popovers (selection popover, autocomplete) to the real
 * caret position, not to the textarea's bounding box.
 *
 * Technique: render a hidden "mirror" <div> outside the viewport that
 * copies every relevant style from the textarea, insert a zero-width
 * marker at the caret index, measure the marker's rect, translate it
 * back to viewport coords accounting for the textarea's scrollTop/Left.
 *
 * This is the same approach used by the well-known
 * `textarea-caret-position` library (MIT, Jeff Schmaltz, 2015) adapted
 * to return a full DOMRect (with a synthesized height = line-height).
 *
 * Returns a DOMRect with:
 *   - left/top = caret position in viewport coords
 *   - width = 0
 *   - height = computed line-height of the textarea
 */

const MIRROR_STYLE_PROPS = [
  'boxSizing',
  'width', // explicitly set below to match clientWidth
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
  'MozTabSize',
  'whiteSpace',
  'wordWrap',
  'wordBreak',
] as const;

export function getTextareaCaretRect(
  textarea: HTMLTextAreaElement,
  index: number,
): DOMRect {
  const mirror = document.createElement('div');
  const style = window.getComputedStyle(textarea);

  // Copy relevant computed styles.
  for (const prop of MIRROR_STYLE_PROPS) {
    (mirror.style as unknown as Record<string, string>)[prop as string] =
      style.getPropertyValue(
        prop.replace(/([A-Z])/g, '-$1').toLowerCase(),
      );
  }

  // Pin the mirror off-screen, sized to match the textarea's *content*
  // box so wrapping behavior matches.
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';
  mirror.style.overflow = 'hidden';
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.height = 'auto';
  // For textareas, whiteSpace:pre-wrap is the right wrap model.
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordWrap = 'break-word';

  const before = textarea.value.substring(0, index);
  mirror.textContent = before;

  // Zero-width marker span at the caret position.
  const marker = document.createElement('span');
  marker.textContent = '\u200b'; // zero-width space so it occupies height
  mirror.appendChild(marker);

  document.body.appendChild(mirror);

  const markerRect = marker.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();
  const textareaRect = textarea.getBoundingClientRect();

  // Marker position relative to the mirror's content start.
  const relX = markerRect.left - mirrorRect.left;
  const relY = markerRect.top - mirrorRect.top;

  // Translate to textarea viewport coords, subtract scroll.
  const caretX = textareaRect.left + relX - textarea.scrollLeft;
  const caretY = textareaRect.top + relY - textarea.scrollTop;

  const lineHeight =
    parseFloat(style.lineHeight) ||
    parseFloat(style.fontSize) * 1.4 ||
    16;

  document.body.removeChild(mirror);

  return new DOMRect(caretX, caretY, 0, lineHeight);
}

/**
 * For selections that span a range, return a rect that covers the
 * visible selection (approximated as the caret rect at the END of the
 * selection, useful for anchoring a popover just below the end of the
 * selected text so it doesn't occlude the user's selection).
 */
export function getTextareaSelectionRect(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number,
): DOMRect {
  const startRect = getTextareaCaretRect(textarea, start);
  if (start === end) return startRect;
  const endRect = getTextareaCaretRect(textarea, end);
  // Combine: left = min of both, top = min, bottom = max, width = span.
  const left = Math.min(startRect.left, endRect.left);
  const top = Math.min(startRect.top, endRect.top);
  const bottom = Math.max(
    startRect.top + startRect.height,
    endRect.top + endRect.height,
  );
  const right = Math.max(startRect.left, endRect.left);
  return new DOMRect(left, top, right - left, bottom - top);
}
