/**
 * Two invariants of the vim surface that carry data-loss risk: a vim caret
 * over a hidden line, and the read-only report tab.
 *
 * A VIM CARET OVER A HIDDEN LINE would be data loss. `hidden hide` gives h:1
 * lines `display: none`, but they remain in the document, so vim's j/k
 * traverse them and `dd` would delete a task the user cannot see. The hide
 * exemption therefore covers every line under every selection range — and a
 * vim caret IS a range, just a collapsed one. The tests below assert that a
 * collapsed range exempts its line, i.e. that moving onto a hidden line
 * reveals it before any operator can touch it. If that regresses, `dd`
 * becomes a silent delete of unseen content.
 *
 * THE READ-ONLY REPORT TAB. report.txt renders with `disabled`, wired to
 * CodeMirror's `EditorState.readOnly` facet. That is a STATE-level block: it
 * is consulted before a document-changing transaction is dispatched, and vim
 * dispatches through the same transactions rather than mutating the DOM, so
 * vim cannot write there. Asserted against the real facet rather than taken
 * on trust, because the backend endpoint behind that tab is append-only and
 * answers 405.
 */
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';

import { selectionExemption } from '../ui/src/components/cm-todotxt-filter';

const DOC = ['alpha first task', 'secret middle task h:1', 'gamma last task'].join(
  '\n',
);

describe('a vim caret on a hidden line reveals it', () => {
  it('exempts the line under a COLLAPSED range (the vim caret)', () => {
    const state = EditorState.create({ doc: DOC });
    // Caret parked inside line 2 (the h:1 line), nothing selected.
    const caret = state.doc.line(2).from + 3;
    const isExempt = selectionExemption(state.doc, [
      { from: caret, to: caret },
    ]);

    expect(isExempt(2)).toBe(true);
    // ...and only that line.
    expect(isExempt(1)).toBe(false);
    expect(isExempt(3)).toBe(false);
  });

  it('exempts every line a visual-mode selection covers', () => {
    const state = EditorState.create({ doc: DOC });
    // Vjj — from line 1 through line 3.
    const isExempt = selectionExemption(state.doc, [
      { from: state.doc.line(1).from, to: state.doc.line(3).to },
    ]);
    expect([1, 2, 3].map(isExempt)).toEqual([true, true, true]);
  });

  it('exempts a caret at the very start and very end of a line', () => {
    const state = EditorState.create({ doc: DOC });
    const line = state.doc.line(2);
    for (const pos of [line.from, line.to]) {
      expect(selectionExemption(state.doc, [{ from: pos, to: pos }])(2)).toBe(
        true,
      );
    }
  });
});

describe('the read-only report tab is what vim consults', () => {
  it('sets state.readOnly, the exact flag vim checks', () => {
    const state = EditorState.create({
      doc: 'report snapshot line\n',
      extensions: [EditorState.readOnly.of(true)],
    });
    // @replit/codemirror-vim reads this in TWO places (verified in
    // node_modules/@replit/codemirror-vim/dist/index.js):
    //   enterInsertMode:  `if (cm.getOption('readOnly')) { return; }`
    //   dispatchChange:   `if (view.state.readOnly) return;`
    // and its getOption('readOnly') maps straight to `cm6.state.readOnly`.
    // dispatchChange is the single helper every vim operator routes document
    // changes through, so dd / x / p / J are all blocked by this one flag.
    expect(state.readOnly).toBe(true);
  });

  it('is false on a writable file (the flag is not hard-coded)', () => {
    const state = EditorState.create({
      doc: 'buy milk\n',
      extensions: [EditorState.readOnly.of(false)],
    });
    expect(state.readOnly).toBe(false);
  });

  it('does NOT block a programmatic transaction — protection is by convention', () => {
    // Worth pinning as a WARNING, not a reassurance. CodeMirror's readOnly
    // facet is advisory: it is honoured by the standard keymap commands and by
    // vim, both of which check it before dispatching, but the transaction
    // system itself applies changes regardless. So any future code path that
    // dispatches its own change into the report tab (a palette verb, an AI
    // edit, a paste handler) will succeed unless IT checks state.readOnly too.
    const state = EditorState.create({
      doc: 'report snapshot line\n',
      extensions: [EditorState.readOnly.of(true)],
    });
    const next = state.update({
      changes: { from: 0, to: 6, insert: 'HACKED' },
    }).state;
    expect(next.doc.toString()).toBe('HACKED snapshot line\n');
  });
});
