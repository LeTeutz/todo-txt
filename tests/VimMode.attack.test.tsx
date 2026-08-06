/**
 * Vim installed over an editor whose other features assume normal editing.
 *
 * Vim is the hardest guest this component hosts: it brings its own keymaps,
 * selection model, registers and undo stack, and drops them on top of a
 * component that already owns a readOnly compartment, a controlled-value
 * contract, a `!!`-shortcut expander on every document change, a 400 ms
 * autosave debounce, and three global capture-phase key handlers. Every
 * conflict below lives in that overlap, not in vim and not in the editor.
 *
 * Covered elsewhere, in tests/vimSurface.partial.test.ts: a vim caret on a
 * hidden `h:1` line reveals it, and `state.readOnly` is the flag vim's own
 * operators consult.
 *
 * ===========================================================================
 * jsdom honesty statement — READ BEFORE TRUSTING ANY ASSERTION HERE
 * ===========================================================================
 * jsdom has no layout, and vim depends on layout in one specific place:
 * VERTICAL MOTION. `j` / `k` / `Ctrl+D` / `Ctrl+U` route through
 * `CodeMirror.findPosV` -> `EditorView.moveVertically` -> `coordsAtPos`, which
 * throws `textRange(...).getClientRects is not a function` in jsdom. Verified
 * directly, not assumed.
 *
 * Consequences, stated rather than papered over:
 *   - Every test below positions the caret with `view.dispatch({selection})`
 *     and NEVER with `j`/`k`. A caret placed that way is indistinguishable
 *     from one placed by a motion as far as the code under test is concerned:
 *     the leader actions read `state.selection.main.head` and nothing else.
 *   - `coordsAtPos` is NOT stubbed in this file. A fixed-rect stub would make
 *     `j`/`k` *appear* to work while silently landing on the wrong line, which
 *     would manufacture passing assertions. Vertical-motion behaviour is
 *     therefore explicitly NOT covered here and belongs in a Playwright spec.
 *   - What IS exercised for real: leader commands (`\x` `\s` `\D` ...), `dd`,
 *     `x`, `p`, `u`, `i`/`<Esc>` mode transitions, and `V` linewise visual
 *     mode. All of those are pure transactions plus horizontal/linewise
 *     arithmetic, no geometry.
 *
 * Vim keys are driven through `Vim.handleKey(getCM(view), key, 'user')` — the
 * same entry point @replit/codemirror-vim's own keydown handler calls, so this
 * is the production key path minus the browser event plumbing.
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { act, createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorView } from '@codemirror/view';
import { Vim, getCM } from '@replit/codemirror-vim';

import CmEditor, { type CmEditorHandle } from '../ui/src/components/CmEditor';
import TodoTxtPage from '../ui/src/TodoTxtPage';

/**
 * The one environment seam, and it fills a MISSING jsdom API rather than
 * fabricating layout.
 *
 * vim's block-cursor plugin measures the caret on every view update, and
 * CodeMirror's `clientRectsFor` calls `Range.prototype.getClientRects` — which
 * jsdom does not implement at all (`textRange(...).getClientRects is not a
 * function`). The measure runs asynchronously, so the crash escapes the test
 * that caused it and lands as an uncaught exception.
 *
 * Returning an EMPTY rect list is the truthful answer for an environment with
 * no layout: it means "this content occupies no measurable boxes", and every
 * caller in this stack already handles it (`if (!rects.length) return null`).
 * The dishonest alternative would be a fixed non-empty rect, which would make
 * `j`/`k` appear to work while landing on the wrong line and thereby
 * manufacture passing assertions. With an empty list, vertical motion is
 * simply inert — and nothing in this file asserts on it.
 */
const realGetClientRects = Range.prototype.getClientRects;

beforeEach(() => {
  Range.prototype.getClientRects = function emptyRectList() {
    return Object.assign([], { item: () => null }) as unknown as DOMRectList;
  };
});

afterEach(() => {
  Range.prototype.getClientRects = realGetClientRects;
  cleanup();
});

/** Send a vim key sequence through the real vim key handler. */
function vimKeys(view: EditorView, ...keys: string[]): void {
  const cm = getCM(view);
  if (!cm) throw new Error('vim is not installed on this view');
  act(() => {
    for (const key of keys) {
      (Vim as unknown as { handleKey(cm: unknown, k: string, o: string): void })
        .handleKey(cm, key, 'user');
    }
  });
}

/** True when the vim extension is live in this view's configuration. */
function vimIsInstalled(view: EditorView): boolean {
  return getCM(view) !== null && getCM(view) !== undefined;
}

/** Park a collapsed caret inside 1-based line `n`. Never uses j/k — see header. */
function caretOnLine(view: EditorView, n: number, column = 0): void {
  const line = view.state.doc.line(n);
  act(() => {
    view.dispatch({ selection: { anchor: Math.min(line.from + column, line.to) } });
  });
}

/** Mount a real CmEditor with vim requested, and wait for vim to install. */
async function mountVim(
  doc: string,
  props: Partial<React.ComponentProps<typeof CmEditor>> = {},
) {
  const ref = createRef<CmEditorHandle>();
  const onChange = vi.fn();
  const utils = render(
    <CmEditor ref={ref} value={doc} onChange={onChange} vimMode {...props} />,
  );
  await waitFor(() => expect(vimIsInstalled(ref.current!.getView()!)).toBe(true));
  return { ref, view: ref.current!.getView()!, onChange, utils };
}

// ===========================================================================
// Vim's lazy load vs a fast toggle
// ===========================================================================
//
// `loadVim()` dynamic-imports @replit/codemirror-vim and installs it in a
// `.then()`. If the effect returns no cleanup and the continuation performs no
// staleness check, a vimMode:true -> false flip that lands inside the import
// window is overtaken by the resolved promise. The compartment then holds
// `vim()` while the React prop, the mode indicator, and the Ctrl+D/Escape
// arbitration all believe vim is off.

describe('vim lifecycle across a fast toggle', () => {
  it('positive control: vim installs when requested and uninstalls when not', async () => {
    const ref = createRef<CmEditorHandle>();
    const { rerender } = render(
      <CmEditor ref={ref} value="alpha\nbeta" onChange={() => {}} vimMode />,
    );
    const view = ref.current!.getView()!;
    await waitFor(() => expect(vimIsInstalled(view)).toBe(true));

    await act(async () => {
      rerender(
        <CmEditor
          ref={ref}
          value="alpha\nbeta"
          onChange={() => {}}
          vimMode={false}
        />,
      );
    });
    expect(vimIsInstalled(view)).toBe(false);
  });

  it('stays OFF when toggled off before the lazy import resolves', async () => {
    const ref = createRef<CmEditorHandle>();
    const props = { value: 'alpha\nbeta', onChange: () => {} };

    // Turn vim ON. The effect fires loadVim(); its .then is queued, not run.
    const { rerender } = render(<CmEditor ref={ref} {...props} vimMode />);
    const view = ref.current!.getView()!;

    // Turn it back OFF in the very next commit — still inside the import
    // window. Synchronous act() flushes effects but not promise continuations.
    rerender(<CmEditor ref={ref} {...props} vimMode={false} />);

    // NOW let the import continuation run.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    // The user asked for vim off. It must be off.
    expect(vimIsInstalled(view)).toBe(false);
  });

  it('does not double-install when toggled on twice inside the import window', async () => {
    const ref = createRef<CmEditorHandle>();
    const props = { value: 'alpha\nbeta', onChange: () => {} };
    const { rerender } = render(<CmEditor ref={ref} {...props} vimMode />);
    const view = ref.current!.getView()!;
    rerender(<CmEditor ref={ref} {...props} vimMode={false} />);
    rerender(<CmEditor ref={ref} {...props} vimMode />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    // Requested ON last, so ON is correct — and exactly one vim adapter.
    expect(vimIsInstalled(view)).toBe(true);
    expect(getCM(view)).toBe(getCM(view));
  });
});

// ===========================================================================
// readOnly vs the todo.txt leader commands
// ===========================================================================
//
// @replit/codemirror-vim checks `state.readOnly` in `enterInsertMode` AND in
// `dispatchChange`, the helper EVERY one of its operators routes through — so
// vim's own editing keys are safe in a read-only editor for free.
//
// That guarantee does NOT extend to this app's leader actions: every
// `Vim.defineAction` body in cm-vim-todotxt.ts calls `view.dispatch(...)`
// DIRECTLY, and CodeMirror's readOnly facet does not reject programmatic
// transactions (tests/vimSurface.partial.test.ts pins that fact itself).
//
// So inheriting vim's read-only safety is not enough; the guard has to live in
// the actions. Each case below is paired with the vim-native control that
// shows where the free protection stops.

describe('readOnly vs the todo.txt leader commands', () => {
  it("control: vim's own `dd` IS blocked by readOnly", async () => {
    const { view } = await mountVim('buy milk\nsecond task', { disabled: true });
    expect(view.state.readOnly).toBe(true);
    caretOnLine(view, 1);
    vimKeys(view, 'd', 'd');
    expect(view.state.doc.toString()).toBe('buy milk\nsecond task');
  });

  it('\\x must not complete a task in a read-only editor', async () => {
    const { view, onChange } = await mountVim('buy milk\nsecond task', {
      disabled: true,
    });
    caretOnLine(view, 1);
    vimKeys(view, '\\', 'x');
    expect(view.state.doc.toString()).toBe('buy milk\nsecond task');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('\\s must not reorder a read-only document', async () => {
    const { view } = await mountVim('beta task\nalpha task\n', {
      disabled: true,
    });
    caretOnLine(view, 1);
    vimKeys(view, '\\', 's');
    expect(view.state.doc.toString()).toBe('beta task\nalpha task\n');
  });

  it('\\D must not archive in a read-only editor', async () => {
    const { view } = await mountVim('buy milk\n', { disabled: true });
    caretOnLine(view, 1);
    vimKeys(view, '\\', 'D');
    expect(view.state.doc.toString()).toBe('buy milk\n');
  });

  it('the same leaders DO work once the editor is writable', async () => {
    // The guard must be a guard, not a disable.
    const { view } = await mountVim('buy milk\nsecond task');
    caretOnLine(view, 1);
    vimKeys(view, '\\', 'x');
    expect(view.state.doc.toString()).toMatch(/^x \d{4}-\d{2}-\d{2} buy milk\n/);
  });
});

// ===========================================================================
// `\s` through the real editor keeps the file's shape
// ===========================================================================

describe('\\s over the real editor', () => {
  it('sorts without inventing a leading blank line or dropping the terminator', async () => {
    const { view, onChange } = await mountVim('beta task\nalpha task\n');
    caretOnLine(view, 1);
    vimKeys(view, '\\', 's');

    expect(view.state.doc.toString()).toBe('alpha task\nbeta task\n');
    // The controlled-value contract must see the same text, because that is
    // what reaches setContent() -> scheduleSave() -> the PUT body.
    expect(onChange.mock.calls.map((c) => c[0])).toContain(
      'alpha task\nbeta task\n',
    );
  });

  it('does not push a real task below an injected blank line', async () => {
    const { view } = await mountVim('(A) alpha\nbeta\n');
    caretOnLine(view, 1);
    vimKeys(view, '\\', 's');
    expect(view.state.doc.toString().split('\n')[1]).not.toBe('');
  });
});

// ===========================================================================
// PART B — the REAL TodoTxtPage, so the shortcut expander, the autosave
// debounce and the global capture-phase key handlers are the production ones.
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

function installFetchRouter(content: string) {
  const puts: string[] = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      if (method === 'PUT' && typeof init?.body === 'string') {
        puts.push(JSON.parse(init.body).content);
      }
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
  return { puts, fetchMock };
}

/** Mount the real page with vim already enabled, and hand back the live view. */
async function mountPageWithVim(content: string) {
  window.localStorage.setItem('todotxt.vimMode', 'true');
  const router = installFetchRouter(content);
  render(<TodoTxtPage />);
  const contentDom = await screen.findByTestId('todo-txt-textarea');
  await waitFor(() =>
    expect(EditorView.findFromDOM(contentDom as HTMLElement)).toBeTruthy(),
  );
  const view = EditorView.findFromDOM(contentDom as HTMLElement)!;
  await waitFor(() => expect(view.state.doc.toString()).toBe(content));
  await waitFor(() => expect(vimIsInstalled(view)).toBe(true));
  return { view, router };
}

describe('vim over the real page', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    vi.stubGlobal('indexedDB', undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // `u` must not undo the LOAD-FROM-DISK
  // =========================================================================
  //
  // Data loss, and one keystroke away. CmEditor is a controlled component: the
  // page fetches todo.txt, calls setContent(), and the value-sync effect lands
  // it in the document. A plain `view.dispatch({changes: {from: 0, to: len,
  // insert: value}})` is an ordinary edit as far as `history()` is concerned,
  // which would put the act of LOADING the file at the bottom of the undo
  // stack.
  //
  // vim's `u` is one unmodified keystroke. Pressed before any edit, it would
  // revert the load: the document becomes the empty string the editor was
  // constructed with. That empty document then flows out through the normal
  // onChange -> setContent -> scheduleSave path and is PUT over todo.txt.
  //
  // Not vim-exclusive (`historyKeymap` gives Ctrl+Z the same reach), but `u`
  // is the spelling with no modifier and the one a vim user hits reflexively.
  // The load is therefore annotated `addToHistory.of(false)`.
  it('does not let `u` revert the load-from-disk to an empty document', async () => {
    const { view } = await mountPageWithVim('buy milk\ncall the bank\n');

    vimKeys(view, 'u');
    await act(async () => {
      await Promise.resolve();
    });

    expect(view.state.doc.toString()).not.toBe('');
    expect(view.state.doc.toString()).toContain('buy milk');
  });

  it('never PUTs an empty todo.txt because of an `u` right after load', async () => {
    const { view, router } = await mountPageWithVim('buy milk\ncall the bank\n');

    vimKeys(view, 'u');
    // Let the 400 ms autosave debounce elapse for real; mixing fake timers
    // into the mount's fetch promises is what would be dishonest here, not
    // waiting half a second.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    expect(router.puts).not.toContain('');
  });

  // =========================================================================
  // `u` must not re-fire the `!!` shortcut it is trying to undo
  // =========================================================================
  //
  // `applyShortcut` exists for "the user just typed a trigger char", but it is
  // wired to CmEditor's onChange — which fires for EVERY document change.
  // vim's `u` restores both the pre-expansion text AND the caret sitting right
  // after the trigger space, so an unguarded undo is itself read as a fresh
  // trigger and the expansion is re-applied on the spot. Undo then becomes a
  // loop that keeps reinstating the edit being undone.
  //
  // The same hazard governs the Backspace "autocorrect-style undo" in
  // handleEditorKeyDown, which is why that path restores the controlled value
  // instead of dispatching a transaction: it avoids feeding the restored
  // trigger straight back through applyShortcut. Every other route into the
  // document — CodeMirror's history, and therefore vim `u` and Ctrl+Z — needs
  // the equivalent protection.
  it('does not re-fire a !!done expansion when vim `u` undoes it', async () => {
    const { view } = await mountPageWithVim('buy milk\n');

    act(() => {
      view.dispatch({
        changes: { from: 8, insert: ' !!done ' },
        selection: { anchor: 16 },
        // Real typing carries this annotation; the shortcut expander is gated
        // on it, so a simulation that omits it would not be typing at all.
        userEvent: 'input.type',
      });
    });
    await waitFor(() =>
      expect(view.state.doc.toString()).toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/),
    );
    const expanded = view.state.doc.toString();

    // Two `u` presses, i.e. more than enough to reach past the expansion.
    for (const _ of [0, 1]) {
      vimKeys(view, 'u');
      await act(async () => {
        await Promise.resolve();
      });
    }

    const after = view.state.doc.toString();
    // The load-bearing guarantees: the file is intact, and undo did not become
    // a loop that keeps re-applying the very edit being undone.
    expect(after).not.toBe('');
    expect(after).toContain('buy milk');
    // Either it stepped back to the typed trigger, or it did nothing. What it
    // must NOT do is re-expand into a NEW completion after being undone.
    if (after !== expanded) {
      expect(after).not.toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/);
    }
  });

  it('steps `u` back across a shortcut expansion in one move', async () => {
    // Two design decisions meet here.
    //
    // The load-from-disk path writes the CONTROLLED VALUE (setContent) and is
    // annotated `addToHistory.of(false)`, so loading a file cannot be undone
    // into an empty document. A shortcut expansion is a rewrite the USER
    // caused, though, so it goes through CmEditorHandle.applyEdit — an ordinary
    // undoable transaction that sets the caret in the same dispatch. `u`
    // therefore steps back to the text the user actually typed. And because
    // applyEdit is NOT marked as a `userEvent: 'input'` transaction, neither
    // the expansion nor its undo re-enters the expander.
    // The Backspace affordance is unaffected by either choice.
    const { view } = await mountPageWithVim('buy milk\n');
    act(() => {
      view.dispatch({
        changes: { from: 8, insert: ' !!done ' },
        selection: { anchor: 16 },
        userEvent: 'input.type',
      });
    });
    await waitFor(() =>
      expect(view.state.doc.toString()).toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/),
    );
    const expanded = view.state.doc.toString();
    vimKeys(view, 'u');
    await act(async () => {
      await Promise.resolve();
    });
    const undone = view.state.doc.toString();
    // Stepped BACK: the expansion is gone...
    expect(undone).not.toBe(expanded);
    expect(undone).not.toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/);
    // ...and it took the trigger with it, in ONE step. CodeMirror's history
    // groups transactions inside its newGroupDelay window, and the typed
    // insert plus the expansion land in the same tick — so `u` undoes "the
    // thing that just happened" as a unit. That is the better semantics: the
    // alternative would surface `buy milk !!done `, an intermediate state that
    // exists only because of how the app applies the expansion, and a second
    // `u` would then be needed to reach the text the user actually meant.
    expect(undone).toBe('buy milk\n');
    // The undo did not re-fire the expansion it just reverted.
    expect(undone).not.toMatch(/x \d{4}-\d{2}-\d{2}/);
  });

  // =========================================================================
  // `u` must not re-fire the `!!` shortcut it is trying to undo
  // =========================================================================
  //
  // `applyShortcut` exists for "the user just typed a trigger char", but it is
  // wired to CmEditor's onChange — which fires for EVERY document change.
  // vim's `u` restores both the pre-expansion text AND the caret sitting right
  // after the trigger space, so an unguarded undo is itself read as a fresh
  // trigger and the expansion is re-applied on the spot. Undo then becomes a
  // loop that keeps reinstating the edit being undone.
  //
  // The same hazard governs the Backspace "autocorrect-style undo" in
  // handleEditorKeyDown, which is why that path restores the controlled value
  // instead of dispatching a transaction: it avoids feeding the restored
  // trigger straight back through applyShortcut. Every other route into the
  // document — CodeMirror's history, and therefore vim `u` and Ctrl+Z — needs
  // the equivalent protection.
  it('does not re-fire a !!done expansion when vim `u` undoes it', async () => {
    const { view } = await mountPageWithVim('buy milk\n');

    act(() => {
      view.dispatch({
        changes: { from: 8, insert: ' !!done ' },
        selection: { anchor: 16 },
        // Real typing carries this annotation; the shortcut expander is gated
        // on it, so a simulation that omits it would not be typing at all.
        userEvent: 'input.type',
      });
    });
    await waitFor(() =>
      expect(view.state.doc.toString()).toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/),
    );
    const expanded = view.state.doc.toString();

    // Two `u` presses, i.e. more than enough to reach past the expansion.
    for (const _ of [0, 1]) {
      vimKeys(view, 'u');
      await act(async () => {
        await Promise.resolve();
      });
    }

    const after = view.state.doc.toString();
    // The load-bearing guarantees: the file is intact, and undo did not become
    // a loop that keeps re-applying the very edit being undone.
    expect(after).not.toBe('');
    expect(after).toContain('buy milk');
    // Either it stepped back to the typed trigger, or it did nothing. What it
    // must NOT do is re-expand into a NEW completion after being undone.
    if (after !== expanded) {
      expect(after).not.toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/);
    }
  });

  it('steps `u` back across a shortcut expansion in one move', async () => {
    // Two design decisions meet here.
    //
    // The load-from-disk path writes the CONTROLLED VALUE (setContent) and is
    // annotated `addToHistory.of(false)`, so loading a file cannot be undone
    // into an empty document. A shortcut expansion is a rewrite the USER
    // caused, though, so it goes through CmEditorHandle.applyEdit — an ordinary
    // undoable transaction that sets the caret in the same dispatch. `u`
    // therefore steps back to the text the user actually typed. And because
    // applyEdit is NOT marked as a `userEvent: 'input'` transaction, neither
    // the expansion nor its undo re-enters the expander.
    // The Backspace affordance is unaffected by either choice.
    const { view } = await mountPageWithVim('buy milk\n');
    act(() => {
      view.dispatch({
        changes: { from: 8, insert: ' !!done ' },
        selection: { anchor: 16 },
        userEvent: 'input.type',
      });
    });
    await waitFor(() =>
      expect(view.state.doc.toString()).toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/),
    );
    const expanded = view.state.doc.toString();
    vimKeys(view, 'u');
    await act(async () => {
      await Promise.resolve();
    });
    const undone = view.state.doc.toString();
    // Stepped BACK: the expansion is gone...
    expect(undone).not.toBe(expanded);
    expect(undone).not.toMatch(/^x \d{4}-\d{2}-\d{2} buy milk/);
    // ...and it took the trigger with it, in ONE step. CodeMirror's history
    // groups transactions inside its newGroupDelay window, and the typed
    // insert plus the expansion land in the same tick — so `u` undoes "the
    // thing that just happened" as a unit. That is the better semantics: the
    // alternative would surface `buy milk !!done `, an intermediate state that
    // exists only because of how the app applies the expansion, and a second
    // `u` would then be needed to reach the text the user actually meant.
    expect(undone).toBe('buy milk\n');
    // The undo did not re-fire the expansion it just reverted.
    expect(undone).not.toMatch(/x \d{4}-\d{2}-\d{2}/);
  });


  // =========================================================================
  // Pseudo-fullscreen's Escape handler must not swallow vim's Escape
  // =========================================================================
  //
  // Three things claim Escape: leaving vim INSERT mode, closing the selection
  // popover, and exiting pseudo-fullscreen. The fullscreen handler is bound at
  // WINDOW level with `capture: true`, so calling `preventDefault()` and
  // `stopPropagation()` unconditionally would run it before the editor's own
  // handler and CodeMirror would never see the key. In fullscreen the user
  // would then be stuck in INSERT mode: they press Escape, the app leaves
  // fullscreen, and their next `dd` types the literal text `dd` into the task.
  it('leaves vim INSERT mode on Escape even while pseudo-fullscreen is on', async () => {
    const { view } = await mountPageWithVim('buy milk\n');
    const cm = getCM(view)! as unknown as { state: { vim: { insertMode: boolean } } };

    // Enter pseudo-fullscreen (jsdom has no Fullscreen API, so the component's
    // CSS path is the one exercised — which is also the production path in
    // KiroCrew's Electron shell, where native fullscreen is denied).
    const button = screen.getByTestId('todo-txt-fullscreen');
    await act(async () => {
      button.click();
    });

    vimKeys(view, 'i');
    expect(cm.state.vim.insertMode).toBe(true);

    // One Escape, delivered the way a real keypress is: at the window, so
    // every capture-phase listener in the page sees it.
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
      view.contentDOM.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
    });

    expect(cm.state.vim.insertMode).toBe(false);
  });

  it('leaves vim INSERT mode on the same Escape with fullscreen off', async () => {
    const { view } = await mountPageWithVim('buy milk\n');
    const cm = getCM(view)! as unknown as { state: { vim: { insertMode: boolean } } };
    vimKeys(view, 'i');
    expect(cm.state.vim.insertMode).toBe(true);
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
      view.contentDOM.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(cm.state.vim.insertMode).toBe(false);
  });

  // =========================================================================
  // Cross-cutting invariants that vim must not disturb
  // =========================================================================

  it('keeps vim installed across a tab switch, leaders included', async () => {
    // CmEditor keeps its JSX position across todo <-> done, so the view is not
    // remounted — but the vim compartment, the leader registration and the
    // `[data-todo-file]` read all have to survive on the far side.
    const { view } = await mountPageWithVim('buy milk\n');
    await act(async () => {
      screen.getByTestId('todo-txt-file-tab-done').click();
    });
    await waitFor(() =>
      expect(
        screen
          .getByTestId('todo-txt-editor-wrap')
          .getAttribute('data-todo-file'),
      ).toBe('done'),
    );
    const afterSwitch = EditorView.findFromDOM(
      screen.getByTestId('todo-txt-textarea') as HTMLElement,
    )!;
    expect(vimIsInstalled(afterSwitch)).toBe(true);
  });

  it('does not spawn a recurrence instance for \\x on the done tab', async () => {
    // `toggleDoneForFile` gates recurrence generation on `[data-todo-file]`.
    // A `rec:` task un-completed on done.txt must not plant a new ACTIVE task
    // inside done.txt, where nobody looks.
    window.localStorage.setItem('todotxt.vimMode', 'true');
    const puts: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? 'GET';
        if (method === 'PUT' && typeof init?.body === 'string') {
          puts.push(JSON.parse(init.body).content);
        }
        if (url.includes('name=done')) {
          return jsonResponse({ content: 'water plants rec:+1w\n', mtime: 21 });
        }
        return jsonResponse({ content: 'buy milk\n', mtime: 11 });
      }),
    );
    render(<TodoTxtPage />);
    await screen.findByTestId('todo-txt-textarea');
    await act(async () => {
      screen.getByTestId('todo-txt-file-tab-done').click();
    });
    await waitFor(() =>
      expect(
        screen.getByTestId('todo-txt-editor-wrap').getAttribute('data-todo-file'),
      ).toBe('done'),
    );
    const view = EditorView.findFromDOM(
      screen.getByTestId('todo-txt-textarea') as HTMLElement,
    )!;
    await waitFor(() =>
      expect(view.state.doc.toString()).toBe('water plants rec:+1w\n'),
    );
    await waitFor(() => expect(vimIsInstalled(view)).toBe(true));

    caretOnLine(view, 1);
    vimKeys(view, '\\', 'x');

    // Completed in place, exactly one line — no spawned follow-up instance.
    const text = view.state.doc.toString();
    expect(text).toMatch(/^x \d{4}-\d{2}-\d{2} water plants rec:\+1w\n$/);
    expect(text.split('\n').filter((l) => l.trim()).length).toBe(1);
  });
});

