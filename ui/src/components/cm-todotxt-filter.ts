/**
 * cm-todotxt-filter — the view-narrowing line decorations.
 *
 * Three extensions, one mechanism:
 *
 *   `todotxtFilterDim`      dims lines that do not match the active filter (R1)
 *   `todotxtThresholdDim`   pushes lines whose `t:` date is in the future far
 *                           into the background (R2)
 *   `todotxtHiddenLines`    strongly dims — or, on request, removes from view —
 *                           lines tagged `h:1` (R3)
 *
 * All three are deliberately SEPARATE extensions from cm-todotxt-decorations,
 * and from each other:
 *
 *   1. Narrowing is orthogonal to syntax highlighting. The user can turn
 *      highlighting off and still expect a filter to narrow the view, so each
 *      lives in its own compartment (see CmEditor).
 *   2. They use `Decoration.line`, not `Decoration.mark`. A line decoration
 *      attaches to the line itself and carries no document range, so typing
 *      inside a decorated line cannot split, extend, or orphan it — this is
 *      the "edit-safe" half of the requirement. These extensions narrow what
 *      the user LOOKS at; they never gate what they can edit. Every line stays
 *      selectable, editable, and saved exactly as before.
 *
 * R1 and R2 never hide with `display: none`, because this app's contract is
 * "just a text file" and an edit made against a collapsed document is how
 * plain-text tools lose data. R3's `hide` mode is the ONE exception, and only
 * because `h:1` is a tag the user typed whose literal meaning is "hide this" —
 * see the module note in utils/hidden.ts for the full reasoning and the two
 * safeguards (dim is the default; the cursor's own line is always exempt).
 */
import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  type DecorationSet,
  type PluginValue,
} from '@codemirror/view';
import { RangeSetBuilder, type Extension } from '@codemirror/state';
import { isFilterable, matchesFilter, todayIso } from '../utils/filterExpr';
import type { ParsedFilter } from '../utils/filterExpr';
import { isThresholdFuture, isThresholdable } from '../utils/threshold';
import { isHiddenLine, isHideable, type HiddenMode } from '../utils/hidden';

/** Whole-line dim class applied to every non-matching line. */
const dimDeco = Decoration.line({ class: 'todotxt-filter-dim' });

/** Whole-line class applied to every future-`t:` line while hiding is on. */
const thresholdDeco = Decoration.line({ class: 'todotxt-threshold-hidden' });

/** Whole-line class for an `h:1` line in `dim` mode. */
const hiddenDimDeco = Decoration.line({ class: 'todotxt-hidden-dim' });

/** Whole-line class for an `h:1` line in `hide` mode (removed from view). */
const hiddenGoneDeco = Decoration.line({ class: 'todotxt-hidden-gone' });

/** The minimal `doc` surface these helpers need — lets tests skip EditorState. */
interface DocLike {
  lineAt(pos: number): { number: number };
  line(n: number): { from: number; text: string };
}

/**
 * Which lines are exempt from a narrowing treatment.
 *
 * Either a single 1-based line number (`0` = none — the pure tests use that to
 * decorate everything) or a predicate over 1-based line numbers, which is what
 * `selectionExemption` returns.
 */
export type ExemptLines = number | ((lineNumber: number) => boolean);

/** Normalize the two `ExemptLines` shapes into one predicate. */
function exemptPredicate(exempt: ExemptLines): (lineNumber: number) => boolean {
  return typeof exempt === 'number' ? (n) => n === exempt : exempt;
}

/**
 * Exemption predicate covering EVERY line touched by ANY selection range.
 *
 * The R3 safety interlock originally exempted `selection.main.head`'s line
 * only, which protects exactly one shape of selection: a lone collapsed caret.
 * It does not protect the two gestures this app actively encourages —
 *
 *   1. a multi-LINE selection (drag, Shift+Down, Ctrl+A). Every
 *      selection-driven action in TodoTxtPage — the Done toggle, delete,
 *      duplicate, priority change, the AI-comment anchor — expands the
 *      selection to whole lines against REAL document offsets
 *      (utils/selectionRanges.ts). A `display: none` line sitting between two
 *      visible ones makes the selection look contiguous on screen while it
 *      silently spans a third line, which is then rewritten unseen.
 *   2. MULTI-CURSOR editing (Alt+click / Alt+drag), which this app ships as a
 *      headline feature. CodeMirror applies typed text at EVERY cursor, but
 *      only the main one used to be exempt, so a secondary caret could sit on
 *      an invisible line and edit it.
 *
 * Exempting the whole selection closes both: whatever the next action is about
 * to touch is on screen before it happens. Nothing about the DOCUMENT changes —
 * this only decides what is drawn.
 *
 * Spans are precomputed once per rebuild and tested with a linear scan: the
 * caller only asks about lines inside the viewport, and a selection carries a
 * handful of ranges in every realistic case.
 */
export function selectionExemption(
  doc: DocLike,
  ranges: readonly { from: number; to: number }[],
): (lineNumber: number) => boolean {
  const spans = ranges.map(({ from, to }) => {
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    return [doc.lineAt(lo).number, doc.lineAt(hi).number] as const;
  });
  return (lineNumber) =>
    spans.some(([first, last]) => lineNumber >= first && lineNumber <= last);
}

/**
 * Line-start offsets of every line inside `ranges` that `select` accepts.
 *
 * The shared walk behind all three line decorations: one place that knows how
 * to iterate visible ranges without double-visiting a line shared by two
 * adjacent ranges. Adding a line twice is harmless for RangeSetBuilder's
 * non-decreasing contract, but it would apply the class twice and so square
 * the opacity of that one line.
 *
 * `select` receives the line NUMBER as well as its text, which is what lets
 * the `h:1` layer exempt the line the cursor is on.
 */
function selectLineStarts(
  doc: DocLike,
  ranges: readonly { from: number; to: number }[],
  select: (text: string, lineNumber: number) => boolean,
): number[] {
  const starts: number[] = [];
  let lastLine = 0;
  for (const { from, to } of ranges) {
    const startLine = doc.lineAt(from).number;
    const endLine = doc.lineAt(to).number;
    for (let n = Math.max(startLine, lastLine + 1); n <= endLine; n++) {
      const line = doc.line(n);
      if (select(line.text, n)) starts.push(line.from);
    }
    lastLine = Math.max(lastLine, endLine);
  }
  return starts;
}

/**
 * Line-start offsets of every non-matching line inside `ranges`.
 *
 * Pure and exported for tests: it needs only a `doc`-shaped object, so a unit
 * test can exercise the line selection without standing up an EditorView.
 */
export function dimmedLineStarts(
  doc: DocLike,
  ranges: readonly { from: number; to: number }[],
  filter: ParsedFilter | null,
  today: string,
): number[] {
  if (filter === null || filter.terms.length === 0) return [];
  return selectLineStarts(
    doc,
    ranges,
    (text) => isFilterable(text) && !matchesFilter(text, filter, today),
  );
}

/**
 * Line-start offsets of every line inside `ranges` whose `t:` date is still
 * in the future, EXCEPT the line the cursor is on. Empty when `hidden` is
 * false, so the caller does not have to branch. Pure and exported for the
 * same reason as `dimmedLineStarts`.
 *
 * The cursor exemption is the P8 close-out of a P4 finding: the theme's
 * `.cm-activeLine` escape rule was dead code (this editor never installs
 * `highlightActiveLine()`), so `threshold hide` at 0.14 opacity had no
 * working legibility escape for the line being edited. Same computed
 * mechanism as `hiddenLineStarts`: `exempt` is a 1-based line number, `0` for
 * "nothing exempt" (decorates everything — used by the pure tests), or a
 * predicate — production passes `selectionExemption`, which covers every line
 * under every selection range rather than just the main cursor's.
 */
export function thresholdHiddenLineStarts(
  doc: DocLike,
  ranges: readonly { from: number; to: number }[],
  hidden: boolean,
  today: string,
  exempt: ExemptLines = 0,
): number[] {
  if (!hidden) return [];
  const isExempt = exemptPredicate(exempt);
  return selectLineStarts(
    doc,
    ranges,
    (text, lineNumber) =>
      !isExempt(lineNumber) &&
      isThresholdable(text) &&
      isThresholdFuture(text, today),
  );
}

/**
 * Line-start offsets of every `h:1` line inside `ranges`, EXCEPT the lines the
 * selection covers. Empty in `show` mode, so the caller does not have to branch.
 *
 * The exemption is the safety interlock for `hide` mode. `.cm-activeLine`
 * is not available to lean on here — this editor does not install CodeMirror's
 * `highlightActiveLine()` extension, so that class is never applied and a CSS
 * rule keyed on it would be dead (a latent problem in the R2 threshold theme,
 * recorded in the plan file). Computing the exemption here instead keeps the
 * interlock self-contained and directly testable: whatever the mode, a line the
 * user is about to act on is never dimmed to illegibility and never removed
 * from view, so neither the caret nor a pending bulk edit can land somewhere
 * the user cannot see.
 *
 * `exempt` is a 1-based line number, `0` for "nothing exempt" (which decorates
 * everything — used by the pure tests), or a predicate. Production passes
 * `selectionExemption`, i.e. EVERY line under EVERY selection range, not just
 * the main cursor's line — see that function for why the narrower rule was not
 * enough.
 */
export function hiddenLineStarts(
  doc: DocLike,
  ranges: readonly { from: number; to: number }[],
  mode: HiddenMode,
  exempt: ExemptLines = 0,
): number[] {
  if (mode === 'show') return [];
  const isExempt = exemptPredicate(exempt);
  return selectLineStarts(
    doc,
    ranges,
    (text, lineNumber) =>
      !isExempt(lineNumber) && isHideable(text) && isHiddenLine(text),
  );
}

/**
 * Build a line-decoration set from a start-offset selector.
 *
 * `today` is resolved per rebuild, not captured once at construction, so a
 * session left open across midnight re-evaluates `due:today` / a `t:` that
 * has just become current on the next edit.
 */
function buildLineDecorations(
  view: EditorView,
  today: string | undefined,
  deco: Decoration,
  starts: (day: string) => number[],
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const from of starts(today ?? todayIso())) {
    builder.add(from, from, deco);
  }
  return builder.finish();
}

const filterTheme = EditorView.baseTheme({
  '.todotxt-filter-dim': {
    // Readable enough to edit in place, faint enough that matching lines
    // pop out at a glance. Saturation is pulled down too so the syntax
    // colours of a dimmed line do not compete with the matches.
    opacity: '0.32',
    filter: 'saturate(0.4)',
  },
});

const thresholdTheme = EditorView.baseTheme({
  '.todotxt-threshold-hidden': {
    // Much fainter than a filter dim (0.32): the user asked for these to be
    // OUT of the way, not merely de-emphasized, and the two treatments must
    // stay tellable apart when a filter and threshold hiding are both on.
    // Not display:none — see the module note in utils/threshold.ts on why
    // the document is never collapsed.
    opacity: '0.14',
    filter: 'saturate(0.15)',
  },
  // No `.cm-activeLine` escape rule here: this editor never installs
  // `highlightActiveLine()`, so that class is never applied and such a rule
  // would be dead. Legibility of the line being edited is guaranteed by the
  // computed cursor exemption in `thresholdHiddenLineStarts` instead — the
  // caret's line is simply never decorated.
});

const hiddenTheme = EditorView.baseTheme({
  // `dim` — the default. Same strength as an R2 threshold hide (0.14): the
  // user flagged these themselves, so "out of the way" is the goal, not mere
  // de-emphasis. The syntax layer's own `.todotxt-hidden` mark handles colour;
  // opacity is owned here so the treatment is identical with highlighting on
  // or off.
  '.todotxt-hidden-dim': {
    opacity: '0.14',
    filter: 'saturate(0.15)',
  },
  // `hide` — gone from the view. The ONLY place this app collapses a line, and
  // only because `h:1` literally means "hide this" (see utils/hidden.ts). The
  // document is untouched: `getValue()`, Ctrl+A, the character count, the save
  // payload and the Tab-complete vocabulary all still see these lines.
  '.todotxt-hidden-gone': {
    display: 'none',
  },
});

/**
 * Generic ViewPlugin factory: rebuilds `deco` decorations on doc / viewport
 * change. Shared by all three extensions below so their update conditions
 * cannot drift apart.
 *
 * `onSelection` additionally rebuilds when the selection moves. Only the `h:1`
 * layer needs it (its cursor exemption depends on where the caret is); the
 * filter and threshold layers opt out so cursor movement does not churn their
 * decoration sets.
 */
function lineDecorationPlugin(
  deco: Decoration,
  today: string | undefined,
  starts: (view: EditorView, day: string) => number[],
  onSelection = false,
): Extension {
  return ViewPlugin.fromClass(
    class implements PluginValue {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildLineDecorations(view, today, deco, (day) =>
          starts(view, day),
        );
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.viewportChanged ||
          (onSelection && update.selectionSet)
        ) {
          this.decorations = buildLineDecorations(
            update.view,
            today,
            deco,
            (day) => starts(update.view, day),
          );
        }
      }
    },
    { decorations: (v) => v.decorations },
  );
}

/**
 * Build the dim extension for `filter` (null / empty = no dimming).
 *
 * Returns a fresh extension each call; CmEditor swaps it through a
 * Compartment when the active filter changes, which rebuilds the decoration
 * set. Filters change on an explicit user action, so recreating the plugin
 * is cheaper than the state-field plumbing an implicit path would need.
 *
 * @param today Injected only by tests; production resolves it per rebuild.
 */
export function todotxtFilterDim(
  filter: ParsedFilter | null,
  today?: string,
): Extension {
  if (filter === null || filter.terms.length === 0) return [];
  return [
    lineDecorationPlugin(dimDeco, today, (view, day) =>
      dimmedLineStarts(view.state.doc, view.visibleRanges, filter, day),
    ),
    filterTheme,
  ];
}

/**
 * Build the threshold extension. `hidden === false` (the default `show` mode)
 * contributes nothing at all, so the common case costs no plugin.
 *
 * Lives in its OWN compartment, separate from both the filter dim and syntax
 * highlighting: the three narrow the view for unrelated reasons and the user
 * toggles them independently, so a change to one must not rebuild the others.
 *
 * @param today Injected only by tests; production resolves it per rebuild.
 */
export function todotxtThresholdDim(hidden: boolean, today?: string): Extension {
  if (!hidden) return [];
  return [
    lineDecorationPlugin(
      thresholdDeco,
      today,
      (view, day) =>
        thresholdHiddenLineStarts(
          view.state.doc,
          view.visibleRanges,
          true,
          day,
          selectionExemption(view.state.doc, view.state.selection.ranges),
        ),
      // Rebuild on selection change: the exempt lines are wherever the
      // selection is.
      true,
    ),
    thresholdTheme,
  ];
}

/**
 * Build the `h:1` extension. `'show'` contributes nothing at all, so that mode
 * costs no plugin — but note it is NOT the default (see utils/hidden.ts), so
 * the common case here does install one, unlike R1/R2.
 *
 * Lives in its OWN (fifth) compartment, independent of the filter dim, the
 * threshold layer and syntax highlighting: the four narrow the view for
 * unrelated reasons and the user toggles them independently, so a change to
 * one must not rebuild the others.
 *
 * `today` is accepted for signature symmetry with the other two factories and
 * is deliberately unused: `h:1` is a flag, not a date, so this layer has
 * nothing to re-evaluate at midnight.
 */
export function todotxtHiddenLines(mode: HiddenMode, _today?: string): Extension {
  if (mode === 'show') return [];
  const deco = mode === 'hide' ? hiddenGoneDeco : hiddenDimDeco;
  return [
    lineDecorationPlugin(
      deco,
      undefined,
      (view) =>
        hiddenLineStarts(
          view.state.doc,
          view.visibleRanges,
          mode,
          selectionExemption(view.state.doc, view.state.selection.ranges),
        ),
      // Rebuild on selection change: the exempt lines are wherever the
      // selection is.
      true,
    ),
    hiddenTheme,
  ];
}
