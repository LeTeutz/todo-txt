import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { forwardRef, useImperativeHandle } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@kirocrew/app-sdk', () => ({
  useChatLauncher: () => ({ openChat: vi.fn() }),
}));

vi.mock('../ui/src/components/CmEditor', async () => {
  const React = await import('react');
  const CmEditorStub = forwardRef<
    {
      focus: () => void;
      getCaret: () => number;
      getView: () => null;
      getSelections: () => never[];
      getScrollElement: () => null;
      getValue: () => string;
      setCaret: () => void;
      setSelection: () => void;
    },
    { value: string; onChange: (value: string) => void }
  >(({ value, onChange }, ref) => {
    useImperativeHandle(ref, () => ({
      focus: () => undefined,
      getCaret: () => value.length,
      getView: () => null,
      getSelections: () => [],
      getScrollElement: () => null,
      getValue: () => value,
      setCaret: () => undefined,
      setSelection: () => undefined,
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

function response(content = 'disk copy\n', mtime = 11) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => ({ content, mtime }),
    text: async () => '',
  };
}

/** Read a beacon payload. Accepts the real `BodyInit | null | undefined` that
 *  navigator.sendBeacon takes, rather than forcing callers to cast every
 *  mock.calls entry to Blob — the casts were what hid these files from the
 *  typechecker's point of view in the first place. */
function readBlob(blob: BodyInit | null | undefined): Promise<string> {
  if (!(blob instanceof Blob)) {
    return Promise.resolve(typeof blob === 'string' ? blob : String(blob));
  }
  return readBlobBody(blob);
}

function readBlobBody(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function installSendBeacon() {
  // Typed with navigator.sendBeacon's real signature, so mock.calls is
  // [string, BodyInit?] and the assertions below need no casts.
  const sendBeacon = vi.fn<(url: string, body?: BodyInit | null) => boolean>(
    () => true,
  );
  Object.defineProperty(navigator, 'sendBeacon', {
    configurable: true,
    value: sendBeacon,
  });
  return sendBeacon;
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal('indexedDB', undefined);
  vi.stubGlobal('fetch', vi.fn(async () => response()));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('TodoTxtPage release resilience', () => {
  it('offers and restores a newer unsaved crash draft without replacing disk silently', async () => {
    window.localStorage.setItem(
      'todo-txt.recovery.v1.todo',
      JSON.stringify({
        version: 1,
        file: 'todo',
        content: 'recovered draft\n',
        baseMtime: 11,
        updatedAt: Date.now(),
      }),
    );

    render(<TodoTxtPage />);

    expect(await screen.findByTestId('todo-txt-recovery-banner')).toHaveTextContent(
      'Unsaved todo.txt draft',
    );
    expect(screen.getByTestId('todo-txt-cm-editor-stub')).toHaveValue(
      'disk copy\n',
    );

    fireEvent.click(screen.getByTestId('todo-txt-recovery-restore'));

    expect(screen.getByTestId('todo-txt-cm-editor-stub')).toHaveValue(
      'recovered draft\n',
    );
    expect(screen.queryByTestId('todo-txt-recovery-banner')).toBeNull();
  });

  it('cycles and persists Automatic, On demand, and Off action-box modes', async () => {
    render(<TodoTxtPage />);
    const toggle = await screen.findByTestId('todo-txt-selection-toolbar-mode');

    expect(toggle).toHaveTextContent('Actions Auto');
    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('Actions Manual');
    expect(window.localStorage.getItem('todo-txt.selection-toolbar.v1')).toBe(
      'on-demand',
    );

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('Actions Off');
    expect(window.localStorage.getItem('todo-txt.selection-toolbar.v1')).toBe(
      'off',
    );
  });

  it('includes base_mtime in the unload beacon and keeps the journal until ack', async () => {
    const sendBeacon = installSendBeacon();
    render(<TodoTxtPage />);
    const editor = await screen.findByTestId('todo-txt-cm-editor-stub');

    fireEvent.change(editor, { target: { value: 'edited locally\n' } });
    fireEvent(window, new Event('beforeunload'));

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeacon.mock.calls[0];
    expect(url).toBe('/apps/todo-txt/api/content');
    await expect(readBlob(blob)).resolves.toContain('"base_mtime":11');
    await waitFor(() =>
      expect(
        window.localStorage.getItem('todo-txt.recovery.v1.todo'),
      ).toContain('edited locally'),
    );
  });

  it('forces an acknowledged save after four seconds of continuous typing', async () => {
    const fetchMock = vi.mocked(fetch);
    render(<TodoTxtPage />);
    const editor = await screen.findByTestId('todo-txt-cm-editor-stub');
    fetchMock.mockClear();
    vi.useFakeTimers();

    fireEvent.change(editor, { target: { value: 'draft 0\n' } });
    for (let index = 1; index <= 10; index += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(399);
      });
      fireEvent.change(editor, { target: { value: `draft ${index}\n` } });
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(11);
    });
    expect(
      fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT'),
    ).toHaveLength(0);

    fireEvent.change(editor, { target: { value: 'deadline draft\n' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const saves = fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT');
    expect(saves).toHaveLength(1);
    expect(String(saves[0][1]?.body)).toContain('deadline draft');
  });

  it('uses a conflict-safe unload beacon for a dirty done.txt draft', async () => {
    const sendBeacon = installSendBeacon();
    render(<TodoTxtPage />);
    const editor = await screen.findByTestId('todo-txt-cm-editor-stub');

    fireEvent.click(screen.getByTestId('todo-txt-file-tab-done'));
    await waitFor(() =>
      expect(screen.getByTestId('todo-txt-file-tab-done')).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    fireEvent.change(editor, { target: { value: 'done draft\n' } });
    fireEvent(window, new Event('beforeunload'));

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeacon.mock.calls[0];
    expect(url).toBe('/apps/todo-txt/api/file?name=done');
    await expect(readBlob(blob)).resolves.toContain('"base_mtime":11');
    await expect(readBlob(blob)).resolves.toContain('done draft');
  });

  it('flushes every dirty writable file on unload', async () => {
    const sendBeacon = installSendBeacon();
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === 'PUT') {
          return {
            ...response('', 0),
            ok: false,
            status: 503,
            text: async () => 'temporarily unavailable',
          };
        }
        return String(input).includes('name=done')
          ? response('done disk\n', 21)
          : response('todo disk\n', 11);
      },
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<TodoTxtPage />);
    const editor = await screen.findByTestId('todo-txt-cm-editor-stub');

    fireEvent.change(editor, { target: { value: 'todo pending\n' } });
    fireEvent.click(screen.getByTestId('todo-txt-file-tab-done'));
    await waitFor(() => expect(editor).toHaveValue('done disk\n'));
    fireEvent.change(editor, { target: { value: 'done pending\n' } });
    fireEvent(window, new Event('beforeunload'));

    const calls = sendBeacon.mock.calls;
    expect(calls.map(([url]) => url)).toEqual([
      '/apps/todo-txt/api/content',
      '/apps/todo-txt/api/file?name=done',
    ]);
    await expect(readBlob(calls[0][1])).resolves.toContain('todo pending');
    await expect(readBlob(calls[1][1])).resolves.toContain('done pending');
  });

  it('ignores an external-edit poll response after switching files', async () => {
    let poll: (() => void) | null = null;
    vi.spyOn(globalThis, 'setInterval').mockImplementation(
      ((handler: () => void, timeout?: number) => {
        if (timeout === 5_000) poll = handler;
        return 1 as unknown as ReturnType<typeof setInterval>;
      }) as typeof setInterval,
    );
    const delayedPoll = deferred<ReturnType<typeof response>>();
    let holdTodoRequest = false;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (holdTodoRequest && url.endsWith('/content')) {
        return delayedPoll.promise;
      }
      return url.includes('name=done')
        ? response('done disk\n', 22)
        : response('todo disk\n', 11);
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<TodoTxtPage />);
    const editor = await screen.findByTestId('todo-txt-cm-editor-stub');

    holdTodoRequest = true;
    expect(poll).not.toBeNull();
    act(() => {
      poll?.();
    });
    fireEvent.click(screen.getByTestId('todo-txt-file-tab-done'));
    await waitFor(() => expect(editor).toHaveValue('done disk\n'));

    await act(async () => {
      delayedPoll.resolve(response('stale todo poll\n', 99));
      await Promise.resolve();
    });

    expect(editor).toHaveValue('done disk\n');
  });

});
