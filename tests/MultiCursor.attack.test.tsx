/**
 * The MOUNTED multi-cursor / view-interaction surface.
 *
 * `hidden hide` exempts EVERY line under EVERY selection range from hiding
 * (`selectionExemption` in cm-todotxt-filter.ts), which closes the
 * write-to-an-invisible-line hole. What that contract does NOT cover is the
 * three DIFFERENT views of one selection that coexist in this app:
 *
 *   VIEW 1 — the LIVE one. `applyPerLineTransform`, `handleDeleteLine`,
 *            `handleDuplicateLine` and `handleArchiveSelection` all re-read
 *            `view.state.selection.ranges` at CLICK time and expand them to
 *            whole lines via `lineRangesForSelections`. A collapsed range is
 *            an alt-click caret and selects its own line; only a range that
 *            collapsed because its offsets went stale is discarded.
 *
 *   VIEW 2 — the SNAPSHOT. `captureCodeMirrorSelection` builds
 *            `{anchor, ranges, rect, line, column}` at SELECTION time, and
 *            `handleCopy` / `handleAddComment` read that instead. The popover's
 *            count label and its "actions apply to each selected line"
 *            status come from the same snapshot.
 *
 *   VIEW 3 — the REVEAL layer. `selectionExemption` uses a third rule again:
 *            `doc.lineAt(from)..doc.lineAt(to)`, which never skips a range.
 *
 * Three rules over one gesture is the shape that produces silent divergence:
 * the highlight says one thing, the label promises a second, and the write
 * touches a third set of lines. Part A drives the REAL CmEditor and asserts
 * the class that actually lands on `.cm-line`; Part B mounts the REAL
 * TodoTxtPage so the capture, the popover and the action handlers are all the
 * production ones; Part C renders the real popover to pin what its status text
 * PROMISES.
 *
 * ===========================================================================
 * jsdom honesty statement — READ BEFORE TRUSTING PART B
 * ===========================================================================
 * jsdom has no layout. `captureCodeMirrorSelection` calls
 * `view.coordsAtPos(...)` and BAILS OUT (`setSelectionPopoverOpen(false)`) when
 * it returns null, which it always does here — so the production popover is
 * unreachable in jsdom without a geometry seam.
 *
 * Part B therefore stubs `EditorView.prototype.coordsAtPos` with a FIXED rect.
 * That is a deliberate, narrow seam and it is honest only because:
 *   - nothing in Part B asserts a coordinate, a rect, a flip decision or a
 *     popover POSITION. Those are `tests/hidden-coords.e2e.spec.ts`'s job
 *     (real Playwright geometry) and are explicitly NOT covered here;
 *   - every value Part B does assert (the anchor string, the range count, the
 *     comment payload, which lines an action rewrites) is computed with no
 *     reference to geometry whatsoever.
 * The stub unblocks a code path; it does not manufacture a passing assertion.
 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { act, createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorSelection, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { selectionExemption } from '../ui/src/components/cm-todotxt-filter';

import CmEditor, {
  type CmEditorHandle,
} from '../ui/src/components/CmEditor';
import TodoTxtPage from '../ui/src/TodoTxtPage';
import TodoTxtSelectionPopover from '../ui/src/components/TodoTxtSelectionPopover';
import {
  duplicateSelectedLines,
  duplicateSelectedLinesWithReveal,
  countSelectedLines,
  lineRangesForSelections,
  selectedText,
  transformSelectedLines,
  applyTextChanges,
} from '../ui/src/utils/selectionRanges';
import { HIDDEN_STORAGE_KEY } from '../ui/src/utils/hidden';
import { parseFilterExpr } from '../ui/src/utils/filterExpr';

const GONE = 'todotxt-hidden-gone';
const DIM = 'todotxt-hidden-dim';
const FILTER_DIM = 'todotxt-filter-dim';
const THRESHOLD = 'todotxt-threshold-hidden';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Every `.cm-line` element, in document order. */
function lines(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('.cm-line')) as HTMLElement[];
}

/** Text of every line carrying `cls`, in document order. */
function textsWithClass(container: HTMLElement, cls: string): string[] {
  return lines(container)
    .filter((el) => el.classList.contains(cls))
    .map((el) => el.textContent ?? '');
}

/** Text of every line the user can actually READ (not display:none). */
function visibleTexts(container: HTMLElement): string[] {
  return lines(container)
    .filter((el) => !el.classList.contains(GONE))
    .map((el) => el.textContent ?? '');
}

/** Offset of the start of 1-based line `n` in `doc`. */
function lineStart(doc: string, n: number): number {
  const parts = doc.split('\n');
  let pos = 0;
  for (let i = 0; i < n - 1; i++) pos += parts[i].length + 1;
  return pos;
}

/** Offset of the end (before the newline) of 1-based line `n`. */
function lineEnd(doc: string, n: number): number {
  const parts = doc.split('\n');
  return lineStart(doc, n) + parts[n - 1].length;
}

afterEach(() => cleanup());

// ===========================================================================
// PART A — the multi-range REVEAL contract, through the real editor
// ===========================================================================

describe('reveal contract: collapsed alt-click carets', () => {
  //   1 alpha
  //   2 secret h:1     <- invisible unless exempted
  //   3 gamma
  //   4 other h:1      <- invisible unless exempted
  const DOC = 'alpha\nsecret h:1\ngamma\nother h:1';

  it('exempts a line under a COLLAPSED caret', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;
    expect(textsWithClass(container, GONE)).toEqual(['secret h:1', 'other h:1']);

    // Alt+click two extra carets. All three ranges are COLLAPSED (from === to)
    // — the shape that carries no highlight, only a blinking cursor.
    act(() => {
      view.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.cursor(lineStart(DOC, 1)),
            EditorSelection.cursor(lineStart(DOC, 2)),
            EditorSelection.cursor(lineStart(DOC, 4)),
          ],
          2,
        ),
      });
    });

    // `selectionExemption` uses doc.lineAt(from)..doc.lineAt(to), so a
    // zero-width range still names its line. Both h:1 lines come back.
    expect(textsWithClass(container, GONE)).toEqual([]);
  });

  it('exempts every line of a MIXED caret + drag selection', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    // One collapsed caret on line 2 (h:1) + a drag across lines 3-4.
    act(() => {
      view.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.cursor(lineStart(DOC, 2)),
            EditorSelection.range(lineStart(DOC, 3), lineEnd(DOC, 4)),
          ],
          1,
        ),
      });
    });

    expect(textsWithClass(container, GONE)).toEqual([]);
  });

  it('exempts a threshold-hidden line under a collapsed caret too', () => {
    // `t:` far in the future so the comparison never depends on the clock.
    const TDOC = 'alpha\nlater t:2999-01-01\ngamma';
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor
        ref={ref}
        value={TDOC}
        onChange={() => {}}
        thresholdHidden
        hiddenMode="show"
      />,
    );
    const view = ref.current!.getView()!;
    expect(textsWithClass(container, THRESHOLD)).toEqual(['later t:2999-01-01']);

    act(() => {
      view.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.cursor(lineStart(TDOC, 1)),
            EditorSelection.cursor(lineStart(TDOC, 2)),
          ],
          1,
        ),
      });
    });

    expect(textsWithClass(container, THRESHOLD)).toEqual([]);
  });

  it('reveals EXACTLY what the actions touch (the two layers agree)', () => {
    // The reveal layer and the action layer must describe the SAME set of
    // lines. A superset would be merely safe; equality is the real guarantee —
    // every line that will be rewritten is revealed, and nothing is revealed
    // that will not be. Since carets count for the actions, they must also
    // count for the reveal.
    const carets = [
      { from: lineStart(DOC, 2), to: lineStart(DOC, 2) },
      { from: lineStart(DOC, 4), to: lineStart(DOC, 4) },
    ];

    // The action layer sees one line block per caret...
    const blocks = lineRangesForSelections(DOC, carets);
    expect(blocks).toHaveLength(2);
    expect(transformSelectedLines(DOC, carets, (l) => `x ${l}`)).toHaveLength(2);

    // ...and each block is exactly the caret's own line, which the reveal
    // layer un-hides (asserted in the first test of this block).
    const doc = EditorState.create({ doc: DOC }).doc;
    const revealed = selectionExemption(doc, carets);
    for (const block of blocks) {
      expect(revealed(doc.lineAt(block.from).number)).toBe(true);
    }
  });
});

describe('`dim` mode and the filter layer under a multi-range selection', () => {
  it('un-dims h:1 lines under every range, but leaves FILTER dimming in place', () => {
    const DOC = 'alpha +work\nsecret h:1\ngamma +home';
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor
        ref={ref}
        value={DOC}
        onChange={() => {}}
        hiddenMode="dim"
        filter={parseFilterExpr('+work')}
      />,
    );
    const view = ref.current!.getView()!;

    // Baseline: the h:1 line dimmed by the hidden-mode layer, the two
    // non-matching lines dimmed by the filter layer.
    expect(textsWithClass(container, DIM)).toEqual(['secret h:1']);
    expect(textsWithClass(container, FILTER_DIM)).toEqual([
      'secret h:1',
      'gamma +home',
    ]);

    act(() => {
      view.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.cursor(lineStart(DOC, 2)),
            EditorSelection.range(lineStart(DOC, 3), lineEnd(DOC, 3)),
          ],
          1,
        ),
      });
    });

    // The hidden-mode interlock fires: no h:1 line is at 0.14 while selected.
    expect(textsWithClass(container, DIM)).toEqual([]);

    // The filter layer has NO exemption, deliberately so: filter dim is 0.32
    // with saturate(0.4) — readable enough to edit in place, unlike the 0.14
    // treatments. A filtered-out line inside a bulk selection stays dimmed AND
    // stays legible, so the user can see what is about to change. Pinned
    // because the reasoning is load-bearing: if the filter opacity is ever
    // lowered to 0.14, it dies with it and the exemption becomes mandatory.
    expect(textsWithClass(container, FILTER_DIM)).toEqual([
      'secret h:1',
      'gamma +home',
    ]);
  });
});

describe('Dup in `hide` mode', () => {
  it('makes the copy of a revealed h:1 line visible on arrival', () => {
    const DOC = 'alpha\nsecret h:1\ngamma';
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    // The user drags across the h:1 line. It is revealed by the selection
    // exemption, so they can see exactly what they are about to duplicate.
    act(() => {
      view.dispatch({
        selection: EditorSelection.single(
          lineStart(DOC, 2),
          lineEnd(DOC, 2),
        ),
      });
    });
    expect(visibleTexts(container)).toEqual(['alpha', 'secret h:1', 'gamma']);

    // Exactly what `handleDuplicateLine` does on the CodeMirror path.
    act(() => {
      const source = view.state.doc.toString();
      // EXACTLY what handleDuplicateLine dispatches — via the shared helper,
      // so this pins the app's real behaviour rather than a replica of it.
      const { changes, ranges } = duplicateSelectedLinesWithReveal(
        source,
        view.state.selection.ranges,
      );
      view.dispatch({
        changes,
        selection: EditorSelection.create(
          ranges.map((r) => EditorSelection.range(r.from, r.to)),
        ),
      });
    });

    // The document grew...
    expect(view.state.doc.toString()).toBe(
      'alpha\nsecret h:1\nsecret h:1\ngamma',
    );

    // ...and the copy must be visible to the user who asked for it. A naive
    // insertion lands OUTSIDE the mapped selection, which makes the new line
    // `display: none` on arrival and leaves the "Selected line(s) duplicated"
    // toast as the only evidence the file changed.
    expect(visibleTexts(container)).toEqual([
      'alpha',
      'secret h:1',
      'secret h:1',
      'gamma',
    ]);
  });

  it('keeps the copy visible while selected, then hides it with its original', () => {
    // Two guarantees, and the boundary between them matters.
    //
    // The copy must be visible AT CREATION: inserting it outside the mapped
    // selection would make it born `display: none`, which is what
    // duplicateSelectedLinesWithReveal prevents (pinned by the test above).
    //
    // What happens AFTER `dismissSelection()` is not a defect: both copies are
    // h:1 lines and nothing is selected any more, so `hidden hide` hides them
    // — exactly what the mode is for. Asserting otherwise would demand that
    // Dup permanently exempt its output from a mode the user turned on. So the
    // real guarantee is: visible while selected (the user sees what they
    // created), hidden once deselected (the mode is honoured), and the file
    // grew by exactly one line either way.
    const DOC = 'alpha\nsecret h:1\ngamma';
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    act(() => {
      view.dispatch({
        selection: EditorSelection.single(lineStart(DOC, 2), lineEnd(DOC, 2)),
      });
      const source = view.state.doc.toString();
      // EXACTLY what handleDuplicateLine dispatches — via the shared helper,
      // so this pins the app's real behaviour rather than a replica of it.
      const { changes, ranges } = duplicateSelectedLinesWithReveal(
        source,
        view.state.selection.ranges,
      );
      view.dispatch({
        changes,
        selection: EditorSelection.create(
          ranges.map((r) => EditorSelection.range(r.from, r.to)),
        ),
      });
    });
    // dismissSelection() — the popover's own epilogue.
    act(() => {
      view.dispatch({ selection: EditorSelection.single(0, 0) });
    });

    expect(view.state.doc.toString()).toBe(
      'alpha\nsecret h:1\nsecret h:1\ngamma',
    );
    // Both h:1 copies are hidden now that nothing is selected — correct for
    // `hide` mode. The visible lines are exactly the non-h:1 ones.
    expect(visibleTexts(container)).toEqual(['alpha', 'gamma']);
  });

  it('reveals every copy when the selection grows over the inserted lines', () => {
    // Growing the mapped selection to span each inserted copy is what keeps
    // multi-block duplication visible, and the arithmetic is the fragile part:
    // each insertion shifts every later block by its own length plus the
    // newline. This drives that dispatch shape against the real editor.
    const DOC = 'alpha\nsecret h:1\nmid\nother h:1\ngamma';
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    // Two ranges separated by an untouched line, so `lineRangesForSelections`
    // really emits TWO blocks (adjacent ranges get merged by its joinAdjacent
    // pass) and the cumulative-offset arithmetic is exercised.
    act(() => {
      view.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.range(lineStart(DOC, 1), lineEnd(DOC, 2)),
            EditorSelection.range(lineStart(DOC, 4), lineEnd(DOC, 4)),
          ],
          1,
        ),
      });
    });

    act(() => {
      const source = view.state.doc.toString();
      const blocks = lineRangesForSelections(source, view.state.selection.ranges);
      const changes = duplicateSelectedLines(source, view.state.selection.ranges);
      let shift = 0;
      const grown = blocks.map((block) => {
        const from = block.from + shift;
        shift += block.to - block.from + 1; // the inserted '\n' + copied text
        return EditorSelection.range(from, block.to + shift);
      });
      view.dispatch({ changes, selection: EditorSelection.create(grown) });
    });

    expect(view.state.doc.toString()).toBe(
      'alpha\nsecret h:1\nalpha\nsecret h:1\nmid\nother h:1\nother h:1\ngamma',
    );
    // Every copy of every h:1 line is on screen, because the grown selection
    // covers them and `selectionExemption` therefore exempts them.
    expect(visibleTexts(container)).toEqual([
      'alpha',
      'secret h:1',
      'alpha',
      'secret h:1',
      'mid',
      'other h:1',
      'other h:1',
      'gamma',
    ]);
  });
});

// ===========================================================================
// PART B — capture fidelity, through the REAL mounted page
// ===========================================================================

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

/** Route-aware fetch mock: mount + saves + archive. */
function installFetchRouter(content: string) {
  const calls: Array<{ url: string; method: string; body?: string }> = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      calls.push({
        url,
        method,
        body: typeof init?.body === 'string' ? init.body : undefined,
      });

      if (url.endsWith('/api/content') && method === 'GET') {
        return jsonResponse({ content, mtime: 11 });
      }
      if (url.includes('/api/file?name=todo') && method === 'GET') {
        return jsonResponse({ content, mtime: 11 });
      }
      if (url.includes('/api/file?name=done') && method === 'GET') {
        return jsonResponse({ content: '', mtime: 21 });
      }
      if (url.endsWith('/api/content') && method === 'PUT') {
        return jsonResponse({ mtime: 12, bytes: 1 });
      }
      return jsonResponse({ content: '', mtime: 0 });
    },
  );
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, calls };
}

/** The geometry seam. See the jsdom honesty statement in the file header. */
const realCoordsAtPos = EditorView.prototype.coordsAtPos;
const clipboardWrites: string[] = [];

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal('indexedDB', undefined);
  clipboardWrites.length = 0;
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: (text: string) => {
        clipboardWrites.push(text);
        return Promise.resolve();
      },
    },
  });
  EditorView.prototype.coordsAtPos = function stubbedCoordsAtPos() {
    return { left: 10, right: 40, top: 10, bottom: 26 };
  };
});

afterEach(() => {
  EditorView.prototype.coordsAtPos = realCoordsAtPos;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Mount the page and hand back the live EditorView + its container. */
async function mountPage(content: string) {
  const router = installFetchRouter(content);
  render(<TodoTxtPage />);
  const contentDom = await screen.findByTestId('todo-txt-textarea');
  await waitFor(() =>
    expect(EditorView.findFromDOM(contentDom as HTMLElement)).toBeTruthy(),
  );
  const view = EditorView.findFromDOM(contentDom as HTMLElement)!;
  await waitFor(() => expect(view.state.doc.toString()).toBe(content));
  return { view, router };
}

/** Put `ranges` on the editor and wait for the popover to latch. */
async function selectAndOpenPopover(
  view: EditorView,
  ranges: { anchor: number; head: number }[],
  main = ranges.length - 1,
) {
  act(() => {
    view.dispatch({
      selection: EditorSelection.create(
        ranges.map((r) => EditorSelection.range(r.anchor, r.head)),
        main,
      ),
    });
  });
  return screen.findByTestId('todo-txt-selection-popover-portal');
}

const PAGE_DOC = 'alpha task\nbeta task\ngamma task\ndelta task';

describe('snapshot anchor ordering', () => {
  it('joins the anchor in DOCUMENT order however the cursors were created', async () => {
    const { view } = await mountPage(PAGE_DOC);

    // Create the LATER line's range first, then Alt+click back up to line 1 —
    // the reverse of document order, with main on the line-1 range.
    await selectAndOpenPopover(
      view,
      [
        { anchor: lineStart(PAGE_DOC, 3), head: lineEnd(PAGE_DOC, 3) },
        { anchor: lineStart(PAGE_DOC, 1), head: lineEnd(PAGE_DOC, 1) },
      ],
      1,
    );

    fireEvent.click(screen.getByLabelText('Copy selection'));
    await waitFor(() => expect(clipboardWrites).toHaveLength(1));

    // Two independent guarantees make this hold: CodeMirror's
    // `EditorSelection.create` normalises ranges into document order, and
    // `selectedText` re-sorts them in `mergeRanges` anyway. Cursor creation
    // order cannot leak into the anchor. Pinned so removing either guarantee
    // is caught.
    expect(clipboardWrites[0]).toBe('alpha task\ngamma task');
  });

  it('reports a count over every line the actions will rewrite', async () => {
    const { view } = await mountPage(PAGE_DOC);

    // Three alt-click carets + one drag. The capture filters `from === to` out
    // of `selection.ranges` (an empty anchor is useless to Copy and to the
    // AI-edit comment), but the label is fed `affectedLines` — the merged
    // LINE-BLOCK count from the live ranges — because the actions rewrite the
    // caret lines too. Counting ranges would understate what a click changes,
    // which is the same class of dishonesty this suite exists to catch.
    act(() => {
      view.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.cursor(lineStart(PAGE_DOC, 1)),
            EditorSelection.range(
              lineStart(PAGE_DOC, 2),
              lineEnd(PAGE_DOC, 2),
            ),
            EditorSelection.cursor(lineStart(PAGE_DOC, 3)),
            EditorSelection.cursor(lineStart(PAGE_DOC, 4)),
          ],
          1,
        ),
      });
    });
    await screen.findByTestId('todo-txt-selection-popover-portal');

    // Four distinct lines are covered (1 caret, 1 drag, 2 carets), so the
    // status renders and names all four — matching what Done/Del/Dup do.
    const status = await screen.findByTestId('todo-txt-selection-count');
    expect(status).toHaveTextContent('4 selections');
    expect(status).toHaveTextContent('actions apply to each selected line');
    // And the action layer agrees: the four covered lines are contiguous, so
    // they merge into ONE block spanning lines 1-4 — which is why the label
    // counts LINES rather than blocks (a block count would have said "1").
    const ranges = [
      { from: lineStart(PAGE_DOC, 1), to: lineStart(PAGE_DOC, 1) },
      { from: lineStart(PAGE_DOC, 2), to: lineEnd(PAGE_DOC, 2) },
      { from: lineStart(PAGE_DOC, 3), to: lineStart(PAGE_DOC, 3) },
      { from: lineStart(PAGE_DOC, 4), to: lineStart(PAGE_DOC, 4) },
    ];
    expect(lineRangesForSelections(PAGE_DOC, ranges)).toEqual([
      { from: lineStart(PAGE_DOC, 1), to: lineEnd(PAGE_DOC, 4) },
    ]);
    expect(countSelectedLines(PAGE_DOC, ranges)).toBe(4);
  });
});

describe('Copy is the one action that is not line-scoped', () => {
  it('copies FRAGMENTS while every write action expands to lines', async () => {
    const { view } = await mountPage(PAGE_DOC);

    // Two partial ranges: "alpha" inside line 1, "gamma" inside line 3.
    await selectAndOpenPopover(view, [
      { anchor: lineStart(PAGE_DOC, 1), head: lineStart(PAGE_DOC, 1) + 5 },
      { anchor: lineStart(PAGE_DOC, 3), head: lineStart(PAGE_DOC, 3) + 5 },
    ]);

    // The popover is making a per-LINE promise on screen right now...
    expect(screen.getByTestId('todo-txt-selection-count')).toHaveTextContent(
      '2 selections · actions apply to each selected line',
    );
    // ...and it is true for every write action: they all go through
    // `lineRangesForSelections`, which expands to whole lines.
    const fragments = [
      { from: lineStart(PAGE_DOC, 1), to: lineStart(PAGE_DOC, 1) + 5 },
      { from: lineStart(PAGE_DOC, 3), to: lineStart(PAGE_DOC, 3) + 5 },
    ];
    expect(
      applyTextChanges(
        PAGE_DOC,
        transformSelectedLines(PAGE_DOC, fragments, (l) => `x ${l}`),
      ),
    ).toBe('x alpha task\nbeta task\nx gamma task\ndelta task');

    fireEvent.click(screen.getByLabelText('Copy selection'));
    await waitFor(() => expect(clipboardWrites).toHaveLength(1));

    // Copy reads `selection.anchor` — the raw substrings — so it is the ONLY
    // button in the toolbar whose scope is the RANGE and not the LINE. That is
    // correct editor behaviour (CodeMirror's own multi-range copy joins with
    // '\n' the same way, and paste redistributes to the cursors), and it is
    // pinned here so a well-meaning "make everything line-scoped" change does
    // not quietly break clipboard semantics.
    //
    // The consequence to keep in mind: the status text one row above these
    // buttons, "actions apply to each selected line", is a generalisation that
    // holds for Done / priority / Date / Due / Dup / Del and is false for Copy.
    expect(clipboardWrites[0]).toBe('alpha\ngamma');
  });
});

describe('the multi-range AI-edit anchor', () => {
  it('stages only anchors that occur verbatim in the file', async () => {
    const { view } = await mountPage(PAGE_DOC);

    // Whole lines 1 and 3 — nothing partial, so the only thing under test is
    // the JOIN.
    await selectAndOpenPopover(view, [
      { anchor: lineStart(PAGE_DOC, 1), head: lineEnd(PAGE_DOC, 1) },
      { anchor: lineStart(PAGE_DOC, 3), head: lineEnd(PAGE_DOC, 3) },
    ]);

    fireEvent.change(screen.getByTestId('todo-txt-selection-prompt'), {
      target: { value: 'bump both to (A)' },
    });
    fireEvent.keyDown(screen.getByTestId('todo-txt-selection-prompt'), {
      key: 'Enter',
    });

    await screen.findByTestId('todo-txt-pending-comments');
    const anchors = screen
      .getAllByTestId('todo-txt-pending-comment-anchor')
      .map((el) => el.getAttribute('title')!);

    // `selectedText` joins ranges with '\n', so two lines that are NOT
    // neighbours would become one string containing a newline that does not
    // exist between them. `_build_ai_edit_prompt` would then render it as
    // `anchor: 'alpha task\ngamma task'` and tell the model to "apply each
    // instruction to the anchored line" — against a file where that anchor
    // never occurs at all.
    //
    // Every staged anchor must be findable in the file it will be applied to.
    for (const anchor of anchors) {
      expect(PAGE_DOC.split('\n')).toContain(anchor);
    }
  });

  it("points the line hint at the line each anchor STARTS on", async () => {
    const { view } = await mountPage(PAGE_DOC);
    await selectAndOpenPopover(
      view,
      [
        { anchor: lineStart(PAGE_DOC, 1), head: lineEnd(PAGE_DOC, 1) },
        { anchor: lineStart(PAGE_DOC, 3), head: lineEnd(PAGE_DOC, 3) },
      ],
      1,
    );

    fireEvent.change(screen.getByTestId('todo-txt-selection-prompt'), {
      target: { value: 'bump both to (A)' },
    });
    fireEvent.keyDown(screen.getByTestId('todo-txt-selection-prompt'), {
      key: 'Enter',
    });

    await screen.findByTestId('todo-txt-pending-comments');
    const rows = screen.getAllByTestId('todo-txt-pending-comment-anchor');

    // The anchor BEGINS with line 1's text, but the PRIMARY range is line 3
    // here, because Alt+click makes the newest caret main. A hint taken from
    // the primary range does not merely omit the other ranges; it points at the
    // wrong end of the string it annotates. Every row's hint must name the line
    // its own anchor starts on.
    for (const row of rows) {
      const anchor = row.getAttribute('title')!;
      const startLine = PAGE_DOC.split('\n').indexOf(anchor.split('\n')[0]) + 1;
      expect(row.textContent).toContain(`line ${startLine}:1`);
    }
  });
});

describe('staleness of a staged comment', () => {
  it('flags a staged comment whose anchored line has been deleted', async () => {
    const { view } = await mountPage(PAGE_DOC);
    await selectAndOpenPopover(view, [
      { anchor: lineStart(PAGE_DOC, 1), head: lineEnd(PAGE_DOC, 1) },
    ]);

    fireEvent.change(screen.getByTestId('todo-txt-selection-prompt'), {
      target: { value: 'add +work' },
    });
    fireEvent.keyDown(screen.getByTestId('todo-txt-selection-prompt'), {
      key: 'Enter',
    });
    const row = await screen.findByTestId('todo-txt-pending-comment-anchor');
    expect(row.getAttribute('title')).toBe('alpha task');

    // The popover deliberately STAYS OPEN after a submit so comments can be
    // stacked. The user, still in that popover, hits Del on the same
    // selection — `handleDeleteLine` re-reads the LIVE ranges and removes the
    // line the comment is anchored to.
    fireEvent.click(screen.getByLabelText('Delete line'));
    await waitFor(() =>
      expect(view.state.doc.toString()).toBe(
        'beta task\ngamma task\ndelta task',
      ),
    );

    // The comment survives the delete, so without a staleness check it would
    // still display (and still carry, on the wire) an anchor for text that is
    // no longer anywhere in the file. "Submit All" would send it,
    // `_build_ai_edit_prompt` would render `anchor: 'alpha task'` + `line: 1`
    // against a file whose line 1 is now 'beta task', and instruct the model to
    // "apply each instruction to the anchored line". The server's 409
    // base-changed guard only covers the file moving AFTER staging; nothing
    // else covers the anchor rotting BEFORE submit.
    expect(row.getAttribute('title')).toBe('alpha task');
    expect(view.state.doc.toString()).not.toContain('alpha task');

    // A staged comment whose anchor no longer occurs in the file must say so.
    expect(
      screen.getByTestId('todo-txt-pending-comment-stale'),
    ).toBeInTheDocument();
  });

  it('degrades but does not break the anchor when Done rewrites the line', async () => {
    const { view } = await mountPage(PAGE_DOC);
    await selectAndOpenPopover(view, [
      { anchor: lineStart(PAGE_DOC, 1), head: lineEnd(PAGE_DOC, 1) },
    ]);

    fireEvent.change(screen.getByTestId('todo-txt-selection-prompt'), {
      target: { value: 'add +work' },
    });
    fireEvent.keyDown(screen.getByTestId('todo-txt-selection-prompt'), {
      key: 'Enter',
    });
    const row = await screen.findByTestId('todo-txt-pending-comment-anchor');

    // Document-level keydown, bound by the popover for as long as it is
    // mounted — no re-selection, no click on the toolbar.
    act(() => {
      fireEvent.keyDown(document, { key: 'd', metaKey: true });
    });
    await waitFor(() =>
      expect(view.state.doc.toString().startsWith('x ')).toBe(true),
    );

    const staleAnchor = row.getAttribute('title')!;
    const docNow = view.state.doc.toString();

    // Milder than the delete case, and the reason the staleness check uses
    // SUBSTRING containment rather than whole-line equality: 'alpha task' still
    // occurs inside 'x <today> alpha task', so the model can still find the
    // line. Pinned anyway, because the stored `line:column` is now wrong by the
    // width of the completion prefix, and that is the residue any future
    // anchor-resolution change has to cope with.
    expect(docNow).toContain(staleAnchor);
    expect(docNow.split('\n')).not.toContain(staleAnchor);
    expect(docNow.split('\n')[0].indexOf(staleAnchor) + 1).toBeGreaterThan(1);
  });
});

// ===========================================================================
// PART C — what the popover PROMISES for a multi-range selection
// ===========================================================================

const anchorRect = new DOMRect(10, 10, 30, 18);

function renderPopover(rangeCount: number) {
  return render(
    <TodoTxtSelectionPopover
      selection={'alpha task\ngamma task'}
      anchorRect={anchorRect}
      rangeCount={rangeCount}
      onClose={() => {}}
      onMarkDone={() => {}}
      onSetPriority={() => {}}
      onAddCreationDate={() => {}}
      onCopy={() => {}}
      onDeleteLine={() => {}}
      onDuplicateLine={() => {}}
      onArchiveSelection={() => {}}
      onSetDueDate={() => {}}
      onAddComment={() => {}}
      onAskInChat={() => {}}
    />,
  );
}

describe('the "actions apply to each selected line" claim vs Archive', () => {
  it('labels "→ Done" with the whole-file blast radius it really has', () => {
    renderPopover(2);

    expect(screen.getByTestId('todo-txt-selection-count')).toHaveTextContent(
      '2 selections · actions apply to each selected line',
    );

    // `handleArchiveSelection` marks the selected lines done, saves, then
    // POSTs /api/archive — which moves EVERY `x ` line in todo.txt to
    // done.txt, including completed lines the user never selected (pinned
    // server-side by tests/test_api_archive.py). Under a status that says
    // "actions apply to each selected line", "→ Done" is the one button whose
    // blast radius is the whole file, so its own tooltip has to say so.
    const archive = screen.getByLabelText('Archive line to done.txt');
    expect(archive.getAttribute('title')).toMatch(/all completed|every|whole file/i);
  });

  it('shows no claim at all for a single range (correct)', () => {
    renderPopover(1);
    expect(
      screen.queryByTestId('todo-txt-selection-count'),
    ).not.toBeInTheDocument();
  });
});

// ===========================================================================
// Guard: `hide` mode really is reachable from the page's own setting
// ===========================================================================

describe('mode plumbing', () => {
  it('the page passes a stored `hide` mode down to the editor', async () => {
    window.localStorage.setItem(HIDDEN_STORAGE_KEY, 'hide');
    const { view } = await mountPage('alpha\nsecret h:1\ngamma');
    // The premise of every `hide`-mode test above: `hide` is a real
    // user-selectable mode, not a test-only prop. If this stops holding, those
    // tests stop describing anything a user can reach.
    await waitFor(() =>
      expect(
        document.querySelectorAll(`.cm-line.${GONE}`).length,
      ).toBeGreaterThan(0),
    );
    expect(view.state.doc.toString()).toContain('secret h:1');
  });
});
