/**
 * FileTabs — three-file switcher for the todo-txt three-file workflow
 * (T15). Renders three horizontal buttons — **Todo** / **Done** /
 * **Report** — used as the header tab bar in `TodoTxtPage`.
 *
 * =====================================================================
 * Scope contract
 * =====================================================================
 * This component is **purely presentational**. It does *not*:
 *   - fetch file contents (parent calls the three-file GET endpoint on
 *     `onChange`),
 *   - render the report chart (parent swaps the body pane between the
 *     textarea and `<ReportChart>` from T17),
 *   - disable write inputs (parent toggles the textarea `readOnly`
 *     attribute when `activeFile === 'report'`).
 *
 * Keeping FileTabs purely presentational lets T10 (palette wire-up),
 * T17 (ReportChart), and the final integration step share one component
 * without ordering constraints between them.
 *
 * =====================================================================
 * Props
 * =====================================================================
 *   activeFile — one of 'todo' | 'done' | 'report'. The current tab.
 *   onChange   — called with the new tab name when the user clicks a
 *                different button. Not called when the active tab is
 *                re-clicked.
 *
 * =====================================================================
 * Visual spec
 * =====================================================================
 *   - Horizontal row of three buttons, left-aligned.
 *   - Active button: `color: var(--accent)`, `font-weight: 700`, and a
 *     2-px `border-bottom: var(--accent)` underline.
 *   - Inactive button: `color: var(--text-muted)` with a 2-px
 *     transparent bottom border (so heights match and the underline
 *     slides without layout shift).
 *   - Hover on an inactive tab brightens it to `var(--color-fg)` via
 *     `--fg` fallback so the control feels responsive.
 *
 * The spec asks for `var(--text-muted)` explicitly; the dashboard
 * theme tokens expose the muted foreground as `--color-muted-fg`.
 * We reference `var(--text-muted, var(--color-muted-fg, #888))` so the
 * component renders correctly in both token systems (and falls back to
 * a plain gray in the test jsdom env where no CSS custom properties
 * are declared).
 *
 * =====================================================================
 * Accessibility
 * =====================================================================
 * Rendered as a `<nav role="tablist">` with three `<button role="tab">`
 * children. `aria-selected` reflects the active state so assistive tech
 * announces the tab correctly. Arrow Left/Right cycles tabs and Home/End
 * selects the first/last tab while moving keyboard focus with the active tab.
 */
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';

import type { TodoFile } from '../utils/commands';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * The three files in the todo.txt three-file workflow. Re-exported as
 * a local alias of `TodoFile` (from ../utils/commands) so callers can
 * import one consistent symbol from either module; the two types are
 * structurally identical.
 */
export type FileName = TodoFile;

/** Declarative tab definition — name + display label. */
interface TabDef {
  /** Internal identifier (matches the ?name= query param on the API). */
  readonly name: FileName;
  /** Human-readable label shown inside the button. */
  readonly label: string;
  /** Longer aria-label for screen readers. */
  readonly ariaLabel: string;
}

/** Ordered list. Exported for tests so a mismatch fails loudly. */
export const FILE_TABS: ReadonlyArray<TabDef> = [
  {
    name: 'todo',
    label: 'Todo',
    ariaLabel: 'Active tasks (todo.txt)',
  },
  {
    name: 'done',
    label: 'Done',
    ariaLabel: 'Archived completed tasks (done.txt)',
  },
  {
    name: 'report',
    label: 'Report',
    ariaLabel: 'Daily history snapshots (report.txt)',
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FileTabsProps {
  /** Currently-active file tab. */
  activeFile: FileName;
  /**
   * Called with the newly-selected tab name. The parent is responsible
   * for re-fetching content via `GET /apps/todo-txt/api/file?name=…`
   * and swapping the body pane (textarea vs. ReportChart) accordingly.
   */
  onChange: (next: FileName) => void;
}

// ---------------------------------------------------------------------------
// Styles (inline `CSSProperties`, theme tokens only)
// ---------------------------------------------------------------------------

const navStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 2,
  // The parent header already has its own padding; FileTabs sits flush.
  margin: 0,
  padding: 0,
};

/**
 * Per-button style. `active` changes three things: color, weight, and
 * the bottom border. Layout geometry is identical in both states so the
 * underline slides in/out without nudging sibling elements.
 */
function buttonStyle(active: boolean): CSSProperties {
  return {
    appearance: 'none',
    background: 'transparent',
    border: 'none',
    // 2-px "tab underline". Transparent when inactive keeps heights
    // identical so clicking through tabs doesn't reflow the header row.
    borderBottom: active
      ? '2px solid var(--accent, #6366f1)'
      : '2px solid transparent',
    padding: '6px 10px',
    fontSize: 13,
    fontFamily: 'inherit',
    cursor: 'pointer',
    color: active
      ? 'var(--accent, #6366f1)'
      : 'var(--text-muted, var(--color-muted-fg, #888))',
    fontWeight: active ? 700 : 500,
    outline: 'none',
    // Remove the default button focus ring on non-keyboard activation.
    // `:focus-visible` is handled by the global stylesheet (same
    // convention as CommandPalette).
    transition: 'color 120ms ease-out, border-color 120ms ease-out',
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FileTabs — see the file-level docstring for the full contract.
 *
 * Exported as a **named export** (consistent with `CommandPalette`) so
 * the parent can import `{ FileTabs, FILE_TABS }` alongside the
 * `FileName` type without chasing default-vs-named friction.
 */
export function FileTabs({ activeFile, onChange }: FileTabsProps): JSX.Element {
  const handleClick = (next: FileName) => (e: ReactMouseEvent<HTMLButtonElement>) => {
    // Guard against spurious re-selection. The parent's `onChange`
    // triggers a GET request, and clicking the active tab should not
    // cause a re-fetch.
    e.preventDefault();
    if (next === activeFile) return;
    onChange(next);
  };

  const handleKeyDown =
    (current: FileName) => (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = FILE_TABS.findIndex((tab) => tab.name === current);
      let nextIndex: number;
      switch (e.key) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % FILE_TABS.length;
          break;
        case 'ArrowLeft':
          nextIndex = (currentIndex - 1 + FILE_TABS.length) % FILE_TABS.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = FILE_TABS.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const next = FILE_TABS[nextIndex];
      const tablist = e.currentTarget.parentElement;
      tablist
        ?.querySelector<HTMLButtonElement>(
          `[data-testid="todo-txt-file-tab-${next.name}"]`,
        )
        ?.focus();
      if (next.name !== activeFile) onChange(next.name);
    };

  return (
    <nav
      role="tablist"
      aria-label="todo.txt file switcher"
      data-testid="todo-txt-file-tabs"
      style={navStyle}
    >
      {FILE_TABS.map((tab) => {
        const isActive = tab.name === activeFile;
        return (
          <button
            key={tab.name}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={tab.ariaLabel}
            data-testid={`todo-txt-file-tab-${tab.name}`}
            tabIndex={isActive ? 0 : -1}
            onClick={handleClick(tab.name)}
            onKeyDown={handleKeyDown(tab.name)}
            style={buttonStyle(isActive)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export default FileTabs;
