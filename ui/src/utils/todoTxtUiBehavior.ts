import type { EditorView } from '@codemirror/view';

import { toggleDone } from '../components/cm-vim-todotxt';

type ShortcutEvent = Pick<
  KeyboardEvent,
  'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'
>;

/** True for exactly one platform modifier: Ctrl or Command, never both. */
export function hasPrimaryModifier(event: ShortcutEvent): boolean {
  return event.ctrlKey !== event.metaKey;
}

export function isHelpRailShortcut(event: ShortcutEvent): boolean {
  return (
    hasPrimaryModifier(event) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key === '/'
  );
}

/**
 * Cmd/Ctrl+D toggles a task outside Vim mode. In Vim mode Ctrl+D must remain
 * the standard half-page-down command; macOS Command+D is not a Vim binding
 * and may still toggle the task.
 *
 * That left Vim users on Linux and Windows with NO modifier shortcut at all —
 * only the `\x` leader command — because they have no Command key. So in Vim
 * mode Ctrl+SHIFT+D is accepted as well: it is not a Vim normal-mode binding,
 * it is available on every platform, and it cannot be confused with the
 * half-page scroll. Outside Vim mode it stays refused, so the plain
 * Cmd/Ctrl+D remains the single obvious binding there.
 */
export function isToggleDoneShortcut(
  event: ShortcutEvent,
  vimMode: boolean,
): boolean {
  if (
    !hasPrimaryModifier(event) ||
    event.altKey ||
    event.key.toLowerCase() !== 'd'
  ) {
    return false;
  }
  if (event.shiftKey) {
    // Ctrl+Shift+D: the cross-platform Vim-mode escape hatch, Vim mode only.
    return vimMode && event.ctrlKey;
  }
  return !(vimMode && event.ctrlKey);
}

export function bindHelpRailShortcut(
  onToggle: () => void,
  target: Window = window,
): () => void {
  const onKey = (event: KeyboardEvent) => {
    if (!isHelpRailShortcut(event)) return;
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  };
  target.addEventListener('keydown', onKey, { capture: true });
  return () => target.removeEventListener('keydown', onKey, { capture: true });
}

export function bindCurrentLineDoneShortcut(
  getView: () => EditorView | null | undefined,
  vimMode: boolean,
  target: Window = window,
  /**
   * Line transform to apply. Defaults to the recurrence-aware toggle,
   * which is correct for todo.txt; the page passes a file-aware closure
   * so the done tab gets a plain toggle (recurrence generation is a
   * todo.txt semantic — see TodoTxtPage.handleMarkDone).
   */
  transform: (line: string) => string = toggleDone,
): () => void {
  const onKey = (event: KeyboardEvent) => {
    if (!isToggleDoneShortcut(event, vimMode)) return;
    const view = getView();
    if (!view || !view.hasFocus) return;
    const { from, to } = view.state.selection.main;
    if (from !== to) return;
    const line = view.state.doc.lineAt(from);
    if (line.text.trim() === '') return;
    const next = transform(line.text);
    if (next === line.text) return;
    event.preventDefault();
    event.stopPropagation();
    view.dispatch({ changes: { from: line.from, to: line.to, insert: next } });
  };
  target.addEventListener('keydown', onKey, { capture: true });
  return () => target.removeEventListener('keydown', onKey, { capture: true });
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseComputedColor(value: string): RgbaColor | null {
  if (value.trim().toLowerCase() === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  const values = value.match(/\d+(?:\.\d+)?/g)?.map(Number);
  if (!values || values.length < 3) return null;
  return {
    r: values[0],
    g: values[1],
    b: values[2],
    a: values[3] ?? 1,
  };
}

function elementHasDarkBackground(element: HTMLElement): boolean {
  for (let current: Element | null = element; current; current = current.parentElement) {
    try {
      const color = parseComputedColor(getComputedStyle(current).backgroundColor);
      if (color && color.a > 0.01) {
        const luminance =
          (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
        return luminance < 0.4;
      }
    } catch {
      break;
    }
  }
  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  } catch {
    return true;
  }
}

/**
 * Re-evaluate AMOLED against the host palette. The attribute is removed before
 * measuring so its own #000 override cannot make a newly-light theme look dark.
 */
export function syncAmoledAttribute(
  element: HTMLElement,
  enabled: boolean,
): boolean {
  element.removeAttribute('data-amoled');
  const apply = enabled && elementHasDarkBackground(element);
  if (apply) element.setAttribute('data-amoled', 'true');
  return apply;
}

/**
 * Keep AMOLED synchronized with live host-theme changes. KiroCrew themes may
 * change an ancestor class/style, replace theme CSS in <head>, or follow the
 * OS color-scheme media query, so all three signals are observed.
 */
export function bindAmoledThemeSync(
  getElement: () => HTMLElement | null,
  enabled: boolean,
): () => void {
  const sync = () => {
    const element = getElement();
    if (element) syncAmoledAttribute(element, enabled);
  };
  sync();

  if (!enabled) {
    return () => getElement()?.removeAttribute('data-amoled');
  }

  const observer = new MutationObserver(sync);
  const element = getElement();
  for (
    let ancestor = element?.parentElement ?? null;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    observer.observe(ancestor, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme', 'data-color-scheme'],
    });
  }
  if (document.head) {
    observer.observe(document.head, {
      attributes: true,
      attributeFilter: ['disabled', 'media'],
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  const onMediaChange = () => sync();
  media?.addEventListener?.('change', onMediaChange);

  return () => {
    observer.disconnect();
    media?.removeEventListener?.('change', onMediaChange);
    getElement()?.removeAttribute('data-amoled');
  };
}
