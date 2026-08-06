/**
 * TodoTxtSelectionPopover — floating action bar shown when the user
 * selects text inside the todo-txt textarea.
 *
 * =====================================================================
 * Layout
 * =====================================================================
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ [✓ Done] [(A/B/C) ▾] [📅 Date] [⧉ Copy]                      │  ← quick-action row
 *   ├──────────────────────────────────────────────────────────────┤
 *   │ <textarea "Add a comment for KiroCrew to act on…">           │  ← AI comment textarea
 *   │ [Cancel]                                        [Add ▶]       │     (identical to
 *   └──────────────────────────────────────────────────────────────┘     CommentPopover)
 *
 * =====================================================================
 * Positioning / flip / dismiss-on-scroll
 * =====================================================================
 *
 * Duplicated 1:1 from `CommentPopover` in the KiroCrew dashboard's
 * CommentOverlay.tsx so the UX feels identical to the markdown
 * viewer's selection popover:
 *   - When `containerRef` is provided, position `absolute` relative
 *     to that container (so the popover scrolls with the content and
 *     does not get clipped by ancestor overflow).
 *   - When no container, fall back to `fixed` relative to the viewport.
 *   - Flip check: if the popover bottom would exceed the viewport
 *     height, render it ABOVE the anchor rectangle instead of below.
 *   - Dismiss on scroll: listen on `scrollRef` (if provided) else
 *     `containerRef` else `window` — once the user scrolls, selection
 *     coordinates are stale, so close the popover.
 *
 * =====================================================================
 * Input shape: `anchorRect` (not x,y)
 * =====================================================================
 *
 * CommentPopover takes raw `x, y` numbers that come from a click event.
 * Here we take the *selection's* bounding `DOMRect` — computed by the
 * caller via a mirror-div trick in task 16 — so the popover can anchor
 * to the bottom-left of the highlighted range. Internally we map
 * `anchorRect` → `{x: anchorRect.left, y: anchorRect.bottom}` so the
 * flip / clamp math is identical to the reference implementation.
 *
 * =====================================================================
 * Props contract
 * =====================================================================
 *
 *   selection        — the raw selected substring (may span lines).
 *                      Rendered truncated inside quick-action handlers
 *                      if the caller wants to show it; the popover
 *                      itself does not display it (keeps the UI tight).
 *   anchorRect       — DOMRect of the selection bounding box in
 *                      viewport coordinates (same frame as
 *                      `getBoundingClientRect`).
 *   onClose          — called when the user hits Escape, clicks
 *                      Cancel on an empty comment draft, or scrolls.
 *   containerRef     — optional parent whose bounding rect is used to
 *                      convert viewport coords → parent-local absolute
 *                      coords. Matches CommentPopover semantics.
 *   scrollRef        — optional scroll container to listen on for
 *                      dismiss-on-scroll. Falls back to containerRef,
 *                      then window.
 *   onMarkDone       — Mark done action. Caller applies
 *                      `markLineDone()` per intersected line.
 *   onSetPriority    — called with 'A' | 'B' | 'C' | null to set /
 *                      clear the priority prefix on the selected lines.
 *   onAddCreationDate — inserts `YYYY-MM-DD ` after the priority (if any)
 *                      on each selected line via `addCreationDate()`.
 *                      via its existing POST endpoint (no nav change).
 *   onCopy           — writes `selection` to clipboard.
 *   onAddComment     — receives `{anchor, text}`. Caller enriches with
 *                      id/line/column and pushes onto the pending-
 *                      comments list (same shape as CommentOverlay).
 *
 * Callers supply ALL side effects — this component is presentation
 * only. That keeps it trivially unit-testable (task 20).
 *
 * =====================================================================
 * Styling
 * =====================================================================
 *
 * Matches CommentPopover: `bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-solid border-[var(--color-border)] rounded-lg
 * shadow-lg p-3 animate-scale-in`. Width fixed at 320px so the quick-
 * action row has a consistent layout (wraps on narrow screens rather
 * than reflowing the textarea).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  Calendar,
  Copy,
  ChevronDown,
  Trash2,
  CopyPlus,
  Archive,
  CalendarClock,
} from 'lucide-react';

import { isToggleDoneShortcut } from '../utils/todoTxtUiBehavior';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Priority = 'A' | 'B' | 'C' | null;

export interface NewInlineComment {
  anchor: string;
  text: string;
}

export interface TodoTxtSelectionPopoverProps {
  /** The selected substring. */
  selection: string;
  /** Bounding rect of the selection in viewport coords. */
  anchorRect: DOMRect;
  /** How many LINE BLOCKS the per-line actions will rewrite.
   *
   * Deliberately NOT the number of selection ranges: an alt-click caret is
   * a zero-width range that still selects its own line, so counting ranges
   * would understate what a click changes. The caller passes the merged
   * line-block count. */
  rangeCount?: number;
  /** True while CodeMirror Vim key handling is enabled. */
  vimMode?: boolean;
  /**
   * Which file the editor is showing ('todo' | 'done'). Two actions are
   * todo.txt-only and are HIDDEN on the done tab:
   *
   *   - "→ Done" (archive): its pipeline saves the transformed editor
   *     content as todo.txt and then runs the server-side archive. Run
   *     from the done tab it would overwrite todo.txt with done.txt's
   *     content wholesale — the single worst data-loss path in the app.
   *   - The AI comment box: POST /api/ai-edit reads and writes ONLY
   *     todo.txt server-side, so a comment anchored to a done.txt line
   *     targets a file that does not contain the anchor.
   *
   * Everything else (Done toggle, priority, dates, copy, dup, del) is a
   * legitimate raw edit of whichever file is open and stays available.
   */
  file?: 'todo' | 'done';
  /** Close the popover (Escape / Cancel / scroll). */
  onClose: () => void;
  /** Parent element for absolute positioning (matches CommentPopover). */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Scroll container ref retained for legacy textarea callers. */
  scrollRef?: React.RefObject<HTMLElement | null>;
  /** Concrete CodeMirror scroll element for reliable dismiss-on-scroll. */
  scrollElement?: HTMLElement | null;

  // ---- quick actions ----
  onMarkDone: () => void;
  onSetPriority: (p: Priority) => void;
  onAddCreationDate: () => void;
  onCopy: () => void;

  // ---- extended quick actions (2026-05-07 round 2) ----
  /** Delete the line(s) containing the selection. Destructive. */
  onDeleteLine: () => void;
  /** Duplicate the line(s) containing the selection. */
  onDuplicateLine: () => void;
  /** Mark selection done AND move to done.txt (server archive). */
  onArchiveSelection: () => void;
  /** Set due:YYYY-MM-DD on the selection's line(s). `relSpec` is
   *  whatever the shortcut date parser accepts: today/tom/+3d/+1w/fri. */
  onSetDueDate: (relSpec: string) => void;

  // ---- AI-edit comment ----
  onAddComment: (comment: NewInlineComment) => void;
  /** Hand the selection to KiroCrew chat instead of staging an AI edit. */
  onAskInChat: (comment: NewInlineComment) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** Preferred width; the rendered width shrinks on narrow editor panes. */
const POPOVER_PREFERRED_WIDTH = 320;
/** Height estimate used for the flip check (matches CommentPopover’s 200). */
const POPOVER_HEIGHT_ESTIMATE = 220;
/** Min gap (px) kept between the popover and the edges of the editor pane,
 *  so a stale/negative anchor can never slide it over the sidebar. */
const POPOVER_MARGIN = 8;
/** Gap (px) between the selection and whichever side renders the popover. */
const POPOVER_GAP = 8;

function TodoTxtSelectionPopover({
  selection,
  anchorRect,
  rangeCount = 1,
  vimMode = false,
  onClose,
  containerRef,
  scrollRef,
  scrollElement,
  onMarkDone,
  onSetPriority,
  onAddCreationDate,
  onCopy,
  onDeleteLine,
  onDuplicateLine,
  onArchiveSelection,
  onSetDueDate,
  onAddComment,
  onAskInChat,
  file = 'todo',
}: TodoTxtSelectionPopoverProps) {
  // -------------------------------------------------------------------
  // Dynamic height measurement via ResizeObserver (item 10)
  // -------------------------------------------------------------------
  const popoverRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(POPOVER_HEIGHT_ESTIMATE);
  const [, setViewportRevision] = useState(0);

  useEffect(() => {
    const el = popoverRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        if (h > 0) setMeasuredHeight(h);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let frame: number | null = null;
    const handleResize = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        setViewportRevision((revision) => revision + 1);
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  // -------------------------------------------------------------------
  // Positioning (duplicated from CommentPopover)
  // -------------------------------------------------------------------
  //
  // Map DOMRect → (x, y) in the same frame CommentPopover expects:
  //   x = anchor's left edge
  //   y = anchor's bottom edge (so popover drops *below* the selection)
  const x = anchorRect.left;
  const y = anchorRect.bottom;

  const container = containerRef?.current ?? null;
  const rect = container?.getBoundingClientRect();
  const useAbsolute = !!(container && rect);
  const posX = useAbsolute ? x - rect.left + container.scrollLeft : x;
  const posY = useAbsolute ? y - rect.top + container.scrollTop : y;
  const posAnchorTop = useAbsolute
    ? anchorRect.top - rect.top + container.scrollTop
    : anchorRect.top;
  const maxW = useAbsolute ? rect.width : window.innerWidth;
  const popoverWidth = Math.max(
    0,
    Math.min(POPOVER_PREFERRED_WIDTH, maxW - POPOVER_MARGIN * 2),
  );
  // Choose the side with enough room; if neither side fits, use the larger
  // side and cap the card to that exact space so overflow scrolls inside the
  // card instead of covering the selection or escaping the editor pane.
  const visibleTop = useAbsolute ? Math.max(rect!.top, 0) : 0;
  const visibleBottom = useAbsolute
    ? Math.min(rect!.bottom, window.innerHeight)
    : window.innerHeight;
  const belowSpace = Math.max(
    0,
    visibleBottom - anchorRect.bottom - POPOVER_GAP - POPOVER_MARGIN,
  );
  const aboveSpace = Math.max(
    0,
    anchorRect.top - visibleTop - POPOVER_GAP - POPOVER_MARGIN,
  );
  const fitsBelow = measuredHeight <= belowSpace;
  const fitsAbove = measuredHeight <= aboveSpace;
  const flipped = !fitsBelow && (fitsAbove || aboveSpace > belowSpace);
  const availableHeight = flipped ? aboveSpace : belowSpace;
  const positionedHeight = Math.min(measuredHeight, availableHeight);
  const scrollLeft = useAbsolute ? container.scrollLeft : 0;
  const scrollTop = useAbsolute ? container.scrollTop : 0;
  const minTop = useAbsolute
    ? scrollTop + visibleTop - rect!.top + POPOVER_MARGIN
    : POPOVER_MARGIN;

  // -------------------------------------------------------------------
  // Dismiss on scroll (duplicated from CommentPopover)
  // -------------------------------------------------------------------
  //
  // Once the user scrolls, the anchorRect coordinates are stale so
  // there is no way to keep the popover visually attached to the
  // selection. Close it instead.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const target =
      scrollElement ?? scrollRef?.current ?? containerRef?.current ?? window;
    const handler = () => onCloseRef.current();
    target.addEventListener('scroll', handler, { passive: true });
    return () => target.removeEventListener('scroll', handler);
  }, [scrollElement, scrollRef, containerRef]);

  // -------------------------------------------------------------------
  // Priority dropdown state (A / B / C / clear)
  // -------------------------------------------------------------------
  const [priorityOpen, setPriorityOpen] = useState(false);
  const priorityRef = useRef<HTMLDivElement>(null);
  // Due-date dropdown (2026-05-07 round 2)
  const [dueOpen, setDueOpen] = useState(false);
  const dueRef = useRef<HTMLDivElement>(null);
  // Click-outside to close the priority dropdown.
  useEffect(() => {
    if (!priorityOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setPriorityOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [priorityOpen]);

  // Click-outside to close the due-date dropdown.
  useEffect(() => {
    if (!dueOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (dueRef.current && !dueRef.current.contains(e.target as Node)) {
        setDueOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [dueOpen]);

  const pickPriority = useCallback(
    (p: Priority) => {
      setPriorityOpen(false);
      onSetPriority(p);
    },
    [onSetPriority]
  );

  // -------------------------------------------------------------------
  // Comment textarea state (mirrors CommentPopover)
  // -------------------------------------------------------------------
  const [commentText, setCommentText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const submitComment = useCallback(() => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    onAddComment({ anchor: selection, text: trimmed });
    setCommentText('');
    // Keep the popover open so the user can stack multiple comments on
    // the same selection without re-selecting — matches markdown
    // viewer behaviour.
    textareaRef.current?.focus();
  }, [commentText, onAddComment, selection]);

  const askInChat = useCallback(() => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    onAskInChat({ anchor: selection, text: trimmed });
    setCommentText('');
    // No focus restore here: the page dismisses the selection and
    // navigates to /chat, so this popover is unmounting.
  }, [commentText, onAskInChat, selection]);

  const cancelComment = useCallback(() => {
    if (commentText.trim()) {
      // Non-empty draft: clear it but keep the popover open so Escape
      // first drops the draft, second closes.
      setCommentText('');
      return;
    }
    onClose();
  }, [commentText, onClose]);

  // -------------------------------------------------------------------
  // Keyboard shortcuts (active only while this popover is mounted).
  //
  //   Cmd/Ctrl+D      → Mark done (Ctrl+D remains Vim scroll in VIM mode)
  //   Cmd/Ctrl+1/2/3  → Set priority (A) / (B) / (C)
  //   Cmd/Ctrl+0      → Clear priority
  //   Escape          → Close popover
  //
  // We stash the action callbacks in refs (same pattern as onCloseRef
  // above) so re-subscribing only when Vim mode changes still calls the
  // freshest action handlers without churn on every render.
  //
  // preventDefault is called on every matched shortcut to avoid browser
  // conflicts (Cmd+D = bookmark, Cmd+1/2/3 = switch tab in some
  // browsers) and to keep the key from leaking into the textarea when
  // focus is inside the comment box.
  // -------------------------------------------------------------------
  const onMarkDoneRef = useRef(onMarkDone);
  const onSetPriorityRef = useRef(onSetPriority);
  useEffect(() => {
    onMarkDoneRef.current = onMarkDone;
  }, [onMarkDone]);
  useEffect(() => {
    onSetPriorityRef.current = onSetPriority;
  }, [onSetPriority]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Escape always closes, even without a modifier.
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      // All other shortcuts require Cmd (macOS) OR Ctrl (Linux/Windows)
      // with NO Alt / Shift (so ordinary typing in the textarea is
      // unaffected). `metaKey` covers Cmd on macOS; `ctrlKey` covers
      // Ctrl elsewhere. We explicitly reject both being pressed at
      // once (Ctrl+Cmd+D) for predictability.
      const key = e.key.toLowerCase();
      if (key === 'd') {
        if (!isToggleDoneShortcut(e, vimMode)) return;
        e.preventDefault();
        e.stopPropagation();
        onMarkDoneRef.current();
        return;
      }

      // Priority shortcuts keep their existing platform-modifier behavior.
      const modifier = e.ctrlKey !== e.metaKey;
      if (!modifier || e.altKey || e.shiftKey) return;

      if (key === '1') {
        e.preventDefault();
        e.stopPropagation();
        onSetPriorityRef.current('A');
      } else if (key === '2') {
        e.preventDefault();
        e.stopPropagation();
        onSetPriorityRef.current('B');
      } else if (key === '3') {
        e.preventDefault();
        e.stopPropagation();
        onSetPriorityRef.current('C');
      } else if (key === '0') {
        e.preventDefault();
        e.stopPropagation();
        onSetPriorityRef.current(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [vimMode]);

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Todo-txt selection actions"
      className={`${
        useAbsolute ? 'absolute' : 'fixed'
      } z-50 box-border bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-solid border-[var(--border-strong,var(--color-border))] rounded-lg shadow-lg p-3 animate-scale-in`}
      style={{
        // Clamp BOTH edges so a stale/negative anchor can never push the
        // popover left of the editor pane (i.e. on top of the sidebar) or
        // off the right edge. `left` is bounded to [MARGIN, maxW-WIDTH-MARGIN];
        // `top` to >= MARGIN. Previously only the right edge was clamped, so a
        // negative posX rendered the popover over the dashboard sidebar.
        left: Math.max(
          scrollLeft + POPOVER_MARGIN,
          Math.min(
            posX,
            Math.max(
              scrollLeft + POPOVER_MARGIN,
              scrollLeft + maxW - popoverWidth - POPOVER_MARGIN,
            ),
          ),
        ),
        top: Math.max(
          minTop,
          flipped
            ? posAnchorTop - positionedHeight - POPOVER_GAP
            : posY + POPOVER_GAP,
        ),
        width: popoverWidth,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: Math.max(1, availableHeight),
        overflowY: 'auto',
      }}
      // Stop clicks inside the popover from bubbling up and triggering
      // the caller’s "click outside selection → close" logic.
      onMouseDown={(e) => e.stopPropagation()}
    >
      {rangeCount > 1 && (
        <div
          className="mb-2 text-[11px] font-medium text-[var(--muted-aa)]"
          data-testid="todo-txt-selection-count"
          role="status"
        >
          {rangeCount} selections · actions apply to each selected line
        </div>
      )}
      {/* -----------------------------------------------------------
          Quick-action row
          ----------------------------------------------------------- */}
      <div className="flex items-start gap-1 flex-wrap" role="toolbar" aria-label="Quick actions">
        <button
          type="button"
          aria-label="Mark done (Cmd/Ctrl+D)"
          title="Mark done (Cmd/Ctrl+D)"
          onClick={onMarkDone}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          <Check className="lucide-inline w-3.5 h-3.5" />
          <span>Done</span>
          <span
            aria-hidden="true"
            className="ml-1 text-[var(--muted-aa)] text-[10px] font-sans font-normal"
          >
            ⌘D
          </span>
        </button>

        {/* -- Priority dropdown -- */}
        <div ref={priorityRef} className="flex flex-col items-start">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={priorityOpen}
            aria-label="Set priority"
            title="Set priority (Cmd/Ctrl+1/2/3, Cmd/Ctrl+0 to clear)"
            onClick={() => {
              setDueOpen(false);
              setPriorityOpen((v) => !v);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <span className="font-mono">(A/B/C)</span>
            <ChevronDown className="lucide-inline w-3 h-3" />
          </button>
          {priorityOpen && (
            <div
              role="menu"
              aria-label="Priority options"
              className="box-border mt-1 w-[120px] max-w-full bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-solid border-[var(--color-border)] rounded-md shadow-lg py-1"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => pickPriority('A')}
                title="Set priority A (Cmd/Ctrl+1)"
                className="flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--color-danger)] font-mono font-bold hover:bg-[var(--color-bg-hover)] cursor-pointer"
              >
                <span>(A)</span>
                <span className="text-[var(--muted-aa)] text-[10px] font-sans font-normal">⌘1</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => pickPriority('B')}
                title="Set priority B (Cmd/Ctrl+2)"
                className="flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--warning)] font-mono font-bold hover:bg-[var(--color-bg-hover)] cursor-pointer"
              >
                <span>(B)</span>
                <span className="text-[var(--muted-aa)] text-[10px] font-sans font-normal">⌘2</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => pickPriority('C')}
                title="Set priority C (Cmd/Ctrl+3)"
                className="flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--accent)] font-mono font-bold hover:bg-[var(--color-bg-hover)] cursor-pointer"
              >
                <span>(C)</span>
                <span className="text-[var(--muted-aa)] text-[10px] font-sans font-normal">⌘3</span>
              </button>
              <div className="border-t border-solid border-[var(--color-border)] my-1" />
              <button
                type="button"
                role="menuitem"
                onClick={() => pickPriority(null)}
                title="Clear priority (Cmd/Ctrl+0)"
                className="flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--muted-aa)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
              >
                <span>Clear</span>
                <span className="text-[var(--muted-aa)] text-[10px] font-sans font-normal">⌘0</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Add creation date"
          title="Add today's creation date"
          onClick={onAddCreationDate}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          <Calendar className="lucide-inline w-3.5 h-3.5" />
          <span>Date</span>
        </button>

        <button
          type="button"
          aria-label="Copy selection"
          title="Copy selection to clipboard"
          onClick={onCopy}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          <Copy className="lucide-inline w-3.5 h-3.5" />
          <span>Copy</span>
        </button>

        {/* -- Due date dropdown (2026-05-07 round 2) -- */}
        <div ref={dueRef} className="flex flex-col items-start">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={dueOpen}
            aria-label="Set due date"
            title="Set due:YYYY-MM-DD on this line"
            onClick={() => {
              setPriorityOpen(false);
              setDueOpen((v) => !v);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <CalendarClock className="lucide-inline w-3.5 h-3.5" />
            <span>Due</span>
            <ChevronDown className="lucide-inline w-3 h-3" />
          </button>
          {dueOpen && (
            <div
              role="menu"
              aria-label="Due date options"
              className="box-border mt-1 w-[140px] max-w-full bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-solid border-[var(--color-border)] rounded-md shadow-lg py-1"
            >
              {[
                ['today', 'Today'],
                ['tom', 'Tomorrow'],
                ['+3d', 'In 3 days'],
                ['+1w', 'In 1 week'],
                ['+2w', 'In 2 weeks'],
                ['fri', 'Next Friday'],
                ['mon', 'Next Monday'],
              ].map(([rel, label]) => (
                <button
                  key={rel}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setDueOpen(false);
                    onSetDueDate(rel);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1 text-[12px] text-[var(--color-fg)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
                >
                  <span>{label}</span>
                  <span className="text-[var(--muted-aa)] text-[10px] font-mono">{rel}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Duplicate line"
          title="Duplicate line(s) below"
          onClick={onDuplicateLine}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          <CopyPlus className="lucide-inline w-3.5 h-3.5" />
          <span>Dup</span>
        </button>

        {file === 'todo' && (
          <button
            type="button"
            aria-label="Archive line to done.txt"
            title="Mark done + move to done.txt — also archives every line already marked x"
            onClick={onArchiveSelection}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-fg)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <Archive className="lucide-inline w-3.5 h-3.5" />
            <span>→ Done</span>
          </button>
        )}

        <button
          type="button"
          aria-label="Delete line"
          title="Delete line(s) — destructive"
          onClick={onDeleteLine}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] text-[var(--color-danger)] bg-[var(--color-bg-elevated)] border border-solid border-[var(--color-border)] hover:border-[var(--color-danger)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
        >
          <Trash2 className="lucide-inline w-3.5 h-3.5" />
          <span>Del</span>
        </button>
      </div>

      {/* -----------------------------------------------------------
          Divider + AI comment. Available on both tabs: the action
          launches a chat with the selection (paste-back flow), which
          is a raw-file-safe operation on either file. The page names
          the actual file in the launch message.
          ----------------------------------------------------------- */}
      <div className="border-t border-solid border-[var(--color-border)] my-2" />

      {/* -----------------------------------------------------------
          Comment textarea (mirrors CommentPopover)
          -----------------------------------------------------------
          `data-testid` added so end-to-end tests can
          target the textarea without relying on aria-label or
          placeholder copy (which could change again). */}
      <textarea
        ref={textareaRef}
        aria-label="Add a comment for KiroCrew"
        placeholder="Tell KiroCrew what to do…"
        title="Enter to run · Shift+Enter for a new line"
        value={commentText}
        rows={1}
        onChange={(e) => {
          setCommentText(e.target.value);
          autoGrow(e.target);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
            e.preventDefault();
            e.stopPropagation();
            submitComment();
          }
          // Escape inside the textarea: handled by the global listener
          // above so it works uniformly regardless of focus.
        }}
        className="box-border bg-[var(--color-bg)] border border-solid border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-fg)] text-sm font-sans outline-none w-full mb-2 transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] placeholder:text-[13px] placeholder:text-[var(--muted-aa)] resize-none leading-[21px]"
        data-testid="todo-txt-selection-prompt"
      />
      <div className="flex gap-1.5 justify-end">
        <button
          type="button"
          onClick={cancelComment}
          className="px-3 py-1 rounded-md text-[12px] text-[var(--muted-aa)] bg-transparent border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--color-fg)] transition-colors cursor-pointer"
          data-testid="todo-txt-selection-cancel"
        >
          Cancel
        </button>
        {/*
          "Just do it ▸" rename.
          Previously "Run ▶". The user's mental model is "press this and
          KiroCrew does the thing", not "run this prompt through a
          pipeline". New copy matches that phrasing and keeps the same
          chevron affordance (now ▸ = U+25B8 to distinguish from ▶, which
          reads as "play" / "resume media").

          Known limitation (host-side gate): the click
          writes `window.__mc_chat_launch` and navigates to /chat via
          the SDK's `useChatLauncher` (see handleAddComment in
          TodoTxtPage.tsx). The running KiroCrew website bundle predates
          the ChatPage mount-effect that reads the intent global, so the
          /chat page currently lands empty. Fix requires a
          the KiroCrew dashboard rebuild/redeploy — see
          ~/.sdm/s-team/TODO_TXT_MANAGER/wave3-item5-host-escalation.md
          for the escalation. todo.txt-side write is correct.

          2026-05-13 WCAG contrast fix — `text-white` → `text-[var(--accent-fg)]`:
          A dark-theme review caught white-on-accent at
          1.94:1 (FAILS WCAG AA ≥3:1 for large text; `--accent` is the
          fairly light `#00d492` in default dark). The v2.4 SDK ships
          `--accent-fg` as the paired foreground across all themes
          (confirmed in the installed dashboard CSS:
          `.text-[var(--accent-fg)] { color: var(--accent-fg) }` and ~30 theme
          variants where `--accent-fg` is either `#000` or `#fff` chosen
          to pass AA against the theme's `--accent`). Post-fix dark:
          black on `#00d492` ≈ 10.80:1 (AAA). Post-fix light: white on
          `#047558` ≈ 5.68:1 (AA, unchanged — light already passed).
          Matches the dashboard's own `Btn` / `SendBtn` primitive
          pattern (`bg-[var(--accent)] text-[var(--accent-fg)]`).
        */}
        {/* Secondary path: hand the selection to KiroCrew chat instead of
            the in-app staged pipeline. This WAS the only behaviour of "Just
            do it" before the rewire; it stays because the staged pipeline
            only rewrites task lines, while chat handles anything
            conversational. */}
        <button
          type="button"
          onClick={askInChat}
          disabled={!commentText.trim()}
          className="px-3 py-1 rounded-md text-[12px] whitespace-nowrap text-[var(--muted-aa)] bg-transparent border border-solid border-[var(--color-border)] hover:border-[var(--accent)] hover:text-[var(--color-fg)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          data-testid="todo-txt-ask-in-chat"
          title="Open a KiroCrew chat with this selection and your prompt"
          aria-label="Ask in chat — hand the selection to KiroCrew chat"
        >
          Chat
        </button>
        <button
          type="button"
          onClick={submitComment}
          disabled={!commentText.trim()}
          className="px-3 py-1 rounded-md text-[12px] whitespace-nowrap text-[var(--accent-fg)] bg-[var(--accent)] border border-solid border-[var(--accent)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          data-testid="todo-txt-just-do-it"
          title="Stage this edit — KiroCrew rewrites the line; destructive changes are shown as a diff first"
          aria-label="Just do it — stage an AI edit for this selection"
        >
          Just do it ▸
        </button>
      </div>
    </div>
  );
}

export default TodoTxtSelectionPopover;
export { TodoTxtSelectionPopover };
