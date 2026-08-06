/**
 * TodoTxtSyntaxOverlay — per-token colorizing overlay for the todo-txt
 * textarea.
 *
 * =====================================================================
 * Technique: transparent-text textarea + absolutely-positioned <pre>
 * =====================================================================
 *
 *   ┌─────────────────────────────────────────────────┐
 *   │ <textarea>                                      │  ← user types here.
 *   │   color: transparent;                           │     Caret stays visible
 *   │   caret-color: <theme-fg>;                      │     (caret-color survives
 *   │   z-index: 1;                                   │     transparent text).
 *   │ </textarea>                                     │
 *   │                                                 │
 *   │ <pre aria-hidden pointer-events: none>          │  ← this component.
 *   │   absolute inset-0 z-index: 0                   │     Renders the SAME
 *   │   <span class="tok-priority-A">(A) </span>      │     text the user
 *   │   <span class="tok-text">buy </span>            │     typed, broken into
 *   │   <span class="tok-project">+groceries</span>   │     colored spans via
 *   │ </pre>                                          │     `tokenize()`.
 *   └─────────────────────────────────────────────────┘
 *
 * The <pre> and <textarea> share identical box metrics (font, line-height,
 * padding, wrap mode, tab-size). Scroll is kept in sync by the parent
 * (TodoTxtPage.tsx) — it listens for textarea.onScroll and forwards
 * `scrollTop`/`scrollLeft` down via props. We intentionally DO NOT grab
 * the textarea ref from inside this component; that keeps it a pure
 * presentational layer that is trivial to test.
 *
 * =====================================================================
 * Color mapping (per spec)
 * =====================================================================
 *
 *   Token         | Styling
 *   ------------- | ------------------------------------
 *   (A) priority  | var(--danger), bold
 *   (B) priority  | var(--warn),   bold
 *   (C) priority  | var(--accent), bold
 *   other pri.    | var(--muted),  bold     (D–Z, not in spec but not unseen)
 *   date          | var(--muted)
 *   +project      | var(--ok)
 *   @context      | var(--info)
 *   key:value     | var(--accent), italic
 *   completion x  | var(--muted), line-through
 *   completed line| whole line muted + line-through
 *   plain text    | inherits (transparent, since the textarea renders it)
 *
 * =====================================================================
 * Fallback plan — line-height drift
 * =====================================================================
 *
 * The overlay technique is fragile: if the <pre>'s computed line-height
 * drifts even a fractional pixel from the <textarea>'s, tokens visually
 * detach from the caret row by row as the buffer grows. Known triggers:
 *   • Different fonts (textarea inherits `font-family: var(--font-body)`,
 *     <pre> must explicitly match).
 *   • `line-height: normal` vs an explicit unit — browsers compute
 *     `normal` slightly differently per font.
 *   • Zoom levels that trigger sub-pixel rounding.
 *   • Trailing-newline rendering (a textarea always reserves a blank row
 *     after a trailing `\n`; a <pre> only does if we append a sentinel).
 *
 * If we hit drift we cannot fix by pinning `line-height: 1.5rem` + an
 * explicit monospace-safe font stack + the "\n " sentinel trick, the
 * documented fallback is to swap this overlay for CodeMirror 6 (which
 * owns its own textarea virtualization). Before doing so, file a blocker
 * entry in docs/BLOCKERS.md named
 * "todo-txt — SyntaxOverlay line-height drift" with: browser, zoom,
 * font-family computed value, sample content that triggers drift, and a
 * screenshot. That entry gates the CM6 switch so we have receipts.
 */
import { memo, useMemo } from 'react';
import { tokenize, type Token } from '../utils/todotxt';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TodoTxtSyntaxOverlayProps {
  /** Current textarea content (same value the textarea binds to). */
  content: string;
  /**
   * Whether syntax highlighting is ON. When false we render nothing
   * visible — the component collapses to `display: none` so the textarea
   * owns all the painting. Defaults to false so a parent that forgets to
   * wire the hook fails closed (textarea stays legible).
   */
  enabled?: boolean;
  /**
   * Textarea scroll offsets forwarded from the parent's onScroll handler.
   * Undefined is treated as 0.
   */
  scrollTop?: number;
  scrollLeft?: number;
  /** Optional test-id for targeted selection in vitest/Playwright. */
  'data-testid'?: string;
}

// ---------------------------------------------------------------------------
// Token styling (pure, no React)
// ---------------------------------------------------------------------------

interface TokenStyle {
  className: string;
  /** Inline style overrides that can't be expressed as a class. */
  style?: React.CSSProperties;
}

/**
 * Map a token to its visual style. The return value is deterministic
 * (pure function of `token`), which keeps the overlay re-renders cheap.
 * `inCompletedLine` dims the whole line muted+line-through per spec.
 */
function styleForToken(token: Token, inCompletedLine: boolean): TokenStyle {
  if (inCompletedLine) {
    return {
      className: 'todotxt-tok todotxt-tok-completed-line',
      style: {
        color: 'var(--muted)',
        textDecoration: 'line-through',
      },
    };
  }

  switch (token.type) {
    case 'priority': {
      // Token value is the whole "(X) " prefix. Colour by the letter.
      const letter = token.value.charAt(1);
      if (letter === 'A') {
        return {
          className: 'todotxt-tok todotxt-tok-priority todotxt-tok-priority-a',
          style: { color: 'var(--danger)', fontWeight: 700 },
        };
      }
      if (letter === 'B') {
        return {
          className: 'todotxt-tok todotxt-tok-priority todotxt-tok-priority-b',
          style: { color: 'var(--warn)', fontWeight: 700 },
        };
      }
      if (letter === 'C') {
        return {
          className: 'todotxt-tok todotxt-tok-priority todotxt-tok-priority-c',
          style: { color: 'var(--accent)', fontWeight: 700 },
        };
      }
      // D–Z fall back to a muted bold so they're distinguishable from text
      // without stealing attention from the A/B/C hot priorities.
      return {
        className: 'todotxt-tok todotxt-tok-priority todotxt-tok-priority-lo',
        style: { color: 'var(--muted)', fontWeight: 700 },
      };
    }
    case 'date':
      return {
        className: 'todotxt-tok todotxt-tok-date',
        style: { color: 'var(--muted)' },
      };
    case 'project':
      return {
        className: 'todotxt-tok todotxt-tok-project',
        style: { color: 'var(--ok)' },
      };
    case 'context':
      return {
        className: 'todotxt-tok todotxt-tok-context',
        style: { color: 'var(--info, var(--accent))' },
      };
    case 'keyvalue':
      return {
        className: 'todotxt-tok todotxt-tok-keyvalue',
        style: { color: 'var(--accent)', fontStyle: 'italic' },
      };
    case 'completion':
      // Just the "x " prefix itself. The rest of the line picks up
      // inCompletedLine=true via the caller.
      return {
        className: 'todotxt-tok todotxt-tok-completion',
        style: { color: 'var(--muted)', textDecoration: 'line-through' },
      };
    case 'text':
    default:
      return { className: 'todotxt-tok todotxt-tok-text' };
  }
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

/**
 * Detect completed-line status WITHOUT re-tokenising: a todo.txt line is
 * "completed" iff it starts with a lowercase `x ` (literal, space-separated).
 * This mirrors the rule consumed by `tokenize` / `stripTodoTxtSyntax`.
 */
function isCompletedLine(line: string): boolean {
  return line.startsWith('x ') || line === 'x';
}

/**
 * Render one line as a sequence of <span>s. If the tokenizer returns
 * nothing (empty line), we render a zero-width space so the <pre> keeps
 * the row height aligned with the textarea — otherwise empty lines
 * collapse and the overlay drifts.
 */
function renderLine(line: string, lineIdx: number): React.ReactNode {
  const completed = isCompletedLine(line);
  const tokens = tokenize(line);

  if (tokens.length === 0) {
    // Zero-width space preserves row height. `&#8203;` renders nothing
    // visible but the browser still lays out the line box.
    return (
      <span
        key={`line-${lineIdx}-empty`}
        className="todotxt-tok todotxt-tok-empty"
      >
        {'\u200B'}
      </span>
    );
  }

  return tokens.map((tok, tokIdx) => {
    const style = styleForToken(tok, completed);
    return (
      <span
        key={`line-${lineIdx}-tok-${tokIdx}-${tok.start}`}
        className={style.className}
        style={style.style}
      >
        {tok.value}
      </span>
    );
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `memo` wraps the component because the common path is that `content`
 * is stable across unrelated parent re-renders (scroll, focus changes).
 * Re-tokenising on every keystroke is cheap, but re-tokenising on every
 * unrelated parent tick is wasteful.
 */
export const TodoTxtSyntaxOverlay = memo(function TodoTxtSyntaxOverlay({
  content,
  enabled = false,
  scrollTop = 0,
  scrollLeft = 0,
  'data-testid': testId = 'todo-txt-syntax-overlay',
}: TodoTxtSyntaxOverlayProps) {
  // Split once and memoise so React doesn't re-create children for every
  // unrelated re-render. Keyed by content so the memo invalidates cleanly
  // on edits.
  const lineNodes = useMemo(() => {
    if (!enabled) return null;
    // `split('\n')` preserves trailing empties — a trailing "\n" yields
    // a final empty string which we still render as a zero-width span so
    // the <pre> matches the textarea's trailing blank row.
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const isLast = idx === lines.length - 1;
      return (
        <span
          key={`line-${idx}`}
          data-line={idx}
          className="todotxt-line"
        >
          {renderLine(line, idx)}
          {/* Hard newline so <pre> wraps like the textarea. The last
              line gets no trailing \n to avoid a phantom blank row. */}
          {isLast ? null : '\n'}
        </span>
      );
    });
  }, [content, enabled]);

  return (
    <pre
      aria-hidden="true"
      data-testid={testId}
      className="todotxt-syntax-overlay"
      style={{
        // Hidden when SH is OFF — fail closed so textarea owns all paint.
        display: enabled ? 'block' : 'none',

        // Stack on top of the textarea background but BELOW the textarea
        // itself. Parent gives us `position: relative` + a transparent-
        // coloured textarea; we sit at z=0, textarea at z=1. Clicks
        // never land on us because `pointer-events: none`.
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        // Forward textarea scroll so tokens line up with caret content.
        // We transform instead of setting scrollTop to avoid the parent
        // pre becoming independently scrollable — it mirrors the
        // textarea's scroll offsets 1:1.
        transform: `translate(${-scrollLeft}px, ${-scrollTop}px)`,
        willChange: 'transform',

        // Same box metrics as the textarea (px/py/leading/font).
        margin: 0,
        padding: '0.75rem 1rem 0.75rem 3rem', // matches textarea pl-12 pr-4 py-3
        border: 'none',
        background: 'transparent',
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem', // text-sm
        lineHeight: '1.5rem', // leading-6, matches textarea
        tabSize: 4,

        // Critical: same wrap behaviour as the textarea (which wraps
        // soft-by-default). `whiteSpace: pre-wrap` keeps the \n we
        // insert between lines AND allows long lines to wrap like the
        // textarea's soft wrap.
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',

        // Guard against any text rendering on top / swallowing clicks.
        pointerEvents: 'none',
        // userSelect intentionally NOT set: let the textarea (above)
        // own selection behaviour. Setting `none` here was defensive
        // but caused subtle selection-passthrough issues on some
        // browsers when the overlay was GPU-composited above the
        // textarea for a frame during layout settle.

        // Avoid sub-pixel drift across GPU compositors — pin to the
        // nearest device pixel so the span baselines sit under the
        // caret row perfectly.
        transformOrigin: '0 0',
      }}
    >
      {lineNodes}
    </pre>
  );
});

TodoTxtSyntaxOverlay.displayName = 'TodoTxtSyntaxOverlay';

export default TodoTxtSyntaxOverlay;
