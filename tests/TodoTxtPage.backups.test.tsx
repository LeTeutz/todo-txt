/**
 * Backups modal + reload-from-disk boundary regressions (mounted).
 *
 * Pins the fixes for two recovery-flow breaks found in the backup audit:
 *
 *  1. `onReloadFromDisk` hardcoded `GET /api/content` (todo.txt) but poured
 *     the result into the ACTIVE tab's editor and state slots. Reachable
 *     from the Done tab since the move ungate: after a done-tab restore or
 *     move, the editor displayed todo.txt content labeled done.txt and the
 *     next autosave tried to write it INTO done.txt. Reload must fetch the
 *     active file.
 *
 *  2. The Backups modal always listed the todo family, so done.txt backups
 *     (which archive/move/restore all create) had NO recovery path in the
 *     UI. The modal must list the active tab's family and label it.
 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

/** Route-aware fetch mock covering mount, tab switch, backups, restore. */
function installFetchRouter() {
  const calls: Array<{ url: string; method: string }> = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      calls.push({ url, method });

      if (url.endsWith('/api/content') && method === 'GET') {
        return jsonResponse({ content: 'todo disk\n', mtime: 11 });
      }
      if (url.includes('/api/file?name=done') && method === 'GET') {
        return jsonResponse({ content: 'done disk\n', mtime: 21 });
      }
      if (url.includes('/api/file?name=todo') && method === 'GET') {
        return jsonResponse({ content: 'todo disk\n', mtime: 11 });
      }
      if (url.includes('/api/backups?file=done') && method === 'GET') {
        return jsonResponse({
          file: 'done',
          backups: [
            { name: 'done-1700000000000.txt', bytes: 12, mtime: 1_700_000_000 },
          ],
        });
      }
      if (url.includes('/api/backups?file=todo') && method === 'GET') {
        return jsonResponse({
          file: 'todo',
          backups: [
            { name: 'todo-1700000000001.txt', bytes: 10, mtime: 1_700_000_001 },
          ],
        });
      }
      if (url.includes('/api/backups/done-1700000000000.txt/restore')) {
        return jsonResponse({
          restored: 'done-1700000000000.txt',
          file: 'done',
          mtime: 31,
          bytes: 12,
        });
      }
      if (url.includes('/api/backups/done-1700000000000.txt')) {
        return jsonResponse({
          name: 'done-1700000000000.txt',
          content: 'x old done\n',
        });
      }
      return jsonResponse({ content: '', mtime: 0 });
    },
  );
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, calls };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal('indexedDB', undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Backups modal family routing + reload-from-disk file affinity', () => {
  it('lists the DONE family on the done tab and reloads done.txt after restore', async () => {
    const { calls } = installFetchRouter();
    render(<TodoTxtPage />);
    const editor = await screen.findByTestId('todo-txt-cm-editor-stub');

    // Switch to the done tab.
    fireEvent.click(screen.getByTestId('todo-txt-file-tab-done'));
    await waitFor(() => expect(editor).toHaveValue('done disk\n'));

    // Open Backups — must request the done family and say so in the header.
    fireEvent.click(screen.getByTestId('todo-txt-backups'));
    const modal = await screen.findByTestId('todo-txt-backups-modal');
    expect(modal).toHaveTextContent('Backups — done.txt');
    expect(
      calls.some(
        (c) => c.url.includes('/api/backups?file=done') && c.method === 'GET',
      ),
    ).toBe(true);
    expect(await screen.findByText('done-1700000000000.txt')).toBeInTheDocument();

    // Preview, then restore.
    fireEvent.click(screen.getByText('Preview'));
    const restoreBtn = await screen.findByText(/Restore this backup/);
    calls.length = 0;
    fireEvent.click(restoreBtn);

    await waitFor(() =>
      expect(
        calls.some(
          (c) =>
            c.url.includes('/api/backups/done-1700000000000.txt/restore') &&
            c.method === 'POST',
        ),
      ).toBe(true),
    );

    // The post-restore reload must target the ACTIVE file (done.txt) —
    // never the fixed /api/content endpoint (todo.txt), which used to pour
    // todo content into the done tab's editor and state.
    await waitFor(() =>
      expect(
        calls.some(
          (c) => c.url.includes('/api/file?name=done') && c.method === 'GET',
        ),
      ).toBe(true),
    );
    expect(
      calls.some((c) => c.url.endsWith('/api/content') && c.method === 'GET'),
    ).toBe(false);
    expect(editor).toHaveValue('done disk\n');
  });

  it('lists the TODO family on the todo tab (default view unchanged)', async () => {
    const { calls } = installFetchRouter();
    render(<TodoTxtPage />);
    await screen.findByTestId('todo-txt-cm-editor-stub');

    fireEvent.click(screen.getByTestId('todo-txt-backups'));
    const modal = await screen.findByTestId('todo-txt-backups-modal');
    expect(modal).toHaveTextContent('Backups — todo.txt');
    expect(
      calls.some(
        (c) => c.url.includes('/api/backups?file=todo') && c.method === 'GET',
      ),
    ).toBe(true);
    expect(await screen.findByText('todo-1700000000001.txt')).toBeInTheDocument();
  });
});
