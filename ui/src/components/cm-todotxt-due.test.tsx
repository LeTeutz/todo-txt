/**
 * cm-todotxt-due component tests — the `due:` urgency tint, mounted for real.
 *
 * `classifyDue` is unit-tested next door (utils/dueStatus.test.ts). What can
 * only be observed on a real EditorView is where the tint actually LANDS:
 *
 *   1. the mark covers the whole `due:YYYY-MM-DD` token and nothing else,
 *   2. it lands on the correct token when a due-looking substring precedes it,
 *   3. completed lines never get it (they are struck through as a whole, and a
 *      red deadline on a finished task would be a lie), and
 *   4. the tint survives the fact that CodeMirror renders the three overlapping
 *      marks on a due token (urgency / key:value / date) as NESTED spans.
 *
 * `today` cannot be injected into this plugin — it reads the real clock through
 * its own per-minute cache — so the fixtures use dates far enough out (2099 /
 * 2000) that the wall clock cannot reclassify them, and the exact `today`
 * boundary is asserted through the pure `sortedLineMarks` helper instead.
 */
import { cleanup, render } from '@testing-library/react';
import { act, createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CmEditor, { type CmEditorHandle } from './CmEditor';
import { sortedLineMarks } from './cm-todotxt-decorations';

const PAST = 'todotxt-due-past';
const TODAY_CLS = 'todotxt-due-today';

/** The real local calendar day, formatted the way the plugin formats it. */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

afterEach(() => cleanup());

/**
 * Text covered by `cls`, in document order.
 *
 * Reads `.textContent` of the element carrying the class, which is exactly the
 * span the decoration produced — so a mark that is one character short, or that
 * swallowed the trailing space, shows up as a wrong string rather than passing.
 */
function tinted(container: HTMLElement, cls: string): string[] {
  return Array.from(container.querySelectorAll(`.${cls}`)).map(
    (el) => el.textContent ?? '',
  );
}

// ===========================================================================
// sortedLineMarks — which class, and over exactly which range
// ===========================================================================

describe('sortedLineMarks due classification', () => {
  const TODAY = '2026-08-05';

  /** Classes applied to `text`, paired with the substring each one covers. */
  function dueMarks(text: string, today = TODAY) {
    return sortedLineMarks(text, 0, today)
      .map((m) => ({
        // Decoration spec is not part of the public type; read the class off it.
        cls: (m.deco as unknown as { spec: { class: string } }).spec.class,
        covers: text.slice(m.from, m.to),
      }))
      .filter((m) => m.cls === PAST || m.cls === TODAY_CLS);
  }

  it('marks an overdue token with the danger class, covering the whole token', () => {
    expect(dueMarks('file taxes due:2026-08-04')).toEqual([
      { cls: PAST, covers: 'due:2026-08-04' },
    ]);
  });

  it('marks a due-today token with the warning class', () => {
    expect(dueMarks('call mum due:2026-08-05')).toEqual([
      { cls: TODAY_CLS, covers: 'due:2026-08-05' },
    ]);
  });

  it('marks a future token with neither', () => {
    expect(dueMarks('ship it due:2026-08-06')).toEqual([]);
  });

  it('marks a line with no due: token with neither', () => {
    expect(dueMarks('(A) ordinary task +proj @ctx')).toEqual([]);
  });

  it('flips from warning to danger as the day rolls over', () => {
    const line = 'call mum due:2026-08-05';
    expect(dueMarks(line, '2026-08-04')).toEqual([]);
    expect(dueMarks(line, '2026-08-05')).toEqual([
      { cls: TODAY_CLS, covers: 'due:2026-08-05' },
    ]);
    expect(dueMarks(line, '2026-08-06')).toEqual([
      { cls: PAST, covers: 'due:2026-08-05' },
    ]);
  });

  it('tints the REAL due: token, not a due-looking suffix of another key', () => {
    // The old positioning recovered the offset with `text.indexOf('due:…')`,
    // which finds this line's `notdue:` substring and painted the wrong token.
    const text = 'thing notdue:2026-08-04 due:2026-08-04';
    const marks = dueMarks(text);
    expect(marks).toEqual([{ cls: PAST, covers: 'due:2026-08-04' }]);
    expect(sortedLineMarks(text, 0, TODAY).find((m) => {
      const cls = (m as unknown as { deco: { spec: { class: string } } }).deco.spec
        .class;
      return cls === PAST;
    })!.from).toBe(text.indexOf(' due:') + 1);
  });

  it('does not tint an invalid date, however overdue it looks as a string', () => {
    expect(dueMarks('thing due:2026-02-31')).toEqual([]);
    expect(dueMarks('thing due:0000-00-00')).toEqual([]);
  });

  it('tints a token at the start of the line', () => {
    expect(dueMarks('due:2026-08-04 thing')).toEqual([
      { cls: PAST, covers: 'due:2026-08-04' },
    ]);
  });

  it('keeps the marks sorted by `from` with a tint present', () => {
    // The RangeSetBuilder contract that crashed the editor once already.
    const marks = sortedLineMarks(
      '(A) 2026-01-01 file taxes +finance @home due:2020-02-02',
      0,
      TODAY,
    );
    for (let i = 1; i < marks.length; i++) {
      expect(marks[i].from).toBeGreaterThanOrEqual(marks[i - 1].from);
    }
  });
});

// ===========================================================================
// Mounted — the tint on a real EditorView
// ===========================================================================

describe('due tint (mounted)', () => {
  const DOC = [
    'overdue thing due:2000-01-01',
    'future thing due:2099-12-31',
    'no date at all +proj',
  ].join('\n');

  it('tints an overdue token and leaves a future one alone', () => {
    const { container } = render(<CmEditor value={DOC} onChange={vi.fn()} />);
    expect(tinted(container, PAST)).toEqual(['due:2000-01-01']);
    expect(tinted(container, TODAY_CLS)).toEqual([]);
  });

  it('tints a due-today token with the warning class', () => {
    const { container } = render(
      <CmEditor value={`call mum due:${localToday()}`} onChange={vi.fn()} />,
    );
    expect(tinted(container, TODAY_CLS)).toEqual([`due:${localToday()}`]);
    expect(tinted(container, PAST)).toEqual([]);
  });

  it('never tints a COMPLETED line, however overdue', () => {
    const { container } = render(
      <CmEditor
        value={'x 2026-01-02 2026-01-01 paid it due:2000-01-01'}
        onChange={vi.fn()}
      />,
    );
    expect(tinted(container, PAST)).toEqual([]);
    expect(tinted(container, TODAY_CLS)).toEqual([]);
    // The whole-line done treatment is what applies instead.
    expect(container.querySelector('.todotxt-done')).not.toBeNull();
  });

  it('never tints a completed line that is due today either', () => {
    const { container } = render(
      <CmEditor
        value={`x 2026-01-02 2026-01-01 paid it due:${localToday()}`}
        onChange={vi.fn()}
      />,
    );
    expect(tinted(container, TODAY_CLS)).toEqual([]);
  });

  it('drops the tint when the line is marked done', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor
        ref={ref}
        value={'overdue thing due:2000-01-01'}
        onChange={vi.fn()}
      />,
    );
    expect(tinted(container, PAST)).toEqual(['due:2000-01-01']);
    const view = ref.current!.getView()!;
    act(() => {
      view.dispatch({ changes: { from: 0, insert: 'x 2026-01-02 ' } });
    });
    expect(tinted(container, PAST)).toEqual([]);
  });

  it('picks the tint up when a date is edited into the past', () => {
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor
        ref={ref}
        value={'future thing due:2099-12-31'}
        onChange={vi.fn()}
      />,
    );
    expect(tinted(container, PAST)).toEqual([]);
    const view = ref.current!.getView()!;
    const line = view.state.doc.line(1);
    act(() => {
      view.dispatch({
        changes: { from: line.from, to: line.to, insert: 'past thing due:2000-01-01' },
      });
    });
    expect(tinted(container, PAST)).toEqual(['due:2000-01-01']);
  });

  it('tints without stealing the trailing space or the following token', () => {
    const { container } = render(
      <CmEditor value={'thing due:2000-01-01 +proj @ctx'} onChange={vi.fn()} />,
    );
    expect(tinted(container, PAST)).toEqual(['due:2000-01-01']);
  });

  it('does not tint an h:1 line — the tag already says "this is noise"', () => {
    // The syntax layer gives an `h:1` line the muted/italic whole-line mark and
    // no inline marks at all (see buildDecorations). Deliberate: painting a bold
    // red deadline on a line the user personally flagged as noise would fight
    // both the tag and the `hidden` view mode dimming it. The urgency is not
    // lost — deleting `h:1` brings the tint straight back, asserted below.
    const ref = createRef<CmEditorHandle>();
    const { container } = render(
      <CmEditor
        ref={ref}
        value={'someday thing h:1 due:2000-01-01'}
        onChange={vi.fn()}
        hiddenMode="dim"
      />,
    );
    expect(tinted(container, PAST)).toEqual([]);
    expect(container.querySelector('.todotxt-hidden')).not.toBeNull();

    const view = ref.current!.getView()!;
    const at = view.state.doc.toString().indexOf(' h:1');
    act(() => {
      view.dispatch({ changes: { from: at, to: at + 4 } });
    });
    expect(tinted(container, PAST)).toEqual(['due:2000-01-01']);
  });

  it('tints nothing when syntax highlighting is off', () => {
    // The tint belongs to the syntax layer, which the user can switch off.
    const { container } = render(
      <CmEditor value={DOC} onChange={vi.fn()} syntaxHighlight={false} />,
    );
    expect(tinted(container, PAST)).toEqual([]);
  });
});
