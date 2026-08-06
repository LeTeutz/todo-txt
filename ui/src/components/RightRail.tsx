/**
 * RightRail — persistent right-side help / reference panel.
 *
 * Replaces three earlier surfaces (cheatsheet banner, `?` hover popover,
 * `HelpPanel` modal) with a single toggleable rail pinned to the viewport's
 * right edge. Opens on Ctrl+/ (or the header `?` button), on the palette's
 * `help` command, and closes on Esc or a second trigger.
 *
 * ===========================================================================
 * Content (DESIGN.md §3 & §4)
 * ===========================================================================
 * - PinnedBar: five fixed reference rows for the most-used keystrokes and
 *   verbs (Ctrl+K, add, do, example, help).
 * - CategoryList: four collapsible accordions
 *     - File & Navigation: example, listfile, archive, move, where, set-root
 *     - Task Ops:          add, do, pri, depri, del, replace, append, prepend,
 *                          sort, report
 *     - Filters:           list, listall, listcon, listproj, listpri
 *     - Inline Shortcuts:  every entry from SHORTCUT_REFERENCE
 * - Other (fallback): any COMMANDS entry not explicitly mapped (excluding
 *   `help`, which IS the rail itself so is self-referentially skipped).
 *
 * ===========================================================================
 * Tab-contextual filtering (DESIGN.md §5)
 * ===========================================================================
 * - todo tab:   all four categories shown.
 * - done tab:   Filters + File & Navigation shown expanded-by-default;
 *               Task Ops + Inline Shortcuts shown collapsed with an inline
 *               hint "Switch to Todo to run these".
 * - report tab: the rail condenses to a single explanatory paragraph.
 *
 * ===========================================================================
 * Persistence (DESIGN.md §6)
 * ===========================================================================
 * localStorage key `todo-txt.rail.v1` holds `{open, categories}`.
 * Unknown keys at read time are ignored; parse failures fall back to
 * defaults (open=false, first three categories expanded, inline-shortcuts
 * collapsed).
 *
 * ===========================================================================
 * Styling
 * ===========================================================================
 * Inline `CSSProperties` only — matches CommandPalette and HelpPanel. Theme
 * tokens only (`--color-bg`, `--color-fg`, `--color-muted-fg`,
 * `--color-border`, `--color-bg-hover`, `--accent`, `--font-mono`). No
 * hardcoded palette values; no Tailwind classes. Tailwind is now loaded in
 * the build but we match the existing modal-style idiom for consistency.
 *
 * ===========================================================================
 * Accessibility
 * ===========================================================================
 * - Root has `role="complementary"` + `aria-label="Help and reference"`.
 * - Accordion headers are `<button aria-expanded aria-controls>`; bodies
 *   are `role="region" aria-labelledby`.
 * - Close button has an accessible name and returns focus to the previously
 *   focused element on close.
 * - Esc closes when focus is inside the rail.
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';

import type { Command, TodoFile } from '../utils/commands';
import { SHORTCUT_REFERENCE } from '../utils/shortcuts';

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

export interface RightRailProps {
  /** Controlled visibility flag. When false the rail is unmounted. */
  open: boolean;
  /** Close handler — wired to Esc, close button click, toggle re-invocations. */
  onClose: () => void;
  /** Active editor tab. Drives tab-contextual filtering. */
  activeFile: TodoFile;
  /** Command registry (`COMMANDS` from ../utils/commands.ts). */
  commands: Command[];
}

// ---------------------------------------------------------------------------
// Category taxonomy (DESIGN.md §4)
// ---------------------------------------------------------------------------

type CategoryKey = 'file-nav' | 'task-ops' | 'filters' | 'inline-shortcuts' | 'other';

interface CategorySpec {
  key: CategoryKey;
  title: string;
  /**
   * Canonical command names that belong to this category. Empty for
   * `inline-shortcuts` (populated from SHORTCUT_REFERENCE) and `other`
   * (computed as COMMANDS minus everything else).
   */
  commandNames: string[];
}

const CATEGORIES: CategorySpec[] = [
  {
    key: 'file-nav',
    title: 'File & Navigation',
    // `where` / `set-root` answer and change WHICH directory the three files
    // live in, so they belong with the verbs that move between those files
    // rather than in the catch-all Other bucket.
    commandNames: ['example', 'listfile', 'archive', 'move', 'where', 'set-root'],
  },
  {
    key: 'task-ops',
    title: 'Task Ops',
    commandNames: [
      'add',
      'do',
      'pri',
      'depri',
      'del',
      'replace',
      'append',
      'prepend',
      'sort',
      // `report` writes a snapshot to report.txt — belongs with mutating
      // task verbs. DESIGN.md §4 didn't list it; documented as a deviation
      // in the milestone 2 ping to the manager.
      'report',
    ],
  },
  {
    key: 'filters',
    title: 'Filters',
    commandNames: [
      'filter',
      'threshold',
      'hidden',
      'list',
      'listall',
      'listcon',
      'listproj',
      'listpri',
    ],
  },
  { key: 'inline-shortcuts', title: 'Inline Shortcuts', commandNames: [] },
];

/**
 * Commands that should never appear as rail rows. `help` is self-referential
 * (the rail IS the help surface) so listing it in a category would confuse
 * the user. Other meta verbs can be added here as the registry grows.
 */
const EXCLUDED_FROM_CATEGORIES = new Set<string>(['help']);

// ---------------------------------------------------------------------------
// Persisted state (DESIGN.md §6)
// ---------------------------------------------------------------------------

interface RailPersistedState {
  open: boolean;
  categories: Record<CategoryKey, boolean>;
}

const STORAGE_KEY = 'todo-txt.rail.v1';

const DEFAULT_CATEGORIES: Record<CategoryKey, boolean> = {
  'file-nav': true,
  'task-ops': true,
  'filters': true,
  'inline-shortcuts': false,
  'other': true,
};

const DEFAULT_STATE: RailPersistedState = {
  open: false,
  categories: { ...DEFAULT_CATEGORIES },
};

function readPersistedState(): RailPersistedState {
  if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<RailPersistedState>;
    const categories: Record<CategoryKey, boolean> = { ...DEFAULT_CATEGORIES };
    if (parsed.categories && typeof parsed.categories === 'object') {
      for (const key of Object.keys(DEFAULT_CATEGORIES) as CategoryKey[]) {
        const value = parsed.categories[key];
        if (typeof value === 'boolean') categories[key] = value;
      }
    }
    return {
      open: typeof parsed.open === 'boolean' ? parsed.open : DEFAULT_STATE.open,
      categories,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writePersistedState(state: RailPersistedState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota / disabled storage — persistence is best-effort, never blocking.
  }
}

/**
 * Exported so TodoTxtPage can initialize its `railOpen` useState from the
 * same persisted store, giving cross-reload open/closed continuity.
 */
export function loadRailOpenState(): boolean {
  return readPersistedState().open;
}

// ---------------------------------------------------------------------------
// Pinned reference rows (DESIGN.md §3)
// ---------------------------------------------------------------------------

interface PinnedItem {
  key: string;
  label: string;
  hint: string;
  description: string;
}

const PINNED_ITEMS: PinnedItem[] = [
  { key: 'palette', label: 'Command palette', hint: 'Ctrl+K', description: 'Open every verb' },
  { key: 'add', label: 'add', hint: 'a', description: 'Append a new task line' },
  { key: 'do', label: 'do', hint: 'x', description: 'Mark item # done' },
  { key: 'example', label: 'example', hint: 'template', description: 'Fill todo.txt with a starter set' },
  { key: 'help', label: 'Help rail', hint: 'Ctrl+/', description: 'Toggle this panel' },
];

// ---------------------------------------------------------------------------
// Styles (theme tokens only)
// ---------------------------------------------------------------------------
//
// Theme sweep. Previously the hex fallbacks were
// dark-palette literals (e.g. `#111827`, `#334155`, `#e2e8f0`) which
// rendered as a dark-dark mismatch in light theme if the app's own
// `--color-*` vars weren't set. The host app SDK exposes theme primitives
// (`--bg`, `--text`, `--border-strong`, `--ring`, `--muted-aa`) that the
// KiroCrew dashboard guarantees are defined across ALL themes. Rule of
// thumb: never hardcode palette hexes — chain the app's own vars first for
// backward compatibility, then fall back to the SDK tokens. No hex
// fallbacks.

const shellStyle: CSSProperties = {
  // Milestone 2-3 landing: fixed-position overlay pinned to the viewport's
  // right edge so we don't need to restructure TodoTxtPage's layout yet.
  // Milestone 4 (surface retirement) will promote this to a side-by-side
  // flex integration per DESIGN.md §6 once the cheatsheet/popover/modal
  // are gone and there's room to re-flow.
  position: 'fixed',
  right: 0,
  top: 'var(--todo-txt-rail-top, 56px)',
  bottom: 0,
  // Bumped 900 → 950 to explicitly sit above the editor
  // textarea (z-[3]) and its line-numbered gutter (z-[2]). 900 was
  // already enough in principle, but the user reported "renders BEHIND
  // editor text on lines 2–8" in the live dist — bumping leaves zero
  // ambiguity and stays under the palette/backups modals (z-[1000+]).
  zIndex: 950,
  width: 'clamp(240px, 18%, 360px)',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  borderLeft: '1px solid var(--color-border, var(--border-strong))',
  background: 'var(--color-bg, var(--bg))',
  color: 'var(--color-fg, var(--text))',
  fontSize: '13px',
  overflow: 'hidden',
  boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.2)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',
  borderBottom: '1px solid var(--color-border, var(--border-strong))',
  flexShrink: 0,
};

const titleStyle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--color-fg, var(--text))',
  margin: 0,
};

const tabHintStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 400,
  color: 'var(--color-muted-fg, var(--muted-aa))',
  marginLeft: 8,
};

const closeButtonStyle: CSSProperties = {
  appearance: 'none',
  background: 'transparent',
  border: '1px solid transparent',
  color: 'var(--color-muted-fg, var(--muted-aa))',
  padding: '2px 6px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '14px',
  lineHeight: 1,
};

const bodyStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '8px 0',
};

const sectionStyle: CSSProperties = {
  padding: '6px 12px 10px',
  borderBottom: '1px solid var(--color-border, var(--border-strong))',
};

const sectionHeaderStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--color-muted-fg, var(--muted-aa))',
  margin: '4px 0 6px',
};

const pinnedRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: '6px 10px',
  alignItems: 'baseline',
  padding: '3px 0',
};

const hintStyle: CSSProperties = {
  fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
  fontSize: '11px',
  padding: '1px 5px',
  borderRadius: 3,
  background: 'var(--color-bg-hover, rgba(255, 255, 255, 0.08))',
  color: 'var(--color-fg, var(--text))',
  whiteSpace: 'nowrap',
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  color: 'var(--color-fg, var(--text))',
};

const descriptionStyle: CSSProperties = {
  fontSize: '11px',
  color: 'var(--color-muted-fg, var(--muted-aa))',
  marginTop: 1,
};

const accordionHeaderStyle: CSSProperties = {
  appearance: 'none',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-fg, var(--text))',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
};

const accordionBodyStyle: CSSProperties = {
  padding: '2px 12px 10px',
};

const dimmedBodyStyle: CSSProperties = {
  ...accordionBodyStyle,
  opacity: 0.7,
};

const hintLineStyle: CSSProperties = {
  fontSize: '11px',
  fontStyle: 'italic',
  color: 'var(--color-muted-fg, var(--muted-aa))',
  margin: '0 0 6px',
};

const chevronStyle: CSSProperties = {
  display: 'inline-block',
  width: 12,
  marginRight: 8,
  color: 'var(--color-muted-fg, var(--muted-aa))',
  fontSize: '10px',
  transition: 'transform 120ms ease',
};

const countBadgeStyle: CSSProperties = {
  fontSize: '10px',
  fontWeight: 500,
  color: 'var(--color-muted-fg, var(--muted-aa))',
  marginLeft: 'auto',
};

const commandRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '4px 10px',
  alignItems: 'baseline',
  padding: '3px 0',
};

const commandNameStyle: CSSProperties = {
  fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
  fontSize: '12px',
  color: 'var(--accent, var(--ring))',
};

const shortcutRowStyle: CSSProperties = {
  display: 'grid',
  // Widened from 'auto auto 1fr' (8-px dot + trigger +
  // expansion) to 'auto auto 1fr' where the first slot is now a text
  // badge ("LINE" / "INLINE") instead of an ambiguous colored square.
  // The dot required legend decoding at the bottom of the section;
  // the badge is self-describing.
  gridTemplateColumns: 'auto auto 1fr',
  gap: '4px 8px',
  alignItems: 'baseline',
  padding: '3px 0',
};

/**
 * Text badge for "LINE" vs "INLINE" shortcut kind.
 *
 * Replaces the previous 8×8 colored dot (kindDotStyle) which required
 * the user to decode the colour via a legend at the bottom of the
 * accordion. The badge carries the word, so it's self-describing for
 * sighted users AND screen readers (no aria-hidden here — the word
 * IS the label).
 *
 * Colour is still information-bearing (line = muted, inline = accent)
 * but now the text carries the same meaning, satisfying WCAG 1.4.1
 * "Use of Color" — don't convey by colour alone.
 */
const kindBadgeStyle = (kind: 'line' | 'inline'): CSSProperties => ({
  display: 'inline-block',
  fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
  fontSize: '9px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  padding: '1px 5px',
  borderRadius: 3,
  textTransform: 'uppercase',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  color:
    kind === 'line'
      ? 'var(--color-muted-fg, var(--muted-aa))'
      : 'var(--accent, var(--ring))',
  background:
    kind === 'line'
      ? 'var(--color-bg-hover, rgba(148, 163, 184, 0.12))'
      : 'var(--accent-subtle, rgba(125, 211, 252, 0.14))',
  border: '1px solid',
  borderColor:
    kind === 'line'
      ? 'var(--color-border, var(--border-strong))'
      : 'var(--accent, var(--ring))',
  flexShrink: 0,
});

/**
 * Ctrl+K instructions block styling.
 *
 * Rendered at the top of the rail body (above PinnedBar) so it's the
 * first thing the user sees when they open Help. Theme-aware via
 * chained tokens. Not collapsible by design — the amendment said
 * "Full text, no truncation".
 */
const paletteTipStyle: CSSProperties = {
  padding: '10px 12px 12px',
  margin: '4px 10px 8px',
  borderRadius: 6,
  border: '1px solid var(--color-border, var(--border-strong))',
  background: 'var(--color-bg-hover, rgba(125, 211, 252, 0.06))',
  color: 'var(--color-fg, var(--text))',
  fontSize: '12px',
  lineHeight: 1.5,
};

const paletteTipKbdStyle: CSSProperties = {
  display: 'inline-block',
  fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
  fontSize: '11px',
  fontWeight: 600,
  padding: '1px 5px',
  borderRadius: 3,
  background: 'var(--color-bg, var(--bg))',
  color: 'var(--color-fg, var(--text))',
  border: '1px solid var(--color-border, var(--border-strong))',
  whiteSpace: 'nowrap',
};

const reportModeStyle: CSSProperties = {
  padding: '16px 12px',
  fontSize: '12px',
  lineHeight: 1.5,
  color: 'var(--color-muted-fg, var(--muted-aa))',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveCommands(
  commands: Command[],
  category: CategorySpec,
): Command[] {
  if (category.commandNames.length === 0) return [];
  const byName = new Map(commands.map((c) => [c.name, c]));
  return category.commandNames
    .map((n) => byName.get(n))
    .filter((c): c is Command => Boolean(c));
}

function resolveOtherCommands(commands: Command[]): Command[] {
  const mapped = new Set<string>();
  for (const cat of CATEGORIES) {
    for (const name of cat.commandNames) mapped.add(name);
  }
  return commands.filter(
    (c) => !mapped.has(c.name) && !EXCLUDED_FROM_CATEGORIES.has(c.name),
  );
}

/** Done tab keeps file-nav + filters front-and-center; others dim. */
function isCategoryDimmed(activeFile: TodoFile, key: CategoryKey): boolean {
  if (activeFile !== 'done') return false;
  return key === 'task-ops' || key === 'inline-shortcuts';
}

function categoryTestId(key: CategoryKey): string {
  return `todo-txt-help-category-${key}`;
}

function formatArgSummary(cmd: Command): string {
  if (!cmd.argSchema || cmd.argSchema.length === 0) return '';
  return cmd.argSchema.map((a) => `<${a.name}>`).join(' ');
}

// ---------------------------------------------------------------------------
// Internal components
// ---------------------------------------------------------------------------

function CommandRow({ command }: { command: Command }): JSX.Element {
  const args = formatArgSummary(command);
  return (
    <div style={commandRowStyle}>
      <div>
        <span style={commandNameStyle}>{command.name}</span>
        {command.shortName ? (
          <span style={{ ...descriptionStyle, marginLeft: 6, display: 'inline' }}>
            ({command.shortName})
          </span>
        ) : null}
        {args ? (
          <span
            style={{
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              fontSize: '11px',
              color: 'var(--color-muted-fg, var(--muted-aa))',
              marginLeft: 6,
            }}
          >
            {args}
          </span>
        ) : null}
        <div style={descriptionStyle}>{command.description}</div>
      </div>
    </div>
  );
}

function ShortcutRow({
  trigger,
  expansion,
  kind,
}: {
  trigger: string;
  expansion: string;
  kind: 'line' | 'inline';
}): JSX.Element {
  return (
    <div style={shortcutRowStyle}>
      {/*
        Explicit "LINE" / "INLINE" text badge.
        Replaces the ambiguous 8×8 colour dot that required a separate
        legend. No `aria-hidden` — the word is the semantic label, so
        screen readers should read it.
      */}
      <span style={kindBadgeStyle(kind)}>{kind === 'line' ? 'LINE' : 'INLINE'}</span>
      <span
        style={{
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontSize: '11px',
          color: 'var(--color-fg, var(--text))',
          whiteSpace: 'nowrap',
        }}
      >
        {trigger}
      </span>
      <span style={descriptionStyle}>{expansion}</span>
    </div>
  );
}

/**
 * Command palette instructions.
 *
 * Rendered at the top of the rail body (just below the PinnedBar's
 * first entry, but inside its own section so the "PINNED" header
 * stays tight against the five keystroke rows). Users were missing
 * the Ctrl+K palette — the pinned row mentions it but the amendment
 * asked for a dedicated, readable block with no truncation.
 *
 * Theme-aware via `paletteTipStyle` / `paletteTipKbdStyle`. No
 * hardcoded palette values.
 */
function PaletteTip(): JSX.Element {
  return (
    <div style={paletteTipStyle} data-testid="todo-txt-help-palette-tip">
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Command palette</div>
      <div>
        Press <kbd style={paletteTipKbdStyle}>Ctrl</kbd>
        <span aria-hidden="true"> + </span>
        <kbd style={paletteTipKbdStyle}>K</kbd>
        {' '}(or{' '}
        <kbd style={paletteTipKbdStyle}>⌘</kbd>
        <span aria-hidden="true"> + </span>
        <kbd style={paletteTipKbdStyle}>K</kbd>
        ) to open the command palette for{' '}
        <code style={{ fontFamily: 'var(--font-mono, monospace)' }}>add</code>
        {' / '}
        <code style={{ fontFamily: 'var(--font-mono, monospace)' }}>do</code>
        {' / '}
        <code style={{ fontFamily: 'var(--font-mono, monospace)' }}>list</code>
        {' / '}
        <code style={{ fontFamily: 'var(--font-mono, monospace)' }}>example</code>
        {' / etc.'}
      </div>
    </div>
  );
}

function AccordionSection({
  id,
  title,
  count,
  expanded,
  onToggle,
  dimmed,
  hint,
  children,
  testId,
}: {
  id: string;
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  dimmed?: boolean;
  hint?: string;
  children: React.ReactNode;
  testId: string;
}): JSX.Element {
  const headerId = `${id}-header`;
  const bodyId = `${id}-body`;
  return (
    <section data-testid={testId}>
      <button
        type="button"
        id={headerId}
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={onToggle}
        style={accordionHeaderStyle}
      >
        <span style={{ ...chevronStyle, transform: expanded ? 'rotate(90deg)' : 'none' }}>
          ▶
        </span>
        <span>{title}</span>
        <span style={countBadgeStyle}>{count}</span>
      </button>
      {expanded ? (
        <div
          id={bodyId}
          role="region"
          aria-labelledby={headerId}
          style={dimmed ? dimmedBodyStyle : accordionBodyStyle}
        >
          {hint ? <p style={hintLineStyle}>{hint}</p> : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}

function PinnedBar(): JSX.Element {
  return (
    <div style={sectionStyle} data-testid="todo-txt-help-pinned">
      <h3 style={sectionHeaderStyle}>Pinned</h3>
      {PINNED_ITEMS.map((item) => (
        <div key={item.key} style={pinnedRowStyle}>
          <span style={hintStyle}>{item.hint}</span>
          <div>
            <div style={labelStyle}>{item.label}</div>
            <div style={descriptionStyle}>{item.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Getting started (intro-guide) — smallest crucial command set. Rendered at
// the very top of the rail body so first-time users see the essentials
// before the full catalogue. Theme-token styling only.
// ---------------------------------------------------------------------------
const gsStyle: CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--color-border, var(--border-strong))',
  fontSize: '12px',
  lineHeight: 1.5,
};
const gsRowsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(92px, auto) 1fr',
  gap: '4px 10px',
  marginTop: 6,
};
const gsCodeStyle: CSSProperties = {
  fontFamily: 'var(--font-mono, monospace)',
  color: 'var(--accent, #f59e0b)',
  whiteSpace: 'nowrap',
};

function GettingStarted(): JSX.Element {
  const rows: Array<[string, string]> = [
    ['add <task>', 'new task (+proj @ctx due:YYYY-MM-DD)'],
    ['do 2', 'complete item 2'],
    ['pri 2 A', 'set priority A'],
    ['list @home', 'filter (prefix -term to exclude)'],
    ['archive', 'move done tasks to done.txt'],
    ['sort', 'order by priority'],
  ];
  return (
    <div style={gsStyle} data-testid="todo-txt-help-getting-started">
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Getting started</div>
      <div>
        It&apos;s a plain{' '}
        <code style={gsCodeStyle}>todo.txt</code> file — edit it directly (it
        saves live) or use the command palette. The crucial commands:
      </div>
      <div style={gsRowsStyle}>
        {rows.map(([cmd, desc]) => (
          <Fragment key={cmd}>
            <code style={gsCodeStyle}>{cmd}</code>
            <span>{desc}</span>
          </Fragment>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        Toggle <strong>VIM</strong> in the header (leader{' '}
        <kbd style={paletteTipKbdStyle}>\</kbd>:{' '}
        <code style={gsCodeStyle}>\x</code> done,{' '}
        <code style={gsCodeStyle}>\d</code> date). Press{' '}
        <kbd style={paletteTipKbdStyle}>Ctrl/⌘</kbd>
        <span aria-hidden="true"> + </span>
        <kbd style={paletteTipKbdStyle}>/</kbd> toggles this panel;{' '}
        <kbd style={paletteTipKbdStyle}>Ctrl/⌘</kbd>
        <span aria-hidden="true"> + </span>
        <kbd style={paletteTipKbdStyle}>D</kbd> completes the current line. In
        VIM, <kbd style={paletteTipKbdStyle}>Ctrl+D</kbd> keeps its half-page
        scroll; use <code style={gsCodeStyle}>\x</code> to complete.
      </div>
      <div style={{ marginTop: 8 }}>
        Multi-cursor: <kbd style={paletteTipKbdStyle}>Alt</kbd> + click adds a
        cursor, <kbd style={paletteTipKbdStyle}>Ctrl/⌘+Alt+↑/↓</kbd> adds one
        above or below, and <kbd style={paletteTipKbdStyle}>Alt</kbd> + drag
        makes a rectangular selection. The <strong>Actions</strong> header
        setting cycles Auto, Manual (<kbd style={paletteTipKbdStyle}>Alt+Enter</kbd>),
        and Off.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RightRail(props: RightRailProps): JSX.Element | null {
  const { open, onClose, activeFile, commands } = props;

  // Persisted category state. `open` is parent-owned but kept in sync with
  // the same store via an effect below, so a page reload restores both.
  const [categoryState, setCategoryState] = useState<Record<CategoryKey, boolean>>(
    () => readPersistedState().categories,
  );

  // Persist on every change. Cheap (small object, infrequent writes).
  useEffect(() => {
    writePersistedState({ open, categories: categoryState });
  }, [open, categoryState]);

  // Focus management: close button on open; previously-focused element
  // on close. Matches HelpPanel's contract (DESIGN.md §8).
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus();
    } else if (prevFocusRef.current) {
      prevFocusRef.current.focus();
      prevFocusRef.current = null;
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  const toggleCategory = useCallback((key: CategoryKey) => {
    setCategoryState((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const otherCommands = useMemo(() => resolveOtherCommands(commands), [commands]);

  if (!open) return null;

  const tabContextHint: string =
    activeFile === 'done'
      ? 'On Done tab — Task Ops and inline shortcuts apply after switching to Todo.'
      : '';

  return (
    <aside
      role="complementary"
      aria-label="Help and reference"
      data-testid="todo-txt-help-panel"
      style={shellStyle}
      onKeyDown={handleKeyDown}
    >
      <div style={headerStyle}>
        <h2 style={titleStyle} id="todo-txt-rail-title">
          Help & reference
          {activeFile !== 'todo' ? (
            <span style={tabHintStyle}>({activeFile})</span>
          ) : null}
        </h2>
        <button
          type="button"
          ref={closeRef}
          onClick={onClose}
          style={closeButtonStyle}
          aria-label="Close help"
          data-testid="todo-txt-help-close"
        >
          ×
        </button>
      </div>

      {activeFile === 'report' ? (
        <div style={reportModeStyle}>
          <p style={{ margin: '0 0 10px' }}>
            The Report tab accumulates snapshots written by the{' '}
            <code style={{ fontFamily: 'var(--font-mono, monospace)' }}>report</code>{' '}
            command. It isn't editable, so the command catalogue is hidden
            here.
          </p>
          <p style={{ margin: 0 }}>
            Switch back to the Todo tab to open the full reference.
          </p>
        </div>
      ) : (
        <div style={bodyStyle}>
          {/*
            Ctrl+K instructions live at the very top of
            the body (above the pinned bar) so it's the first thing
            users see when they open the help rail. Full text, no
            truncation.
          */}
          <GettingStarted />
          <PaletteTip />
          <PinnedBar />

          {CATEGORIES.map((category) => {
            const items =
              category.key === 'inline-shortcuts'
                ? SHORTCUT_REFERENCE
                : resolveCommands(commands, category);
            const count = items.length;
            const dimmed = isCategoryDimmed(activeFile, category.key);
            const hint =
              dimmed && activeFile === 'done'
                ? 'Switch to the Todo tab to run these.'
                : undefined;
            return (
              <AccordionSection
                key={category.key}
                id={`todo-txt-rail-${category.key}`}
                testId={categoryTestId(category.key)}
                title={category.title}
                count={count}
                expanded={Boolean(categoryState[category.key])}
                onToggle={() => toggleCategory(category.key)}
                dimmed={dimmed}
                hint={hint}
              >
                {category.key === 'inline-shortcuts' ? (
                  <>
                    {SHORTCUT_REFERENCE.map((s) => (
                      <ShortcutRow
                        key={s.trigger}
                        trigger={s.trigger}
                        expansion={s.expansion}
                        kind={s.kind}
                      />
                    ))}
                    {/*
                      Legend removed. Each row now carries
                      its own "LINE" / "INLINE" text badge (kindBadgeStyle),
                      so the dot + decoder-legend pair the section used
                      to have is redundant. Kept the accordion intact.
                    */}
                  </>
                ) : (
                  (items as Command[]).map((cmd) => (
                    <CommandRow key={cmd.name} command={cmd} />
                  ))
                )}
              </AccordionSection>
            );
          })}

          {otherCommands.length > 0 ? (
            <AccordionSection
              id="todo-txt-rail-other"
              testId={categoryTestId('other')}
              title="Other"
              count={otherCommands.length}
              expanded={Boolean(categoryState.other)}
              onToggle={() => toggleCategory('other')}
            >
              {otherCommands.map((cmd) => (
                <CommandRow key={cmd.name} command={cmd} />
              ))}
            </AccordionSection>
          ) : null}

          {tabContextHint ? (
            <div
              style={{
                ...descriptionStyle,
                padding: '8px 12px 14px',
                fontStyle: 'italic',
              }}
              data-testid="todo-txt-help-tab-hint"
            >
              {tabContextHint}
            </div>
          ) : null}
        </div>
      )}
    </aside>
  );
}
