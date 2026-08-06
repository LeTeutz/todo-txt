/**
 * Mounted tests for P6 — the report tab renders the real ReportChart.
 *
 * The chart component itself is covered by tests/ReportChart.test.tsx; what
 * only integration can break is the PAGE-side wiring: does switching to the
 * Report tab parse the already-loaded content and hand it to the chart via
 * `data` (no second fetch), and does an empty/unparseable report.txt still
 * fall back to the placeholder instead of a zero-point chart?
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@kirocrew/app-sdk', () => ({
  useChatLauncher: () => ({ openChat: vi.fn() }),
}));

vi.mock('../ui/src/components/CmEditor', async () => {
  const React = await import('react');
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

function jsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

/** Two recent snapshots so the chart's 90-day window keeps them. */
function recentReportContent(): string {
  const now = Date.now();
  const a = new Date(now - 2 * 86_400_000).toISOString();
  const b = new Date(now - 1 * 86_400_000).toISOString();
  return `${a} 5 2\n${b} 4 3\n`;
}

function makeFetch(reportContent: string) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method ?? 'GET').toUpperCase();
    if (method === 'GET' && url.includes('name=report')) {
      return jsonResponse({ content: reportContent, mtime: 1 });
    }
    if (url.includes('/settings')) {
      return jsonResponse({
        root: '/home/u/data',
        default_root: '/home/u/data',
        is_default: true,
        settings_path: '/home/u/data/settings.json',
        files: {
          todo: '/home/u/data/todo.txt',
          done: '/home/u/data/done.txt',
          report: '/home/u/data/report.txt',
        },
      });
    }
    if (method === 'PUT' || method === 'POST') {
      return jsonResponse({ status: 'ok', mtime: 1, bytes: 1 });
    }
    return jsonResponse({ content: 'ship the feature\n', mtime: 1 });
  });
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function openReportTab() {
  render(<TodoTxtPage />);
  const tab = await screen.findByRole('tab', { name: /report/i });
  tab.click();
}

describe('report tab chart wiring (P6)', () => {
  it('renders the ReportChart when report.txt has parseable snapshots', async () => {
    vi.stubGlobal('fetch', makeFetch(recentReportContent()));
    await openReportTab();
    await waitFor(() => {
      expect(screen.getByTestId('report-chart')).toBeInTheDocument();
    });
    // The chart must receive page state via `data` — its self-fetch path
    // would issue a SECOND GET for report.txt through a hardcoded URL.
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const reportGets = fetchMock.mock.calls.filter(
      (call) => {
        const [url, init] = call as [unknown, RequestInit | undefined];
        return (
          (init?.method ?? 'GET').toUpperCase() === 'GET' &&
          String(url).includes('name=report')
        );
      },
    );
    expect(reportGets).toHaveLength(1);
  });

  it('keeps the placeholder when report.txt is empty', async () => {
    vi.stubGlobal('fetch', makeFetch(''));
    await openReportTab();
    await waitFor(() => {
      expect(screen.getByTestId('todo-txt-report-body')).toHaveTextContent(
        /No snapshots yet/,
      );
    });
    expect(screen.queryByTestId('report-chart')).not.toBeInTheDocument();
  });

  it('keeps the placeholder when report.txt has only malformed lines', async () => {
    vi.stubGlobal('fetch', makeFetch('not a snapshot\ngarbage 1\n'));
    await openReportTab();
    await waitFor(() => {
      expect(screen.getByTestId('todo-txt-report-body')).toHaveTextContent(
        /No snapshots yet/,
      );
    });
    expect(screen.queryByTestId('report-chart')).not.toBeInTheDocument();
  });
});
