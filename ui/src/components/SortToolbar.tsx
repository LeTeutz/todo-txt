/**
 * SortToolbar (T16) — toolbar for the four todo.sh sort modes plus a
 * "Clear sort" link and a "Persist" checkbox.
 *
 * =====================================================================
 * Scope contract
 * =====================================================================
 * Purely presentational. This component does NOT:
 *   - call `sortLines()` itself (the parent is responsible for applying
 *     the returned mode to its in-memory lines),
 *   - fetch / PUT the todo.txt file (parent owns the editor state and
 *     decides when to call the PUT endpoint — see below),
 *   - remember the previous mode after a Clear (parent owns state).
 *
 * Behaviour contract with the parent (enforced by callers, not this
 * component):
 *
 *   persist === false  → parent re-orders the editor buffer in-place.
 *                        The file on disk is NOT written. Switching back
 *                        to mode=null restores original order iff the
 *                        parent kept the pre-sort snapshot (which the
 *                        parent is expected to do).
 *   persist === true   → parent applies the sort AND writes the sorted
 *                        content back via
 *                        `PUT /apps/todo-txt/api/file?name=todo`. That
 *                        endpoint creates a rotating backup first (see
 *                        T5) so the pre-sort order is always recoverable.
 *
 * This split is why the "Persist" checkbox lives next to the mode
 * buttons: it flips the parent's write-back policy, not this
 * component's own rendering.
 *
 * =====================================================================
 * Props
 * =====================================================================
 *   mode            — currently-active SortMode, or null for "no sort".
 *   onChange        — called with the new mode (or null on Clear).
 *                     Clicking the already-active mode button is a no-op.
 *   persist         — current state of the Persist checkbox.
 *   onPersistChange — called with the new boolean when the user toggles
 *                     the checkbox.
 *
 * Both pairs are fully controlled (parent owns state) — same pattern as
 * FileTabs (T15). The minimal "props { mode, onChange }" shape from the
 * spec is extended with the standard `persist` / `onPersistChange` pair
 * because the checkbox needs to be controllable from the parent (so the
 * preference can be persisted to localStorage or the KiroCrew settings
 * store without this component having to own any effects of its own).
 *
 * =====================================================================
 * Visual spec
 * =====================================================================
 *   - Horizontal row: [ Priority ] [ Date ] [ Project ] [ Context ]
 *     followed by a small "Clear sort" text link (only visible when a
 *     mode is active), then a right-aligned "Persist" checkbox.
 *   - Active mode button: var(--accent) background tint, bold weight.
 *     Inactive: transparent background, muted text colour.
 *   - Clear link: underlined, var(--text-muted), brightens on hover.
 *   - Persist checkbox: standard <input type="checkbox"> with a paired
 *     <label> for keyboard / a11y.
 *
 * =====================================================================
 * Accessibility
 * =====================================================================
 *   - `<div role="toolbar">` wrapper with `aria-label`.
 *   - Each sort button is a `<button type="button">` with
 *     `aria-pressed` reflecting the active state.
 *   - The Clear link is a `<button>` styled as a link (not an anchor)
 *     so keyboard focus and activation work without a bogus href.
 *   - The Persist checkbox has an explicit `<label htmlFor>` so
 *     clicking either the label or the box toggles the state.
 */
import type {
  ChangeEvent as ReactChangeEvent,
  CSSProperties,
  MouseEvent as ReactMouseEvent,
} from 'react';

import type { SortMode } from '../utils/sortModes';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** One entry per sort-mode button shown in the toolbar. */
interface SortButtonDef {
  /** Internal identifier — matches the SortMode union. */
  readonly mode: SortMode;
  /** Button label shown in the UI. */
  readonly label: string;
  /** Long aria-label so screen readers announce the action. */
  readonly ariaLabel: string;
}

/**
 * Canonical button order — matches the todo.sh convention where
 * priority is the primary sort axis.
 *
 * Exported so SortToolbar.test.tsx can assert the order without
 * reaching into component internals.
 */
export const SORT_BUTTONS: ReadonlyArray<SortButtonDef> = [
  {
    mode: 'priority',
    label: 'Priority',
    ariaLabel: 'Sort by priority (A → Z)',
  },
  {
    mode: 'date',
    label: 'Date',
    ariaLabel: 'Sort by creation date (newest first)',
  },
  {
    mode: 'project',
    label: 'Project',
    ariaLabel: 'Sort by first +project tag',
  },
  {
    mode: 'context',
    label: 'Context',
    ariaLabel: 'Sort by first @context tag',
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SortToolbarProps {
  /** Currently-active sort mode, or null for "no sort applied". */
  mode: SortMode | null;
  /**
   * Called when the user clicks a sort-mode button or the Clear link.
   *
   *   click a button → onChange(<that mode>)
   *   click the same button twice → no-op (already active)
   *   click Clear → onChange(null)
   */
  onChange: (next: SortMode | null) => void;
  /**
   * Whether "Persist" is enabled. When true, the parent is expected to
   * write the sorted content back via the three-file PUT endpoint
   * (which performs a backup first). When false, sorting is a purely
   * in-memory / in-editor reorder.
   */
  persist: boolean;
  /** Called when the user toggles the Persist checkbox. */
  onPersistChange: (next: boolean) => void;
}

// ---------------------------------------------------------------------------
// Styles (inline `CSSProperties`, theme tokens only)
// ---------------------------------------------------------------------------

const toolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  padding: '4px 0',
  margin: 0,
  // Keep typography consistent with the rest of the dashboard chrome.
  fontSize: 13,
  fontFamily: 'inherit',
};

function sortButtonStyle(active: boolean): CSSProperties {
  return {
    appearance: 'none',
    // Subtle accent-tinted background when active; transparent otherwise
    // so the toolbar blends into the header strip.
    background: active
      ? 'var(--accent-bg, rgba(99, 102, 241, 0.12))'
      : 'transparent',
    border: active
      ? '1px solid var(--accent, #6366f1)'
      : '1px solid var(--color-border, #30363d)',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 13,
    fontFamily: 'inherit',
    cursor: 'pointer',
    color: active
      ? 'var(--accent, #6366f1)'
      : 'var(--text-muted, var(--color-muted-fg, #888))',
    fontWeight: active ? 700 : 500,
    outline: 'none',
    transition:
      'color 120ms ease-out, background-color 120ms ease-out, border-color 120ms ease-out',
  };
}

const clearLinkStyle: CSSProperties = {
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  padding: '4px 6px',
  fontSize: 12,
  fontFamily: 'inherit',
  cursor: 'pointer',
  color: 'var(--text-muted, var(--color-muted-fg, #888))',
  textDecoration: 'underline',
  outline: 'none',
};

const persistLabelStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  marginLeft: 'auto', // Right-align in the toolbar row.
  fontSize: 12,
  color: 'var(--text-muted, var(--color-muted-fg, #888))',
  cursor: 'pointer',
  userSelect: 'none',
};

const persistCheckboxStyle: CSSProperties = {
  margin: 0,
  cursor: 'pointer',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SortToolbar — see file-level docstring for full contract.
 *
 * Named export to match the convention used by FileTabs and
 * CommandPalette; a default re-export is also provided for ergonomic
 * default imports.
 */
export function SortToolbar({
  mode,
  onChange,
  persist,
  onPersistChange,
}: SortToolbarProps): JSX.Element {
  const handleButtonClick =
    (next: SortMode) => (e: ReactMouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      // Clicking the already-active mode is a no-op. Users clear a
      // sort via the explicit "Clear sort" link so accidental
      // re-clicks don't wipe the current mode.
      if (next === mode) return;
      onChange(next);
    };

  const handleClear = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (mode === null) return;
    onChange(null);
  };

  const handlePersistToggle = (e: ReactChangeEvent<HTMLInputElement>) => {
    onPersistChange(e.target.checked);
  };

  const persistId = 'todo-txt-sort-persist';

  return (
    <div
      role="toolbar"
      aria-label="Sort toolbar"
      data-testid="todo-txt-sort-toolbar"
      style={toolbarStyle}
    >
      {SORT_BUTTONS.map((btn) => {
        const isActive = btn.mode === mode;
        return (
          <button
            key={btn.mode}
            type="button"
            aria-pressed={isActive}
            aria-label={btn.ariaLabel}
            data-testid={`todo-txt-sort-${btn.mode}`}
            onClick={handleButtonClick(btn.mode)}
            style={sortButtonStyle(isActive)}
          >
            {btn.label}
          </button>
        );
      })}

      {mode !== null && (
        <button
          type="button"
          data-testid="todo-txt-sort-clear"
          aria-label="Clear sort and restore original order"
          onClick={handleClear}
          style={clearLinkStyle}
        >
          Clear sort
        </button>
      )}

      <label
        htmlFor={persistId}
        style={persistLabelStyle}
        data-testid="todo-txt-sort-persist-label"
      >
        <input
          id={persistId}
          type="checkbox"
          data-testid="todo-txt-sort-persist"
          checked={persist}
          onChange={handlePersistToggle}
          style={persistCheckboxStyle}
          aria-describedby="todo-txt-sort-persist-hint"
        />
        <span>Persist</span>
        <span
          id="todo-txt-sort-persist-hint"
          // Hidden from visual layout but exposed to assistive tech so
          // the checkbox's effect is self-describing.
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          When on, applying a sort saves the reordered file and creates a
          backup. When off, the sort is applied only in the editor.
        </span>
      </label>
    </div>
  );
}

export default SortToolbar;
