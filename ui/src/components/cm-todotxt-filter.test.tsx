/**
 * cm-todotxt-filter component tests — the dim decoration, mounted for real.
 *
 * These drive an actual CodeMirror EditorView through <CmEditor>, because the
 * two properties that matter cannot be observed from a pure function:
 *
 *   1. the dim class lands on the `.cm-line` ELEMENT (a line decoration), not
 *      on a span wrapping the text (a mark decoration), and
 *   2. editing a dimmed line neither corrupts the document nor strands the
 *      decoration — the "edit-safe" half of the requirement.
 *
 * `today` is injected so `due:` cases cannot rot.
 */
import { cleanup, render } from '@testing-library/react';
import { act } from 'react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CmEditor, { type CmEditorHandle } from './CmEditor';
import { dimmedLineStarts } from './cm-todotxt-filter';
import { parseFilterExpr, type ParsedFilter } from '../utils/filterExpr';

/** TODAY, derived from the clock — NOT hardcoded.
 *
 * A hardcoded date would make this suite a time bomb: the decoration layer
 * reads the REAL clock (nothing is injected, despite the test name below), so
 * the moment the date rolled past the pinned day, a `due:<pinned>` line would
 * become genuinely overdue and the "due today is not overdue" assertion would
 * invert. Local, not UTC, matching every date producer in the app. */
function localToday(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
const TODAY = localToday();
const DIM = 'todotxt-filter-dim';

afterEach(() => cleanup());

/** Rendered lines paired with whether the dim decoration is on them. */
function renderedLines(container: HTMLElement): { text: string; dim: boolean }[] {
  return Array.from(container.querySelectorAll('.cm-line')).map((el) => ({
    text: el.textContent ?? '',
    dim: el.classList.contains(DIM),
  }));
}

/** Text of every dimmed line, in document order. */
function dimmedTexts(container: HTMLElement): string[] {
  return renderedLines(container)
    .filter((l) => l.dim)
    .map((l) => l.text);
}

function mount(doc: string, filter: ParsedFilter | null) {
  const ref = createRef<CmEditorHandle>();
  const onChange = vi.fn();
  const utils = render(
    <CmEditor ref={ref} value={doc} onChange={onChange} filter={filter} />,
  );
  return { ...utils, ref, onChange };
}

// ===========================================================================
// dimmedLineStarts — pure line selection
// ===========================================================================

describe('dimmedLineStarts', () => {
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
    '(A) file taxes +finance', // no @home  -> dimmed
    '(B) mow the lawn @home', // matches
    '', // blank -> never dimmed
    'buy milk @errands', // dimmed
  ];

  it('returns the line-start offsets of non-matching, non-blank lines', () => {
    const doc = fakeDoc(LINES);
    const starts = dimmedLineStarts(
      doc,
      [{ from: 0, to: doc.length - 1 }],
      parseFilterExpr('@home'),
      TODAY,
    );
    expect(starts).toEqual([doc.line(1).from, doc.line(4).from]);
  });

  it('returns nothing for a null filter or a filter with no terms', () => {
    const doc = fakeDoc(LINES);
    const range = [{ from: 0, to: doc.length - 1 }];
    expect(dimmedLineStarts(doc, range, null, TODAY)).toEqual([]);
    expect(
      dimmedLineStarts(doc, range, { source: '', terms: [] }, TODAY),
    ).toEqual([]);
  });

  it('emits a boundary line once when two ranges share it', () => {
    const doc = fakeDoc(LINES);
    // Ranges deliberately overlap on line 1 and line 4.
    const starts = dimmedLineStarts(
      doc,
      [
        { from: 0, to: doc.line(4).from },
        { from: doc.line(4).from, to: doc.length - 1 },
      ],
      parseFilterExpr('@home'),
      TODAY,
    );
    expect(starts).toEqual([doc.line(1).from, doc.line(4).from]);
    expect(new Set(starts).size).toBe(starts.length);
  });

  it('returns ascending offsets — the RangeSetBuilder contract', () => {
    const doc = fakeDoc(LINES);
    const starts = dimmedLineStarts(
      doc,
      [{ from: 0, to: doc.length - 1 }],
      parseFilterExpr('@nowhere'),
      TODAY,
    );
    for (let i = 1; i < starts.length; i++) {
      expect(starts[i]).toBeGreaterThan(starts[i - 1]);
    }
  });
});

// ===========================================================================
// Mounted editor — the dim decoration
// ===========================================================================

describe('filter dim decoration (mounted)', () => {
  const DOC = [
    '(A) file taxes +finance due:2026-07-01',
    '(B) mow the lawn @home +garden',
    '',
    'buy milk @errands',
    'x 2026-08-01 call bank pri:A',
  ].join('\n');

  it('dims every non-matching line and leaves matches alone', () => {
    const { container } = mount(DOC, parseFilterExpr('@home'));
    const lines = renderedLines(container);
    expect(lines).toHaveLength(5);
    expect(lines.map((l) => l.dim)).toEqual([true, false, false, true, true]);
  });

  it('never dims a blank line', () => {
    // `@nowhere` matches nothing, so only the blank line can stay undimmed.
    const { container } = mount(DOC, parseFilterExpr('@nowhere'));
    const lines = renderedLines(container);
    expect(lines.filter((l) => !l.dim).map((l) => l.text)).toEqual(['']);
  });

  it('applies no dim class at all when there is no filter', () => {
    const { container } = mount(DOC, null);
    expect(dimmedTexts(container)).toEqual([]);
  });

  it('puts the class on the .cm-line element, not on a span around the text', () => {
    // A line decoration decorates the line; a mark decoration would wrap the
    // text in a <span class=...> inside it. Only the former is edit-safe.
    const { container } = mount(DOC, parseFilterExpr('@home'));
    const dimmedLine = container.querySelector(`.cm-line.${DIM}`);
    expect(dimmedLine).not.toBeNull();
    expect(dimmedLine!.querySelector(`span.${DIM}`)).toBeNull();
  });

  it('dims by priority range across the (A) prefix and the pri: tag', () => {
    const { container } = mount(DOC, parseFilterExpr('pri:A'));
    // Lines 1 and 5 carry priority A; 2 is (B), 4 has none, 3 is blank.
    expect(renderedLines(container).map((l) => l.dim)).toEqual([
      false,
      true,
      false,
      true,
      false,
    ]);
  });

  it('honours a due: term against the injected today', () => {
    const doc = [
      `pay rent due:${TODAY}`,
      'renew passport due:2026-07-01',
      'ship it due:2026-12-01',
    ].join('\n');
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor
        ref={ref}
        value={doc}
        onChange={vi.fn()}
        filter={parseFilterExpr('due:overdue')}
      />,
    );
    // Only the 2026-07-01 line is overdue relative to the real clock too —
    // both dates are safely in the past/future of any plausible run date.
    expect(renderedLines(container).map((l) => l.dim)).toEqual([
      true,
      false,
      true,
    ]);
  });

  it('keeps dimming when syntax highlighting is off', () => {
    // Filter and highlighting live in separate compartments precisely so
    // one cannot switch the other off.
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor
        ref={ref}
        value={DOC}
        onChange={vi.fn()}
        syntaxHighlight={false}
        filter={parseFilterExpr('@home')}
      />,
    );
    expect(dimmedTexts(container)).toHaveLength(3);
    expect(container.querySelector('.todotxt-project')).toBeNull();
  });
});

// ===========================================================================
// Edit safety
// ===========================================================================

describe('filter dim decoration is edit-safe', () => {
  const DOC = ['alpha @home', 'beta @work', 'gamma @home'].join('\n');

  it('leaves a dimmed line fully editable and reports the edit upstream', () => {
    const { container, ref, onChange } = mount(DOC, parseFilterExpr('@home'));
    const view = ref.current!.getView()!;
    expect(dimmedTexts(container)).toEqual(['beta @work']);

    // Type into the middle of the DIMMED line.
    const line = view.state.doc.line(2);
    act(() => {
      view.dispatch({ changes: { from: line.from + 4, insert: 'XYZ' } });
    });

    expect(view.state.doc.line(2).text).toBe('betaXYZ @work');
    // Second arg is CmEditor's change provenance (`{typed}`).
    expect(onChange).toHaveBeenLastCalledWith(
      'alpha @home\nbetaXYZ @work\ngamma @home',
      expect.anything(),
    );
    // Still dimmed — the edit did not make it match.
    expect(dimmedTexts(container)).toEqual(['betaXYZ @work']);
  });

  it('undims a line the moment an edit makes it match', () => {
    const { container, ref } = mount(DOC, parseFilterExpr('@home'));
    const view = ref.current!.getView()!;
    const line = view.state.doc.line(2);

    act(() => {
      view.dispatch({
        changes: { from: line.from, to: line.to, insert: 'beta @home' },
      });
    });

    expect(dimmedTexts(container)).toEqual([]);
  });

  it('dims a newly inserted non-matching line', () => {
    const { container, ref } = mount(DOC, parseFilterExpr('@home'));
    const view = ref.current!.getView()!;

    act(() => {
      view.dispatch({
        changes: { from: view.state.doc.length, insert: '\ndelta @office' },
      });
    });

    expect(dimmedTexts(container)).toEqual(['beta @work', 'delta @office']);
  });

  it('re-dims from scratch when the filter prop changes', () => {
    const ref = createRef<CmEditorHandle>();
    const rendered = render(
      <CmEditor
        ref={ref}
        value={DOC}
        onChange={vi.fn()}
        filter={parseFilterExpr('@home')}
      />,
    );
    expect(dimmedTexts(rendered.container)).toEqual(['beta @work']);

    rendered.rerender(
      <CmEditor
        ref={ref}
        value={DOC}
        onChange={vi.fn()}
        filter={parseFilterExpr('@work')}
      />,
    );
    expect(dimmedTexts(rendered.container)).toEqual(['alpha @home', 'gamma @home']);

    // Clearing the filter removes every dim class and leaves the document
    // byte-identical to what was mounted.
    rendered.rerender(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} filter={null} />,
    );
    expect(dimmedTexts(rendered.container)).toEqual([]);
    expect(ref.current!.getValue()).toBe(DOC);
  });
});
