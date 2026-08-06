export type SelectionToolbarMode = 'automatic' | 'on-demand' | 'off';

export const SELECTION_TOOLBAR_STORAGE_KEY =
  'todo-txt.selection-toolbar.v1';

const MODES: readonly SelectionToolbarMode[] = [
  'automatic',
  'on-demand',
  'off',
];

export function parseSelectionToolbarMode(
  value: unknown,
): SelectionToolbarMode {
  return MODES.includes(value as SelectionToolbarMode)
    ? (value as SelectionToolbarMode)
    : 'automatic';
}

export function readSelectionToolbarMode(): SelectionToolbarMode {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'automatic';
  }
  try {
    return parseSelectionToolbarMode(
      window.localStorage.getItem(SELECTION_TOOLBAR_STORAGE_KEY),
    );
  } catch {
    return 'automatic';
  }
}

export function writeSelectionToolbarMode(
  mode: SelectionToolbarMode,
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SELECTION_TOOLBAR_STORAGE_KEY, mode);
  } catch {
    // Preferences are best-effort when browser storage is unavailable.
  }
}

export function nextSelectionToolbarMode(
  mode: SelectionToolbarMode,
): SelectionToolbarMode {
  const index = MODES.indexOf(mode);
  return MODES[(index + 1) % MODES.length];
}

export function selectionToolbarModeLabel(
  mode: SelectionToolbarMode,
): string {
  if (mode === 'automatic') return 'Auto';
  if (mode === 'on-demand') return 'Manual';
  return 'Off';
}
