/**
 * TodoTxtPage — plain-text todo-txt editor shell.
 *
 * Layout:
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ 📓 todo.txt   ● Saved   [Fullscreen]      142 chars · 8 ln │  ← compact header
 *   ├────────────────────────────────────────────────────────────┤
 *   │                                                            │
 *   │  <textarea font-family: var(--font-body)>                  │  ← full-height textarea
 *   │                                                            │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Behaviour (this shell only — no popover, no syntax highlighting):
 *   - On mount: GET /apps/todo-txt/api/content → { content, mtime }.
 *   - On keystroke: update local state immediately; debounce 400ms then
 *     PUT /apps/todo-txt/api/content with {content}.
 *   - Save status indicator reflects 'Saved' | 'Saving…' | 'Error: <msg>'.
 *   - mtime poll every 10s; if server mtime > last-known AND the user has
 *     been idle ≥5s (no keystrokes), show a non-destructive banner offering
 *     to reload. Never overwrite user input silently.
 *   - On window blur / tab close: `navigator.sendBeacon` flushes the
 *     pending content synchronously so a close-during-typing doesn't drop.
 *
 * NOTE: selection popover, quick-action buttons, AI-edit, and syntax
 * highlighting all arrive in later tasks. This shell is intentionally
 * minimal — the point of the app is "just a text file, always saved".
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NotebookPen,
  Maximize2,
  Minimize2,
  Sparkles,
  Highlighter,
  MessageSquare,
  Pencil,
  Check,
  Trash2,
  CircleHelp,
  Download,
  PlusCircle,
  History,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  MousePointer2,
  EyeOff,
  ListFilter,
  X,
} from 'lucide-react';
import { useSyntaxHighlight } from './utils/useSyntaxHighlight';
// TodoTxtSyntaxOverlay is superseded by CM6's todotxtDecorations plugin.
// Kept as a module for potential fallback but no longer rendered.
import TodoTxtSelectionPopover, {
  type NewInlineComment,
  type Priority as PopoverPriority,
} from './components/TodoTxtSelectionPopover';
import {
  addCreationDate,
  lineRangeForSelection,
  markLineDone,
  setPriority,
} from './utils/todotxt';
import { applyShortcut, completeProjectOrContext, parseRelDate, fmtDate } from './utils/shortcuts';
import { getTextareaSelectionRect } from './utils/caretRect';
import { STARTER_EXAMPLE } from './utils/starterExample';
import {
  filterCounts,
  loadStoredFilter,
  storeFilter,
  todayIso,
  tryParseFilterExpr,
  type ParsedFilter,
} from './utils/filterExpr';
import { completeLineWithRecurrence } from './utils/recurrence';
import { ReportChart } from './components/ReportChart';
import { parseReport } from './utils/reportParser';
import {
  loadStoredThresholdMode,
  storeThresholdMode,
  thresholdCounts,
  type ThresholdMode,
} from './utils/threshold';
import {
  hiddenCounts,
  loadStoredHiddenMode,
  storeHiddenMode,
  type HiddenMode,
} from './utils/hidden';
import {
  formatRootChange,
  formatSettingsError,
  formatWhere,
  type SettingsResponse,
} from './utils/settings';
import CommandPalette from './components/CommandPalette';
import ResultPanel, { type ResultPayload } from './components/ResultPanel';
import FileTabs from './components/FileTabs';
import RightRail, { loadRailOpenState } from './components/RightRail';
import {
  COMMANDS,
  NotImplementedError,
  formatCommandErrorToast,
  type ApplyResult,
  type Command,
  type TodoFile,
} from './utils/commands';
// SDK hook for launching a new chat session from the selection
// popover's "Just do it ▸" button. Resolved at runtime via the
// dashboard's import map to window.__kirocrew_modules['@kirocrew/app-sdk']
// — NOT bundled (see vite.config.ts external list). See sdk.d.ts for the
// type.
import { useChatLauncher } from '@kirocrew/app-sdk';
import CmEditor, {
  type CmChangeMeta,
  type CmEditorHandle,
  type CmSelectionRange,
} from './components/CmEditor';
import { registerTodotxtVimBindings, toggleDoneForFile } from './components/cm-vim-todotxt';
import {
  bindAmoledThemeSync,
  bindCurrentLineDoneShortcut,
  bindHelpRailShortcut,
} from './utils/todoTxtUiBehavior';
import {
  clearRecoveryDraft,
  readRecoveryDraft,
  type DraftScope,  writeRecoveryDraft,
  type RecoveryDraft,
  type RecoveryDraftFile,
} from './utils/draftRecovery';
import {
  LatestSaveQueue,
  type SaveAttemptResult,
  type SaveRequest,
  type WritableTodoFile,
} from './utils/latestSaveQueue';
import {
  nextSelectionToolbarMode,
  readSelectionToolbarMode,
  selectionToolbarModeLabel,
  writeSelectionToolbarMode,
  type SelectionToolbarMode,
} from './utils/editorPreferences';
// Only for re-selecting after Dup: the new copy must fall INSIDE a selection
// range so the hide layers' exemption reveals it.
import { EditorSelection } from '@codemirror/state';
import {
  countSelectedLines,
  deleteSelectedLines,
  duplicateSelectedLines,
  duplicateSelectedLinesWithReveal,
  lineRangesForSelections,
  selectedText,
  transformSelectedLines,
  type TextChange,
} from './utils/selectionRanges';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string };

interface ContentResponse {
  content: string;
  mtime: number; // epoch seconds
  /**
   * Present and `true` only on a conditional read (`?if_none_mtime=`) whose
   * token still matched, in which case `content` is absent. Optional rather
   * than a separate union member so the existing `data.mtime ?? 0` reads keep
   * type-checking — the one place it is consulted returns early.
   */
  unchanged?: boolean;
}

/**
 * InlineComment shape emitted by CommentOverlay/Popover and consumed by
 * the backend `/apps/todo-txt/api/ai-edit` endpoint.
 */
export interface InlineComment {
  id: string;
  anchor: string;
  text: string;
  line: number;
  column: number;
}

/**
 * Textarea-selection snapshot captured on mouseUp / keyUp. Used to
 * anchor the popover and to enrich pending `InlineComment` entries with
 * 1-based line/column.
 */
interface SelectionState {
  /** Selected substrings joined in document order. */
  anchor: string;
  /** Every non-empty CodeMirror range represented by this snapshot. */
  ranges: CmSelectionRange[];
  /** Bounding rect used to position the popover. */
  rect: DOMRect;
  /** 1-based line number where the primary selection starts. */
  line: number;
  /** 1-based column on that line where the primary selection starts. */
  column: number;
  /** How many LINE BLOCKS the per-line actions will rewrite.
   *
   * Not `ranges.length`: `ranges` deliberately excludes collapsed alt-click
   * carets (an empty anchor would be useless to Copy and to the AI-edit
   * comment), but the ACTIONS read the live view selection, where a caret now
   * selects its own line. Counting the merged line blocks is the only number
   * that matches the popover's own promise — "actions apply to each selected
   * line" — for every mix of drags and carets. */
  affectedLines: number;
}

type AiEditResponse =
  | {
      status: 'applied';
      tier: 2 | 3;
      mtime: number;
      bytes: number;
      snapshot: string;
      line_delta: number;
      char_delta: number;
    }
  | {
      status: 'staged';
      tier: 3;
      proposed: string;
      diff: string;
      snapshot: string;
      line_delta: number;
      char_delta: number;
      reason: string;
    }
  | {
      status: 'rejected';
      tier: 4;
      reason: string;
      snapshot: string;
      diff: string;
      line_delta?: number;
      char_delta?: number;
    };

interface StagedEdit {
  current: string;
  proposed: string;
  diff: string;
  reason: string;
  lineDelta: number;
  charDelta: number;
  snapshot: string;
}

type ToastTone = 'info' | 'success' | 'error';
interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = '/apps/todo-txt/api';

/** Fetch the active data root so recovery drafts can be scoped to it.
 *
 * Fails OPEN (returns undefined) on any error: an unscoped offer risks the
 * cross-root case, which needs a deliberate `set-root` to reach, while
 * refusing to offer would throw away real unsaved work every time this one
 * request hiccups. The wrong trade in the other direction is worse.
 */
async function fetchDraftScope(): Promise<DraftScope | undefined> {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      root?: unknown;
      is_default?: unknown;
    };
    if (typeof data.root !== 'string' || data.root === '') return undefined;
    return { root: data.root, isDefault: data.is_default === true };
  } catch {
    return undefined;
  }
}

/** Same rule the store applies, for the page's own offer decision. */
function draftBelongsToScope(
  draft: { root?: string },
  scope: DraftScope | undefined,
): boolean {
  if (!scope) return true;
  if (draft.root === undefined) return scope.isDefault;
  return draft.root === scope.root;
}

/** Palette verbs that address a task by 1-based FILE line number.
 *
 * Used only to warn when `hidden hide` is active: those numbers count every
 * line in the document, including the ones the mode has taken off screen, so
 * a user counting visible rows addresses the wrong task. Membership is by
 * command name because the parsed item number is not plumbed this far.
 */
const LINE_ADDRESSED_COMMANDS = new Set([
  'do',
  'undo',
  'del',
  'move',
  'pri',
  'depri',
  'replace',
  'append',
  'prepend',
  'due',
]);
const DEBOUNCE_MS = 400;
const MAX_UNSAVED_MS = 4000;
const MTIME_POLL_MS = 10_000;
const EXTERNAL_EDIT_POLL_MS = 5_000;
const IDLE_BEFORE_RELOAD_BANNER_MS = 5_000;
const TOAST_TTL_MS = 4_000;

// ---------------------------------------------------------------------------
// Module helpers (exported for unit tests)
// ---------------------------------------------------------------------------

/**
 * Build the user-facing toast message for an `applied` AI-edit response.
 * Tier 2 = additive silent; Tier 3-YOLO = destructive allowed.
 */
export function formatAppliedToast(res: {
  tier: 2 | 3;
  line_delta: number;
}): string {
  const n = Math.abs(res.line_delta);
  if (res.tier === 3 && res.line_delta < 0) {
    return n === 1
      ? 'KiroCrew removed 1 line (YOLO)'
      : `KiroCrew removed ${n} lines (YOLO)`;
  }
  if (res.line_delta === 0) {
    return 'KiroCrew modified todo.txt';
  }
  const verb = res.line_delta > 0 ? 'added' : 'modified';
  return n === 1
    ? `KiroCrew ${verb} 1 line`
    : `KiroCrew ${verb} ${n} lines`;
}

/**
 * Decide whether pending comments should be cleared after a rejection.
 * Keep only when the reason indicates malformed LLM output so the user
 * can retry; clear for all other rejections (empty/trunc/oversize).
 */
export function shouldClearOnReject(reason: string): boolean {
  const r = reason.toLowerCase();
  return !(
    r.includes('malformed') ||
    r.includes('parse') ||
    r.includes('invalid llm')
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TodoTxtPage(): JSX.Element {
  // ---------------- state ----------------
  // SDK-provided chat launcher. Used by the selection popover's
  // "Just do it ▸" button (handleAddComment below) to open a new chat
  // with the selected text + user prompt as the initial message. Must
  // be called inside the component body — it's a React hook.
  //
  // This uses the documented SDK contract rather than a hand-rolled
  // `useNavigate + inline openChat` helper. The two are semantically
  // equivalent, so keeping the hook here gives a 1-line swap if the
  // host's SDK surface ever changes.
  const { openChat } = useChatLauncher();
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<SaveStatus>({ kind: 'idle' });
  const [mtime, setMtime] = useState<number>(0);
  const [reloadAvailable, setReloadAvailable] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  // True only while a NATIVE Element.requestFullscreen() attempt is live —
  // distinguishes a real native exit from unrelated fullscreenchange events
  // so they cannot cancel CSS pseudo-fullscreen. See the fullscreen-sync
  // effect and the header button.
  const nativeAttemptRef = useRef<boolean>(false);
  // Right-rail help panel state — the single help surface, in place of a
  // cheatsheet banner / hover popover / modal. Initial value comes from the
  // same localStorage key the rail uses for per-category state, so a page
  // reload restores open/closed continuity.
  const [railOpen, setRailOpen] = useState<boolean>(() => loadRailOpenState());
  const [loaded, setLoaded] = useState<boolean>(false);
  // Distinguishes a failed initial load (blank editor -> designed error
  // state) from a transient save/file-switch error (content stays put).
  // Cleared on any successful load.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recoveryDraft, setRecoveryDraft] = useState<RecoveryDraft | null>(null);
  const [saveConflict, setSaveConflict] = useState<boolean>(false);

  // Backups modal state. List is fetched lazily when the modal opens so
  // we don't poll the server on every keystroke.
  const [showBackups, setShowBackups] = useState<boolean>(false);
  const [backups, setBackups] = useState<
    Array<{ name: string; bytes: number; mtime: number }>
  >([]);
  const [backupsLoading, setBackupsLoading] = useState<boolean>(false);
  // Which file family the open modal is showing ('todo' | 'done') — set from
  // the active tab when the modal opens, displayed in the header so restores
  // are unambiguous about which file they rewrite.
  const [backupsFamily, setBackupsFamily] = useState<'todo' | 'done'>('todo');
  const [backupPreview, setBackupPreview] = useState<{
    name: string;
    content: string;
  } | null>(null);

  // Esc closes the Backups modal. If a preview is open, Esc first
  // returns to the list; second Esc closes the whole modal.
  useEffect(() => {
    if (!showBackups) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      if (backupPreview) {
        setBackupPreview(null);
      } else {
        setShowBackups(false);
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [showBackups, backupPreview]);

  // Command palette (⌘K / Ctrl+K) state. The palette is opened by a
  // global window-level keydown listener registered further below; it is
  // intentionally separate from the per-editor `onKeyDown` (which owns
  // the shortcut-expansion undo window) so the palette works even when
  // focus is NOT inside the textarea.
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  // Mirror for the capture-phase Cmd/Ctrl+K handler (registered once with
  // [] deps, so it must not close over paletteOpen directly).
  const paletteOpenRef = useRef<boolean>(false);
  useEffect(() => {
    paletteOpenRef.current = paletteOpen;
  }, [paletteOpen]);
  const [resultPanel, setResultPanel] = useState<ResultPayload | null>(null);
  // Which of the three files the palette should apply commands to.
  // Held in state and driven by the FileTabs component in
  // the header. Switching tabs triggers `onFileChange` (defined below,
  // after `doSave`), which re-fetches the corresponding file via the
  // three-file GET endpoint.
  const [activeFile, setActiveFile] = useState<TodoFile>('todo');

  // AI-edit wiring — `pendingComments` is populated by the selection popover.
  const [pendingComments, setPendingComments] = useState<InlineComment[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [stagedEdit, setStagedEdit] = useState<StagedEdit | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Selection popover state. `selection` is null when no text is
  // highlighted inside the textarea; non-null renders the floating popover
  // anchored at `rect`. `handleAddComment` reads `line` / `column` off this
  // snapshot.
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [selectionPopoverOpen, setSelectionPopoverOpen] =
    useState<boolean>(false);
  const [selectionToolbarMode, setSelectionToolbarMode] =
    useState<SelectionToolbarMode>(() => readSelectionToolbarMode());
  const cycleSelectionToolbarMode = useCallback(() => {
    setSelectionToolbarMode((current) => {
      const next = nextSelectionToolbarMode(current);
      writeSelectionToolbarMode(next);
      if (next === 'off') setSelectionPopoverOpen(false);
      if (next === 'automatic' && selection) setSelectionPopoverOpen(true);
      return next;
    });
  }, [selection]);

  // Syntax highlighting — overlay technique, see
  // `<TodoTxtSyntaxOverlay>`. Hook owns localStorage + cross-tab sync.
  // Default is OFF so the viewer renders exactly what the user typed.
  const { enabled: syntaxHighlight, toggle: toggleSyntaxHighlight } =
    useSyntaxHighlight();

  // Vim mode (CodeMirror 6 integration). Persisted in localStorage.
  const [vimMode, setVimMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('todotxt.vimMode') === 'true';
    } catch { return false; }
  });
  const [vimStatus, setVimStatus] = useState<string>('NORMAL');

  // ------------------------------------------------------------------
  // Filter layer.
  //
  // `filterSource` is the raw expression the user typed (normalized to
  // single spaces), or null for "no filter". It is the single source of
  // truth: the parsed form, the match counts, and the localStorage write
  // all derive from it, so there is no way for the chip, the dimming, and
  // the persisted value to disagree.
  //
  // Restored from localStorage on mount. A filter is a VIEW state, not file
  // state -- restoring it never changes a byte of todo.txt, and the chip in
  // the header makes an inherited filter visible immediately so a restored
  // filter can't be mistaken for missing tasks.
  // ------------------------------------------------------------------
  const [filterSource, setFilterSource] = useState<string | null>(() =>
    loadStoredFilter(),
  );
  const filterSourceRef = useRef<string | null>(filterSource);
  filterSourceRef.current = filterSource;

  const activeFilter = useMemo<ParsedFilter | null>(
    () => (filterSource === null ? null : tryParseFilterExpr(filterSource)),
    [filterSource],
  );

  /** Set or clear the filter, keeping localStorage in step. */
  const applyFilterExpr = useCallback((expr: string | null) => {
    setFilterSource(expr);
    storeFilter(expr);
  }, []);

  // Chip tally. filterCounts resolves "today" itself from the local calendar,
  // the same way the dim decoration does, so the chip and the dimming can
  // never disagree about which lines are overdue.
  const filterTally = useMemo(
    () => (activeFilter === null ? null : filterCounts(content, activeFilter)),
    [content, activeFilter],
  );

  // ------------------------------------------------------------------
  // Threshold (`t:`) view mode.
  //
  // Same shape as the filter above and for the same reasons: one piece of
  // state is the source of truth, the decoration / the chip / localStorage all
  // derive from it, and restoring it on mount never touches a byte of
  // todo.txt. The chip is what stops a restored `hide` from looking like
  // missing tasks.
  // ------------------------------------------------------------------
  const [thresholdMode, setThresholdMode] = useState<ThresholdMode>(() =>
    loadStoredThresholdMode(),
  );
  const thresholdModeRef = useRef<ThresholdMode>(thresholdMode);
  thresholdModeRef.current = thresholdMode;

  /** Set the threshold mode, keeping localStorage in step. */
  const applyThresholdMode = useCallback((mode: ThresholdMode) => {
    setThresholdMode(mode);
    storeThresholdMode(mode);
  }, []);

  // Chip tally. `todayStr` is defined further down (it is only needed inside
  // callbacks); the tally resolves the local day itself so it cannot disagree
  // with what the decoration dims.
  const thresholdTally = useMemo(
    () => thresholdCounts(content, thresholdMode, todayIso()),
    [content, thresholdMode],
  );

  // ------------------------------------------------------------------
  // Hidden (`h:1`) view mode.
  //
  // Same shape as the filter and threshold layers above. The one difference
  // that matters: the default is `dim`, not "off", because `h:1` is a tag the
  // user typed asking for exactly this — and `hide` (the mode that removes
  // lines from view) is only ever reached by asking for it explicitly. See
  // utils/hidden.ts for why this layer is allowed to collapse a line when
  // the filter and threshold layers are not.
  // ------------------------------------------------------------------
  const [hiddenMode, setHiddenMode] = useState<HiddenMode>(() =>
    loadStoredHiddenMode(),
  );
  const hiddenModeRef = useRef<HiddenMode>(hiddenMode);
  hiddenModeRef.current = hiddenMode;

  /** Set the `h:1` view mode, keeping localStorage in step. */
  const applyHiddenMode = useCallback((mode: HiddenMode) => {
    setHiddenMode(mode);
    storeHiddenMode(mode);
  }, []);

  // Chip tally. `h:1` is a flag, not a date, so unlike the threshold tally
  // this one needs no notion of today.
  const hiddenTally = useMemo(
    () => hiddenCounts(content, hiddenMode),
    [content, hiddenMode],
  );
  // Read inside `dispatchApplyResult`, which is a stable callback — a ref
  // keeps the hidden-line warning honest without re-creating the dispatcher
  // on every keystroke.
  const hiddenTallyRef = useRef(hiddenTally);
  hiddenTallyRef.current = hiddenTally;

  const toggleVimMode = useCallback(() => {
    setVimMode((prev) => {
      const next = !prev;
      try { localStorage.setItem('todotxt.vimMode', next ? 'true' : 'false'); } catch {}
      return next;
    });
  }, []);

  // CmEditor imperative handle ref (replaces textareaRef for CM6 path).
  const cmEditorRef = useRef<CmEditorHandle | null>(null);

  // Track whether vim bindings have been registered (once per session).
  const vimBindingsRegistered = useRef(false);

  // Scroll offsets forwarded to the overlay. We mirror the textarea's
  // scroll in state so the overlay's `translate()` stays in lockstep.
  const [overlayScroll, setOverlayScroll] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  // ---------------- refs (mutable, not re-rendering) ----------------
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstDirtyAt = useRef<number | null>(null);
  const knownMtime = useRef<number>(0);
  /** Active data root, resolved on mount and refreshed by `set-root`. Read
   *  when writing a draft and when deciding whether to offer one. */
  const draftScopeRef = useRef<DraftScope | undefined>(undefined);  const knownMtimeByFile = useRef<Record<TodoFile, number>>({
    todo: 0,
    done: 0,
    report: 0,
  });
  const latestContentByFile = useRef<Record<WritableTodoFile, string>>({
    todo: '',
    done: '',
  });
  const dirtyFiles = useRef<Set<WritableTodoFile>>(new Set());
  const activeFileRef = useRef<TodoFile>('todo');
  const saveQueueRef = useRef<LatestSaveQueue | null>(null);
  const mtimeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastKeystroke = useRef<number>(0);
  const latestContent = useRef<string>('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const toastSeq = useRef<number>(0);
  // Root wrapper ref — used for native browser Fullscreen API so the
  // editor truly takes over the viewport. See fullscreenchange effect.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  // AMOLED true-black background (opt-in, dark themes only). Persisted like
  // vim/syntax. Applied by toggling `data-amoled` on the app root; the
  // scoped rule in index.css overrides only the app's own --color-* tokens
  // under that attribute, so it never touches the dashboard :root palette.
  const [amoled, setAmoled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('todotxt.amoled') === 'true';
    } catch { return false; }
  });
  const toggleAmoled = useCallback(() => {
    setAmoled((prev) => {
      const next = !prev;
      try { localStorage.setItem('todotxt.amoled', next ? 'true' : 'false'); } catch {}
      return next;
    });
  }, []);
  useEffect(
    () => bindAmoledThemeSync(() => rootRef.current, amoled),
    [amoled],
  );

  // Ctrl+/ (or ⌘+/) toggles the help rail. Capture-phase handling keeps it
  // available while the editor owns focus.
  useEffect(
    () => bindHelpRailShortcut(() => setRailOpen((open) => !open)),
    [],
  );

  // Cmd/Ctrl+D toggles the current logical line when no text is selected.
  // In Vim mode Ctrl+D is deliberately left to Vim's half-page-down command;
  // macOS Command+D remains available, and \x is the cross-platform Vim action.
  useEffect(
    () =>
      bindCurrentLineDoneShortcut(
        () => cmEditorRef.current?.getView(),
        vimMode,
        window,
        // File-aware at keypress time (ref read, no rebind on tab switch):
        // recurrence spawning only in todo.txt — see handleMarkDone.
        (line) => toggleDoneForFile(line, activeFileRef.current),
      ),
    [vimMode],
  );

  // Tab-cycle index for +project / @context completion. Incremented
  // each time the user presses Tab on the same prefix word; reset on
  // any non-Tab keystroke or when the word changes.
  const tabCycleRef = useRef<{
    key: string; // `${prefix}${partial}@${start}` — identifies the word
    index: number;
  } | null>(null);

  // Editor wrapper ref — passed to the popover as `containerRef` so it
  // positions absolute relative to the editor (not the viewport).
  const editorWrapRef = useRef<HTMLDivElement | null>(null);
  // Monotonic counter for generating unique pending-comment IDs so React
  // keys stay stable when the user rapidly adds multiple comments in the
  // same tick (Date.now alone can collide at sub-ms granularity).
  const commentSeq = useRef<number>(0);

  // Keep ref in lockstep with state so the beacon-on-unload closure sees
  // the current value without depending on React commit timing.
  useEffect(() => {
    latestContent.current = content;
  }, [content]);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  // Register vim leader bindings once when vim mode is first enabled.
  useEffect(() => {
    if (vimMode && !vimBindingsRegistered.current) {
      import('@replit/codemirror-vim').then((mod) => {
        registerTodotxtVimBindings(mod.Vim);
        vimBindingsRegistered.current = true;
      });
    }
  }, [vimMode]);

  // ---------------- save (PUT) ----------------

  const performSave = useCallback(
    async (request: SaveRequest): Promise<SaveAttemptResult> => {
      const endpoint =
        request.file === 'todo'
          ? `${API_BASE}/content`
          : `${API_BASE}/file?name=done`;
      const payload: { content: string; base_mtime?: number } = {
        content: request.content,
      };
      if (!request.force) payload.base_mtime = request.baseMtime;

      try {
        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.status === 409) {
          return {
            kind: 'conflict',
            message: 'File changed on disk — reload or overwrite explicitly',
          };
        }
        if (!res.ok) {
          const text = await res.text().catch(() => `HTTP ${res.status}`);
          const message = text || `HTTP ${res.status}`;
          if (
            res.status === 408 ||
            res.status === 425 ||
            res.status === 429 ||
            res.status >= 500
          ) {
            return { kind: 'retry', message };
          }
          return { kind: 'fatal', message };
        }
        const data = (await res.json().catch(() => ({}))) as {
          mtime?: number;
        };
        return {
          kind: 'saved',
          mtime:
            typeof data.mtime === 'number' && Number.isFinite(data.mtime)
              ? data.mtime
              : Date.now() / 1000,
        };
      } catch (error) {
        return {
          kind: 'retry',
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
    [],
  );

  useEffect(() => {
    const queue = new LatestSaveQueue({
      save: performSave,
      onAttempt: (request) => {
        if (activeFileRef.current === request.file) {
          setStatus({ kind: 'saving' });
        }
      },
      onSaved: (request, result) => {
        knownMtimeByFile.current[request.file] = result.mtime;
        if (activeFileRef.current === request.file) {
          knownMtime.current = result.mtime;
          setMtime(result.mtime);
          setStatus({ kind: 'saved', at: Date.now() });
          setReloadAvailable(false);
          setSaveConflict(false);
        }
        if (latestContentByFile.current[request.file] === request.content) {
          dirtyFiles.current.delete(request.file);
          void clearRecoveryDraft(request.file);
          setRecoveryDraft((current) =>
            current?.file === request.file ? null : current,
          );
        }
      },
      onConflict: (request, result) => {
        if (activeFileRef.current !== request.file) return;
        setReloadAvailable(true);
        setSaveConflict(true);
        setStatus({ kind: 'error', message: result.message });
      },
      onRetry: (request, result, _attempt, delayMs) => {
        if (activeFileRef.current !== request.file) return;
        setStatus({
          kind: 'error',
          message: `${result.message} — retrying in ${Math.ceil(delayMs / 1000)}s`,
        });
      },
      onFatal: (request, result) => {
        if (activeFileRef.current === request.file) {
          setStatus({ kind: 'error', message: result.message });
        }
      },
    });
    saveQueueRef.current = queue;
    return () => {
      queue.dispose();
      if (saveQueueRef.current === queue) saveQueueRef.current = null;
    };
  }, [performSave]);

  const doSave = useCallback(
    async (
      body: string,
      file: WritableTodoFile = activeFileRef.current as WritableTodoFile,
      force = false,
    ): Promise<SaveAttemptResult | null> => {
      if (file !== 'todo' && file !== 'done') return null;
      const queue = saveQueueRef.current;
      if (!queue) {
        return performSave({
          file,
          content: body,
          baseMtime: knownMtimeByFile.current[file],
          force,
          revision: 0,
        });
      }
      queue.enqueue({
        file,
        content: body,
        baseMtime: knownMtimeByFile.current[file],
        force,
      });
      return queue.flush();
    },
    [performSave],
  );

  const scheduleSave = useCallback(
    (body: string) => {
      const currentFile = activeFileRef.current;
      if (currentFile === 'report') return;
      const file = currentFile as WritableTodoFile;
      latestContent.current = body;
      latestContentByFile.current[file] = body;
      dirtyFiles.current.add(file);
      setRecoveryDraft((current) =>
        current?.file === file ? null : current,
      );
      void writeRecoveryDraft({
        version: 1,
        file,
        content: body,
        baseMtime: knownMtimeByFile.current[file],
        updatedAt: Date.now(),
        // Stamp the root so this draft is only ever offered back for the
        // directory it was actually typed against.
        root: draftScopeRef.current?.root,
      });

      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (firstDirtyAt.current === null) firstDirtyAt.current = Date.now();
      const elapsed = Date.now() - firstDirtyAt.current;
      const delay = elapsed >= MAX_UNSAVED_MS ? 0 : DEBOUNCE_MS;
      saveTimer.current = setTimeout(() => {
        saveTimer.current = null;
        firstDirtyAt.current = null;
        void doSave(body, file);
      }, delay);
    },
    [doSave],
  );

  // ---------------- three-file tab switch ----------------

  /**
   * Flush whatever save is in flight or pending for the ACTIVE file.
   *
   * Extracted from `onFileChange` because `set-root` needs the same guarantee
   * for a different reason: a tab switch must land the last keystrokes in the
   * correct FILE, and a root change must land them in the correct DIRECTORY.
   * Both are the same "do not let a debounced save cross a boundary" problem.
   */
  const flushPendingSave = useCallback(async () => {
    const previous = activeFileRef.current;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      firstDirtyAt.current = null;
      if (previous !== 'report') {
        await doSave(
          latestContentByFile.current[previous as WritableTodoFile],
          previous as WritableTodoFile,
        );
      }
    } else if (saveQueueRef.current?.hasUnsavedWork()) {
      await saveQueueRef.current.flush();
    }
  }, [doSave]);

  /**
   * Handle a tab-switch from <FileTabs>. Fetches the chosen file via
   * `GET /apps/todo-txt/api/file?name=<todo|done|report>`, swaps
   * it into the editor, and resets the dirty-save indicator. Errors
   * surface as a non-dismissing status message; the previous content
   * stays on screen so a transient 5xx doesn't blank the editor.
   *
   * Before switching, any in-flight debounced save on the *current*
   * file is flushed synchronously so the user's last few keystrokes
   * land in the correct file.
   *
   * `options.force` re-runs the fetch even when the target IS the active
   * file. Only `set-root` uses it: after the root changes, the content in
   * state came from a directory the app no longer reads, so "already on this
   * tab" is exactly the case that must NOT early-return.
   *
   * Report tab: content is loaded for completeness (so the textarea
   * can still show the raw text when debugging) but the textarea
   * renders `readOnly` and the body pane swaps to <ReportChart> —
   * direct writes through the normal PUT path are blocked because
   * `report.txt` is append-only on the backend, which answers a PUT
   * for name=report with 405.
   */
  const onFileChange = useCallback(
    async (next: TodoFile, options?: { force?: boolean }) => {
      if (next === activeFileRef.current && !options?.force) return;
      await flushPendingSave();

      activeFileRef.current = next;
      setActiveFile(next);
      setSelection(null);
      setSelectionPopoverOpen(false);
      setRecoveryDraft(null);
      setSaveConflict(false);

      try {
        const res = await fetch(
          `${API_BASE}/file?name=${encodeURIComponent(next)}`,
        );
        if (!res.ok) {
          setStatus({
            kind: 'error',
            message: `Load ${next}.txt failed: HTTP ${res.status}`,
          });
          return;
        }
        const data = (await res.json()) as ContentResponse;
        const nextContent = data.content ?? '';
        const nextMtime = data.mtime ?? 0;
        setContent(nextContent);
        latestContent.current = nextContent;
        setMtime(nextMtime);
        knownMtime.current = nextMtime;
        knownMtimeByFile.current[next] = nextMtime;
        if (next !== 'report') {
          const file = next as WritableTodoFile;
          latestContentByFile.current[file] = nextContent;
          dirtyFiles.current.delete(file);
          const draft = await readRecoveryDraft(file);
          if (draft && draft.content !== nextContent) {
            setRecoveryDraft(draft);
          } else if (draft) {
            void clearRecoveryDraft(file);
          }
        }
        setStatus({ kind: 'saved', at: Date.now() });
        setReloadAvailable(false);
        setLoadError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setStatus({
          kind: 'error',
          message: `Load ${next}.txt failed: ${message}`,
        });
      }
    },
    [flushPendingSave],
  );

  // ---------------- initial GET ----------------

  useEffect(() => {
    let cancelled = false;
    // Scope the draft to the ACTIVE data root before offering it. A draft is
    // keyed by file, so without this a draft written under the app data root
    // is offered after `set-root` points the app at a synced directory — and
    // accepting it overwrites that file (the write carries the NEW root's
    // mtime, so it does not even conflict). Fetched in parallel with the
    // content so it costs no extra latency.
    const scopePromise = fetchDraftScope();
    const draftPromise = readRecoveryDraft('todo');
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/content`);
        if (!res.ok) {
          const draft = await draftPromise;
          if (!cancelled) {
            setRecoveryDraft(draft);
            setStatus({
              kind: 'error',
              message: `Load failed: HTTP ${res.status}`,
            });
            setLoadError(`HTTP ${res.status}`);
            setLoaded(true);
          }
          return;
        }
        const data = (await res.json()) as ContentResponse;
        const draft = await draftPromise;
        if (cancelled) return;
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
        const diskContent = data.content ?? '';
        const diskMtime = data.mtime ?? 0;
        setContent(diskContent);
        latestContent.current = diskContent;
        latestContentByFile.current.todo = diskContent;
        dirtyFiles.current.delete('todo');
        setMtime(diskMtime);
        knownMtime.current = diskMtime;
        knownMtimeByFile.current.todo = diskMtime;
        if (draft && draft.content !== diskContent) {
          // Only offer a draft that belongs to this root.
          const scope = await scopePromise;
          if (cancelled) return;
          draftScopeRef.current = scope;
          if (draftBelongsToScope(draft, scope)) {
            setRecoveryDraft(draft);
          }
        } else if (draft) {
          void clearRecoveryDraft('todo');
        }
        setStatus({ kind: 'saved', at: Date.now() });
        setLoadError(null);
        setLoaded(true);
      } catch (err) {
        if (cancelled) return;
        const draft = await draftPromise;
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setRecoveryDraft(draft);
        setStatus({ kind: 'error', message: `Load failed: ${message}` });
        setLoadError(message);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Re-fetch the active file after a failed initial load. Wired to the
   * "Try again" button in the designed load-error state so a transient
   * 5xx / proxy hiccup is recoverable without a full page reload.
   */
  const retryLoad = useCallback(async () => {
    // Cancel any pending debounced save so it cannot clobber fresh content.
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    setStatus({ kind: 'idle' });
    try {
      const res = await fetch(`${API_BASE}/content`);
      if (!res.ok) {
        setStatus({ kind: 'error', message: `Load failed: HTTP ${res.status}` });
        setLoadError(`HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as ContentResponse;
      const diskContent = data.content ?? '';
      const diskMtime = data.mtime ?? 0;
      setContent(diskContent);
      latestContent.current = diskContent;
      latestContentByFile.current.todo = diskContent;
      dirtyFiles.current.delete('todo');
      setMtime(diskMtime);
      knownMtime.current = diskMtime;
      knownMtimeByFile.current.todo = diskMtime;
      const draft = await readRecoveryDraft('todo');
      if (draft && draft.content !== diskContent) setRecoveryDraft(draft);
      else if (draft) void clearRecoveryDraft('todo');
      setStatus({ kind: 'saved', at: Date.now() });
      setLoadError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message: `Load failed: ${message}` });
      setLoadError(message);
    } finally {
      setLoaded(true);
    }
  }, []);

  const restoreRecoveryDraft = useCallback(() => {
    if (!recoveryDraft) return;
    const file = recoveryDraft.file;
    saveQueueRef.current?.cancelPending();
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    activeFileRef.current = file;
    setActiveFile(file);
    latestContent.current = recoveryDraft.content;
    latestContentByFile.current[file] = recoveryDraft.content;
    setContent(recoveryDraft.content);
    if (knownMtimeByFile.current[file] === 0) {
      knownMtimeByFile.current[file] = recoveryDraft.baseMtime;
      knownMtime.current = recoveryDraft.baseMtime;
    }
    setLoaded(true);
    setLoadError(null);
    setRecoveryDraft(null);
    setStatus({ kind: 'saving' });
    scheduleSave(recoveryDraft.content);
  }, [recoveryDraft, scheduleSave]);

  const discardRecoveryDraft = useCallback(() => {
    if (!recoveryDraft) return;
    void clearRecoveryDraft(recoveryDraft.file);
    setRecoveryDraft(null);
  }, [recoveryDraft]);

  const overwriteDiskWithLocal = useCallback(async () => {
    const file = activeFileRef.current;
    if (file === 'report') return;
    const result = await doSave(
      latestContentByFile.current[file as WritableTodoFile],
      file as WritableTodoFile,
      true,
    );
    if (result?.kind === 'saved') {
      setSaveConflict(false);
      setReloadAvailable(false);
    }
  }, [doSave]);

  // ---------------- external-edit detection poll (item 2) ----------------

  useEffect(() => {
    if (mtimeTimer.current) clearInterval(mtimeTimer.current);

    const poll = async () => {
      if (document.visibilityState !== 'visible') return;
      const file = activeFileRef.current;
      // Conditional read: hand the backend the mtime we already hold and it
      // answers `{unchanged:true}` with no body when nothing moved. That is the
      // common case on a 5-second timer, and shipping a whole file back every
      // five seconds to learn "nothing happened" is pure waste — on a 1 MB
      // budget it is also the difference between a poll and a load.
      const known = knownMtimeByFile.current[file];
      const conditional =
        Number.isFinite(known) && known > 0
          ? `if_none_mtime=${encodeURIComponent(String(known))}`
          : '';
      const endpoint =
        file === 'todo'
          ? `${API_BASE}/content${conditional ? `?${conditional}` : ''}`
          : `${API_BASE}/file?name=${encodeURIComponent(file)}` +
            (conditional ? `&${conditional}` : '');
      try {
        const response = await fetch(endpoint);
        if (!response.ok) return;
        const data = (await response.json()) as ContentResponse;
        if (activeFileRef.current !== file) return;
        // The cheap path. `unchanged` is authoritative: the server compared
        // against the very mtime we sent, so there is nothing to reconcile.
        if (data.unchanged === true) return;
        const serverMtime = data.mtime ?? 0;
        if (serverMtime <= 0 || serverMtime <= knownMtimeByFile.current[file]) {
          return;
        }
        const isDirty =
          file !== 'report' &&
          (dirtyFiles.current.has(file as WritableTodoFile) ||
            Boolean(saveQueueRef.current?.hasUnsavedWork()));
        if (isDirty) {
          setReloadAvailable(true);
          return;
        }

        const diskContent = data.content ?? '';
        setContent(diskContent);
        latestContent.current = diskContent;
        if (file !== 'report') {
          latestContentByFile.current[file as WritableTodoFile] = diskContent;
        }
        setMtime(serverMtime);
        knownMtime.current = serverMtime;
        knownMtimeByFile.current[file] = serverMtime;
        setStatus({ kind: 'saved', at: Date.now() });
      } catch {
        // Poll failures are non-fatal; the save queue owns retry feedback.
      }
    };

    mtimeTimer.current = setInterval(poll, EXTERNAL_EDIT_POLL_MS);
    return () => {
      if (mtimeTimer.current) clearInterval(mtimeTimer.current);
    };
  }, []);

  // ---------------- flush on blur / unload ----------------

  useEffect(() => {
    const flushAcknowledged = () => {
      // Flush EVERY dirty file, not just the active one. A save that 409'd
      // leaves its file dirty, so switching tabs can leave two files dirty at
      // once — and the previous version silently skipped the inactive one.
      if (dirtyFiles.current.size === 0) return;
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      firstDirtyAt.current = null;
      for (const file of dirtyFiles.current) {
        // No `report` guard needed: dirtyFiles only ever holds writable files.
        void doSave(latestContentByFile.current[file], file);
      }
    };

    const flushForUnload = () => {
      if (dirtyFiles.current.size === 0) return;
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      firstDirtyAt.current = null;

      for (const file of dirtyFiles.current) {
        const endpoint =
          file === 'todo'
            ? `${API_BASE}/content`
            : `${API_BASE}/file?name=${encodeURIComponent(file)}`;
        const body = JSON.stringify({
          content: latestContentByFile.current[file],
          base_mtime: knownMtimeByFile.current[file],
        });
        let queued = false;
        if (typeof navigator.sendBeacon === 'function') {
          try {
            const blob = new Blob([body], { type: 'application/json' });
            queued = navigator.sendBeacon(endpoint, blob);
          } catch {
            // Fall through to a keepalive PUT when the beacon quota is full.
          }
        }
        if (!queued) {
          void fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          }).catch(() => undefined);
        }
      }
    };

    const flushOnHidden = () => {
      // `visibilitychange` → hidden is the ONLY unload-ish signal that fires
      // reliably everywhere (mobile Safari and BFCache skip beforeunload
      // outright). Beacons are queued by the browser and survive the page
      // going away, so sending here is safe even when the tab comes back.
      if (document.visibilityState === 'hidden') flushForUnload();
    };

    window.addEventListener('blur', flushAcknowledged);
    window.addEventListener('beforeunload', flushForUnload);
    // `pagehide` covers the cases beforeunload misses (BFCache, mobile).
    window.addEventListener('pagehide', flushForUnload);
    document.addEventListener('visibilitychange', flushOnHidden);
    return () => {
      window.removeEventListener('blur', flushAcknowledged);
      window.removeEventListener('beforeunload', flushForUnload);
      window.removeEventListener('pagehide', flushForUnload);
      document.removeEventListener('visibilitychange', flushOnHidden);
      // UNMOUNT is its own unload. The dashboard is a single-page app, so
      // navigating away from /apps/todo-txt tears this component down WITHOUT
      // any unload event firing: the pending debounce would otherwise depend
      // on an orphaned setTimeout outliving the save queue's disposal.
      flushForUnload();
    };
  }, [doSave]);

  // ---------------- handlers ----------------

  /**
   * Undo-last-shortcut state. When a shortcut fires, we stash the
   * pre-expansion value + caret here. The very next keystroke, if it's
   * Backspace, rolls back to that snapshot (autocorrect-style undo).
   * Any other keystroke clears the snapshot.
   */
  const lastExpansionRef = useRef<{
    beforeValue: string;
    beforeCaret: number;
    afterValue: string;
  } | null>(null);

  const handleEditorKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const editor = cmEditorRef.current;
      const view = editor?.getView();
      if (!editor || !view) return;

      // Tab-complete bare +project / @context prefixes against tokens that
      // already exist in the document. CodeMirror owns the selection, so the
      // old detached textareaRef path could never observe or update it.
      if (
        event.key === 'Tab' &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const main = view.state.selection.main;
        if (main.empty) {
          const source = editor.getValue();
          const caret = main.head;
          const cycleKey = `${caret}:${source.slice(
            Math.max(0, caret - 40),
            caret,
          )}`;
          const previous = tabCycleRef.current;
          const nextIndex =
            previous && previous.key === cycleKey ? previous.index + 1 : 0;
          const result = completeProjectOrContext(source, caret, nextIndex);
          if (result && result.matches.length > 0) {
            event.preventDefault();
            event.stopPropagation();
            lastExpansionRef.current = null;
            tabCycleRef.current = { key: cycleKey, index: nextIndex };
            setContent(result.value);
            scheduleSave(result.value);
            requestAnimationFrame(() => editor.setCaret(result.caret));
            return;
          }
        }
        tabCycleRef.current = null;
      } else {
        tabCycleRef.current = null;
      }

      // Autocorrect-style undo: Backspace immediately after an inline
      // shortcut expansion restores exactly what the user typed. Updating the
      // controlled value (rather than dispatching a CM transaction) avoids
      // feeding the restored trigger straight back through applyShortcut.
      if (event.key === 'Backspace' && lastExpansionRef.current) {
        const snapshot = lastExpansionRef.current;
        const currentValue = editor.getValue();
        if (
          currentValue === snapshot.afterValue ||
          currentValue.trimEnd() === snapshot.afterValue.trimEnd()
        ) {
          event.preventDefault();
          event.stopPropagation();
          lastExpansionRef.current = null;
          setContent(snapshot.beforeValue);
          scheduleSave(snapshot.beforeValue);
          requestAnimationFrame(() => editor.setCaret(snapshot.beforeCaret));
          return;
        }
      }

      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
        lastExpansionRef.current = null;
      }

      if (
        selectionToolbarMode === 'on-demand' &&
        selection &&
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.key === 'Enter'
      ) {
        event.preventDefault();
        event.stopPropagation();
        setSelectionPopoverOpen(true);
      }
    },
    [scheduleSave, selection, selectionToolbarMode],
  );

  const onReloadFromDisk = useCallback(async () => {
    saveQueueRef.current?.cancelPending();
    // CRITICAL: Cancel any pending debounced save so it cannot clobber
    // the fresh content we're about to fetch (data-loss race fix).
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    try {
      // Fetch the ACTIVE file — not the fixed /content endpoint (todo.txt).
      // This helper is reachable from the Done tab (move/restore/conflict
      // paths since the move ungate), and the old hardcoded fetch poured
      // todo.txt's content into the done tab's editor and state slots: the
      // editor then DISPLAYED todo content labeled done.txt, and the next
      // autosave attempted to write it INTO done.txt (caught only by the
      // mtime conflict gate — a reload from THAT banner looped the swap).
      const activeAtFetch = activeFileRef.current;
      const res = await fetch(
        `${API_BASE}/file?name=${encodeURIComponent(activeAtFetch)}`,
      );
      if (!res.ok) {
        setStatus({
          kind: 'error',
          message: `Reload failed: HTTP ${res.status}`,
        });
        return;
      }
      const data = (await res.json()) as ContentResponse;
      const diskContent = data.content ?? '';
      const diskMtime = data.mtime ?? 0;
      setContent(diskContent);
      latestContent.current = diskContent;
      if (activeAtFetch !== 'report') {
        const file = activeAtFetch as WritableTodoFile;
        latestContentByFile.current[file] = diskContent;
        dirtyFiles.current.delete(file);
        void clearRecoveryDraft(file);
      }
      setMtime(diskMtime);
      knownMtime.current = diskMtime;
      knownMtimeByFile.current[activeAtFetch] = diskMtime;
      setStatus({ kind: 'saved', at: Date.now() });
      setReloadAvailable(false);
      setSaveConflict(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message: `Reload failed: ${message}` });
    }
  }, []);

  // ---------------- AI-edit: Submit All ----------------

  const pushToast = useCallback((tone: ToastTone, message: string) => {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_TTL_MS);
  }, []);

  // ---------------- command palette wiring ----------------
  //
  // Global ⌘K / Ctrl+K opens the palette. This listener is registered on
  // `window` with `capture: true` so it wins over the per-textarea
  // editor onKeyDown (which handles the shortcut-expansion undo window). Esc
  // closes when open; the palette component itself also handles Esc
  // internally when focus is inside it.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isPaletteShortcut =
        (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k';
      if (isPaletteShortcut) {
        // Scope to app focus: the KiroCrew dashboard has its own global
        // Cmd/Ctrl+K launcher on the window BUBBLE phase, and this listener
        // runs CAPTURE with stopPropagation — grabbing the shortcut
        // unconditionally would silently disable the dashboard's launcher
        // on this route. Only claim it while focus is inside the app root
        // (except when our palette is open, so its own Cmd+K toggle-close
        // keeps working as focus sits in the palette portal).
        const root = rootRef.current;
        const active = document.activeElement;
        const focusInApp = !!(root && active && root.contains(active));
        if (!focusInApp && !paletteOpenRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => {
      window.removeEventListener('keydown', handler, { capture: true } as EventListenerOptions);
    };
  }, []);

  /**
   * Dispatch a palette-produced `ApplyResult` back into the editor.
   *
   *   - `mutation`      -> setContent + scheduleSave (writes todo.txt
   *                         via the existing debounced PUT pipeline).
   *   - `server-action` -> fetch to the declared endpoint, then reload
   *                         content from disk so the textarea reflects
   *                         the server-side change (archive, move,
   *                         report). Success/error surfaced via toast.
   *   - `filter` / `aggregate` -> render the result panel; aggregate rows
   *                         can drill into their corresponding filtered view.
   *   - `info`          -> surface the command's text in a neutral toast.
   */
  const dispatchApplyResult = useCallback(
    async (cmd: Command, result: ApplyResult) => {
      // `hidden hide` REMOVES lines from view, but item numbers address the
      // FILE (1-based document lines), so a user counting what they can see
      // and typing `del 3` hits a different line than the third visible one.
      // The mismatch is silent and the commands below are destructive, so say
      // it out loud before applying. Only fires when lines are actually out
      // of view — `dim` keeps them on screen and countable.
      if (
        hiddenModeRef.current === 'hide' &&
        hiddenTallyRef.current.hidden > 0 &&
        LINE_ADDRESSED_COMMANDS.has(cmd.name) &&
        (result.type === 'mutation' || result.type === 'server-action')
      ) {
        pushToast(
          'info',
          `${hiddenTallyRef.current.hidden} h:1 line${
            hiddenTallyRef.current.hidden === 1 ? '' : 's'
          } out of view — item numbers count every line in the file, ` +
            `including hidden ones. Run \`hidden show\` to see them.`,
        );
      }
      switch (result.type) {
        case 'mutation': {
          setContent(result.content);
          scheduleSave(result.content);
          if (cmd.name === 'example') {
            // `example` is the only mutating verb that REPLACES the whole
            // file instead of editing it. Signal that to the user so the
            // overwrite is visible. The toast states the change size and
            // deliberately offers no "— Ctrl+Z to undo" hint: the
            // textarea-undo path is not architecturally guaranteed once the
            // beacon-save pipeline has landed the new content, so the hint
            // would be a promise the app cannot keep.
            const prevLines = latestContent.current
              .split('\n')
              .filter((l) => l !== '').length;
            const newLines = result.content
              .split('\n')
              .filter((l) => l !== '').length;
            pushToast(
              'success',
              `example: replaced ${prevLines} line${prevLines === 1 ? '' : 's'} ` +
                `with ${newLines} starter line${newLines === 1 ? '' : 's'}`,
            );
          } else {
            pushToast('success', `${cmd.name}: applied.`);
          }
          return;
        }
        case 'server-action': {
          try {
            // `move` addresses a task by 1-based line NUMBER into the view the
            // user is looking at, so a stale view does not fail — it moves
            // whichever task now occupies that position. Send the source
            // file's known mtime as the optimistic-concurrency token and let
            // the backend 409 instead.
            const moveFrom =
              result.endpoint === `${API_BASE}/move` &&
              result.body !== null &&
              typeof result.body === 'object'
                ? (result.body as { from?: TodoFile }).from
                : undefined;
            const requestBody =
              moveFrom !== undefined
                ? {
                    ...(result.body as Record<string, unknown>),
                    base_mtime: knownMtimeByFile.current[moveFrom],
                  }
                : result.body;
            const res = await fetch(result.endpoint, {
              method: result.method,
              headers:
                requestBody !== undefined
                  ? { 'Content-Type': 'application/json' }
                  : undefined,
              body:
                requestBody !== undefined ? JSON.stringify(requestBody) : undefined,
            });
            if (res.status === 409) {
              // Nothing was moved. Pull the current file back so the line
              // numbers the user sees match disk before they retry.
              await onReloadFromDisk();
              pushToast(
                'error',
                `${cmd.name}: ${moveFrom ?? 'file'}.txt changed on disk — reloaded, nothing moved.`,
              );
              return;
            }
            if (!res.ok) {
              const text = await res.text().catch(() => `HTTP ${res.status}`);
              pushToast('error', `${cmd.name}: ${text || `HTTP ${res.status}`}`);
              return;
            }
            // Per-command reload target.
            //   `report` → jump to report.txt so the new snapshot is visible
            //   `archive`/`move` → reload todo.txt (user was on todo tab)
            //   default → reload todo.txt
            if (cmd.name === 'report') {
              await onFileChange('report');
              const parsed = (await res
                .json()
                .catch(() => null)) as { snapshot?: string } | null;
              pushToast(
                'success',
                parsed?.snapshot
                  ? `report: ${parsed.snapshot}`
                  : 'report: snapshot saved.',
              );
            } else {
              await onReloadFromDisk();
              pushToast('success', `${cmd.name}: done.`);
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            pushToast('error', `${cmd.name}: ${message}`);
          }
          return;
        }
        case 'filter': {
          setResultPanel(result);
          return;
        }
        case 'aggregate': {
          setResultPanel({
            ...result,
            drillMode: cmd.name === 'listproj' ? 'project' : 'context',
          });
          return;
        }
        case 'info': {
          pushToast('info', result.text);
          return;
        }
        case 'set-filter': {
          if (result.expr === null) {
            if (filterSourceRef.current === null) {
              pushToast('info', `${cmd.name}: no filter is active.`);
              return;
            }
            applyFilterExpr(null);
            pushToast('success', `${cmd.name}: cleared.`);
            return;
          }
          applyFilterExpr(result.expr);
          // Report the tally straight away: a filter that matches nothing
          // looks identical to a broken filter unless we say "0/12".
          const parsed = tryParseFilterExpr(result.expr);
          const tally =
            parsed === null ? null : filterCounts(latestContent.current, parsed);
          pushToast(
            'success',
            tally === null
              ? `${cmd.name}: ${result.expr}`
              : `${cmd.name}: ${result.expr} — ${tally.matched}/${tally.total} match` +
                  (tally.matched === 0 ? ' (nothing matches — Esc to clear)' : ''),
          );
          return;
        }
        case 'set-threshold': {
          const mode =
            result.mode === 'toggle'
              ? thresholdModeRef.current === 'hide'
                ? 'show'
                : 'hide'
              : result.mode;
          if (mode === thresholdModeRef.current) {
            pushToast('info', `${cmd.name}: already ${mode}ing future t: tasks.`);
            return;
          }
          applyThresholdMode(mode);
          // Report the tally straight away: "hide" that matched nothing is
          // indistinguishable from a broken toggle unless we say so.
          const tally = thresholdCounts(
            latestContent.current,
            mode,
            todayIso(),
          );
          pushToast(
            'success',
            mode === 'show'
              ? `${cmd.name}: showing all ${tally.total} lines.`
              : tally.hidden === 0
                ? `${cmd.name}: hide is on — no t: dates are in the future yet.`
                : `${cmd.name}: ${tally.hidden}/${tally.total} future t: task` +
                  `${tally.hidden === 1 ? '' : 's'} pushed back.`,
          );
          return;
        }
        case 'set-hidden': {
          // A bare `hidden` flips between showing and treating. Flipping back
          // ON restores the DEFAULT strength (`dim`) rather than whatever the
          // user last chose: re-deriving `hide` from a toggle would make a
          // single keystroke remove lines from view, which is not something a
          // toggle should be able to do silently.
          const mode =
            result.mode === 'toggle'
              ? hiddenModeRef.current === 'show'
                ? 'dim'
                : 'show'
              : result.mode;
          if (mode === hiddenModeRef.current) {
            pushToast('info', `${cmd.name}: h:1 lines are already ${mode}.`);
            return;
          }
          applyHiddenMode(mode);
          // Report the tally straight away: a mode change that matched nothing
          // is indistinguishable from a broken command unless we say so.
          const tally = hiddenCounts(latestContent.current, mode);
          const plural = tally.hidden === 1 ? '' : 's';
          pushToast(
            'success',
            mode === 'show'
              ? `${cmd.name}: showing all ${tally.total} lines.`
              : tally.hidden === 0
                ? `${cmd.name}: ${mode} is on — no line carries h:1 yet.`
                : mode === 'hide'
                  ? `${cmd.name}: ${tally.hidden}/${tally.total} h:1 line${plural} ` +
                    'removed from view (still in the file).'
                  : `${cmd.name}: ${tally.hidden}/${tally.total} h:1 line${plural} ` +
                    'dimmed.',
          );
          return;
        }
        case 'set-root': {
          // Ordering matters and is the whole reason this case is not a
          // two-liner:
          //   1. flush any pending save FIRST, so the user's last keystrokes
          //      land in the OLD root. Doing it after the PUT would write the
          //      old file's buffer into the new directory.
          //   2. PUT the new root.
          //   3. force-reload the active file, because `content` in state is
          //      now from a directory the app no longer reads.
          try {
            await flushPendingSave();
            const res = await fetch(`${API_BASE}/settings`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ root: result.root }),
            });
            const body = (await res.json().catch(() => null)) as
              | SettingsResponse
              | null;
            if (!res.ok || body === null) {
              pushToast(
                'error',
                `${cmd.name}: ${formatSettingsError(body, res.status)}`,
              );
              return;
            }
            await onFileChange(activeFileRef.current, { force: true });
            pushToast('success', `${cmd.name}: ${formatRootChange(body)}`);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            pushToast('error', `${cmd.name}: ${message}`);
          }
          return;
        }
        case 'show-root': {
          try {
            const res = await fetch(`${API_BASE}/settings`);
            const body = (await res.json().catch(() => null)) as
              | SettingsResponse
              | null;
            if (!res.ok || body === null) {
              pushToast(
                'error',
                `${cmd.name}: ${formatSettingsError(body, res.status)}`,
              );
              return;
            }
            pushToast('info', `${cmd.name}: ${formatWhere(body)}`);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            pushToast('error', `${cmd.name}: ${message}`);
          }
          return;
        }
        case 'switch-file': {
          // `listfile <name>` — switch the active tab to another file.
          // onFileChange handles the GET and updates both activeFile and
          // content. If the user is already on that tab, treat as a no-op
          // with a gentle toast so the command still produces feedback.
          if (result.target === activeFile) {
            pushToast('info', `${cmd.name}: already on ${result.target}.`);
            return;
          }
          try {
            await onFileChange(result.target);
            pushToast('success', `${cmd.name}: showing ${result.target}.txt`);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            pushToast('error', `${cmd.name}: ${message}`);
          }
          return;
        }
      }
    },
    [
      activeFile,
      applyFilterExpr,
      applyHiddenMode,
      applyThresholdMode,
      flushPendingSave,
      onFileChange,
      onReloadFromDisk,
      pushToast,
      scheduleSave,
    ],
  );

  /**
   * Palette `onExecute` bridge. Runs `cmd.apply()` against the current
   * textarea contents, the user-entered args, and the active file, then
   * dispatches the result. Errors (including `NotImplementedError`, for a
   * verb the palette does not implement as a text mutation) surface as
   * error toasts so the palette stays usable.
   *
   * All mutating + file-crossing commands semantically
   * operate on todo.txt (matching todo.sh behavior). Running them from
   * the `done` or `report` tab would corrupt state (mutate wrong file,
   * save as todo.txt). Guarded below with a clear error toast that
   * tells the user to switch tabs.
   */
  const COMMANDS_REQUIRING_TODO_TAB = new Set([
    'add',
    'append',
    'prepend',
    'del',
    'replace',
    'do',
    'pri',
    'depri',
    'sort',
    'deduplicate',
    'archive',
    // NOT 'move': applyMove is file-aware (`from` = active file) and
    // `move N todo` from the DONE tab is the sanctioned un-archive path —
    // gating it here made reverse-move unreachable. applyMove itself
    // rejects the report tab with a clear error.
    'report',
    'example',
  ]);

  const handlePaletteExecute = useCallback(
    (cmd: Command, args: string[]) => {
      // `help` is a pure UI command — opening the right-rail help panel.
      if (cmd.name === 'help') {
        setRailOpen(true);
        return;
      }
      // Guard: command must run against todo.txt. Refuse with a helpful
      // message instead of silently mutating the wrong file.
      if (
        COMMANDS_REQUIRING_TODO_TAB.has(cmd.name) &&
        activeFile !== 'todo'
      ) {
        pushToast(
          'error',
          `${cmd.name}: switch to the todo tab first — this command operates on todo.txt`,
        );
        return;
      }
      try {
        const result = cmd.apply(latestContent.current, args, activeFile);
        void dispatchApplyResult(cmd, result);
      } catch (err) {
        if (err instanceof NotImplementedError) {
          pushToast('info', `${cmd.name}: not yet implemented (follow-up task).`);
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        // Dedup a leading `${cmd.name}: ` that the thrown message may
        // already carry -- see formatCommandErrorToast for the full
        // rationale and the failure mode to watch for.
        pushToast('error', formatCommandErrorToast(cmd.name, message));
      }
    },
    [activeFile, dispatchApplyResult, pushToast],
  );

  const handleResultJump = useCallback((lineIdxOneBased: number) => {
    const view = cmEditorRef.current?.getView();
    if (!view) return;
    const lineNumber = Math.max(
      1,
      Math.min(lineIdxOneBased, view.state.doc.lines),
    );
    const line = view.state.doc.line(lineNumber);
    view.dispatch({
      selection: { anchor: line.from, head: line.to },
      scrollIntoView: true,
    });
    view.focus();
  }, []);

  const handleResultDrillIn = useCallback(
    (key: string, drillMode: 'context' | 'project') => {
      const commandName = drillMode === 'project' ? 'listproj' : 'listcon';
      const command = COMMANDS.find((candidate) => candidate.name === commandName);
      if (!command) {
        pushToast('error', `${commandName}: command unavailable`);
        return;
      }
      try {
        const result = command.apply(
          latestContent.current,
          [key],
          activeFile,
        );
        if (result.type === 'filter') {
          setResultPanel(result);
        } else {
          pushToast('error', `${commandName}: unexpected result`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        pushToast('error', formatCommandErrorToast(commandName, message));
      }
    },
    [activeFile, pushToast],
  );

  /**
   * POST pending comments to /apps/todo-txt/api/ai-edit. Dispatch on status:
   *   - 'applied' -> reload content via GET, show success toast, clear pending
   *   - 'staged'  -> open diff modal with current+proposed, clear pending
   *   - 'rejected'-> show error toast; clear pending unless malformed (retry)
   */
  const onSubmitAll = useCallback(async () => {
    if (pendingComments.length === 0 || submitting) return;

    // Flush any outstanding debounced PUT first so the backend reads the
    // user's latest content (not a stale snapshot) before invoking the LLM.
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      try {
        await doSave(latestContent.current);
      } catch {
        // fall through — ai-edit will surface its own error
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/ai-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: pendingComments }),
      });

      let payload: AiEditResponse | { error: string };
      try {
        payload = (await res.json()) as AiEditResponse | { error: string };
      } catch {
        pushToast('error', 'AI edit failed: malformed response');
        // Keep comments so user can retry.
        return;
      }

      // 4xx/5xx envelope with `{error}` (timeout 504, unavailable 503, etc).
      if ('error' in payload) {
        pushToast('error', `AI edit failed: ${payload.error}`);
        return;
      }

      if (payload.status === 'applied') {
        pushToast('success', formatAppliedToast(payload));
        setPendingComments([]);
        await (async () => {
          try {
            const r = await fetch(`${API_BASE}/content`);
            if (!r.ok) return;
            const data = (await r.json()) as ContentResponse;
            setContent(data.content ?? '');
            setMtime(data.mtime ?? 0);
            knownMtime.current = data.mtime ?? 0;
            setStatus({ kind: 'saved', at: Date.now() });
            setReloadAvailable(false);
          } catch {
            // ignore reload errors; user can hit Reload manually
          }
        })();
        return;
      }

      if (payload.status === 'staged') {
        setStagedEdit({
          current: latestContent.current,
          proposed: payload.proposed,
          diff: payload.diff,
          reason: payload.reason,
          lineDelta: payload.line_delta,
          charDelta: payload.char_delta,
          snapshot: payload.snapshot,
        });
        setPendingComments([]);
        return;
      }

      if (payload.status === 'rejected') {
        pushToast('error', `AI edit rejected: ${payload.reason}`);
        if (shouldClearOnReject(payload.reason)) {
          setPendingComments([]);
        }
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      pushToast('error', `AI edit failed: ${message}`);
      // Network exception — keep comments so user can retry.
    } finally {
      setSubmitting(false);
    }
  }, [pendingComments, submitting, doSave, pushToast]);

  const onStagedApply = useCallback(async () => {
    if (!stagedEdit) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE}/ai-snapshots/${encodeURIComponent(stagedEdit.snapshot)}/apply`,
        { method: 'POST' },
      );
      if (!res.ok) {
        if (res.status === 409) {
          // todo.txt changed after this proposal was staged — the staged
          // diff is no longer valid against the current content and the
          // backend refuses to apply it (it would destroy the newer edits).
          // The proposal can never become applicable again, so discard it
          // server-side too; otherwise it lingers exempt from pruning.
          await fetch(
            `${API_BASE}/ai-snapshots/${encodeURIComponent(stagedEdit.snapshot)}/discard`,
            { method: 'POST' },
          ).catch(() => undefined);
          setStagedEdit(null);
          pushToast(
            'error',
            'todo.txt changed after this edit was staged — stale proposal discarded. Re-run the AI edit.',
          );
          return;
        }
        const text = await res.text().catch(() => `HTTP ${res.status}`);
        pushToast('error', `Apply failed: ${text || res.status}`);
        return;
      }
      pushToast(
        'success',
        `KiroCrew applied staged edit (Δ${stagedEdit.lineDelta >= 0 ? '+' : ''}${stagedEdit.lineDelta} lines)`,
      );
      setStagedEdit(null);
      try {
        const r = await fetch(`${API_BASE}/content`);
        if (r.ok) {
          const data = (await r.json()) as ContentResponse;
          setContent(data.content ?? '');
          setMtime(data.mtime ?? 0);
          knownMtime.current = data.mtime ?? 0;
          setStatus({ kind: 'saved', at: Date.now() });
          setReloadAvailable(false);
        }
      } catch {
        // ignore
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      pushToast('error', `Apply failed: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }, [stagedEdit, pushToast]);

  const onStagedReject = useCallback(async () => {
    if (!stagedEdit) return;
    try {
      await fetch(
        `${API_BASE}/ai-snapshots/${encodeURIComponent(stagedEdit.snapshot)}/discard`,
        { method: 'POST' },
      ).catch(() => undefined);
    } finally {
      setStagedEdit(null);
      pushToast('info', 'Staged AI edit discarded');
    }
  }, [stagedEdit, pushToast]);

  // ---------------- selection + popover ----------------

  /**
   * Convert a character offset into 1-based `{line, column}` within
   * `src`. Matches the payload shape produced by the markdown
   * CommentOverlay so `/apps/todo-txt/api/ai-edit` sees a familiar
   * `InlineComment` on the wire.
   */
  const indexToLineCol = useCallback(
    (src: string, idx: number): { line: number; column: number } => {
      const clamped = Math.max(0, Math.min(idx, src.length));
      const before = src.slice(0, clamped);
      const nlCount = (before.match(/\n/g) || []).length;
      const lastNl = before.lastIndexOf('\n');
      return {
        line: nlCount + 1,
        column: clamped - (lastNl + 1) + 1,
      };
    },
    [],
  );

  const captureCodeMirrorSelection = useCallback(
    (rangesOverride?: readonly CmSelectionRange[], allowAutomaticOpen = true) => {
      const view = cmEditorRef.current?.getView();
      if (!view) return;
      const ranges = (rangesOverride ?? view.state.selection.ranges)
        .map((range) => ({ from: range.from, to: range.to }))
        .filter((range) => range.from !== range.to);
      if (ranges.length === 0) {
        setSelection(null);
        setSelectionPopoverOpen(false);
        return;
      }

      // Count from the LIVE ranges, carets included, so the label cannot
      // understate what a click is about to change.
      const liveRanges = (rangesOverride ?? view.state.selection.ranges).map(
        (range) => ({ from: range.from, to: range.to }),
      );
      // LINES, not blocks: four adjacent lines merge into one block, so a
      // block count would report "1" for a four-line change.
      const affectedLines = countSelectedLines(
        view.state.doc.toString(),
        liveRanges,
      );

      const primary = ranges.find(
        (range) =>
          range.from === view.state.selection.main.from &&
          range.to === view.state.selection.main.to,
      ) ?? ranges[0];
      const startCoords = view.coordsAtPos(primary.from);
      const endCoords = view.coordsAtPos(primary.to);
      if (!startCoords || !endCoords) {
        setSelectionPopoverOpen(false);
        return;
      }
      const rect = new DOMRect(
        Math.min(startCoords.left, endCoords.left),
        Math.min(startCoords.top, endCoords.top),
        Math.max(startCoords.right, endCoords.right) -
          Math.min(startCoords.left, endCoords.left),
        Math.max(startCoords.bottom, endCoords.bottom) -
          Math.min(startCoords.top, endCoords.top),
      );
      const source = view.state.doc.toString();
      const { line, column } = indexToLineCol(source, primary.from);
      setSelection({
        anchor: selectedText(source, ranges),
        ranges,
        rect,
        line,
        column,
        affectedLines,
      });
      setSelectionPopoverOpen((currentlyOpen) => {
        if (selectionToolbarMode === 'off') return false;
        if (selectionToolbarMode === 'automatic' && allowAutomaticOpen) {
          return true;
        }
        return currentlyOpen;
      });
    },
    [indexToLineCol, selectionToolbarMode],
  );

  /**
   * Textarea mouse-up / key-up handler. When the user has a non-empty
   * selection, snapshot it + anchor rect so the popover can attach.
   * Anchoring is deliberately coarse: rather than a mirror-div computing
   * character-accurate coordinates, the popover attaches to the textarea's
   * own bounding rect, which keeps it predictably near the text at a
   * fraction of the complexity.
   */
  const onTextareaMouseUp = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) {
      // Empty selection -- dismiss any open popover so the user's next
      // click doesn't re-anchor on a stale range.
      if (selection) setSelection(null);
      return;
    }
    const anchorText = latestContent.current.slice(start, end);
    // Real caret-based rect (mirror-div technique) — NOT the textarea's
    // whole bounding box. Previously `el.getBoundingClientRect()` put
    // the popover at the editor floor regardless of where the selection
    // actually was on screen.
    const rect = getTextareaSelectionRect(el, start, end);
    const { line, column } = indexToLineCol(latestContent.current, start);
    setSelection({
      anchor: anchorText,
      // Textarea fallback: a single contiguous range, hence one line block.
      affectedLines: 1,
      ranges: [{ from: start, to: end }],
      rect,
      line,
      column,
    });
    setSelectionPopoverOpen(selectionToolbarMode === 'automatic');
  }, [selection, indexToLineCol]);

  /**
   * Textarea scroll handler. Keeps the SH overlay in lockstep (existing
   * behaviour) AND dismisses any open popover (anchor coords are stale
   * once the content scrolls).
   */
  const onTextareaScroll = useCallback(
    (e: React.UIEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      setOverlayScroll({ top: el.scrollTop, left: el.scrollLeft });
      if (selection) setSelection(null);
    },
    [selection],
  );

  /** Dismiss the popover (Escape / Cancel / scroll / post-action). */
  const dismissSelection = useCallback(() => {
    setSelectionPopoverOpen(false);
    setSelection(null);
  }, []);

  // Quick-action handlers. Each one:
  //   1. Expands the current selection to whole lines via
  //      `lineRangeForSelection(textareaRef.current)`.
  //   2. Splits the intersected block into lines, applies the helper
  //      from `utils/todotxt.ts` per line, and splices the result back
  //      into `content`.
  //   3. Triggers the 400ms debounced save path (`scheduleSave`).
  //   4. Dismisses the popover so the user sees the action completed.
  //
  // Helper: produce `YYYY-MM-DD` for the local day in the same format
  // the todotxt.ts mutators expect.
  const todayStr = useCallback((): string => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Helper: run `transform` against every line intersected by the
  // current textarea selection, splice back into `content`, schedule a
  // save, and preserve the user's selection span on the transformed
  // block so they can stack subsequent actions without re-highlighting.
  const applyPerLineTransform = useCallback(
    (transform: (line: string) => string): string | null => {
      const view = cmEditorRef.current?.getView();
      if (view) {
        const source = view.state.doc.toString();
        const ranges = view.state.selection.ranges.map((range) => ({
          from: range.from,
          to: range.to,
        }));
        const changes = transformSelectedLines(source, ranges, transform);
        if (changes.length === 0) return null;
        view.dispatch({ changes });
        return view.state.doc.toString();
      }

      const ta = textareaRef.current;
      if (!ta) return null;
      const range = lineRangeForSelection(ta);
      const before = content.slice(0, range.start);
      const block = content.slice(range.start, range.end);
      const after = content.slice(range.end);
      const newBlock = block.split('\n').map(transform).join('\n');
      if (newBlock === block) return null;
      const next = before + newBlock + after;
      lastKeystroke.current = Date.now();
      setContent(next);
      setReloadAvailable(false);
      scheduleSave(next);
      requestAnimationFrame(() => {
        textareaRef.current?.setSelectionRange(
          range.start,
          range.start + newBlock.length,
        );
      });
      return next;
    },
    [content, scheduleSave],
  );

  /**
   * Mark done — toggle the `x YYYY-MM-DD ` prefix on every intersected line.
   *
   * Uses the shared recurrence-aware path, so completing a `rec:` task through
   * the popover generates the next instance exactly as the palette, Ctrl/Cmd+D
   * and vim `\x` do. The transform may return two lines; both the CodeMirror
   * and the textarea branch of `applyPerLineTransform` splice the returned
   * text over the line range, so that needs no special handling here.
   */
  const handleMarkDone = useCallback(() => {
    // Recurrence generation is a todo.txt semantic: completing a task on
    // the TODO tab spawns the next instance next to it. On the done tab
    // the toggle is a correction (un-archive / fix a mis-mark) — spawning
    // a new ACTIVE task inside done.txt would plant it where no one looks.
    applyPerLineTransform((line) =>
      activeFileRef.current === 'todo'
        ? completeLineWithRecurrence(line, todayStr())
        : markLineDone(line, todayStr()),
    );
    dismissSelection();
  }, [applyPerLineTransform, todayStr, dismissSelection]);

  /** Set / clear priority on every intersected line. */
  const handleSetPriority = useCallback(
    (p: PopoverPriority) => {
      applyPerLineTransform((line) => setPriority(line, p));
      dismissSelection();
    },
    [applyPerLineTransform, dismissSelection],
  );

  /** Insert today's creation date (spec Rule 2) on every intersected line. */
  const handleAddCreationDate = useCallback(() => {
    applyPerLineTransform((line) => addCreationDate(line, todayStr()));
    dismissSelection();
  }, [applyPerLineTransform, todayStr, dismissSelection]);

  /**
   * Apply a set of text changes to a source string outside CodeMirror —
   * the textarea fallback path (CM applies changes via view.dispatch).
   */
  const applyChangesLocally = useCallback(
    (source: string, changes: readonly TextChange[]): string =>
      [...changes]
        .sort((a, b) => b.from - a.from || b.to - a.to)
        .reduce(
          (current, change) =>
            current.slice(0, change.from) +
            change.insert +
            current.slice(change.to),
          source,
        ),
    [],
  );


  /** Copy the selected substring to the clipboard and show a success toast. */
  const handleCopy = useCallback(() => {
    if (!selection) {
      dismissSelection();
      return;
    }
    const text = selection.anchor;
    // Prefer the async clipboard API; fall back to a no-op with an
    // error toast if it's unavailable (insecure context / jsdom).
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      navigator.clipboard.writeText(text).then(
        () => pushToast('success', 'Copied to clipboard'),
        (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          pushToast('error', `Copy failed: ${msg}`);
        },
      );
    } else {
      pushToast('error', 'Clipboard unavailable');
    }
    dismissSelection();
  }, [selection, pushToast, dismissSelection]);

  /** Delete the line(s) containing the selection. Destructive. */
  const handleDeleteLine = useCallback(() => {
    const view = cmEditorRef.current?.getView();
    if (view) {
      const source = view.state.doc.toString();
      const changes = deleteSelectedLines(
        source,
        view.state.selection.ranges,
      );
      if (changes.length > 0) view.dispatch({ changes });
    } else {
      const ta = textareaRef.current;
      if (!ta) return;
      const changes = deleteSelectedLines(content, [
        { from: ta.selectionStart, to: ta.selectionEnd },
      ]);
      const next = applyChangesLocally(content, changes);
      setContent(next);
      scheduleSave(next);
    }
    pushToast('success', 'Selected line(s) deleted');
    dismissSelection();
  }, [content, scheduleSave, pushToast, dismissSelection, applyChangesLocally]);

  /** Duplicate the line(s) containing the selection, inserting the
   *  copy immediately after the original block. */
  const handleDuplicateLine = useCallback(() => {
    const view = cmEditorRef.current?.getView();
    if (view) {
      const source = view.state.doc.toString();
      // The reveal-aware variant: it returns the grown ranges that keep the
      // NEW copy inside a selection, so the hide layers do not collapse it the
      // moment it is created. See duplicateSelectedLinesWithReveal.
      const { changes, ranges } = duplicateSelectedLinesWithReveal(
        source,
        view.state.selection.ranges,
      );
      if (changes.length > 0) {
        view.dispatch({
          changes,
          selection: EditorSelection.create(
            ranges.map((r) => EditorSelection.range(r.from, r.to)),
          ),
        });
      }
    } else {
      const ta = textareaRef.current;
      if (!ta) return;
      const changes = duplicateSelectedLines(content, [
        { from: ta.selectionStart, to: ta.selectionEnd },
      ]);
      const next = applyChangesLocally(content, changes);
      setContent(next);
      scheduleSave(next);
    }
    pushToast('success', 'Selected line(s) duplicated');
    dismissSelection();
  }, [content, scheduleSave, pushToast, dismissSelection, applyChangesLocally]);

  /** Single-line archive: mark the selection's line(s) done, then run
   *  the server-side archive (which moves ALL `x ` lines to done.txt).
   *  Slightly over-eager — archives any other already-done lines at
   *  the same time — but that's what the backend supports without a
   *  new endpoint. User-perceived result is still "selected line → done". */
  const handleArchiveSelection = useCallback(async () => {
    // Defense in depth behind the popover's hidden button: this pipeline
    // transforms the ACTIVE editor content and saves it AS todo.txt. Run
    // from the done tab it would overwrite todo.txt with done.txt's
    // content wholesale — refuse loudly instead.
    if (activeFileRef.current !== 'todo') {
      pushToast('error', 'Archive works from the todo tab — this line is already in done.txt');
      dismissSelection();
      return;
    }
    // Recurrence-aware too: the server-side archive only moves `x ` lines, so
    // a generated next instance stays behind in todo.txt, which is exactly
    // what archiving one occurrence of a recurring task should leave you with.
    const next = applyPerLineTransform((line) =>
      completeLineWithRecurrence(line, todayStr()),
    );
    if (!next) {
      dismissSelection();
      return;
    }
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const saveResult = await doSave(next, 'todo');
    if (saveResult?.kind !== 'saved') {
      pushToast('error', 'Archive paused until todo.txt is safely saved');
      dismissSelection();
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/archive`, { method: 'POST' });
      if (!res.ok) {
        pushToast('error', `Archive failed: HTTP ${res.status}`);
      } else {
        // Reload todo.txt so the archived line disappears.
        await onReloadFromDisk();
        pushToast('success', 'Line archived to done.txt');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      pushToast('error', `Archive failed: ${msg}`);
    }
    dismissSelection();
  }, [
    applyPerLineTransform,
    todayStr,
    doSave,
    onReloadFromDisk,
    pushToast,
    dismissSelection,
  ]);

  /** Set a due:YYYY-MM-DD key-value on the selected line(s). `relSpec`
   *  is parsed with the shortcut date parser, so we accept 'today',
   *  'tom', '+3d', '+1w', 'fri', etc. On parse failure, no-op + toast. */
  const handleSetDueDate = useCallback(
    (relSpec: string) => {
      const d = parseRelDate(relSpec, new Date());
      if (!d) {
        pushToast('error', `Unknown date: "${relSpec}"`);
        return;
      }
      const iso = fmtDate(d);
      applyPerLineTransform((line) => {
        if (!line.trim()) return line;
        if (/\bdue:\d{4}-\d{2}-\d{2}\b/.test(line)) {
          return line.replace(/\bdue:\d{4}-\d{2}-\d{2}\b/, `due:${iso}`);
        }
        return `${line.trimEnd()} due:${iso}`;
      });
      pushToast('success', `due:${iso}`);
      dismissSelection();
    },
    [applyPerLineTransform, pushToast, dismissSelection],
  );

  // ---------------- pending comments ----------------

  /**
   * Popover's "Run ▶" button handler. Hands off to KiroCrew chat via
   * the SDK's useChatLauncher hook, which opens a new chat session in
   * the host dashboard with the selected text + user prompt as the
   * initial message.
   *
   * WHY THE SDK HOOK AND NOT A PLAIN NAVIGATION. The handoff payload
   * travels through `window.__mc_chat_launch`, which ChatPage consumes in
   * its mount effect (10s TTL in the consumer) — it reads that global
   * only, never searchParams, so no query string is part of the contract.
   * Assigning `window.location.href` would trigger a FULL PAGE RELOAD and
   * build a fresh `window`, destroying the payload before ChatPage could
   * read it and leaving the user on an empty chat page with no prompt.
   * `useChatLauncher` routes through the dashboard's client-side React
   * Router `navigate('/chat')`, so the same `window` survives the route
   * change and the payload is still there on mount.
   *
   * =====================================================================
   * End-to-end selectors / flow
   * =====================================================================
   *
   * 1. Trigger the popover: select text inside the textarea
   *    `[data-testid="todo-txt-textarea"]`. Popover portal is at
   *    `[data-testid="todo-txt-selection-popover-portal"]`, ready
   *    sentinel at `[data-testid="todo-txt-selection-ready"]`.
   * 2. Type into the comment textarea inside the popover
   *    (`aria-label="Add a comment for KiroCrew"` /
   *    `placeholder="Tell KiroCrew what to do…"`).
   * 3. Click the "Run ▶" button (the submit button with text "Run ▶"
   *    inside the popover), OR press Enter in the textarea.
   * 4. Assert the browser navigated to `/chat` AND that the chat page
   *    mounted with the expected initial message (either by reading
   *    `window.__mc_chat_launch` BEFORE ChatPage consumes it with a
   *    page.evaluate, or by asserting the chat input shows the message
   *    after auto-send).
   *
   * The message format is deterministic — it includes the selected
   * text inside a fenced code block and the user's prompt after
   * "My request:". See `message` construction below.
   */
  const handleAddComment = useCallback(
    (payload: NewInlineComment) => {
      // STAGE THE COMMENT IN-APP. This is the app's own differentiated
      // pipeline: /api/ai-edit classifies the proposal into tiers, snapshots
      // the file first, auto-applies only additive edits, and STAGES a
      // destructive one for review in the diff modal.
      //
      // This connector is the ONLY producer of `pendingComments`. Wiring it
      // to the chat handoff instead would leave `onSubmitAll`, the staged
      // modal, apply, discard, and the backend's whole staging pipeline with
      // no way in — an entire reviewed-edit surface that no user action can
      // reach. The chat handoff stays available, deliberately, as a separate
      // action: `handleAskInChat`.
      const snapshot = selection;
      const source = latestContent.current;
      // ONE COMMENT PER CONTIGUOUS RANGE. `selectedText` joins ranges with
      // '\n', so a non-adjacent multi-range selection would produce an anchor like
      // 'alpha task\ngamma task' — a string that does not occur anywhere in
      // todo.txt. The backend resolves a comment by anchor TEXT, so an anchor
      // matching nothing becomes an unconstrained rewrite instruction against
      // the whole file. The single line/column could only ever describe one
      // range anyway, and it described the PRIMARY (newest caret), i.e. the
      // wrong end of the joined string.
      const targets =
        snapshot && snapshot.ranges.length > 1
          ? snapshot.ranges.map((range) => ({
              anchor: source.slice(range.from, range.to),
              ...indexToLineCol(source, range.from),
            }))
          : [
              {
                anchor: payload.anchor,
                line: snapshot?.line ?? 1,
                column: snapshot?.column ?? 1,
              },
            ];
      setPendingComments((prev) => [
        ...prev,
        ...targets.map((target, i) => ({
          // crypto.randomUUID is unavailable on insecure origins in some
          // browsers; the counter suffix keeps ids unique either way.
          id:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `c-${Date.now()}-${prev.length}-${i}`,
          anchor: target.anchor,
          text: payload.text,
          // Fall back to 1/1 rather than 0: the backend renders these into
          // the prompt as 1-based line references, and the anchor TEXT is
          // what actually resolves the target, so a missing snapshot
          // degrades the hint, never the edit.
          line: target.line,
          column: target.column,
        })),
      ]);
      // The popover intentionally stays open so several comments can be
      // stacked onto one submission; it clears its own textarea.
    },
    [selection, indexToLineCol],
  );

  /** Hand the selection to KiroCrew chat instead of the in-app pipeline.
   *
   * Kept as an explicit, separate affordance. The staged pipeline can only
   * rewrite todo.txt line-for-line; chat is the escape hatch for anything
   * conversational ("what should I prioritise?"), and it was the popover's
   * only behaviour before this rewire, so removing it would take away
   * something already in use.
   */
  const handleAskInChat = useCallback(
    async (payload: NewInlineComment) => {
      // Build the launch message. Format is deliberately structured so
      // the model can distinguish the selection from the user's request:
      // fenced code block for the selection, explicit "My request:"
      // line for the prompt. Matches the prior implementation so any
      // downstream prompt-handling expectations are unchanged.
      const selected = payload.anchor.trim();
      const prompt = payload.text.trim();
      const message = [
        `I'm editing my ${activeFileRef.current === 'done' ? 'done' : 'todo'}.txt file. Here's the selected task(s):`,
        '',
        '```',
        selected,
        '```',
        '',
        `My request: ${prompt}`,
        '',
        'Please reply with just the rewritten task line(s). I will paste them back myself.',
      ].join('\n');

      // Close popover immediately so the UI doesn't look stuck mid-
      // navigation. Navigation itself is synchronous (SDK internally
      // calls navigate('/chat') after writing the launch intent).
      dismissSelection();

      // Hand off to the SDK. No explicit `agent` — user's current
      // default agent picks up the session, matching the informal
      // "ask KiroCrew" feel the popover's copy suggests. If a future
      // product decision wants a specific agent, pass `agent: '<name>'`
      // here.
      try {
        openChat({ message });
      } catch (err) {
        // Defensive: SDK hook should never throw under normal use, but
        // if the import map is broken or the hook runs outside the
        // AppApiProvider, surface a non-blocking toast so the user
        // knows the popover action didn't take effect.
        pushToast(
          'error',
          `Could not open chat: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    [dismissSelection, openChat, pushToast],
  );

  /** Remove a pending comment before submission. */
  const handleRemoveComment = useCallback((id: string) => {
    setPendingComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /** Inline-edit a pending comment's text (empty / whitespace rejected). */
  const handleEditComment = useCallback((id: string, nextText: string) => {
    const trimmed = nextText.trim();
    if (!trimmed) return;
    setPendingComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, text: trimmed } : c)),
    );
  }, []);

  // ---------------- derived ----------------

  const charCount = content.length;
  const lineCount = content === '' ? 0 : content.split('\n').length;

  const statusLabel = (() => {
    switch (status.kind) {
      case 'idle':
        return loaded ? 'Saved' : 'Loading…';
      case 'saving':
        return 'Saving…';
      case 'saved':
        return 'Saved';
      case 'error':
        return `Error: ${status.message}`;
    }
  })();

  const statusTone = (() => {
    // Theme-token classes instead of hardcoded Tailwind shades. See
    // src/index.css @layer base for the token definitions and per-theme
    // overrides; on dark themes the tokens resolve to emerald-500 /
    // amber-500 / red-500, while light themes drop to AA-safe darker
    // shades.
    switch (status.kind) {
      case 'error':
        return 'text-[var(--color-status-err)]';
      case 'saving':
        return 'text-[var(--color-status-warn)]';
      default:
        return 'text-[var(--color-status-ok)]';
    }
  })();

  // ---------------- render ----------------

  // ---------------- fullscreen sync ----------------
  // Sync local `fullscreen` state with the browser Fullscreen API for the
  // NATIVE path only (plain browser tab): engaging native fullscreen on our
  // root confirms the flag; a native exit (Esc handled by the browser)
  // clears it. Pseudo-fullscreen never touches the Fullscreen API, so an
  // unrelated fullscreenchange elsewhere on the page must not cancel it —
  // hence the nativeAttemptRef guard.
  useEffect(() => {
    const handler = () => {
      if (document.fullscreenElement === rootRef.current) {
        setFullscreen(true);
      } else if (document.fullscreenElement === null && nativeAttemptRef.current) {
        nativeAttemptRef.current = false;
        setFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /**
   * True when a key event originated inside the editor's DOM.
   *
   * `Node.contains()` THROWS a TypeError when handed a non-Node, and a keydown
   * dispatched at `window` has `window` as its target — so the naive
   * `dom.contains(e.target as Node)` form crashes for any window-level
   * synthetic event. Guarded here once and shared by both Escape arbiters.
   */
  const eventIsInsideEditor = useCallback((e: Event): boolean => {
    const target = e.target;
    if (!(target instanceof Node)) return false;
    const dom = cmEditorRef.current?.getView()?.dom;
    return dom ? dom.contains(target) : false;
  }, []);

  // Esc exits PSEUDO fullscreen (in native fullscreen the browser consumes
  // Esc before it reaches us; in pseudo mode nothing else would).
  //
  // Vim arbitration: this handler is capture-phase at WINDOW level and calls
  // preventDefault + stopPropagation, so it runs before CodeMirror's own
  // keydown handler and vim never sees the key. Claiming it unconditionally
  // would strand a vim user in INSERT mode while fullscreen was on — they
  // press Esc, the app leaves fullscreen, and their next `dd` types the
  // literal `dd` into the task. Escape is therefore yielded to the editor exactly
  // when vim has something to do with it: a non-NORMAL mode (insert / visual /
  // replace) with focus inside the editor. In NORMAL mode Esc is a vim no-op,
  // so fullscreen keeps it and neither claimant is silently dead.
  useEffect(() => {
    if (!fullscreen || document.fullscreenElement) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (vimMode && vimStatus !== 'NORMAL' && eventIsInsideEditor(e)) return;
      e.preventDefault();
      e.stopPropagation();
      setFullscreen(false);
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () =>
      window.removeEventListener('keydown', onKey, {
        capture: true,
      } as EventListenerOptions);
  }, [eventIsInsideEditor, fullscreen, vimMode, vimStatus]);


  // Esc clears an active filter.
  //
  // Deliberately NOT a capture-phase handler and it never preventDefaults:
  //   - the pseudo-fullscreen Esc effect above captures and stops the event,
  //     so leaving fullscreen wins when both are active (one Esc, one action);
  //   - the result panel / palette / modals own Esc while they are open, hence
  //     the guards below;
  //   - in vim mode Esc belongs to the editor (leave insert/visual), so an Esc
  //     raised from inside the editor DOM is left alone entirely. The chip is
  //     clickable, so the filter is still one gesture away from cleared.
  useEffect(() => {
    if (filterSource === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (paletteOpen || resultPanel || stagedEdit || showBackups) return;
      if (backupPreview || recoveryDraft) return;
      if (vimMode && eventIsInsideEditor(e)) return;
      applyFilterExpr(null);
      pushToast('info', 'filter: cleared.');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    applyFilterExpr,
    backupPreview,
    eventIsInsideEditor,
    filterSource,
    paletteOpen,
    pushToast,
    recoveryDraft,
    resultPanel,
    showBackups,
    stagedEdit,
    vimMode,
  ]);

  // Keep the fixed help rail immediately below the real header. The header
  // wraps on narrow screens, so a hard-coded 56px offset can cover controls.
  useEffect(() => {
    const header = headerRef.current;
    const root = rootRef.current;
    if (!header || !root) return;

    let frame: number | null = null;
    const updateRailTop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = null;
        root.style.setProperty(
          '--todo-txt-rail-top',
          `${Math.ceil(header.getBoundingClientRect().bottom)}px`,
        );
      });
    };
    updateRailTop();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateRailTop);
    observer?.observe(header);
    window.addEventListener('resize', updateRailTop, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateRailTop);
      if (frame !== null) cancelAnimationFrame(frame);
    };
    // `fullscreen` MOVES the header (y≈96 → 0) without resizing it, so
    // neither the ResizeObserver nor window.resize fires — the effect must
    // re-run on the flag or the rail stays parked below a header edge that
    // no longer exists.
  }, [fullscreen]);

  return (
    <div
      ref={rootRef}
      className={
        fullscreen
          ? 'fixed inset-0 z-[9000] flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]'
          : 'flex h-full flex-col bg-[var(--color-bg)] text-[var(--color-fg)]'
      }
      // The app's aesthetic is "a text file": the mono font is the baseline
      // for the WHOLE tree (header counter, tabs, toolbar chips, popover
      // action buttons, toasts), not just the editor. Without this, every
      // element with no explicit font silently inherits the dashboard's
      // body font, so the user's selected mono applied only where a
      // component happened to set --font-mono itself. Deliberate sans
      // islands (comment textarea, shortcut-hint <span>s) keep their
      // explicit font-sans classes, which override inheritance.
      style={{ fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)' }}
      data-testid="todo-txt-page"
    >
      {/* Header */}
      <header
        ref={headerRef}
        className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--color-border)] px-3 py-2 sm:px-4"
        data-testid="todo-txt-header"
      >
        <NotebookPen className="shrink-0" size={16} aria-hidden="true" />
        <h1 className="shrink-0 text-sm font-medium">todo.txt</h1>

        <span
          className={`text-xs ${statusTone}`}
          data-testid="todo-txt-status"
          aria-live="polite"
        >
          ● {statusLabel}
        </span>

        <div className="order-last flex w-full min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-xs text-[var(--color-muted-fg)] sm:order-none sm:ml-auto sm:w-auto sm:flex-1 md:gap-x-2">
          {pendingComments.length > 0 && (
            <button
              type="button"
              onClick={() => void onSubmitAll()}
              disabled={submitting}
              className="inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-2 py-1 text-[var(--accent)] hover:bg-[var(--accent-glow)] disabled:opacity-50"
              data-testid="todo-txt-submit-all"
              aria-label={`Submit ${pendingComments.length} AI edit ${pendingComments.length === 1 ? 'comment' : 'comments'}`}
            >
              <Sparkles size={14} aria-hidden="true" />
              <span className="hidden lg:inline">
                {submitting
                  ? 'Submitting…'
                  : `Submit All (${pendingComments.length})`}
              </span>
              <span className="lg:hidden" aria-hidden="true">
                {submitting ? '…' : pendingComments.length}
              </span>
            </button>
          )}
          {activeFilter !== null && filterTally !== null && (
            <button
              type="button"
              onClick={() => {
                applyFilterExpr(null);
                pushToast('info', 'filter: cleared.');
              }}
              className={`inline-flex max-w-[16rem] items-center gap-1 rounded px-2 py-1 ${
                filterTally.matched === 0
                  ? 'bg-[var(--color-bg-hover)] text-[var(--color-warn-fg,#f59e0b)]'
                  : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
              } hover:bg-[var(--accent-glow)]`}
              data-testid="todo-txt-filter-chip"
              title="Clear filter (Esc)"
              aria-label={
                `Filter ${activeFilter.source} — ` +
                `${filterTally.matched} of ${filterTally.total} lines match. ` +
                'Activate to clear.'
              }
            >
              <ListFilter size={14} aria-hidden="true" />
              <span
                className="truncate"
                style={{ fontFamily: 'var(--font-mono)' }}
                data-testid="todo-txt-filter-chip-expr"
              >
                filter: {activeFilter.source}
              </span>
              <span data-testid="todo-txt-filter-chip-counts">
                ({filterTally.matched}/{filterTally.total})
              </span>
              <X size={12} aria-hidden="true" />
            </button>
          )}
          {thresholdMode === 'hide' && (
            <button
              type="button"
              onClick={() => {
                applyThresholdMode('show');
                pushToast('info', 'threshold: showing all lines.');
              }}
              className="inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-2 py-1 text-[var(--accent)] hover:bg-[var(--accent-glow)]"
              data-testid="todo-txt-threshold-chip"
              title="Show future t: tasks again"
              aria-label={
                `Threshold hiding is on — ${thresholdTally.hidden} of ` +
                `${thresholdTally.total} lines have a future t: date. ` +
                'Activate to show them.'
              }
            >
              <EyeOff size={14} aria-hidden="true" />
              <span
                style={{ fontFamily: 'var(--font-mono)' }}
                data-testid="todo-txt-threshold-chip-counts"
              >
                t: {thresholdTally.hidden}/{thresholdTally.total}
              </span>
              <X size={12} aria-hidden="true" />
            </button>
          )}
          {/* `h:1` chip. Only shown when h:1 lines actually EXIST and are being
              treated — the default is `dim`, so an unconditional chip would
              greet every user with a mode indicator for a feature they have
              never used. Clicking it goes straight to `show`, which is the
              escape hatch that stops `hide` from ever looking like data loss. */}
          {hiddenMode !== 'show' && hiddenTally.hidden > 0 && (
            <button
              type="button"
              onClick={() => {
                applyHiddenMode('show');
                pushToast('info', 'hidden: showing h:1 lines.');
              }}
              className="inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-2 py-1 text-[var(--accent)] hover:bg-[var(--accent-glow)]"
              data-testid="todo-txt-hidden-chip"
              title="Show h:1 lines again"
              aria-label={
                `h:1 lines are ${hiddenMode === 'hide' ? 'out of view' : 'dimmed'} — ` +
                `${hiddenTally.hidden} of ${hiddenTally.total} lines carry the tag. ` +
                'They are still in the file. Activate to show them.'
              }
            >
              <EyeOff size={14} aria-hidden="true" />
              <span
                style={{ fontFamily: 'var(--font-mono)' }}
                data-testid="todo-txt-hidden-chip-counts"
              >
                h:1 {hiddenTally.hidden}/{hiddenTally.total}
              </span>
              <X size={12} aria-hidden="true" />
            </button>
          )}
          <span className="hidden lg:inline" data-testid="todo-txt-counts">
            {charCount} chars · {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
          {/* Header `?` button: toggles the right-rail help panel, which is
              the single canonical help surface — there is deliberately no
              second hover popover or modal competing with it. */}
          <button
            type="button"
            onClick={() => setRailOpen((v) => !v)}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${
              railOpen
                ? 'text-[var(--accent)]'
                : 'text-[var(--color-muted-fg)]'
            }`}
            data-testid="todo-txt-help-toggle"
            aria-pressed={railOpen}
            aria-controls="todo-txt-rail-title"
            aria-label={railOpen ? 'Hide help panel' : 'Show help panel'}
            title="Help panel (Ctrl+/)"
          >
            <CircleHelp size={14} aria-hidden="true" />
            <span className="hidden lg:inline">?</span>
          </button>
          {/* Three-file tab switcher (todo / done / report). Sits
               immediately before the syntax-highlight toggle. */}
          <FileTabs
            activeFile={activeFile}
            onChange={(next) => {
              void onFileChange(next);
            }}
          />
          <button
            type="button"
            onClick={toggleSyntaxHighlight}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${
              syntaxHighlight
                ? 'text-[var(--accent)]'
                : 'text-[var(--color-muted-fg)]'
            }`}
            data-testid="todo-txt-syntax-toggle"
            aria-pressed={syntaxHighlight}
            aria-label={
              syntaxHighlight
                ? 'Disable syntax highlighting'
                : 'Enable syntax highlighting'
            }
            title={
              syntaxHighlight
                ? 'Syntax highlighting: ON'
                : 'Syntax highlighting: OFF'
            }
          >
            <Highlighter size={14} aria-hidden="true" />
            <span className="hidden lg:inline">SH {syntaxHighlight ? 'on' : 'off'}</span>
          </button>
          <button
            type="button"
            onClick={cycleSelectionToolbarMode}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${
              selectionToolbarMode === 'off'
                ? 'text-[var(--color-muted-fg)]'
                : 'text-[var(--accent)]'
            }`}
            data-testid="todo-txt-selection-toolbar-mode"
            aria-label={`Selection actions: ${selectionToolbarMode}`}
            title={
              selectionToolbarMode === 'automatic'
                ? 'Selection actions open automatically'
                : selectionToolbarMode === 'on-demand'
                  ? 'Selection actions open with Alt+Enter'
                  : 'Selection actions disabled'
            }
          >
            <MousePointer2 size={14} aria-hidden="true" />
            <span className="hidden lg:inline">Actions {selectionToolbarModeLabel(selectionToolbarMode)}</span>
          </button>
          <button
            type="button"
            onClick={toggleVimMode}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${
              vimMode
                ? 'text-[var(--accent)]'
                : 'text-[var(--color-muted-fg)]'
            }`}
            data-testid="todo-txt-vim-toggle"
            aria-pressed={vimMode}
            aria-label={vimMode ? 'Disable vim mode' : 'Enable vim mode'}
            title={vimMode ? 'Vim mode: ON' : 'Vim mode: OFF'}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 'bold' }}>VIM</span>
            <span className="hidden lg:inline">{vimMode ? 'on' : 'off'}</span>
          </button>
          <button
            type="button"
            onClick={toggleAmoled}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)] ${
              amoled
                ? 'text-[var(--accent)]'
                : 'text-[var(--color-muted-fg)]'
            }`}
            data-testid="todo-txt-amoled-toggle"
            aria-pressed={amoled}
            aria-label={amoled ? 'Disable AMOLED black background' : 'Enable AMOLED black background'}
            title={amoled ? 'AMOLED black: ON (dark themes)' : 'AMOLED black: OFF'}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 'bold' }}>AMOLED</span>
            <span className="hidden lg:inline">{amoled ? 'on' : 'off'}</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              // The modal shows the ACTIVE tab's backup family: on the Done
              // tab you get done.txt backups (previously invisible — done
              // backups existed on disk with no recovery path). Report tab
              // falls back to the todo family.
              const family =
                activeFileRef.current === 'done' ? 'done' : 'todo';
              setBackupsFamily(family);
              setShowBackups(true);
              setBackupsLoading(true);
              try {
                const res = await fetch(
                  `${API_BASE}/backups?file=${family}`,
                );
                if (res.ok) {
                  const data = (await res.json()) as {
                    backups: Array<{ name: string; bytes: number; mtime: number }>;
                  };
                  setBackups(data.backups ?? []);
                } else {
                  pushToast('error', `Backups fetch failed: HTTP ${res.status}`);
                }
              } catch (err) {
                pushToast(
                  'error',
                  `Backups fetch failed: ${err instanceof Error ? err.message : String(err)}`,
                );
              } finally {
                setBackupsLoading(false);
              }
            }}
            className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)]"
            data-testid="todo-txt-backups"
            aria-label="Open backups"
            title="Browse and restore backups"
          >
            <History size={14} />
            <span className="hidden lg:inline">Backups</span>
          </button>
          <button
            type="button"
            onClick={() => {
              // Download the active file as <name>.txt. Uses a Blob URL;
              // revoked immediately after the synthetic click to free memory.
              try {
                const text = latestContent.current ?? '';
                const blob = new Blob([text], {
                  type: 'text/plain;charset=utf-8',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${activeFile}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                pushToast('error', `Download failed: ${message}`);
              }
            }}
            className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)]"
            data-testid="todo-txt-download"
            aria-label={`Download ${activeFile}.txt`}
            title={`Download ${activeFile}.txt`}
          >
            <Download size={14} />
            <span className="hidden lg:inline">Download</span>
          </button>
          <button
            type="button"
            onClick={() => {
              // KiroCrew's Electron shell denies the `fullscreen` permission
              // for every renderer (main.js -> createPermissionRequestHandler
              // grants only `media`), so Element.requestFullscreen() always
              // rejects here — silently, since the host doesn't even log the
              // denial. CSS pseudo-fullscreen is therefore the PRIMARY path;
              // native fullscreen is attempted as an opportunistic upgrade
              // for plain-browser-tab sessions where the platform allows it.
              if (document.fullscreenElement) {
                void document.exitFullscreen().catch(() => {});
                setFullscreen(false);
                return;
              }
              if (fullscreen) {
                setFullscreen(false);
                return;
              }
              setFullscreen(true); // paint immediately
              if (
                document.fullscreenEnabled &&
                rootRef.current?.requestFullscreen
              ) {
                nativeAttemptRef.current = true;
                void rootRef.current
                  .requestFullscreen()
                  .catch(() => {
                    // Denied (the Electron-shell case): stay in pseudo mode.
                    nativeAttemptRef.current = false;
                  });
              }
            }}
            className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-[var(--color-bg-hover)]"
            data-testid="todo-txt-fullscreen"
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden lg:inline">{fullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </header>

      {recoveryDraft && (
        <div
          className="flex flex-wrap items-center gap-3 border-b border-[var(--accent)] bg-[var(--accent-subtle)] px-4 py-2 text-xs"
          data-testid="todo-txt-recovery-banner"
          role="alert"
        >
          <span>
            Unsaved {recoveryDraft.file}.txt draft from{' '}
            {new Date(recoveryDraft.updatedAt).toLocaleString()} ({
              recoveryDraft.content.length
            } chars).
          </span>
          <button
            type="button"
            onClick={restoreRecoveryDraft}
            className="rounded border border-[var(--accent)] px-2 py-0.5 font-medium text-[var(--accent)]"
            data-testid="todo-txt-recovery-restore"
          >
            Restore draft
          </button>
          <button
            type="button"
            onClick={discardRecoveryDraft}
            className="rounded px-2 py-0.5 text-[var(--color-muted-fg)] hover:bg-[var(--color-bg-hover)]"
            data-testid="todo-txt-recovery-discard"
          >
            Discard
          </button>
        </div>
      )}

      {/* Reload banner (non-destructive) */}
      {reloadAvailable && (
        <div
          className="flex items-center gap-3 border-b border-[var(--warn)] bg-[var(--warn-subtle)] px-4 py-2 text-xs"
          data-testid="todo-txt-reload-banner"
          role="status"
        >
          <span>File changed on disk.</span>
          <button
            type="button"
            onClick={() => void onReloadFromDisk()}
            className="rounded px-2 py-0.5 underline hover:bg-[var(--warn-subtle)]"
            data-testid="todo-txt-reload-button"
          >
            Reload from disk
          </button>
          {saveConflict && (
            <button
              type="button"
              onClick={() => void overwriteDiskWithLocal()}
              className="rounded border border-[var(--warn)] px-2 py-0.5 font-medium"
              data-testid="todo-txt-overwrite-disk"
            >
              Overwrite disk with mine
            </button>
          )}
          <button
            type="button"
            onClick={() => setReloadAvailable(false)}
            className="ml-auto rounded px-2 py-0.5 text-[var(--color-muted-fg)] hover:bg-[var(--warn-subtle)]"
            data-testid="todo-txt-reload-dismiss"
            aria-label="Dismiss reload banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* Textarea + syntax-highlight overlay.
          When SH is ON the textarea renders transparent text so the
          absolutely-positioned <TodoTxtSyntaxOverlay> paints tokenized
          spans underneath the live caret. When SH is OFF the overlay
          collapses to `display: none` and the textarea owns all painting.

          When `activeFile === 'report'` the body pane swaps to
          <ReportChart>. The raw report.txt contents stay reachable via
          `GET /apps/todo-txt/api/file?name=report` for tooling.

          The body region reserves space for the right-rail help panel via
          `paddingRight` so the rail does not overlay the editor content
          while open. The rail itself keeps `position: fixed` and floats
          into the reserved band; when closed the padding collapses and the
          editor reclaims full width. */}
      <div
        className="flex flex-1 flex-col min-h-0"
        style={{
          paddingRight: railOpen ? 'clamp(240px, 18%, 360px)' : 0,
          transition: 'padding-right 180ms ease',
        }}
        data-testid="todo-txt-body-wrap"
      >
      {loadError && content === '' ? (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center"
          data-testid="todo-txt-load-error"
          role="alert"
        >
          <AlertTriangle
            size={28}
            aria-hidden="true"
            style={{ color: 'var(--danger)' }}
          />
          <div
            className="text-sm font-medium"
            style={{ color: 'var(--color-fg)' }}
          >
            Couldn&rsquo;t load todo.txt
          </div>
          <div
            className="max-w-sm text-xs leading-5"
            style={{ color: 'var(--color-muted-fg)' }}
          >
            {loadError}
          </div>
          <button
            type="button"
            onClick={() => void retryLoad()}
            data-testid="todo-txt-load-retry"
            className="mt-1 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium"
            style={{
              borderColor: 'var(--border-strong)',
              color: 'var(--accent)',
              background: 'var(--accent-subtle)',
            }}
          >
            <RefreshCw size={13} aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : activeFile === 'report' ? (
        /* P6: the report tab renders the real chart when report.txt has
         * parseable snapshots. The chart receives the ALREADY-LOADED
         * content via `data` (parsed here) instead of using its internal
         * self-fetch — one source of truth, no second network request,
         * and a freshly captured snapshot re-renders the chart because
         * `content` is state. The placeholder remains the empty state. */
        (() => {
          const points = parseReport(content);
          if (points.length > 0) {
            return (
              <div
                className="flex flex-1 flex-col overflow-auto px-4 py-4"
                data-testid="todo-txt-report-body"
              >
                <ReportChart data={points} />
              </div>
            );
          }
          return (
            <div
              className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-sm text-[var(--color-muted-fg)]"
              data-testid="todo-txt-report-body"
            >
              <div className="mb-2 font-mono text-xs uppercase tracking-wider">
                report.txt
              </div>
              <div className="mb-4 text-center">
                No snapshots yet — run `report` from the command palette
                (Ctrl+K) to capture one.
              </div>
            </div>
          );
        })()
      ) : (
        <div
          ref={editorWrapRef}
          // `min-h-0` is load-bearing. A flex item defaults to
          // `min-height: auto`, which refuses to shrink below its content — so
          // without it this wrapper grew to the editor's FULL document height,
          // CmEditor's `height: 100%` resolved against that, and
          // `.cm-scroller` ended up with clientHeight === scrollHeight. The
          // editor therefore never scrolled internally; the surrounding panel
          // scrolled instead, which silently made vim's Ctrl+D / Ctrl+U
          // (half-page scroll of the EDITOR's scroller) no-ops. The parent
          // body container already carries min-h-0; this one was missed.
          className="relative flex min-h-0 flex-1 flex-col"
          data-testid="todo-txt-editor-wrap"
          // Read by the vim leader actions (cm-vim-todotxt) so \x can gate
          // recurrence generation to todo.txt without threading React state
          // into a module-level Vim registration.
          data-todo-file={activeFile}
        >
        <CmEditor
          ref={cmEditorRef}
          value={content}
          filter={activeFilter}
          thresholdHidden={thresholdMode === 'hide'}
          hiddenMode={hiddenMode}
          onChange={(newContent: string, meta?: CmChangeMeta) => {
            // Try shortcut expansion (same as old onChange). Gated on `typed`
            // so an undo cannot be mistaken for the user re-typing the
            // trigger char and re-fire the expansion it is undoing.
            const caret = cmEditorRef.current?.getCaret() ?? newContent.length;
            lastKeystroke.current = Date.now();
            setReloadAvailable(false);
            const expansion =
              meta?.typed === false ? null : applyShortcut(newContent, caret);
            if (expansion) {
              lastExpansionRef.current = {
                beforeValue: newContent,
                beforeCaret: caret,
                afterValue: expansion.value,
              };
              // Apply as an UNDOABLE edit, not through the controlled value.
              // The controlled path is annotated addToHistory.of(false) so
              // that loading a file cannot be undone into an empty document.
              // But the user CAUSED this rewrite by typing a trigger, so
              // `u` / Ctrl+Z immediately afterwards has to undo it. Writing
              // it through setContent would make undo a silent
              // no-op. applyEdit also sets the caret in the same transaction,
              // so no requestAnimationFrame hop is needed to reposition it.
              cmEditorRef.current?.applyEdit(expansion.value, expansion.caret);
              setContent(expansion.value);
              scheduleSave(expansion.value);
              return;
            }
            setContent(newContent);
            scheduleSave(newContent);
          }}
          onSelectionChange={(
            _start: number,
            _end: number,
            ranges: CmSelectionRange[],
          ) => captureCodeMirrorSelection(ranges, true)}
          onMouseUp={() => captureCodeMirrorSelection(undefined, true)}
          onViewportChange={() => {
            if (selectionPopoverOpen) {
              captureCodeMirrorSelection(undefined, false);
            }
          }}
          onKeyDown={handleEditorKeyDown}
          vimMode={vimMode}
          syntaxHighlight={syntaxHighlight}
          placeholder={loaded ? 'Start typing…' : 'Loading…'}
          disabled={!loaded}
          onVimModeChange={setVimStatus}
        />
        {/* Starter example — renders as an overlay when the active file
            is todo.txt AND content is empty. Non-intrusive: sits above
            the textarea's placeholder, dismissed by any keystroke or by
            clicking the "Insert example" button. Once inserted, the
            normal editor flow takes over (auto-save, syntax overlay,
            popover, etc). Only offered for todo — done.txt and
            report.txt have their own semantics. */}
        {loaded && activeFile === 'todo' && content.trim() === '' && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
            data-testid="todo-txt-starter-example"
          >
            <div className="pointer-events-auto max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated,var(--color-bg))] p-5 text-sm shadow-lg">
              <div className="mb-2 font-medium text-[var(--color-fg)]">
                Empty todo.txt
              </div>
              <div className="mb-3 text-xs text-[var(--color-muted-fg)]">
                Try a starter example that shows priorities, projects,
                contexts, dates, recurring tasks, and the <code>!!</code>
                inline shortcuts. You can wipe it anytime.
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const example = STARTER_EXAMPLE;
                    setContent(example);
                    latestContent.current = example;
                    scheduleSave(example);
                    pushToast('success', 'Starter example inserted.');
                  }}
                  className="inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-3 py-1.5 text-xs text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                  data-testid="todo-txt-insert-starter"
                >
                  <span>📋 Load example</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Dismiss by focusing textarea — the starter div
                    // stays hidden once content is non-empty.
                    textareaRef.current?.focus();
                    cmEditorRef.current?.focus();
                  }}
                  className="rounded border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted-fg)] hover:bg-[var(--color-bg-hover)]"
                >
                  Start blank
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Vim mode status indicator in footer */}
        {vimMode && (
          <div
            className="flex items-center gap-2 border-t border-[var(--color-border)] px-3 py-1 text-xs"
            data-testid="todo-txt-vim-status"
            style={{ fontFamily: 'var(--font-mono, monospace)' }}
          >
            <span
              className={`rounded px-1.5 py-0.5 font-bold ${
                vimStatus === 'INSERT'
                  ? 'bg-[var(--ok,#22c55e)] text-[#000]'
                  : vimStatus === 'VISUAL'
                  ? 'bg-[var(--warn,#f59e0b)] text-[#000]'
                  : 'bg-[var(--color-muted-fg,#71717a)] text-[#000]'
              }`}
            >
              -- {vimStatus} --
            </span>
            <span className="text-[var(--color-muted-fg)]">
              Leader: \
            </span>
            {/* Discoverability. Vim mode hands Ctrl+D to vim (half-page
                scroll), so the app's plain Ctrl+D mark-done is unavailable
                while it is on — and nothing said what to use instead. These
                are the bindings that still work. */}
            <span
              className="text-[var(--color-muted-fg)]"
              data-testid="todo-txt-vim-hints"
            >
              <span className="font-bold">\x</span> done ·{' '}
              <span className="font-bold">^⇧D</span> done ·{' '}
              <span className="font-bold">\d</span> due ·{' '}
              <span className="font-bold">\a</span>
              <span className="font-bold">\b</span>
              <span className="font-bold">\c</span> priority
            </span>
          </div>
        )}
        {/* Selection-triggered quick-action popover. This page owns the
            mounting and the quick-action handlers; the component owns its
            own internals. `onAddComment` is what feeds `pendingComments`. */}
        {selection && selectionPopoverOpen && (
          <div data-testid="todo-txt-selection-popover-portal">
            {/* Determinism sentinel: an end-to-end test that drives a
                programmatic mouseup races the selection state — by the time
                it asserts popover visibility, the state may or may not have
                latched. This hidden sentinel renders iff `selection` is
                non-null, so a test can await
                `[data-testid="todo-txt-selection-ready"]` and skip the race.
                The portal testid contract is unchanged. */}
            <span
              data-testid="todo-txt-selection-ready"
              aria-hidden="true"
              style={{ display: 'none' }}
            />
            <TodoTxtSelectionPopover
              selection={selection.anchor}
              anchorRect={selection.rect}
              rangeCount={selection.affectedLines}
              vimMode={vimMode}
              file={activeFile === 'done' ? 'done' : 'todo'}
              containerRef={editorWrapRef}
              scrollElement={cmEditorRef.current?.getScrollElement()}
              onClose={dismissSelection}
              onMarkDone={handleMarkDone}
              onSetPriority={handleSetPriority}
              onAddCreationDate={handleAddCreationDate}
              onCopy={handleCopy}
              onAddComment={handleAddComment}
              onAskInChat={(payload) => void handleAskInChat(payload)}
              onDeleteLine={handleDeleteLine}
              onDuplicateLine={handleDuplicateLine}
              onArchiveSelection={() => void handleArchiveSelection()}
              onSetDueDate={handleSetDueDate}
            />
          </div>
        )}
        </div>
      )}
      </div>

      {/* Pending-comments list panel. Mirrors CommentList from
          CommentOverlay.tsx — anchor + text row per pending comment,
          inline edit, remove, and a Submit All button wired to the
          AI-edit endpoint. */}
      <TodoTxtCommentList
        comments={pendingComments}
        content={content}
        submitting={submitting}
        onEdit={handleEditComment}
        onRemove={handleRemoveComment}
        onSubmitAll={() => void onSubmitAll()}
      />

      {/* Staged AI-edit modal. Rendered inline rather than as a standalone
          component: it is used in exactly one place and reads this page's
          staged-edit state directly. */}
      {stagedEdit && (
        <InlineStagedEditModal
          staged={stagedEdit}
          submitting={submitting}
          onApply={() => void onStagedApply()}
          onReject={() => void onStagedReject()}
        />
      )}

      {/* Toasts */}
      {toasts.length > 0 && (
        <div
          className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-[9500] flex flex-col gap-2"
          data-testid="todo-txt-toasts"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-2 rounded-md border px-3 py-2 text-xs shadow-lg"
              style={{
                // Opaque elevated surface (no /10 bleed) with the tone
                // carried by border + text via canonical status tokens,
                // so the toast reads correctly and clears AA under
                // light/dark and the 6 CRT themes instead of the old
                // fixed dark-red / dark-green / dark-navy hexes.
                background: 'var(--color-bg-elevated, #1a1d25)',
                borderColor:
                  t.tone === 'error'
                    ? 'var(--danger, #ef4444)'
                    : t.tone === 'success'
                      ? 'var(--ok, #22c55e)'
                      : 'var(--color-border, #27272a)',
                color:
                  t.tone === 'error'
                    ? 'var(--danger, #ef4444)'
                    : t.tone === 'success'
                      ? 'var(--ok, #22c55e)'
                      : 'var(--color-fg, #e4e4e7)',
              }}
              data-testid={`todo-txt-toast-${t.tone}`}
              role="status"
            >
              <span
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'currentColor',
                  flexShrink: 0,
                }}
              />
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}
      {/* Command palette (⌘K / Ctrl+K). Mounted at the page root so
          it overlays every other panel/modal. onExecute bridges into the
          COMMANDS registry: deterministic verbs mutate the textarea,
          server-actions (archive/move/report) hit the backend and
          reload content. */}
      <ResultPanel
        open={resultPanel !== null}
        result={resultPanel}
        onClose={() => setResultPanel(null)}
        onJumpToLine={handleResultJump}
        onDrillIn={handleResultDrillIn}
      />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onExecute={handlePaletteExecute}
        commands={COMMANDS}
      />
      {/* Right-rail help panel — the single canonical help surface, in place
          of a cheatsheet banner, a hover popover, or a modal. Toggled by the
          header `?` button, Ctrl+/, or the palette's `help` command. */}
      <RightRail
        open={railOpen}
        onClose={() => setRailOpen(false)}
        activeFile={activeFile}
        commands={COMMANDS}
      />

      {/* Backups modal — lists auto-save backups with Preview + Restore.
          Backend caps at 20 entries (BACKUP_RETENTION_COUNT). Restore
          takes a safety backup of current content first so it's always
          reversible. */}
      {showBackups && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          onClick={() => {
            setShowBackups(false);
            setBackupPreview(null);
          }}
          data-testid="todo-txt-backups-modal"
        >
          <div
            className="flex max-h-[80vh] w-[min(720px,92vw)] flex-col gap-3 rounded-lg border border-[var(--color-border,#334155)] p-4 shadow-xl"
            style={{
              // Opaque themed surface (host --bg is always opaque) so the
              // seeded todo content never shows through the modal.
              background: 'var(--bg, #12141a)',
              color: 'var(--color-fg, #e2e8f0)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} />
                <span className="font-medium">
                  Backups — {backupsFamily}.txt
                </span>
                <span className="text-xs text-[var(--color-muted-fg)]">
                  {backups.length
                    ? `${backups.length} entries (newest first, max 20)`
                    : 'no backups yet'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBackups(false);
                  setBackupPreview(null);
                }}
                className="rounded px-2 py-1 text-sm hover:bg-[var(--color-bg-hover)]"
              >
                Close
              </button>
            </div>

            {backupsLoading ? (
              <div className="flex flex-1 items-center justify-center py-12 text-sm text-[var(--color-muted-fg)]">
                Loading…
              </div>
            ) : backups.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-12 text-sm text-[var(--color-muted-fg)]">
                Backups are created automatically every 5 min while you
                edit. Come back here once you've made some changes.
              </div>
            ) : backupPreview ? (
              <div className="flex flex-1 flex-col gap-2 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[var(--color-muted-fg)]">
                    {backupPreview.name}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBackupPreview(null)}
                      className="rounded border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-bg-hover)]"
                    >
                      ← Back to list
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const name = backupPreview.name;
                        setBackupPreview(null);
                        setShowBackups(false);
                        try {
                          const res = await fetch(
                            `${API_BASE}/backups/${encodeURIComponent(name)}/restore`,
                            { method: 'POST' },
                          );
                          if (!res.ok) {
                            pushToast(
                              'error',
                              `Restore failed: HTTP ${res.status}`,
                            );
                            return;
                          }
                          await onReloadFromDisk();
                          pushToast('success', `Restored ${backupsFamily}.txt from ${name}. A safety backup was created first — you can undo via Backups.`);
                        } catch (err) {
                          pushToast(
                            'error',
                            `Restore failed: ${err instanceof Error ? err.message : String(err)}`,
                          );
                        }
                      }}
                      className="rounded bg-[var(--accent-subtle)] px-3 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                    >
                      <RotateCcw size={12} className="inline mr-1" />
                      Restore this backup
                    </button>
                  </div>
                </div>
                <pre className="flex-1 overflow-auto whitespace-pre-wrap rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle,rgba(0,0,0,0.15))] p-3 text-xs font-mono text-[var(--color-fg)]">
                  {backupPreview.content}
                </pre>
              </div>
            ) : (
              <ul className="flex-1 overflow-auto divide-y divide-[var(--color-border)]">
                {backups.map((b) => {
                  const date = new Date(b.mtime * 1000);
                  const dateStr =
                    date.toLocaleDateString() +
                    ' ' +
                    date.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  return (
                    <li
                      key={b.name}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="font-mono text-xs text-[var(--color-fg)] truncate">
                          {b.name}
                        </div>
                        <div className="text-[11px] text-[var(--color-muted-fg)]">
                          {dateStr} · {b.bytes} bytes
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch(
                                `${API_BASE}/backups/${encodeURIComponent(b.name)}`,
                              );
                              if (!res.ok) {
                                pushToast(
                                  'error',
                                  `Preview failed: HTTP ${res.status}`,
                                );
                                return;
                              }
                              const data = (await res.json()) as {
                                name: string;
                                content: string;
                              };
                              setBackupPreview({
                                name: data.name,
                                content: data.content,
                              });
                            } catch (err) {
                              pushToast(
                                'error',
                                `Preview failed: ${err instanceof Error ? err.message : String(err)}`,
                              );
                            }
                          }}
                          className="rounded border border-[var(--color-border)] px-2 py-1 text-xs hover:bg-[var(--color-bg-hover)]"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Restore ${b.name}? Your current todo.txt will be backed up first.`,
                              )
                            ) {
                              return;
                            }
                            setShowBackups(false);
                            try {
                              const res = await fetch(
                                `${API_BASE}/backups/${encodeURIComponent(b.name)}/restore`,
                                { method: 'POST' },
                              );
                              if (!res.ok) {
                                pushToast(
                                  'error',
                                  `Restore failed: HTTP ${res.status}`,
                                );
                                return;
                              }
                              await onReloadFromDisk();
                              pushToast(
                                'success',
                                `Restored from ${b.name}.`,
                              );
                            } catch (err) {
                              pushToast(
                                'error',
                                `Restore failed: ${err instanceof Error ? err.message : String(err)}`,
                              );
                            }
                          }}
                          className="rounded bg-[var(--accent-subtle)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                        >
                          Restore
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline staged-edit modal — the review surface for a staged AI edit.
// Kept local to this file: it is used in exactly one place and reads the
// page's staged-edit state directly rather than through props plumbing.
// ---------------------------------------------------------------------------

interface InlineStagedEditModalProps {
  staged: StagedEdit;
  submitting: boolean;
  onApply: () => void;
  onReject: () => void;
}

function InlineStagedEditModal({
  staged,
  submitting,
  onApply,
  onReject,
}: InlineStagedEditModalProps): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="todo-txt-staged-title"
      data-testid="todo-txt-staged-modal"
    >
      <div className="flex max-h-[80vh] w-[min(800px,92vw)] flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-xl">
        <header className="flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--accent)]" aria-hidden="true" />
          <h2 id="todo-txt-staged-title" className="text-sm font-medium">
            Review AI edit
          </h2>
          <span className="ml-auto text-xs text-[var(--color-muted-fg)]">
            Δ {staged.lineDelta >= 0 ? '+' : ''}
            {staged.lineDelta} lines · {staged.charDelta >= 0 ? '+' : ''}
            {staged.charDelta} chars
          </span>
        </header>

        <p className="text-xs text-[var(--color-muted-fg)]">
          {staged.reason || 'This edit removes lines. Review before applying.'}
        </p>

        <pre
          className="flex-1 overflow-auto rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-2 text-xs leading-5"
          data-testid="todo-txt-staged-diff"
        >
          {staged.diff}
        </pre>

        <footer className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onReject}
            disabled={submitting}
            className="rounded border border-[var(--color-border)] px-3 py-1 text-sm hover:bg-[var(--color-bg-hover)] disabled:opacity-50"
            data-testid="todo-txt-staged-reject"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={submitting}
            className="rounded bg-[var(--accent)] px-3 py-1 text-sm text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
            data-testid="todo-txt-staged-apply"
          >
            {submitting ? 'Applying…' : 'Apply'}
          </button>
        </footer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TodoTxtCommentList — pending AI-edit comments panel rendered at the
// bottom of the editor when the user has staged ≥1 comment via the
// selection popover. Structure mirrors `CommentList` from
// CommentOverlay.tsx so the UX feels identical to the markdown viewer's
// batch-submit surface; duplicated locally (rather than imported) so
// this page stays decoupled from the KiroCrew dashboard's chrome/token CSS.
// ---------------------------------------------------------------------------

interface TodoTxtCommentListProps {
  comments: InlineComment[];
  /** Live document text, so a comment whose anchor no longer occurs in the
   *  file can be flagged BEFORE it is submitted. */
  content: string;
  submitting: boolean;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onSubmitAll: () => void;
}

function TodoTxtCommentList({
  comments,
  content,
  submitting,
  onEdit,
  onRemove,
  onSubmitAll,
}: TodoTxtCommentListProps): JSX.Element | null {
  // Render nothing when empty so tests / users don't see an empty bar.
  if (comments.length === 0) return null;
  return (
    <div
      className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
      data-testid="todo-txt-pending-comments"
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className="text-[13px] font-semibold"
          data-testid="todo-txt-pending-count"
        >
          {comments.length} comment{comments.length > 1 ? 's' : ''} pending
        </span>
        <button
          type="button"
          onClick={onSubmitAll}
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded bg-[var(--accent-subtle)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-glow)] disabled:opacity-50"
          data-testid="todo-txt-pending-submit-all"
          aria-label={`Submit ${comments.length} AI edit ${
            comments.length === 1 ? 'comment' : 'comments'
          }`}
        >
          <Sparkles size={14} aria-hidden="true" />
          <span>{submitting ? 'Submitting…' : 'Submit All ▶'}</span>
        </button>
      </div>
      <div className="max-h-[200px] space-y-1.5 overflow-y-auto">
        {comments.map((c) => (
          <TodoTxtCommentRow
            key={c.id}
            comment={c}
            content={content}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

interface TodoTxtCommentRowProps {
  comment: InlineComment;
  content: string;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

function TodoTxtCommentRow({
  comment,
  content,
  onEdit,
  onRemove,
}: TodoTxtCommentRowProps): JSX.Element {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Escape path sets this so the onBlur commit path knows not to save.
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setDraft(comment.text);
      setEditing(false);
      return;
    }
    const trimmed = draft.trim();
    if (trimmed && trimmed !== comment.text) {
      onEdit(comment.id, trimmed);
    }
    setEditing(false);
  }, [draft, comment.id, comment.text, onEdit]);

  // Prevent click-to-remove / click-to-save triggering a textarea blur
  // before the handler fires (onMouseDown fires before onBlur).
  const preventBlur = useCallback(
    (e: React.MouseEvent) => e.preventDefault(),
    [],
  );

  return (
    <div
      className="flex items-start gap-2 rounded-md bg-[var(--color-bg-elevated,rgba(255,255,255,0.03))] px-2.5 py-1.5 text-[13px]"
      data-testid="todo-txt-pending-comment"
    >
      <MessageSquare
        size={14}
        className="mt-0.5 shrink-0 text-[var(--color-muted-fg)]"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div
          className="truncate font-mono text-[11px] text-[var(--color-muted-fg)]"
          title={comment.anchor}
          data-testid="todo-txt-pending-comment-anchor"
        >
          &quot;{comment.anchor.slice(0, 60)}
          {comment.anchor.length > 60 ? '…' : ''}&quot;
          {/* The popover stays open after staging so comments can be stacked,
              and it keeps its Cmd+D / Cmd+1-3 / Del bindings live — so the
              anchored line can be edited or deleted BEFORE Submit All. The
              server's 409 guard only covers the file moving AFTER staging;
              nothing covered the anchor rotting before it. Substring
              containment, not whole-line equality: a Done toggle prefixes the
              line, which degrades the anchor without breaking it. */}
          {!content.includes(comment.anchor) && (
            <span
              className="ml-2 text-[10px] text-[var(--color-danger)]"
              data-testid="todo-txt-pending-comment-stale"
              title="This line changed or was deleted after the comment was staged"
            >
              anchor no longer in file
            </span>
          )}
          {comment.line != null && comment.column != null && (
            <span className="ml-2 text-[10px] opacity-70">
              line {comment.line}:{comment.column}
            </span>
          )}
        </div>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) {
                e.preventDefault();
                commit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelledRef.current = true;
                setDraft(comment.text);
                setEditing(false);
              }
            }}
            onBlur={commit}
            className="w-full rounded border border-[var(--color-border)] bg-transparent px-1.5 py-0.5 text-[13px] outline-none focus-ring"
            data-testid="todo-txt-pending-comment-edit-input"
          />
        ) : (
          <div
            className="cursor-pointer text-[var(--color-fg)]"
            onClick={() => {
              setDraft(comment.text);
              setEditing(true);
            }}
            data-testid="todo-txt-pending-comment-text"
          >
            {comment.text}
          </div>
        )}
      </div>
      {editing ? (
        <button
          type="button"
          aria-label="Save"
          onMouseDown={preventBlur}
          onClick={commit}
          className="shrink-0 cursor-pointer border-none bg-transparent text-[var(--ok)] hover:opacity-80"
          data-testid="todo-txt-pending-comment-save"
        >
          <Check size={14} />
        </button>
      ) : (
        <button
          type="button"
          aria-label="Edit"
          onClick={() => {
            setDraft(comment.text);
            setEditing(true);
          }}
          className="shrink-0 cursor-pointer border-none bg-transparent text-[var(--color-muted-fg)] hover:text-[var(--accent)]"
          data-testid="todo-txt-pending-comment-edit"
        >
          <Pencil size={14} />
        </button>
      )}
      <button
        type="button"
        aria-label="Remove"
        onMouseDown={preventBlur}
        onClick={() => onRemove(comment.id)}
        className="shrink-0 cursor-pointer border-none bg-transparent text-[var(--color-muted-fg)] hover:text-[var(--danger)]"
        data-testid="todo-txt-pending-comment-remove"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
