/**
 * CmEditor — CodeMirror 6 wrapper with controlled-value contract.
 *
 * The editing surface for TodoTxtPage.tsx, with a textarea-compatible
 * interface:
 *   - value/onChange for content syncing
 *   - onSelectionChange(start, end) for popover anchoring
 *   - focus()/getCaret() imperative handle for shortcuts + popover
 *   - data-testid="todo-txt-textarea" on the contentDOM for e2e compat
 *
 * Vim mode is toggled dynamically via a Compartment (no remount).
 * Syntax highlighting is provided by the todotxt decoration plugin.
 */
import {
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
  useCallback,
  useMemo,
} from 'react';
import { EditorState, Compartment, Transaction, type Extension, Prec } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  ViewUpdate,
  placeholder as cmPlaceholder,
  rectangularSelection,
  crosshairCursor,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { todotxtDecorations } from './cm-todotxt-decorations';
import {
  todotxtFilterDim,
  todotxtThresholdDim,
  todotxtHiddenLines,
} from './cm-todotxt-filter';
import { registerTodotxtVimBindings } from './cm-vim-todotxt';
import type { ParsedFilter } from '../utils/filterExpr';
import { DEFAULT_HIDDEN_MODE, type HiddenMode } from '../utils/hidden';

// Vim is lazy-loaded on first enable to keep initial bundle lean.
let vimModule: typeof import('@replit/codemirror-vim') | null = null;
let vimLoadPromise: Promise<typeof import('@replit/codemirror-vim')> | null = null;
// defineAction/mapCommand mutate @replit/codemirror-vim's GLOBAL Vim object,
// so the todo.txt leader bindings must register exactly once per page load.
let vimBindingsRegistered = false;

async function loadVim() {
  if (vimModule) return vimModule;
  if (!vimLoadPromise) {
    vimLoadPromise = import('@replit/codemirror-vim');
  }
  vimModule = await vimLoadPromise;
  if (!vimBindingsRegistered) {
    // Wire the todo.txt leader commands (\x \j \k \a \b \c \d \D \s) the
    // help rail advertises. Without this call the bindings never reach the
    // global Vim object, and the rail documents keys that do nothing.
    registerTodotxtVimBindings(vimModule.Vim);
    vimBindingsRegistered = true;
  }
  return vimModule;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CmSelectionRange {
  from: number;
  to: number;
}

export interface CmEditorHandle {
  /** Focus the editor. */
  focus(): void;
  /** Get current caret offset. */
  getCaret(): number;
  /** Set caret to given offset. */
  setCaret(pos: number): void;
  /** Set a single selection range. */
  setSelection(start: number, end: number): void;
  /** Read all cursor/selection ranges. */
  getSelections(): CmSelectionRange[];
  /** Get the editor's scrolling element. */
  getScrollElement(): HTMLElement | null;
  /** Get current value (avoids stale closure issues). */
  getValue(): string;
  /** Get the EditorView instance (for advanced integrations). */
  getView(): EditorView | null;
  /** Replace the whole document as a USER EDIT — undoable, and moving the
   *  caret to `caret`.
   *
   *  The controlled-value path (`value` prop) is deliberately NOT undoable, so
   *  that loading a file cannot be undone into an empty document.
   *  But a page-level rewrite the USER caused — the `!!date` shortcut
   *  expansion is the one that matters — has to stay undoable, or `u` /
   *  Ctrl+Z silently does nothing right after it. Routing that one case
   *  through here keeps the two kinds of whole-document write distinguishable
   *  instead of guessing from the value alone.
   *
   *  Deliberately NOT marked as a `userEvent: 'input'` transaction: the page
   *  gates its shortcut expander on `meta.typed`, and re-entering it with the
   *  already-expanded text would risk expanding twice. */
  applyEdit(value: string, caret?: number): void;
}

export interface CmChangeMeta {
  /**
   * True when the change came from real user input (typing, paste, drop,
   * completion) rather than an undo/redo or a programmatic transaction.
   * Consumers that only make sense for typed input — the `!!` shortcut
   * expander — must gate on this.
   */
  typed: boolean;
}

export interface CmEditorProps {
  value: string;
  onChange: (content: string, meta?: CmChangeMeta) => void;
  onSelectionChange?: (
    start: number,
    end: number,
    ranges: CmSelectionRange[],
  ) => void;
  /** Called at most once per animation frame when scrolling changes geometry. */
  onViewportChange?: () => void;
  /** Vim mode enabled. */
  vimMode?: boolean;
  /** Syntax highlight enabled. */
  syntaxHighlight?: boolean;
  /**
   * Active dim filter, or null for none. Non-matching lines are dimmed by a
   * line decoration; the document stays fully editable either way.
   */
  filter?: ParsedFilter | null;
  /**
   * True while `threshold hide` is active: lines whose `t:` date is in the
   * future are pushed into the visual background. Never removed from the
   * document — see utils/threshold.ts.
   */
  thresholdHidden?: boolean;
  /**
   * How `h:1` lines are treated: `'dim'` (default) pushes them far into the
   * background, `'hide'` removes them from view, `'show'` leaves them alone.
   * `'hide'` is the one place this editor collapses a line, and only because
   * the user typed the tag that asks for it — see utils/hidden.ts. The document
   * is never altered in any mode, and the cursor's own line is always exempt.
   */
  hiddenMode?: HiddenMode;
  /** Placeholder text when empty. */
  placeholder?: string;
  /** Disabled state. */
  disabled?: boolean;
  /** Called when vim mode changes (NORMAL/INSERT/VISUAL). */
  onVimModeChange?: (mode: string) => void;
  /** Fired on keydown events CM doesn't consume (for shortcuts compat). */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Fired on mouseup / selection gestures settling (for popover). */
  onMouseUp?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CmEditor = forwardRef<CmEditorHandle, CmEditorProps>(function CmEditor(
  {
    value,
    onChange,
    onSelectionChange,
    onViewportChange,
    vimMode = false,
    syntaxHighlight = true,
    filter = null,
    thresholdHidden = false,
    hiddenMode = DEFAULT_HIDDEN_MODE,
    placeholder = '',
    disabled = false,
    onVimModeChange,
    onKeyDown,
    onMouseUp,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onViewportChangeRef = useRef(onViewportChange);
  const onVimModeChangeRef = useRef(onVimModeChange);
  const vimModeCleanupRef = useRef<(() => void) | null>(null);
  const onKeyDownRef = useRef(onKeyDown);
  const onMouseUpRef = useRef(onMouseUp);
  const filterRef = useRef(filter);
  filterRef.current = filter;
  const thresholdHiddenRef = useRef(thresholdHidden);
  thresholdHiddenRef.current = thresholdHidden;
  const hiddenModeRef = useRef(hiddenMode);
  hiddenModeRef.current = hiddenMode;

  // Keep refs fresh without triggering effect re-runs.
  onChangeRef.current = onChange;
  onSelectionChangeRef.current = onSelectionChange;
  onViewportChangeRef.current = onViewportChange;
  onVimModeChangeRef.current = onVimModeChange;
  onKeyDownRef.current = onKeyDown;
  onMouseUpRef.current = onMouseUp;

  // Compartments for dynamic reconfiguration.
  const vimCompartment = useMemo(() => new Compartment(), []);
  const syntaxCompartment = useMemo(() => new Compartment(), []);
  const filterCompartment = useMemo(() => new Compartment(), []);
  const thresholdCompartment = useMemo(() => new Compartment(), []);
  const hiddenCompartment = useMemo(() => new Compartment(), []);
  const readOnlyCompartment = useMemo(() => new Compartment(), []);

  // Track whether we're dispatching an update from external value sync.
  const externalUpdate = useRef(false);
  // Avoid a second full-document serialization when React reflects an edit
  // straight back through the controlled `value` prop.
  const lastEmittedValue = useRef<string | null>(null);

  // ---------------------------------------------------------------------------
  // Initial mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    let selectionFrame: number | null = null;
    let viewportFrame: number | null = null;
    const emitSelection = (view: EditorView) => {
      if (selectionFrame !== null) cancelAnimationFrame(selectionFrame);
      selectionFrame = requestAnimationFrame(() => {
        selectionFrame = null;
        const main = view.state.selection.main;
        const ranges = view.state.selection.ranges.map((range) => ({
          from: range.from,
          to: range.to,
        }));
        onSelectionChangeRef.current?.(main.from, main.to, ranges);
      });
    };
    const emitViewportChange = () => {
      if (viewportFrame !== null) return;
      viewportFrame = requestAnimationFrame(() => {
        viewportFrame = null;
        onViewportChangeRef.current?.();
      });
    };

    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (!externalUpdate.current && update.docChanged) {
        const newContent = update.state.doc.toString();
        lastEmittedValue.current = newContent;
        // Provenance, not just text. The page's `!!` shortcut expander is
        // written for "the user just typed a trigger char", but onChange fires
        // for EVERY document change — including vim's `u`. An undo restores
        // both the pre-expansion text AND the caret sitting right after the
        // trigger space, so without provenance the undo reads as a fresh
        // trigger and the expansion is re-applied: the user could never get
        // back to what they typed. `input` covers typing, paste, drop and
        // completion; `undo` / `redo` and programmatic transactions do not
        // carry it.
        const typed = update.transactions.some((tr) => tr.isUserEvent('input'));
        onChangeRef.current(newContent, { typed });
      }

      if (update.selectionSet || update.docChanged) emitSelection(update.view);
      if (update.viewportChanged || update.geometryChanged) emitViewportChange();
    });

    const interactionHandlers = EditorView.domEventHandlers({
      mouseup: () => {
        requestAnimationFrame(() => onMouseUpRef.current?.());
        return false;
      },
      keyup: () => {
        requestAnimationFrame(() => onMouseUpRef.current?.());
        return false;
      },
    });

    const theme = EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '0.875rem',
        // The mono chain, not --font-body: the editor shows a todo.txt FILE,
        // and --font-body resolves to the host's proportional body font. The
        // user's selected mono comes through --font-mono -> --mono.
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        backgroundColor: 'transparent',
        color: 'var(--color-fg, #e4e4e7)',
      },
      '.cm-content': {
        // A small left inset is enough: CodeMirror renders a real line-number
        // gutter to our left, so the content does not need to reserve space
        // for one of its own.
        padding: '0.75rem 1rem 0.75rem 0.75rem',
        lineHeight: '1.5rem',
        caretColor: 'var(--color-fg, #e4e4e7)',
        fontFamily: 'inherit',
      },
      '.cm-gutters': {
        backgroundColor: 'transparent',
        // Divider between the number gutter and the text area.
        borderRight: '1px solid var(--color-border, #27272a)',
        color: 'var(--color-muted-fg, #71717a)',
        minWidth: '2.75rem',
        // NOTE: no paddingTop here — CodeMirror aligns the first gutter
        // element to the content's top padding by itself; adding our own
        // padding double-offsets every number ~half a row downward.
        fontFamily: 'inherit',
        fontSize: '0.8125rem',
      },
      // Vertically center each number in the 1.5rem line box so numbers line
      // up with their text rows (the default gutter line-height, derived
      // from the smaller gutter font, floated the digits too high).
      '.cm-lineNumbers .cm-gutterElement': {
        lineHeight: '1.5rem',
        padding: '0 0.55rem 0 0.4rem',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: 'var(--color-fg, #e4e4e7)',
      },
      '.cm-activeLine': {
        backgroundColor: 'var(--color-bg-hover, rgba(255,255,255,0.03))',
      },
      '.cm-cursor': {
        borderLeftColor: 'var(--color-fg, #e4e4e7)',
      },
      '.cm-selectionBackground': {
        backgroundColor: 'var(--accent-bg, rgba(245, 158, 50, 0.15)) !important',
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: 'var(--accent-bg, rgba(245, 158, 50, 0.15)) !important',
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'inherit',
      },
      // Vim status bar styling.
      '.cm-vim-panel': {
        backgroundColor: 'var(--color-bg-elevated, #1a1d25)',
        color: 'var(--color-fg, #e4e4e7)',
        padding: '2px 8px',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono, monospace)',
      },
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        theme,
        updateListener,
        interactionHandlers,
        history(),
        EditorState.allowMultipleSelections.of(true),
        // Alt+click adds a cursor; Alt+drag creates a rectangular selection.
        EditorView.clickAddsSelectionRange.of((event) => event.altKey),
        rectangularSelection(),
        crosshairCursor(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        vimCompartment.of([]),
        syntaxCompartment.of(syntaxHighlight ? todotxtDecorations() : []),
        // Separate compartment from syntax highlighting on purpose: a filter
        // must keep dimming even with highlighting switched off.
        filterCompartment.of(todotxtFilterDim(filter)),
        // Third compartment: threshold hiding toggles independently of both
        // the filter and syntax highlighting, so changing one must not tear
        // down the others.
        thresholdCompartment.of(todotxtThresholdDim(thresholdHidden)),
        // Fifth compartment: the `h:1` view mode. Independent of the filter,
        // the threshold layer and syntax highlighting for the same reason —
        // four unrelated reasons to narrow the view, four independent toggles.
        hiddenCompartment.of(todotxtHiddenLines(hiddenMode)),
        readOnlyCompartment.of(EditorState.readOnly.of(disabled)),
        cmPlaceholder(placeholder),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    // Capture keydown before CodeMirror's own keymap handles destructive
    // keys such as Backspace. If the parent prevents the event, CodeMirror
    // observes defaultPrevented and leaves the document untouched; otherwise
    // normal editor bindings continue unchanged.
    const handleKeyDownCapture = (event: KeyboardEvent) => {
      onKeyDownRef.current?.(event);
    };
    view.contentDOM.addEventListener('keydown', handleKeyDownCapture, {
      capture: true,
    });

    // Add data-testid to the contentDOM for e2e selector compat.
    view.contentDOM.setAttribute('data-testid', 'todo-txt-textarea');
    view.contentDOM.setAttribute('aria-label', 'todo.txt contents');

    return () => {
      if (selectionFrame !== null) cancelAnimationFrame(selectionFrame);
      if (viewportFrame !== null) cancelAnimationFrame(viewportFrame);
      view.contentDOM.removeEventListener('keydown', handleKeyDownCapture, {
        capture: true,
      });
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Sync external value → editor (controlled component contract)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (lastEmittedValue.current === value) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc === value) return;

    externalUpdate.current = true;
    try {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
        // NOT undoable. This transaction is how the app LOADS a document —
        // the initial GET, a tab switch, a reload-from-disk, a set-root, a
        // recovery-draft restore, and the echo of a page-level rewrite all
        // arrive through here. Left in the undo stack, `history()` treats
        // "the file was loaded" as an edit, so one vim `u` (or Ctrl+Z) before
        // the user has typed anything reverts the document to the empty string
        // CmEditor was constructed with — which then flows out through
        // onChange -> setContent -> scheduleSave and is PUT over todo.txt.
        // History still MAPS its stored events through this change, so undo of
        // the user's own edits stays coherent.
        annotations: Transaction.addToHistory.of(false),
      });
      // The editor now reflects a controlled value that differs from the
      // last user-emitted document. Track the applied value so restoring the
      // earlier raw text remains a real external update rather than being
      // mistaken for React merely echoing the original edit.
      lastEmittedValue.current = value;
    } finally {
      externalUpdate.current = false;
    }
  }, [value]);

  // ---------------------------------------------------------------------------
  // Vim mode toggle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // Vim arrives from a dynamic import, so the install is asynchronous while
    // the toggle is synchronous. Without this flag a vimMode true -> false
    // flip that lands inside the import window is OVERTAKEN by the resolved
    // promise: the else-branch reconfigures the compartment to `[]`, then the
    // stale continuation reconfigures it back to `vim()`. Vim then runs while
    // the prop, the mode indicator, and the Ctrl+D / Escape arbitration (which
    // all read `vimMode`) believe it is off.
    let cancelled = false;

    if (vimMode) {
      loadVim().then((mod) => {
        if (cancelled || !viewRef.current) return;
        viewRef.current.dispatch({
          // PRECEDENCE IS LOAD-BEARING. `keymap.of([...defaultKeymap, ...])`
          // is registered above this compartment, so without Prec.high the
          // default keymap outranks vim for every overlapping key. The
          // observable consequence (found by tests/vim-motion.e2e.spec.ts,
          // invisible to jsdom): on macOS the standard keymap binds Ctrl-d to
          // deleteCharForward, so in vim mode Ctrl+D silently DELETED the
          // character under the cursor — it neither scrolled (vim's meaning)
          // nor marked done (the app yields Ctrl+D while vim is on). A vim
          // user pressing a scroll key was corrupting a task, one character
          // at a time.
          effects: vimCompartment.reconfigure(Prec.high(mod.vim())),
        });
        // Subscribe to the real vim-mode-change event via the CM5 adapter
        // (@replit/codemirror-vim exposes getCM). Covers NORMAL/INSERT/
        // VISUAL (+linewise/blockwise) and REPLACE reliably.
        const cm = mod.getCM(viewRef.current);
        if (cm) {
          const handler = (ev: { mode: string; subMode?: string }) => {
            const mode = (ev.mode || 'normal').toUpperCase();
            const sub = ev.subMode ? ` ${ev.subMode.toUpperCase()}` : '';
            onVimModeChangeRef.current?.(mode === 'VISUAL' && sub ? `VISUAL${sub}` : mode);
          };
          cm.on('vim-mode-change', handler);
          vimModeCleanupRef.current = () => cm.off('vim-mode-change', handler);
        }
        onVimModeChangeRef.current?.('NORMAL');
      });
    } else {
      vimModeCleanupRef.current?.();
      vimModeCleanupRef.current = null;
      view.dispatch({
        effects: vimCompartment.reconfigure([]),
      });
      onVimModeChangeRef.current?.('NORMAL');
    }

    return () => {
      cancelled = true;
    };
  }, [vimMode, vimCompartment]);

  // ---------------------------------------------------------------------------
  // Syntax highlight toggle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: syntaxCompartment.reconfigure(
        syntaxHighlight ? todotxtDecorations() : [],
      ),
    });
  }, [syntaxHighlight, syntaxCompartment]);

  // ---------------------------------------------------------------------------
  // Filter dim toggle
  //
  // Keyed on the parsed filter's `source` string rather than object identity,
  // so a parent re-render that produces an equal-but-new ParsedFilter does not
  // pointlessly tear down and rebuild the decoration plugin.
  // ---------------------------------------------------------------------------
  const filterSource = filter?.source ?? null;
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: filterCompartment.reconfigure(todotxtFilterDim(filterRef.current)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSource, filterCompartment]);

  // ---------------------------------------------------------------------------
  // Threshold hide toggle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: thresholdCompartment.reconfigure(
        todotxtThresholdDim(thresholdHiddenRef.current),
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thresholdHidden, thresholdCompartment]);

  // ---------------------------------------------------------------------------
  // `h:1` view-mode toggle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: hiddenCompartment.reconfigure(
        todotxtHiddenLines(hiddenModeRef.current),
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenMode, hiddenCompartment]);

  // ---------------------------------------------------------------------------
  // Disabled toggle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readOnlyCompartment.reconfigure(
        EditorState.readOnly.of(disabled),
      ),
    });
  }, [disabled, readOnlyCompartment]);

  // ---------------------------------------------------------------------------
  // Imperative handle
  // ---------------------------------------------------------------------------
  useImperativeHandle(ref, () => ({
    focus() {
      viewRef.current?.focus();
    },
    getCaret() {
      return viewRef.current?.state.selection.main.head ?? 0;
    },
    setCaret(pos: number) {
      const view = viewRef.current;
      if (!view) return;
      const clamped = Math.max(0, Math.min(pos, view.state.doc.length));
      view.dispatch({ selection: { anchor: clamped } });
    },
    setSelection(start: number, end: number) {
      const view = viewRef.current;
      if (!view) return;
      const s = Math.max(0, Math.min(start, view.state.doc.length));
      const e = Math.max(0, Math.min(end, view.state.doc.length));
      view.dispatch({ selection: { anchor: s, head: e } });
    },
    getSelections() {
      return (
        viewRef.current?.state.selection.ranges.map((range) => ({
          from: range.from,
          to: range.to,
        })) ?? []
      );
    },
    getScrollElement() {
      return viewRef.current?.scrollDOM ?? null;
    },
    getValue() {
      return viewRef.current?.state.doc.toString() ?? '';
    },
    getView() {
      return viewRef.current;
    },
    applyEdit(nextValue: string, caret?: number) {
      const view = viewRef.current;
      if (!view) return;
      const currentDoc = view.state.doc.toString();
      if (currentDoc === nextValue) {
        if (caret !== undefined) {
          const pos = Math.max(0, Math.min(caret, nextValue.length));
          view.dispatch({ selection: { anchor: pos } });
        }
        return;
      }
      const pos =
        caret === undefined
          ? undefined
          : Math.max(0, Math.min(caret, nextValue.length));
      // No addToHistory annotation: the default IS undoable, which is the
      // whole point of this method existing next to the controlled-value path.
      //
      // This replaces the WHOLE document rather than dispatching a minimal
      // range. The caller hands over a finished string, and a whole-document
      // change keeps this method independent of how that string was derived —
      // a narrower change would have to re-derive the edited range, and any
      // disagreement between that range and the new text is a corruption bug
      // rather than a visible failure. Whole-document replaces are cheap here
      // because a todo.txt file is small by nature.
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: nextValue },
        ...(pos === undefined ? {} : { selection: { anchor: pos } }),
      });
    },
  }));

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden"
      style={{ height: '100%' }}
    />
  );
});

export default CmEditor;
