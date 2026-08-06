/**
 * CommandPalette — VSCode-style modal that lists every todo.sh CLI verb
 * as a named action. Opens on ⌘K / Ctrl+K (the parent registers the
 * global keyboard shortcut in T10 and toggles the `open` prop).
 *
 * =====================================================================
 * Props contract
 * =====================================================================
 *   open       — controlled visibility flag from the parent.
 *   onClose    — called on Esc, backdrop click, or after a successful
 *                execute. Parent flips `open` to false.
 *   onExecute  — called with the chosen `Command` and the parsed arg
 *                strings (in schema order). Parent dispatches into the
 *                command registry / palette dispatcher.
 *   commands   — the `COMMANDS` array from ../utils/commands.ts.
 *
 * =====================================================================
 * Interaction model
 * =====================================================================
 *  - The top slot is a search input. Typing filters the list with a
 *    case-insensitive substring match against the concatenated haystack
 *    `${name} ${shortName ?? ''} ${description}`. This is the "fuzzy"
 *    search described in the spec: low-ceremony, no external fuzzy
 *    library, good enough for 19 commands.
 *  - Up / Down arrows (and Tab / Shift+Tab) move the highlight through
 *    the filtered list, clamped at the ends.
 *  - Enter on a command with an empty `argSchema` immediately calls
 *    `onExecute(cmd, [])` then `onClose()`.
 *  - Enter on a command with a non-empty `argSchema` reveals an inline
 *    argument form below the list: one labelled `<input>` per entry
 *    in `argSchema`. The first argument input receives focus. Enter in
 *    an argument input advances focus to the next required input; on
 *    the last input, it calls `onExecute(cmd, values)` then `onClose()`.
 *    Optional args with an empty string are passed through as `""` —
 *    commands decide how to interpret omission.
 *  - Esc clears the pending argument form if one is open; otherwise it
 *    calls `onClose()`. Clicking the backdrop also calls `onClose()`.
 *
 * =====================================================================
 * Styling
 * =====================================================================
 * Uses the dashboard theme tokens (`--color-bg`, `--color-fg`,
 * `--color-muted-fg`, `--color-border`, `--color-bg-hover`, `--accent`)
 * exclusively — no hard-coded palette values. Inline style objects are
 * used instead of Tailwind classes so the component renders correctly
 * in both the plugin bundle (no Tailwind JIT) and the test jsdom env.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';

import type { Command } from '../utils/commands';

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

export interface CommandPaletteProps {
  /** Controlled visibility flag. When false, the palette is unmounted. */
  open: boolean;
  /** Close handler (Esc / backdrop / post-execute). */
  onClose: () => void;
  /**
   * Execute handler. Receives the chosen command and the collected
   * argument values (in `cmd.argSchema` order).
   */
  onExecute: (cmd: Command, args: string[]) => void;
  /** Full command list (`COMMANDS` from ../utils/commands.ts). */
  commands: Command[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Case-insensitive substring match against a concatenated haystack
 * (name + shortName + description). Empty queries match everything.
 */
function matchesQuery(cmd: Command, query: string): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = `${cmd.name} ${cmd.shortName ?? ''} ${cmd.description}`.toLowerCase();
  return haystack.includes(q);
}

/**
 * Try to parse input as "verb rest" where verb exactly matches a command
 * name or shortName (case-insensitive). Returns the matched command and
 * the remaining arg text, or null if no exact verb match.
 */
function parseInlineArgs(
  input: string,
  commands: Command[],
): { cmd: Command; rest: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) return null; // no args after verb
  const verb = trimmed.slice(0, spaceIdx).toLowerCase();
  const rest = trimmed.slice(spaceIdx + 1).trim();
  if (!rest) return null; // empty rest — use normal flow
  for (const cmd of commands) {
    if (
      cmd.name.toLowerCase() === verb ||
      (cmd.shortName && cmd.shortName.toLowerCase() === verb)
    ) {
      return { cmd, rest };
    }
  }
  return null;
}

/**
 * Split "rest" string into positional args for a command's argSchema.
 * First N-1 args are split on spaces; the last arg gets the remainder
 * (so 'add buy milk @errands' gives args=['buy milk @errands']).
 * If a single arg schema, all of rest is the single arg.
 */
function splitArgsForSchema(rest: string, argCount: number): string[] {
  if (argCount <= 1) return [rest];
  const parts = rest.split(/\s+/);
  if (parts.length <= argCount) {
    // Pad with empty strings for missing optional args
    while (parts.length < argCount) parts.push('');
    return parts;
  }
  // First N-1 are individual tokens, last gets the remainder
  const args = parts.slice(0, argCount - 1);
  args.push(parts.slice(argCount - 1).join(' '));
  return args;
}

// ---------------------------------------------------------------------------
// Styles (theme tokens only)
// ---------------------------------------------------------------------------

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(0, 0, 0, 0.72)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '10vh',
};

const panelStyle: CSSProperties = {
  width: 'min(640px, 92vw)',
  maxHeight: '70vh',
  display: 'flex',
  flexDirection: 'column',
  // Follow the active UI theme. Fallback only kicks in when the dashboard
  // theme hasn't published --color-bg (never in practice). Earlier fix
  // used a fixed #0f172a which broke light themes; drop that.
  background: 'var(--color-bg, #111827)',
  color: 'var(--color-fg, #e2e8f0)',
  border: '1px solid var(--color-border, #334155)',
  borderRadius: 8,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04)',
  overflow: 'hidden',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 14,
  background: 'transparent',
  color: 'var(--color-fg)',
  border: 'none',
  borderBottom: '1px solid var(--color-border)',
  outline: 'none',
  fontFamily: 'inherit',
};

const listStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  listStyle: 'none',
  margin: 0,
  padding: 4,
};

const emptyStyle: CSSProperties = {
  padding: '16px 14px',
  color: 'var(--color-muted-fg)',
  fontSize: 13,
};

function itemStyle(active: boolean): CSSProperties {
  return {
    padding: '8px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    background: active ? 'var(--color-bg-hover)' : 'transparent',
    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
  };
}

const nameStyle: CSSProperties = {
  fontWeight: 600,
  color: 'var(--color-fg)',
};

const shortStyle: CSSProperties = {
  color: 'var(--accent)',
  fontSize: 11,
  fontFamily: 'var(--font-mono, monospace)',
};

const descStyle: CSSProperties = {
  color: 'var(--color-muted-fg)',
  fontSize: 12,
  marginLeft: 'auto',
  textAlign: 'right',
  maxWidth: '60%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const argFormStyle: CSSProperties = {
  borderTop: '1px solid var(--color-border)',
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  background: 'var(--color-bg)',
};

const argRowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const argLabelStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--color-muted-fg)',
};

const argInputStyle: CSSProperties = {
  padding: '6px 8px',
  fontSize: 13,
  background: 'var(--color-bg)',
  color: 'var(--color-fg)',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  outline: 'none',
  fontFamily: 'inherit',
};

const hintStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--color-muted-fg)',
  padding: '6px 12px',
  borderTop: '1px solid var(--color-border)',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommandPalette({
  open,
  onClose,
  onExecute,
  commands,
}: CommandPaletteProps): JSX.Element | null {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pending, setPending] = useState<Command | null>(null);
  const [argValues, setArgValues] = useState<string[]>([]);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const firstArgRef = useRef<HTMLInputElement | null>(null);

  // ----- derived ----------------------------------------------------------
  const filtered = useMemo(
    () => commands.filter((c) => matchesQuery(c, query)),
    [commands, query],
  );

  // Scroll the active item into view when selectedIndex changes so arrow
  // navigation doesn't strand the highlight below the fold.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.children[selectedIndex] as HTMLElement | undefined;
    if (!active) return;
    active.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [selectedIndex, filtered.length]);

  // ----- reset on open/close ---------------------------------------------
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setPending(null);
      setArgValues([]);
      // Focus the search input after the modal mounts.
      const id = window.setTimeout(() => {
        searchRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  // Clamp the selected index whenever the filtered list shrinks/grows.
  useEffect(() => {
    setSelectedIndex((idx) => {
      if (filtered.length === 0) return 0;
      if (idx >= filtered.length) return filtered.length - 1;
      if (idx < 0) return 0;
      return idx;
    });
  }, [filtered.length]);

  // When switching into the pending-args state, focus the first input.
  useEffect(() => {
    if (pending) {
      const id = window.setTimeout(() => {
        firstArgRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [pending]);

  // Handle Escape at the window capture phase so a rapid open-then-Escape
  // still works before focus reaches the search input. When argument fields
  // are open, Escape preserves the documented first-step-back behavior.
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (pending) {
        setPending(null);
        setArgValues([]);
        window.setTimeout(() => searchRef.current?.focus(), 0);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [open, onClose, pending]);

  // ----- handlers ---------------------------------------------------------
  const submitCommand = useCallback(
    (cmd: Command, values: string[]) => {
      onExecute(cmd, values);
      onClose();
    },
    [onClose, onExecute],
  );

  const choose = useCallback(
    (cmd: Command) => {
      if (cmd.argSchema.length === 0) {
        submitCommand(cmd, []);
        return;
      }
      setPending(cmd);
      setArgValues(new Array<string>(cmd.argSchema.length).fill(''));
    },
    [submitCommand],
  );

  const handleSearchKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setSelectedIndex((i) =>
          filtered.length === 0 ? 0 : Math.min(i + 1, filtered.length - 1),
        );
        return;
      }
      if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        // Check if input matches "verb args" inline pattern first.
        const inlineMatch = parseInlineArgs(query, commands);
        if (inlineMatch) {
          const argCount = inlineMatch.cmd.argSchema.length;
          const args = splitArgsForSchema(inlineMatch.rest, argCount || 1);
          submitCommand(inlineMatch.cmd, argCount === 0 ? [] : args);
          return;
        }
        const cmd = filtered[selectedIndex];
        if (cmd) choose(cmd);
      }
    },
    [choose, filtered, onClose, selectedIndex],
  );

  const handleArgKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>, argIndex: number) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Clear pending form but keep palette open.
        setPending(null);
        setArgValues([]);
        // Restore focus to the search input on the next tick.
        window.setTimeout(() => searchRef.current?.focus(), 0);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!pending) return;
        const isLast = argIndex === pending.argSchema.length - 1;
        if (isLast) {
          submitCommand(pending, argValues);
        } else {
          const next = e.currentTarget.parentElement?.parentElement?.children[
            argIndex + 1
          ]?.querySelector('input');
          (next as HTMLInputElement | null)?.focus();
        }
      }
    },
    [argValues, pending, submitCommand],
  );

  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  // ----- render -----------------------------------------------------------
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      style={backdropStyle}
      onClick={handleBackdropClick}
      data-testid="command-palette-backdrop"
    >
      <div style={panelStyle} data-testid="command-palette">
        <input
          ref={searchRef}
          type="text"
          value={query}
          placeholder="Type a command… (Esc to close)"
          style={inputStyle}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleSearchKeyDown}
          aria-label="Search commands"
          data-testid="command-palette-search"
        />

        {filtered.length === 0 ? (
          <div style={emptyStyle} data-testid="command-palette-empty">
            No commands match "{query}".
          </div>
        ) : (
          <ul
            ref={listRef}
            style={listStyle}
            role="listbox"
            aria-label="Commands"
            data-testid="command-palette-list"
          >
            {filtered.map((cmd, idx) => {
              const active = idx === selectedIndex;
              return (
                <li
                  key={cmd.name}
                  role="option"
                  aria-selected={active}
                  style={itemStyle(active)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => choose(cmd)}
                  data-testid={`command-item-${cmd.name}`}
                  data-active={active ? 'true' : 'false'}
                >
                  <span style={nameStyle}>{cmd.name}</span>
                  {cmd.shortName ? (
                    <span style={shortStyle}>({cmd.shortName})</span>
                  ) : null}
                  <span style={descStyle}>{cmd.description}</span>
                </li>
              );
            })}
          </ul>
        )}

        {pending ? (
          <div style={argFormStyle} data-testid="command-palette-args">
            <div style={{ fontSize: 12, color: 'var(--color-muted-fg)' }}>
              <strong style={{ color: 'var(--color-fg)' }}>{pending.name}</strong>
              {' — '}
              {pending.description}
            </div>
            {pending.argSchema.map((arg, argIndex) => (
              <label key={arg.name} style={argRowStyle}>
                <span style={argLabelStyle}>
                  {arg.name}
                  {arg.optional ? ' (optional)' : ''}
                  {arg.description ? ` — ${arg.description}` : ''}
                </span>
                <input
                  ref={argIndex === 0 ? firstArgRef : undefined}
                  type="text"
                  value={argValues[argIndex] ?? ''}
                  onChange={(e) => {
                    const next = argValues.slice();
                    next[argIndex] = e.target.value;
                    setArgValues(next);
                  }}
                  onKeyDown={(e) => handleArgKeyDown(e, argIndex)}
                  style={argInputStyle}
                  aria-label={arg.name}
                  data-testid={`arg-input-${argIndex}`}
                />
              </label>
            ))}
            <div style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>
              Enter to run · Esc to go back
            </div>
          </div>
        ) : (
          <div style={hintStyle}>
            ↑↓ to navigate · Enter to run · Esc to close
          </div>
        )}
      </div>
    </div>
  );
}

export default CommandPalette;
