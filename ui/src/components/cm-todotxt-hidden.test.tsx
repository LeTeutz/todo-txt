/**
 * cm-todotxt-hidden component tests — the `h:1` view layer, mounted for real.
 *
 * Same rationale as the filter-dim and threshold suites next door: several
 * properties cannot be observed from a pure function —
 *
 *   1. the class lands on the `.cm-line` ELEMENT (a line decoration), so it
 *      cannot be split or orphaned by typing inside the line,
 *   2. `hide` really does remove the line from view while leaving every byte in
 *      the document — the distinction this whole layer rests on,
 *   3. the cursor's own line is exempt, so the caret can never be stranded
 *      somewhere invisible, and
 *   4. the Tab-complete vocabulary still reads `h:1` lines — the property that
 *      makes hiding safe. A +project mentioned only on a hidden line must still
 *      complete, because the file is the vocabulary, not the view.
 */
import { cleanup, render } from '@testing-library/react';
import { act, createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CmEditor, { type CmEditorHandle } from './CmEditor';
import { hiddenLineStarts } from './cm-todotxt-filter';
import { parseFilterExpr } from '../utils/filterExpr';
import {
  completeProjectOrContext,
  extractProjectsAndContexts,
} from '../utils/shortcuts';

const DIM = 'todotxt-hidden-dim';
const GONE = 'todotxt-hidden-gone';
const FILTER_DIM = 'todotxt-filter-dim';
const THRESHOLD = 'todotxt-threshold-hidden';

afterEach(() => cleanup());

/** Text of every line carrying `cls`, in document order. */
function textsWithClass(container: HTMLElement, cls: string): string[] {
  return Array.from(container.querySelectorAll('.cm-line'))
    .filter((el) => el.classList.contains(cls))
    .map((el) => el.textContent ?? '');
}

// ===========================================================================
// hiddenLineStarts — pure line selection
// ===========================================================================

describe('hiddenLineStarts', () => {
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
    'ordinary task', // no tag -> untouched
    'someday tin whistle h:1', // tagged -> treated
    '', // blank -> never decorated
    'note h:0', // near miss -> untouched
    'x 2026-01-02 old thing h:1', // completed but tagged -> treated
    'note h:10', // near miss -> untouched
  ];

  it('returns the line-start offsets of h:1 lines only', () => {
    const doc = fakeDoc(LINES);
    const starts = hiddenLineStarts(doc, [{ from: 0, to: doc.length - 1 }], 'dim');
    expect(starts).toEqual([doc.line(2).from, doc.line(5).from]);
  });

  it('selects the same lines in hide mode — only the class differs', () => {
    const doc = fakeDoc(LINES);
    expect(hiddenLineStarts(doc, [{ from: 0, to: doc.length - 1 }], 'hide')).toEqual(
      [doc.line(2).from, doc.line(5).from],
    );
  });

  it('returns nothing in show mode', () => {
    const doc = fakeDoc(LINES);
    expect(hiddenLineStarts(doc, [{ from: 0, to: doc.length - 1 }], 'show')).toEqual(
      [],
    );
  });

  it('exempts the cursor line so the caret is never stranded', () => {
    const doc = fakeDoc(LINES);
    const starts = hiddenLineStarts(
      doc,
      [{ from: 0, to: doc.length - 1 }],
      'hide',
      2,
    );
    expect(starts).toEqual([doc.line(5).from]);
  });

  it('exempts nothing when the cursor sits on an untagged line', () => {
    const doc = fakeDoc(LINES);
    expect(
      hiddenLineStarts(doc, [{ from: 0, to: doc.length - 1 }], 'hide', 1),
    ).toEqual([doc.line(2).from, doc.line(5).from]);
  });

  it('emits a boundary line once when two ranges share it', () => {
    const doc = fakeDoc(LINES);
    const starts = hiddenLineStarts(
      doc,
      [
        { from: 0, to: doc.line(5).from },
        { from: doc.line(5).from, to: doc.length - 1 },
      ],
      'dim',
    );
    expect(starts).toEqual([doc.line(2).from, doc.line(5).from]);
    expect(new Set(starts).size).toBe(starts.length);
  });
});

// ===========================================================================
// Mounted — the decoration on a real EditorView
// ===========================================================================

const DOC = [
  'alpha @home',
  'beta @work h:1',
  'gamma @home',
  'delta @work h:1',
].join('\n');

describe('todotxtHiddenLines (mounted)', () => {
  it('dims exactly the h:1 lines in dim mode (the default)', () => {
    const { container } = render(
      <CmEditor value={DOC} onChange={vi.fn()} hiddenMode="dim" />,
    );
    expect(textsWithClass(container, DIM)).toEqual([
      'beta @work h:1',
      'delta @work h:1',
    ]);
    expect(textsWithClass(container, GONE)).toEqual([]);
  });

  it('defaults to dim when the prop is omitted', () => {
    const { container } = render(<CmEditor value={DOC} onChange={vi.fn()} />);
    expect(textsWithClass(container, DIM)).toEqual([
      'beta @work h:1',
      'delta @work h:1',
    ]);
  });

  it('applies the removed-from-view class in hide mode', () => {
    const { container } = render(
      <CmEditor value={DOC} onChange={vi.fn()} hiddenMode="hide" />,
    );
    expect(textsWithClass(container, GONE)).toEqual([
      'beta @work h:1',
      'delta @work h:1',
    ]);
    expect(textsWithClass(container, DIM)).toEqual([]);
  });

  it('decorates nothing in show mode', () => {
    const { container } = render(
      <CmEditor value={DOC} onChange={vi.fn()} hiddenMode="show" />,
    );
    expect(textsWithClass(container, DIM)).toEqual([]);
    expect(textsWithClass(container, GONE)).toEqual([]);
  });

  it('puts the class on the .cm-line element, not on an inner span', () => {
    const { container } = render(
      <CmEditor value={DOC} onChange={vi.fn()} hiddenMode="dim" />,
    );
    const lines = Array.from(container.querySelectorAll('.cm-line'));
    expect(lines[1].classList.contains(DIM)).toBe(true);
    expect(lines[1].querySelector(`.${DIM}`)).toBeNull();
  });

  it('keeps every treated line in the document, even in hide mode', () => {
    const ref = createRef<CmEditorHandle>();
    render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="hide" />,
    );
    expect(ref.current!.getValue()).toBe(DOC);
    expect(ref.current!.getValue().split('\n')).toHaveLength(4);
  });

  it('survives an edit inside a treated line, keeping it decorated', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="dim" />,
    );
    const view = ref.current!.getView()!;
    const line = view.state.doc.line(2);
    act(() => {
      view.dispatch({ changes: { from: line.from + 4, insert: ' EDITED' } });
    });
    expect(textsWithClass(container, DIM)).toEqual([
      'beta EDITED @work h:1',
      'delta @work h:1',
    ]);
    expect(ref.current!.getValue()).toContain('beta EDITED @work h:1');
  });

  it('drops the decoration when the tag is edited away', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="dim" />,
    );
    const view = ref.current!.getView()!;
    const line = view.state.doc.line(2);
    act(() => {
      view.dispatch({
        changes: { from: line.from, to: line.to, insert: 'beta @work h:0' },
      });
    });
    expect(textsWithClass(container, DIM)).toEqual(['delta @work h:1']);
  });

  it('picks the decoration up when a tag is typed onto a line', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="dim" />,
    );
    const view = ref.current!.getView()!;
    // Park the caret on an untagged line FIRST. A fresh editor puts it at
    // offset 0, i.e. on line 1 — which the cursor exemption would then keep
    // undecorated, masking the thing this case is meant to observe.
    act(() => {
      view.dispatch({ selection: { anchor: view.state.doc.line(3).from } });
    });
    const line = view.state.doc.line(1);
    act(() => {
      view.dispatch({ changes: { from: line.to, insert: ' h:1' } });
    });
    expect(textsWithClass(container, DIM)).toContain('alpha @home h:1');
  });

  it('leaves a freshly tagged line alone while the caret is still on it', () => {
    // The flip side of the case above, and the reason it needed setting up:
    // typing `h:1` on the line you are editing must not make it vanish from
    // under the cursor. The treatment lands as soon as the caret moves away.
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;
    const line = view.state.doc.line(1);
    act(() => {
      view.dispatch({
        changes: { from: line.to, insert: ' h:1' },
        selection: { anchor: line.to + 4 },
      });
    });
    expect(textsWithClass(container, GONE)).not.toContain('alpha @home h:1');

    act(() => {
      view.dispatch({ selection: { anchor: view.state.doc.line(3).from } });
    });
    expect(textsWithClass(container, GONE)).toContain('alpha @home h:1');
  });

  it('exempts the line the cursor moves onto, and re-treats the one it leaves', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="hide" />,
    );
    const view = ref.current!.getView()!;
    expect(textsWithClass(container, GONE)).toHaveLength(2);

    // Caret into the first tagged line: it must become visible again.
    act(() => {
      view.dispatch({ selection: { anchor: view.state.doc.line(2).from + 2 } });
    });
    expect(textsWithClass(container, GONE)).toEqual(['delta @work h:1']);

    // Caret away again: it goes back out of view.
    act(() => {
      view.dispatch({ selection: { anchor: view.state.doc.line(1).from } });
    });
    expect(textsWithClass(container, GONE)).toEqual([
      'beta @work h:1',
      'delta @work h:1',
    ]);
  });

  it('switches cleanly between all three modes, leaving the document untouched', () => {
    const ref = createRef<CmEditorHandle>();
    const rendered = render(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="show" />,
    );
    expect(textsWithClass(rendered.container, DIM)).toEqual([]);

    rendered.rerender(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="dim" />,
    );
    expect(textsWithClass(rendered.container, DIM)).toHaveLength(2);
    expect(textsWithClass(rendered.container, GONE)).toEqual([]);

    rendered.rerender(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="hide" />,
    );
    expect(textsWithClass(rendered.container, DIM)).toEqual([]);
    expect(textsWithClass(rendered.container, GONE)).toHaveLength(2);

    rendered.rerender(
      <CmEditor ref={ref} value={DOC} onChange={vi.fn()} hiddenMode="show" />,
    );
    expect(textsWithClass(rendered.container, DIM)).toEqual([]);
    expect(textsWithClass(rendered.container, GONE)).toEqual([]);
    expect(ref.current!.getValue()).toBe(DOC);
  });
});

// ===========================================================================
// Independence from the other two narrowing layers — separate compartments
// ===========================================================================

const MIXED = [
  'alpha @home',
  'beta @work h:1',
  'gamma @home t:2099-01-01',
  'delta @work h:1 t:2099-06-30',
].join('\n');

describe('hidden coexists with the filter and threshold layers', () => {
  it('applies all three classes independently', () => {
    const { container } = render(
      <CmEditor
        value={MIXED}
        onChange={vi.fn()}
        filter={parseFilterExpr('@home')}
        thresholdHidden
        hiddenMode="dim"
      />,
    );
    expect(textsWithClass(container, FILTER_DIM)).toEqual([
      'beta @work h:1',
      'delta @work h:1 t:2099-06-30',
    ]);
    expect(textsWithClass(container, THRESHOLD)).toEqual([
      'gamma @home t:2099-01-01',
      'delta @work h:1 t:2099-06-30',
    ]);
    expect(textsWithClass(container, DIM)).toEqual([
      'beta @work h:1',
      'delta @work h:1 t:2099-06-30',
    ]);
  });

  it('leaves the filter and threshold decorations intact when the hidden mode changes', () => {
    const rendered = render(
      <CmEditor
        value={MIXED}
        onChange={vi.fn()}
        filter={parseFilterExpr('@work')}
        thresholdHidden
        hiddenMode="show"
      />,
    );
    const beforeFilter = textsWithClass(rendered.container, FILTER_DIM);
    const beforeThreshold = textsWithClass(rendered.container, THRESHOLD);
    expect(beforeFilter).toHaveLength(2);
    expect(beforeThreshold).toHaveLength(2);

    rendered.rerender(
      <CmEditor
        value={MIXED}
        onChange={vi.fn()}
        filter={parseFilterExpr('@work')}
        thresholdHidden
        hiddenMode="hide"
      />,
    );
    expect(textsWithClass(rendered.container, FILTER_DIM)).toEqual(beforeFilter);
    expect(textsWithClass(rendered.container, THRESHOLD)).toEqual(beforeThreshold);
    expect(textsWithClass(rendered.container, GONE)).toHaveLength(2);
  });

  it('leaves the hidden decoration intact when the filter changes', () => {
    const rendered = render(
      <CmEditor
        value={MIXED}
        onChange={vi.fn()}
        filter={parseFilterExpr('@home')}
        hiddenMode="dim"
      />,
    );
    const beforeHidden = textsWithClass(rendered.container, DIM);

    rendered.rerender(
      <CmEditor value={MIXED} onChange={vi.fn()} filter={null} hiddenMode="dim" />,
    );
    expect(textsWithClass(rendered.container, FILTER_DIM)).toEqual([]);
    expect(textsWithClass(rendered.container, DIM)).toEqual(beforeHidden);
  });
});

// ===========================================================================
// Vocabulary preservation — the property that makes hiding safe
// ===========================================================================

const VOCAB_DOC = [
  'ordinary task +visible @desk',
  'someday learn the tin whistle +tinwhistle @music h:1',
].join('\n');

describe('Tab-complete keeps reading h:1 lines', () => {
  it('extracts projects and contexts that exist only on a hidden line', () => {
    const { projects, contexts } = extractProjectsAndContexts(VOCAB_DOC);
    expect(projects).toContain('tinwhistle');
    expect(contexts).toContain('music');
  });

  it('completes a +project that exists only on an h:1 line', () => {
    const caret = VOCAB_DOC.length + '\n+tin'.length;
    const result = completeProjectOrContext(`${VOCAB_DOC}\n+tin`, caret);
    expect(result?.chosen).toBe('tinwhistle');
    expect(result?.value.endsWith('+tinwhistle')).toBe(true);
  });

  it('completes an @context that exists only on an h:1 line', () => {
    const caret = VOCAB_DOC.length + '\n@mus'.length;
    const result = completeProjectOrContext(`${VOCAB_DOC}\n@mus`, caret);
    expect(result?.chosen).toBe('music');
  });

  it.each(['dim', 'hide', 'show'] as const)(
    'still completes from a hidden line while the mode is %s',
    (mode) => {
      // The bridge that matters: TodoTxtPage's Tab handler completes against
      // `CmEditorHandle.getValue()`, which serializes the DOCUMENT, not the
      // rendered view. Whatever the decoration layer does to the display, the
      // vocabulary is the whole file — so this asserts getValue() is complete
      // in every mode, and that a completion driven off it still finds the tag.
      const ref = createRef<CmEditorHandle>();
      render(
        <CmEditor
          ref={ref}
          value={`${VOCAB_DOC}\n+tin`}
          onChange={vi.fn()}
          hiddenMode={mode}
        />,
      );
      const source = ref.current!.getValue();
      expect(source).toContain('+tinwhistle @music h:1');

      const result = completeProjectOrContext(source, source.length);
      expect(result?.chosen).toBe('tinwhistle');
    },
  );

  it('still completes when the ONLY line in the file is hidden', () => {
    const doc = 'buried +onlyhere h:1\n+only';
    const result = completeProjectOrContext(doc, doc.length);
    expect(result?.chosen).toBe('onlyhere');
  });
});
