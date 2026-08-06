/**
 * Unload-flush coverage for the save pipeline.
 *
 * The pipeline debounces saves by 400 ms and relies on a "flush before the
 * page goes away" path to land the last keystrokes. Listening to `blur` and
 * `beforeunload` alone leaves three real ways to lose up to 400 ms of typing:
 *
 *   - `beforeunload` DOES NOT FIRE on mobile Safari or when the page enters
 *     the back/forward cache. `pagehide` is the event that does.
 *   - `visibilitychange` → hidden is the one signal that fires reliably
 *     across platforms when a tab or window is backgrounded or closed.
 *   - The dashboard is a SINGLE-PAGE APP: navigating away from
 *     /apps/todo-txt UNMOUNTS this component without firing any unload
 *     event at all, so the pending debounce would depend on an orphaned
 *     setTimeout outliving the save queue's disposal.
 *
 * Beacons are queued by the browser and survive the page going away, so
 * firing on `hidden` is safe even when the tab is later restored.
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

const DISK = 'disk copy\n';
const TYPED = 'disk copy\nfresh keystrokes that must not be lost\n';

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

interface Harness {
  beacons: Array<{ url: string; body: string }>;
  keepalive: Array<{ url: string; body: string }>;
}

function installHarness(): Harness {
  const beacons: Array<{ url: string; body: string }> = [];
  const keepalive: Array<{ url: string; body: string }> = [];

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.keepalive) {
        keepalive.push({ url, body: String(init.body ?? '') });
        return jsonResponse({ mtime: 12 });
      }
      if (url.includes('/api/settings')) {
        return jsonResponse({
          root: '/root/data',
          default_root: '/root/data',
          is_default: true,
          settings_path: '/root/data/settings.json',
          files: {},
        });
      }
      if (url.includes('/api/content') || url.includes('/api/file')) {
        return jsonResponse({ content: DISK, mtime: 11 });
      }
      return jsonResponse({});
    }),
  );

  // NOTE: jsdom implements no `navigator.sendBeacon`, so the pipeline takes
  // its documented keepalive-fetch fallback here. That is the channel this
  // harness records — stubbing sendBeacon plus Blob to observe the other
  // branch would test the stubs more than the app. The e2e suite exercises
  // the real beacon path in Chromium.
  return { beacons, keepalive };
}

/** Mount, wait for the disk load, then type so the file is dirty with a
 *  pending debounce (no timers advanced — the flush must not need them). */
async function mountDirty(): Promise<void> {
  render(<TodoTxtPage />);
  const editor = await screen.findByTestId('todo-txt-cm-editor-stub');
  await waitFor(() => expect(editor).toHaveValue(DISK));
  await act(async () => {
    fireEvent.change(editor, { target: { value: TYPED } });
  });
}

function flushed(h: Harness): Array<{ url: string; body: string }> {
  return [...h.beacons, ...h.keepalive];
}

let harness: Harness;

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal('indexedDB', undefined);
  harness = installHarness();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('pagehide flushes pending keystrokes', () => {
  it('sends the unsaved content when the page is hidden via pagehide', async () => {
    await mountDirty();
    expect(flushed(harness)).toHaveLength(0);

    await act(async () => {
      window.dispatchEvent(new Event('pagehide'));
    });

    const sent = flushed(harness);
    expect(sent.length).toBeGreaterThan(0);
    expect(sent.some((s) => s.body.includes('fresh keystrokes'))).toBe(true);
  });
});

describe('visibilitychange → hidden flushes pending keystrokes', () => {
  it('flushes when the document becomes hidden', async () => {
    await mountDirty();
    expect(flushed(harness)).toHaveLength(0);

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    const sent = flushed(harness);
    expect(sent.some((s) => s.body.includes('fresh keystrokes'))).toBe(true);
  });

  it('does NOT flush when the document becomes visible again', async () => {
    await mountDirty();
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(flushed(harness)).toHaveLength(0);
  });
});

describe('unmount is its own unload (SPA route change)', () => {
  it('flushes pending keystrokes when the component unmounts', async () => {
    await mountDirty();
    expect(flushed(harness)).toHaveLength(0);

    // The dashboard navigating away from /apps/todo-txt fires no unload event.
    await act(async () => {
      cleanup();
    });

    const sent = flushed(harness);
    expect(sent.some((s) => s.body.includes('fresh keystrokes'))).toBe(true);
  });
});

describe('the flush payload carries the conflict token', () => {
  it('includes base_mtime so a stale flush is refused, not forced', async () => {
    await mountDirty();
    await act(async () => {
      window.dispatchEvent(new Event('pagehide'));
    });

    const sent = flushed(harness).find((s) =>
      s.body.includes('fresh keystrokes'),
    );
    expect(sent).toBeDefined();
    const parsed = JSON.parse(sent!.body) as Record<string, unknown>;
    expect(parsed.base_mtime).toBe(11);
    // A flush must never smuggle `force` — that would turn "save my last
    // keystrokes" into "clobber whatever is on disk now".
    expect(parsed.force).toBeUndefined();
  });
});
