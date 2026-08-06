/**
 * ResultPanel — renders the result of a `list` / `listall` / `listcon` /
 * `listproj` / `listpri` command from the palette.
 *
 * The component has two modes matching `ApplyResult` variants:
 *
 *   - 'filter'    — linear list of matching tasks, click row to jump to
 *                   the corresponding line in the textarea.
 *   - 'aggregate' — grouped counts (e.g. "+work 8", "+home 3"), click
 *                   row to drill in (dispatches `listcon @key` /
 *                   `listproj +key`).
 *
 * Layout: slide-over panel on the right, full editor height, solid bg,
 * dismissable by Esc / backdrop click / × button.
 *
 * Keyboard:
 *   - Esc closes the panel (capture-phase listener, Firefox-safe)
 *   - Arrow Up/Down moves selection
 *   - Enter activates selected row (jump or drill)
 */
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type FilterLine = { index: number; text: string };
export type AggregateGroup = { key: string; count: number };

export type ResultPayload =
  | {
      type: 'filter';
      title: string;
      lines: FilterLine[];
    }
  | {
      type: 'aggregate';
      title: string;
      groups: AggregateGroup[];
      /** 'context' triggers listcon on drill, 'project' triggers listproj. */
      drillMode?: 'context' | 'project';
    };

export interface ResultPanelProps {
  open: boolean;
  result: ResultPayload | null;
  onClose: () => void;
  /** Called with 1-indexed line number when a filter row is clicked. */
  onJumpToLine?: (lineIdx1Based: number) => void;
  /** Called with the group key when an aggregate row is clicked. */
  onDrillIn?: (key: string, drillMode: 'context' | 'project') => void;
}

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1100,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'flex-end',
};

const panelStyle: CSSProperties = {
  width: 'min(560px, 90vw)',
  height: '100%',
  background: 'var(--color-bg, #0f172a)',
  color: 'var(--color-fg, #e5e7eb)',
  borderLeft: '1px solid var(--color-border, #334155)',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'inherit',
  boxShadow: '-6px 0 24px rgba(0,0,0,0.4)',
};

const headerStyle: CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--color-border, #334155)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  fontWeight: 600,
};

const closeButtonStyle: CSSProperties = {
  marginLeft: 'auto',
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-muted-fg, #94a3b8)',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 13,
};

const bodyStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '6px 0',
};

const rowBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 12,
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: 12,
  lineHeight: 1.4,
  borderLeft: '3px solid transparent',
};

function rowStyle(active: boolean): CSSProperties {
  return {
    ...rowBaseStyle,
    background: active ? 'var(--color-bg-hover, rgba(255,255,255,0.04))' : 'transparent',
    borderLeftColor: active ? 'var(--accent, #6366f1)' : 'transparent',
  };
}

const indexStyle: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  fontSize: 11,
  color: 'var(--color-muted-fg, #94a3b8)',
  minWidth: 32,
  textAlign: 'right',
  flexShrink: 0,
};

const countStyle: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  fontSize: 11,
  color: 'var(--color-muted-fg, #94a3b8)',
  marginLeft: 'auto',
  background: 'var(--color-bg-subtle, rgba(255,255,255,0.05))',
  padding: '1px 6px',
  borderRadius: 8,
  flexShrink: 0,
};

const textStyle: CSSProperties = {
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  flex: 1,
  color: 'var(--color-fg, #e5e7eb)',
};

const emptyStyle: CSSProperties = {
  padding: '24px 14px',
  color: 'var(--color-muted-fg, #94a3b8)',
  fontSize: 12,
  textAlign: 'center',
};

const footerStyle: CSSProperties = {
  padding: '6px 14px',
  borderTop: '1px solid var(--color-border, #334155)',
  fontSize: 10,
  color: 'var(--color-muted-fg, #94a3b8)',
  display: 'flex',
  gap: 12,
  justifyContent: 'space-between',
};

export function ResultPanel({
  open,
  result,
  onClose,
  onJumpToLine,
  onDrillIn,
}: ResultPanelProps): JSX.Element | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Reset selection when result changes.
  useEffect(() => {
    setSelectedIdx(0);
  }, [result]);

  // Esc handler (capture phase — Firefox-safe, beats window-manager
  // minimise on Linux when focus lands on <body>).
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () =>
      window.removeEventListener('keydown', handler, { capture: true });
  }, [open, onClose]);

  // Focus panel on open so arrow keys work immediately.
  useEffect(() => {
    if (!open) return;
    const rafId = requestAnimationFrame(() => {
      panelRef.current?.focus();
    });
    return () => cancelAnimationFrame(rafId);
  }, [open]);

  const activate = useCallback(
    (idx: number) => {
      if (!result) return;
      if (result.type === 'filter') {
        const row = result.lines[idx];
        if (!row) return;
        onJumpToLine?.(row.index);
        onClose();
      } else {
        const row = result.groups[idx];
        if (!row || !onDrillIn) return;
        onDrillIn(row.key, result.drillMode ?? 'context');
      }
    },
    [result, onJumpToLine, onDrillIn, onClose],
  );

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!result) return;
    const count =
      result.type === 'filter' ? result.lines.length : result.groups.length;
    if (count === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => (i + 1) % count);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => (i - 1 + count) % count);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSelectedIdx(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedIdx(count - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate(selectedIdx);
    }
  };

  if (!open || !result) return null;

  const onBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      style={backdropStyle}
      onMouseDown={onBackdropMouseDown}
      data-testid="todo-txt-result-backdrop"
    >
      <div
        ref={panelRef}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-label={result.title}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        data-testid="todo-txt-result-panel"
      >
        <div style={headerStyle}>
          <span data-testid="todo-txt-result-title">{result.title}</span>
          <span
            style={{
              fontWeight: 400,
              fontSize: 11,
              color: 'var(--color-muted-fg, #94a3b8)',
            }}
          >
            {result.type === 'filter'
              ? `${result.lines.length} item${result.lines.length === 1 ? '' : 's'}`
              : `${result.groups.length} group${result.groups.length === 1 ? '' : 's'}`}
          </span>
          <button
            type="button"
            style={closeButtonStyle}
            onClick={onClose}
            aria-label="Close result panel"
            data-testid="todo-txt-result-close"
          >
            Close ✕
          </button>
        </div>
        <div style={bodyStyle} data-testid="todo-txt-result-body">
          {result.type === 'filter' ? (
            result.lines.length === 0 ? (
              <div style={emptyStyle}>No matching items.</div>
            ) : (
              result.lines.map((row, idx) => (
                <div
                  key={`${row.index}-${idx}`}
                  style={rowStyle(idx === selectedIdx)}
                  onClick={() => {
                    setSelectedIdx(idx);
                    activate(idx);
                  }}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  data-testid={`todo-txt-result-row-${idx}`}
                  role="button"
                  tabIndex={-1}
                >
                  <span style={indexStyle}>{row.index}</span>
                  <span style={textStyle}>{row.text}</span>
                </div>
              ))
            )
          ) : result.groups.length === 0 ? (
            <div style={emptyStyle}>No groups found.</div>
          ) : (
            result.groups.map((row, idx) => (
              <div
                key={row.key}
                style={rowStyle(idx === selectedIdx)}
                onClick={() => {
                  setSelectedIdx(idx);
                  activate(idx);
                }}
                onMouseEnter={() => setSelectedIdx(idx)}
                data-testid={`todo-txt-result-row-${idx}`}
                role="button"
                tabIndex={-1}
              >
                <span style={textStyle}>{row.key}</span>
                <span style={countStyle}>{row.count}</span>
              </div>
            ))
          )}
        </div>
        <div style={footerStyle}>
          <span>
            ↑↓ navigate · Enter{' '}
            {result.type === 'filter' ? 'jump to line' : 'drill in'} · Esc close
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResultPanel;
