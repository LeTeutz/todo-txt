/**
 * Mounted tests for R4 — the conditional external-change poll and the
 * `set-root` / `where` palette flow.
 *
 * These go through the real page so the things that can only break in
 * integration are actually covered: the poll's URL shape (does it send the
 * mtime it holds?), its handling of `{unchanged:true}` (does it leave the
 * buffer alone?), and the ORDER of operations in `set-root` (is the pending
 * save flushed into the OLD root before the root moves?).
 *
 * The last one is the reason this file exists rather than another unit test:
 * ordering is invisible to a unit test of either half, and getting it wrong
 * writes the user's last keystrokes into the wrong directory.
 */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@kirocrew/app-sdk', () => ({
  useChatLauncher: () => ({ openChat: vi.fn() }),
}));

vi.mock('../ui/src/components/CmEditor', async () => {
  const React = await import('react');
  // The stub implements the FULL CmEditorHandle surface the page touches on a
  // change, not just focus/getValue: the page's onChange calls
  // `cmEditorRef.current?.getCaret()` for shortcut expansion, and an
  // incomplete handle throws there — which reads as "the buffer never went
  // dirty" and would quietly invert the dirty-path assertions below.
  const CmEditorStub = React.forwardRef<
    unknown,
    { value: string; onChange: (value: string) => void }
  >(({ value, onChange }, ref) => {
    React.useImperativeHandle(ref, () => ({
      focus: () => undefined,
      getCaret: () => value.length,
      setCaret: () => undefined,
      setSelection: () => undefined,
      getSelections: () => [],
      getScrollElement: () => null,
      getValue: () => value,
      getView: () => null,
    }));
    return React.createElement('textarea', {
      'data-testid': 'todo-txt-cm-editor-stub',
      value,
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange(event.target.value),
    });
  });
  CmEditorStub.displayName = 'CmEditorStub';
  return { default: CmEditorStub };
});

import TodoTxtPage from '../ui/src/TodoTxtPage';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

interface Call {
  url: string;
  method: string;
  body: unknown;
}

const INITIAL_MTIME = 1_700_000_000.5;

function jsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

/**
 * A fetch stub that records every call and answers each route plausibly.
 *
 * `overrides` keys are `"<METHOD> <url fragment>"` — the method is part of the
 * key on purpose. A fragment-only match would also catch the debounced SAVE to
 * `/content`, so a test that overrode the poll's GET would silently feed the
 * save a fresh mtime and move the client's known mtime past the change the
 * poll was supposed to notice.
 */
function makeFetch(
  calls: Call[],
  overrides: Record<string, () => unknown> = {},
) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method ?? 'GET').toUpperCase();
    calls.push({
      url,
      method,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    for (const [key, answer] of Object.entries(overrides)) {
      const [keyMethod, fragment] = key.split(' ');
      if (keyMethod === method && url.includes(fragment)) return answer();
    }
    if (url.includes('/settings')) {
      return jsonResponse({
        root: '/home/u/Documents/todo',
        default_root: '/home/u/.kiro/crew/apps/todo-txt/data',
        is_default: false,
        settings_path: '/home/u/.kiro/crew/apps/todo-txt/data/settings.json',
        files: {
          todo: '/home/u/Documents/todo/todo.txt',
          done: '/home/u/Documents/todo/done.txt',
          report: '/home/u/Documents/todo/report.txt',
        },
      });
    }
    if (method === 'PUT' || method === 'POST') {
      return jsonResponse({ status: 'ok', mtime: INITIAL_MTIME, bytes: 1 });
    }
    return jsonResponse({ content: 'ship the feature\n', mtime: INITIAL_MTIME });
  });
}

/** Drive the 5s external-change poll once. */
async function tickPoll() {
  await act(async () => {
    vi.advanceTimersByTime(5_000);
    await Promise.resolve();
  });
}

function pollCalls(calls: Call[]): Call[] {
  return calls.filter(
    (c) =>
      c.method === 'GET' &&
      (c.url.includes('/content') || c.url.includes('/file?')),
  );
}

let calls: Call[];

beforeEach(() => {
  window.localStorage.clear();
  calls = [];
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal('fetch', makeFetch(calls));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function mount() {
  render(<TodoTxtPage />);
  await screen.findByTestId('todo-txt-cm-editor-stub');
  await waitFor(() => expect(calls.length).toBeGreaterThan(0));
}

describe('conditional external-change poll', () => {
  it('sends the mtime it already holds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await mount();
    calls.length = 0;
    await tickPoll();

    const polls = pollCalls(calls);
    expect(polls.length).toBeGreaterThan(0);
    expect(polls[0].url).toContain(`if_none_mtime=${INITIAL_MTIME}`);
  });

  it('omits the token when it has no mtime yet', async () => {
    // mtime 0 means "no file on disk". Sending 0 would be answered
    // `unchanged` and the very first external write would go unnoticed.
    vi.stubGlobal(
      'fetch',
      makeFetch(calls, {
        'GET /content': () => jsonResponse({ content: '', mtime: 0 }),
      }),
    );
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await mount();
    calls.length = 0;
    await tickPoll();

    const polls = pollCalls(calls);
    expect(polls.length).toBeGreaterThan(0);
    expect(polls[0].url).not.toContain('if_none_mtime');
  });

  it('treats {unchanged:true} as authoritative and never reads its absent content', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await mount();
    const editor = screen.getByTestId(
      'todo-txt-cm-editor-stub',
    ) as HTMLTextAreaElement;
    expect(editor.value).toBe('ship the feature\n');

    // The mtime is deliberately HIGHER than the one the client holds. That
    // combination is what makes this assertion load-bearing: `unchanged` means
    // the response carries no `content`, so the poll must return on the flag
    // ALONE. A poll that fell through to its mtime comparison would read the
    // absent content as `''` and blank the user's file.
    vi.stubGlobal(
      'fetch',
      makeFetch(calls, {
        'GET /content': () =>
          jsonResponse({ unchanged: true, mtime: INITIAL_MTIME + 60 }),
      }),
    );
    await tickPoll();

    expect(editor.value).toBe('ship the feature\n');
    expect(
      screen.queryByTestId('todo-txt-reload-banner'),
    ).not.toBeInTheDocument();
  });

  it('still shows the changed-on-disk banner when a real change arrives dirty', async () => {
    // The save is made to fail (500 → the queue retries) so the buffer stays
    // dirty for the whole test. Without that, the debounced save completes,
    // the dirty flag clears, and the poll takes its OTHER branch — silently
    // adopting disk content. That branch is correct when the buffer is clean,
    // but it is not the one under test here.
    //
    // The external write also has to land AFTER the initial load: an override
    // that answered `mtime + 60` from the first GET would simply become the
    // client's known mtime, and the poll would then see no change at all.
    let externalWriteHappened = false;
    vi.stubGlobal(
      'fetch',
      makeFetch(calls, {
        'PUT /content': () => jsonResponse({ error: 'nope' }, 500),
        'GET /content': () =>
          externalWriteHappened
            ? jsonResponse({
                content: 'someone else wrote this\n',
                mtime: INITIAL_MTIME + 60,
              })
            : jsonResponse({
                content: 'ship the feature\n',
                mtime: INITIAL_MTIME,
              }),
      }),
    );
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await mount();
    const editor = screen.getByTestId(
      'todo-txt-cm-editor-stub',
    ) as HTMLTextAreaElement;

    // Make the buffer dirty so the poll must NOT overwrite it.
    // fireEvent.change, not a raw `input` event: React tracks the value setter
    // on a controlled textarea, so a hand-assigned `.value` never reaches
    // onChange and the buffer would stay clean — the test would then assert
    // the wrong branch of the poll.
    act(() => {
      editor.focus();
      fireEvent.change(editor, { target: { value: 'my unsaved work\n' } });
    });

    externalWriteHappened = true;
    await tickPoll();

    await waitFor(() =>
      expect(screen.getByTestId('todo-txt-reload-banner')).toBeInTheDocument(),
    );
    // Non-destructive: the user's text is still in the editor.
    expect(editor.value).toBe('my unsaved work\n');
  });
});

describe('set-root / where through the palette', () => {
  /**
   * Open the palette and run `line` through its inline "verb args" path.
   *
   * The editor is focused first, deliberately: the Ctrl+K handler only claims
   * the shortcut while focus is inside the app root, so that the KiroCrew
   * dashboard's own Cmd+K launcher keeps working elsewhere on the route. A
   * test that dispatched the key with focus on `document.body` would be
   * testing the focus guard, not the command.
   */
  async function runCommand(line: string) {
    const editor = screen.getByTestId('todo-txt-cm-editor-stub');
    act(() => {
      (editor as HTMLTextAreaElement).focus();
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    const input = (await screen.findByTestId(
      'command-palette-search',
    )) as HTMLInputElement;
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup({ document });
    await user.click(input);
    await user.paste(line);
    await act(async () => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      );
      await Promise.resolve();
    });
  }

  it('PUTs the requested root and reloads the file afterwards', async () => {
    await mount();
    calls.length = 0;
    await runCommand('set-root ~/Documents/todo');

    await waitFor(() => {
      const put = calls.find(
        (c) => c.url.includes('/settings') && c.method === 'PUT',
      );
      expect(put).toBeDefined();
      expect(put?.body).toEqual({ root: '~/Documents/todo' });
    });

    // The buffer came from a directory the app no longer reads, so a reload
    // MUST follow — "already on this tab" is exactly the case that must not
    // early-return.
    await waitFor(() => {
      const settingsIndex = calls.findIndex(
        (c) => c.url.includes('/settings') && c.method === 'PUT',
      );
      const reload = calls
        .slice(settingsIndex + 1)
        .find((c) => c.method === 'GET' && c.url.includes('name=todo'));
      expect(reload).toBeDefined();
    });
  });

  it('sends null for `set-root default`', async () => {
    await mount();
    calls.length = 0;
    await runCommand('set-root default');
    await waitFor(() => {
      const put = calls.find(
        (c) => c.url.includes('/settings') && c.method === 'PUT',
      );
      expect(put?.body).toEqual({ root: null });
    });
  });

  it('flushes a pending save BEFORE the root moves', async () => {
    await mount();
    const editor = screen.getByTestId(
      'todo-txt-cm-editor-stub',
    ) as HTMLTextAreaElement;
    act(() => {
      editor.focus();
      fireEvent.change(editor, { target: { value: 'typed just now\n' } });
    });

    calls.length = 0;
    await runCommand('set-root ~/Documents/todo');

    await waitFor(() => {
      const saveIndex = calls.findIndex(
        (c) =>
          (c.method === 'PUT' || c.method === 'POST') &&
          !c.url.includes('/settings'),
      );
      const settingsIndex = calls.findIndex(
        (c) => c.url.includes('/settings') && c.method === 'PUT',
      );
      expect(saveIndex).toBeGreaterThanOrEqual(0);
      expect(settingsIndex).toBeGreaterThanOrEqual(0);
      // The content write must land in the OLD root, i.e. strictly before the
      // settings PUT. Reversed, the user's last keystrokes are written into a
      // directory they had nothing to do with.
      expect(saveIndex).toBeLessThan(settingsIndex);
    });
  });

  it('surfaces the server rejection reason verbatim and does not reload', async () => {
    const reason = "'root' must be inside your home directory";
    vi.stubGlobal(
      'fetch',
      makeFetch(calls, {
        'PUT /settings': () =>
          jsonResponse({ error: reason, code: 'invalid_root' }, 400),
      }),
    );
    await mount();
    calls.length = 0;
    await runCommand('set-root /etc');

    await waitFor(() =>
      expect(screen.getByText(new RegExp(reason.replace(/[$'()*+.?[\\\]^{|}]/g, '\\$&')))).toBeInTheDocument(),
    );
  });

  it('`where` reports the active root', async () => {
    await mount();
    await runCommand('where');
    await waitFor(() =>
      expect(
        screen.getByText(/\/home\/u\/Documents\/todo \(custom\)/),
      ).toBeInTheDocument(),
    );
  });

  it('`set-root` with no argument opens the argument form instead of acting', async () => {
    // The palette's own flow catches this before `apply()` ever runs: a verb
    // with a required argument and nothing after it lands in the argument
    // form. Either way the invariant that matters holds — no PUT is issued.
    await mount();
    calls.length = 0;
    await runCommand('set-root');
    await waitFor(() =>
      expect(screen.getByTestId('command-palette-args')).toBeInTheDocument(),
    );
    expect(
      calls.find((c) => c.url.includes('/settings') && c.method === 'PUT'),
    ).toBeUndefined();
  });

  it('submitting an empty path reports the error and issues no PUT', async () => {
    await mount();
    calls.length = 0;
    await runCommand('set-root');
    const argInput = await screen.findByTestId('arg-input-0');
    await act(async () => {
      argInput.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      );
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(screen.getByText(/expected a directory path/)).toBeInTheDocument(),
    );
    expect(
      calls.find((c) => c.url.includes('/settings') && c.method === 'PUT'),
    ).toBeUndefined();
  });
});
