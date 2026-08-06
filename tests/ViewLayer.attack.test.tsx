/**
 * The VIEW-narrowing layer vs the selection-action pipeline.
 *
 * Two features that are each correct in isolation combine into a write path
 * against lines the user cannot see.
 *
 * The SELECTION-ACTION pipeline (TodoTxtPage's `applyPerLineTransform` /
 * `deleteSelectedLines` / `duplicateSelectedLines` / the AI-comment anchor)
 * operates on REAL document offsets expanded to whole lines. `hidden hide`
 * mode is the one place in this app that applies `display: none` to a line.
 *
 * Together: a visually contiguous drag, a Ctrl+A, or an Alt-click
 * multi-cursor can put an invisible `h:1` line inside the selection, and
 * every selection action then rewrites it silently. A safety interlock that
 * exempts only `selection.main.head` protects a lone caret and nothing else —
 * so the exemption has to cover every line under every range.
 *
 * These tests mount the real CmEditor so the assertion is about the class that
 * actually lands on the `.cm-line` element, not about a helper in isolation.
 */
import { cleanup, render } from '@testing-library/react';
import { act, createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { EditorSelection } from '@codemirror/state';

import CmEditor, {
  type CmEditorHandle,
} from '../ui/src/components/CmEditor';
import {
  deleteSelectedLines,
  transformSelectedLines,
  applyTextChanges,
} from '../ui/src/utils/selectionRanges';

const GONE = 'todotxt-hidden-gone';
const DIM = 'todotxt-hidden-dim';
const THRESHOLD = 'todotxt-threshold-hidden';

afterEach(() => cleanup());

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

/** 0-based indices of lines carrying `cls`. */
function indicesWithClass(container: HTMLElement, cls: string): number[] {
  return lines(container)
    .map((el, i) => (el.classList.contains(cls) ? i : -1))
    .filter((i) => i >= 0);
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

// ===========================================================================
// hidden `hide` + a MULTI-LINE selection
// ===========================================================================

describe('hidden hide + a multi-line selection', () => {
  //   1 alpha
  //   2 secret h:1     <- invisible, but inside the selection
  //   3 gamma
  const DOC = 'alpha\nsecret h:1\ngamma';

  it('leaves every SELECTED line visible, not just the head line', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    // Baseline: with the caret parked on line 1, the h:1 line IS removed.
    expect(textsWithClass(container, GONE)).toEqual(['secret h:1']);

    // The user drags from the start of line 1 to the end of line 3. On screen
    // that looks like a two-line selection (alpha / gamma); the document range
    // covers three lines.
    act(() => {
      view.dispatch({
        selection: EditorSelection.single(
          lineStart(DOC, 1),
          lineEnd(DOC, 3),
        ),
      });
    });

    // Every line the next selection action will rewrite must be on screen.
    // Exempting only the head line would leave `secret h:1` `display: none`
    // while it is selected and about to be edited.
    expect(textsWithClass(container, GONE)).toEqual([]);
  });

  it('leaves a Ctrl+A selection fully visible', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    act(() => {
      view.dispatch({
        selection: EditorSelection.single(0, view.state.doc.length),
      });
    });

    expect(textsWithClass(container, GONE)).toEqual([]);
  });

  it('re-hides the line once the selection collapses away from it', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    act(() => {
      view.dispatch({
        selection: EditorSelection.single(lineStart(DOC, 1), lineEnd(DOC, 3)),
      });
    });
    expect(textsWithClass(container, GONE)).toEqual([]);

    // Selection collapsed back onto line 1: hiding must resume, otherwise the
    // exemption would leak and the mode would stop working after one drag.
    act(() => {
      view.dispatch({ selection: EditorSelection.single(0, 0) });
    });
    expect(textsWithClass(container, GONE)).toEqual(['secret h:1']);
  });

  it('the selection really does cover the invisible line (why this matters)', () => {
    // The consequence, spelled out against the real selection helpers the
    // popover actions use. This assertion documents the DATA effect, which is
    // independent of visibility: revealing the line changes what the user can
    // see, not what a selection means.
    const ranges = [{ from: lineStart(DOC, 1), to: lineEnd(DOC, 3) }];

    const doneChanges = transformSelectedLines(DOC, ranges, (l) =>
      l.trim() === '' ? l : `x 2026-08-05 ${l}`,
    );
    expect(applyTextChanges(DOC, doneChanges)).toBe(
      'x 2026-08-05 alpha\nx 2026-08-05 secret h:1\nx 2026-08-05 gamma',
    );

    expect(applyTextChanges(DOC, deleteSelectedLines(DOC, ranges))).toBe('');
  });
});

// ===========================================================================
// hidden `hide` + MULTI-CURSOR (the app's advertised bulk-edit gesture)
// ===========================================================================

describe('hidden hide + multi-cursor', () => {
  const DOC = 'alpha\nsecret h:1\ngamma\nother h:1';

  it('exempts every cursor line, not only the main one', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    // Alt+click a second caret onto line 2 while the main caret sits on line 4.
    act(() => {
      view.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.cursor(lineStart(DOC, 2)),
            EditorSelection.cursor(lineStart(DOC, 4)),
          ],
          1, // main = the line-4 cursor
        ),
      });
    });

    // Both h:1 lines carry a caret; neither may be display:none. An invisible
    // caret is an invisible edit target: CodeMirror applies typed text at
    // EVERY cursor, so a hidden caret line gets edited unseen.
    expect(textsWithClass(container, GONE)).toEqual([]);
  });

  it('still hides h:1 lines that carry no cursor', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    act(() => {
      view.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.cursor(lineStart(DOC, 1)),
            EditorSelection.cursor(lineStart(DOC, 2)),
          ],
          0,
        ),
      });
    });

    // Line 2 is exempt (has a cursor); line 4 is not.
    expect(textsWithClass(container, GONE)).toEqual(['other h:1']);
  });

  it('applies typed text to a hidden line, proving the write path is live', () => {
    const ref = createRef<CmEditorHandle>();
    render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;

    act(() => {
      view.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.cursor(lineStart(DOC, 2)),
            EditorSelection.cursor(lineStart(DOC, 4)),
          ],
          1,
        ),
      });
      view.dispatch(view.state.replaceSelection('(A) '));
    });

    // Documents the data effect: multi-cursor typing reaches h:1 lines.
    expect(view.state.doc.toString()).toBe(
      'alpha\n(A) secret h:1\ngamma\n(A) other h:1',
    );
  });
});

// ===========================================================================
// The same interlock in the `dim` mode and the threshold layer
// ===========================================================================

describe('hidden dim + threshold hide exemptions', () => {
  it('exempts every selected line in dim mode too', () => {
    const DOC = 'alpha\nsecret h:1\ngamma';
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={() => {}} hiddenMode="dim" />,
    );
    const view = ref.current!.getView()!;

    act(() => {
      view.dispatch({
        selection: EditorSelection.single(lineStart(DOC, 1), lineEnd(DOC, 3)),
      });
    });

    // 0.14 opacity on a line the user is about to bulk-edit is the same
    // legibility problem the cursor exemption exists to prevent.
    expect(textsWithClass(container, DIM)).toEqual([]);
  });

  it('exempts every selected line in threshold hide', () => {
    // `t:` far in the future, so the date comparison does not depend on when
    // the suite runs.
    const DOC = 'alpha\nlater t:2999-01-01\ngamma';
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor
        ref={ref}
        value={DOC}
        onChange={() => {}}
        thresholdHidden
        hiddenMode="show"
      />,
    );
    const view = ref.current!.getView()!;

    expect(indicesWithClass(container, THRESHOLD)).toEqual([1]);

    act(() => {
      view.dispatch({
        selection: EditorSelection.single(lineStart(DOC, 1), lineEnd(DOC, 3)),
      });
    });

    expect(indicesWithClass(container, THRESHOLD)).toEqual([]);
  });
});
