/**
 * cm-todotxt-threshold component tests — the `t:` background decoration,
 * mounted for real.
 *
 * Same rationale as the filter-dim suite next door: two properties cannot be
 * observed from a pure function —
 *
 *   1. the class lands on the `.cm-line` ELEMENT (a line decoration), so it
 *      cannot be split or orphaned by typing inside the line, and
 *   2. a line pushed into the background is still fully in the document, still
 *      editable, and still saved — this app never collapses text.
 *
 * `today` is injected into the pure helper; the mounted cases pick `t:` dates
 * far enough out (2099 / 2000) that the real clock cannot flip them.
 */
import { cleanup, render } from '@testing-library/react';
import { act } from 'react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CmEditor, { type CmEditorHandle } from './CmEditor';
import { thresholdHiddenLineStarts } from './cm-todotxt-filter';
import { parseFilterExpr } from '../utils/filterExpr';

const TODAY = '2026-08-05';
const HIDDEN = 'todotxt-threshold-hidden';
const DIM = 'todotxt-filter-dim';

afterEach(() => cleanup());

/** Text of every backgrounded line, in document order. */
function hiddenTexts(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('.cm-line'))
    .filter((el) => el.classList.contains(HIDDEN))
    .map((el) => el.textContent ?? '');
}

/** Text of every filter-dimmed line, in document order. */
function dimmedTexts(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('.cm-line'))
    .filter((el) => el.classList.contains(DIM))
    .map((el) => el.textContent ?? '');
}

// ===========================================================================
// thresholdHiddenLineStarts — pure line selection
// ===========================================================================

describe('thresholdHiddenLineStarts', () => {
  /** Minimal doc stand-in: enough surface for the helper, no EditorState. */
  function fakeDoc(lines: string[]) {
    const froms: number[] = [];
    let pos = 0;
    for (const l of lines) {
      froms.push(pos);
      pos += l.length + 1;
    }
    return {
      length: pos,
      lineAt(offset: number) {
        let n = 1;
        for (let i = 0; i < froms.length; i++) {
          if (froms[i] <= offset) n = i + 1;
        }
        return { number: n };
      },
      line(n: number) {
        return { from: froms[n - 1], text: lines[n - 1] };
      },
    };
  }

  const LINES = [
    'pay rent due:2026-08-10', // no t: -> visible
    'renew passport t:2026-09-01', // future -> hidden
    '', // blank -> never decorated
    'book dentist t:2026-08-05', // today -> actionable, visible
    'call mum t:2026-08-04', // past -> visible
    'x 2026-08-02 old t:2026-12-01', // completed but future -> hidden
  ];

  it('returns the line-start offsets of future-threshold lines only', () => {
    const doc = fakeDoc(LINES);
    const starts = thresholdHiddenLineStarts(
      doc,
      [{ from: 0, to: doc.length - 1 }],
      true,
      TODAY,
    );
    expect(starts).toEqual([doc.line(2).from, doc.line(6).from]);
  });

  it('returns nothing when hiding is off', () => {
    const doc = fakeDoc(LINES);
    expect(
      thresholdHiddenLineStarts(doc, [{ from: 0, to: doc.length - 1 }], false, TODAY),
    ).toEqual([]);
  });

  it('emits a boundary line once when two ranges share it', () => {
    const doc = fakeDoc(LINES);
    const starts = thresholdHiddenLineStarts(
      doc,
      [
        { from: 0, to: doc.line(6).from },
        { from: doc.line(6).from, to: doc.length - 1 },
      ],
      true,
      TODAY,
    );
    expect(starts).toEqual([doc.line(2).from, doc.line(6).from]);
    expect(new Set(starts).size).toBe(starts.length);
  });

  it('re-evaluates as today moves past the threshold', () => {
    const doc = fakeDoc(['renew t:2026-09-01']);
    const range = [{ from: 0, to: doc.length - 1 }];
    expect(thresholdHiddenLineStarts(doc, range, true, '2026-08-31')).toEqual([0]);
    expect(thresholdHiddenLineStarts(doc, range, true, '2026-09-01')).toEqual([]);
  });

  // The P8 cursor exemption (closes the P4 finding): the caret's own line is
  // never decorated, whatever its `t:` date, so the line being edited always
  // stays legible. 0 means "no cursor" and decorates everything — the
  // convention shared with hiddenLineStarts.
  it('exempts the cursor line from decoration', () => {
    const doc = fakeDoc(LINES);
    const range = [{ from: 0, to: doc.length - 1 }];
    // Cursor on line 2 (future t:) -> only line 6 decorated.
    expect(thresholdHiddenLineStarts(doc, range, true, TODAY, 2)).toEqual([
      doc.line(6).from,
    ]);
    // Cursor on line 6 -> only line 2 decorated.
    expect(thresholdHiddenLineStarts(doc, range, true, TODAY, 6)).toEqual([
      doc.line(2).from,
    ]);
    // Cursor on a visible line -> exemption changes nothing.
    expect(thresholdHiddenLineStarts(doc, range, true, TODAY, 4)).toEqual([
      doc.line(2).from,
      doc.line(6).from,
    ]);
  });
});

// ===========================================================================
// Mounted — the decoration on a real EditorView
// ===========================================================================

const DOC = [
  'alpha @home',
  'beta @work t:2099-01-01',
  'gamma @home t:2000-01-01',
  'delta @work t:2099-06-30',
].join('\n');

describe('todotxtThresholdDim (mounted)', () => {
  it('decorates nothing while the mode is show (the default)', () => {
    const { container } = render(
      <CmEditor value={DOC} onChange={vi.fn()} thresholdHidden={false} />,
    );
    expect(hiddenTexts(container)).toEqual([]);
  });

  it('is off by default when the prop is omitted', () => {
    const { container } = render(<CmEditor value={DOC} onChange={vi.fn()} />);
    expect(hiddenTexts(container)).toEqual([]);
  });

  it('decorates exactly the future-t: lines when hiding is on', () => {
    const { container } = render(
      <CmEditor value={DOC} onChange={vi.fn()} thresholdHidden />,
    );
    expect(hiddenTexts(container)).toEqual([
      'beta @work t:2099-01-01',
      'delta @work t:2099-06-30',
    ]);
  });

  it('puts the class on the .cm-line element, not on an inner span', () => {
    const { container } = render(
      <CmEditor value={DOC} onChange={vi.fn()} thresholdHidden />,
    );
    const lines = Array.from(container.querySelectorAll('.cm-line'));
    expect(lines[1].classList.contains(HIDDEN)).toBe(true);
    expect(lines[1].querySelector(`.${HIDDEN}`)).toBeNull();
  });

  it('keeps every backgrounded line in the document', () => {
    const ref = createRef<CmEditorHandle>();
    render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} thresholdHidden />,
    );
    expect(ref.current!.getValue()).toBe(DOC);
    expect(ref.current!.getValue().split('\n')).toHaveLength(4);
  });

  it('survives an edit inside a backgrounded line, keeping it decorated', () => {
    const ref = createRef<CmEditorHandle>();
    const onChange = vi.fn();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={onChange} thresholdHidden />,
    );
    const view = ref.current!.getView()!;
    const line = view.state.doc.line(2);
    act(() => {
      view.dispatch({
        changes: { from: line.from + 4, insert: ' EDITED' },
      });
    });
    expect(hiddenTexts(container)).toEqual([
      'beta EDITED @work t:2099-01-01',
      'delta @work t:2099-06-30',
    ]);
    expect(ref.current!.getValue()).toContain('beta EDITED @work t:2099-01-01');
  });

  it('drops the decoration when the threshold date is edited into the past', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} thresholdHidden />,
    );
    const view = ref.current!.getView()!;
    const line = view.state.doc.line(2);
    act(() => {
      view.dispatch({
        changes: { from: line.from, to: line.to, insert: 'beta @work t:2000-01-01' },
      });
    });
    expect(hiddenTexts(container)).toEqual(['delta @work t:2099-06-30']);
  });

  it('toggles cleanly when the prop flips, leaving the document untouched', () => {
    const ref = createRef<CmEditorHandle>();
    const rendered = render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} thresholdHidden={false} />,
    );
    expect(hiddenTexts(rendered.container)).toEqual([]);

    rendered.rerender(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} thresholdHidden />,
    );
    expect(hiddenTexts(rendered.container)).toEqual([
      'beta @work t:2099-01-01',
      'delta @work t:2099-06-30',
    ]);

    rendered.rerender(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} thresholdHidden={false} />,
    );
    expect(hiddenTexts(rendered.container)).toEqual([]);
    expect(ref.current!.getValue()).toBe(DOC);
  });
});

// ===========================================================================
// Independence from the filter dim — separate compartments
// ===========================================================================

describe('threshold and filter coexist', () => {
  it('applies both classes independently, and a line can carry both', () => {
    const { container } = render(
      <CmEditor
        value={DOC}
        onChange={vi.fn()}
        filter={parseFilterExpr('@home')}
        thresholdHidden
      />,
    );
    // Filter dims the two @work lines; threshold backgrounds the two future
    // t: lines — which happen to be the same two here.
    expect(dimmedTexts(container)).toEqual([
      'beta @work t:2099-01-01',
      'delta @work t:2099-06-30',
    ]);
    expect(hiddenTexts(container)).toEqual([
      'beta @work t:2099-01-01',
      'delta @work t:2099-06-30',
    ]);
  });

  it('keeps the filter dim intact when the threshold mode changes', () => {
    const rendered = render(
      <CmEditor
        value={DOC}
        onChange={vi.fn()}
        filter={parseFilterExpr('@work')}
        thresholdHidden={false}
      />,
    );
    const beforeDim = dimmedTexts(rendered.container);
    expect(beforeDim).toEqual(['alpha @home', 'gamma @home t:2000-01-01']);

    rendered.rerender(
      <CmEditor
        value={DOC}
        onChange={vi.fn()}
        filter={parseFilterExpr('@work')}
        thresholdHidden
      />,
    );
    expect(dimmedTexts(rendered.container)).toEqual(beforeDim);
    expect(hiddenTexts(rendered.container)).toEqual([
      'beta @work t:2099-01-01',
      'delta @work t:2099-06-30',
    ]);
  });

  it('keeps the threshold decoration intact when the filter changes', () => {
    const rendered = render(
      <CmEditor
        value={DOC}
        onChange={vi.fn()}
        filter={parseFilterExpr('@home')}
        thresholdHidden
      />,
    );
    const beforeHidden = hiddenTexts(rendered.container);

    rendered.rerender(
      <CmEditor value={DOC} onChange={vi.fn()} filter={null} thresholdHidden />,
    );
    expect(dimmedTexts(rendered.container)).toEqual([]);
    expect(hiddenTexts(rendered.container)).toEqual(beforeHidden);
  });
});
