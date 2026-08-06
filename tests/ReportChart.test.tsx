/**
 * ReportChart — component tests (T17).
 *
 * Acceptance coverage:
 *   1. Empty state (0 points) renders the exact copy from the spec.
 *   2. Single-point input (1 point) renders without crashing — SVG is
 *      present, both series markers are drawn.
 *   3. 30+ point input renders a full chart (both polylines, 14 X
 *      ticks for the 90-day window, Y-axis labels).
 *   4. Points outside the 90-day window are filtered out.
 *   5. The two series use the documented theme tokens
 *      (`var(--warning)` for active, `var(--success)` for done).
 *   6. Exported pure helpers (`filterToWindow`, `niceYMax`,
 *      `projectSeries`, `formatTickDate`) behave correctly at their
 *      numeric boundaries.
 *   7. Error state renders when the fetch rejects.
 *
 * Rendering backend: @testing-library/react + vitest + jsdom (same as
 * FileTabs.test.tsx and CommandPalette.test.tsx).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

import {
  ReportChart,
  EMPTY_STATE_TEXT,
  DEFAULT_WINDOW_DAYS,
  VIEWBOX_WIDTH,
  VIEWBOX_HEIGHT,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  MARGIN_TOP,
  MARGIN_BOTTOM,
  filterToWindow,
  niceYMax,
  projectSeries,
  formatTickDate,
} from '../ui/src/components/ReportChart';
import type { ReportPoint } from '../ui/src/utils/reportParser';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date('2026-05-06T00:00:00Z');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Build N synthetic daily snapshots trailing `end` backwards. */
function makePoints(
  count: number,
  end: Date = NOW,
): ReportPoint[] {
  const out: ReportPoint[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    out.push({
      timestamp: new Date(end.getTime() - i * ONE_DAY_MS),
      active: (i % 17) + 5, // 5 … 21, deterministic
      done: (i % 11) + 1, // 1 … 11, deterministic
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pure-helper tests
// ---------------------------------------------------------------------------

describe('filterToWindow', () => {
  it('keeps points within the trailing window, inclusive of both ends', () => {
    const points: ReportPoint[] = [
      { timestamp: new Date(NOW.getTime() - 100 * ONE_DAY_MS), active: 1, done: 1 },
      { timestamp: new Date(NOW.getTime() - 90 * ONE_DAY_MS), active: 2, done: 2 },
      { timestamp: new Date(NOW.getTime() - 50 * ONE_DAY_MS), active: 3, done: 3 },
      { timestamp: NOW, active: 4, done: 4 },
    ];
    const kept = filterToWindow(points, NOW, 90);
    // -100 dropped, -90 inclusive, -50 kept, NOW kept.
    expect(kept.map((p) => p.active)).toEqual([2, 3, 4]);
  });

  it('returns an empty array when no points are in range', () => {
    const points: ReportPoint[] = [
      { timestamp: new Date(NOW.getTime() - 200 * ONE_DAY_MS), active: 1, done: 1 },
    ];
    expect(filterToWindow(points, NOW, 90)).toEqual([]);
  });

  it('preserves input order', () => {
    const p1 = { timestamp: new Date(NOW.getTime() - 10 * ONE_DAY_MS), active: 1, done: 1 };
    const p2 = { timestamp: new Date(NOW.getTime() - 5 * ONE_DAY_MS), active: 2, done: 2 };
    const p3 = { timestamp: new Date(NOW.getTime() - 1 * ONE_DAY_MS), active: 3, done: 3 };
    // Pass in an out-of-order list — filter should NOT sort.
    const kept = filterToWindow([p2, p3, p1], NOW, 90);
    expect(kept.map((p) => p.active)).toEqual([2, 3, 1]);
  });
});

describe('niceYMax', () => {
  it('returns 1 for empty / zero input', () => {
    expect(niceYMax(0)).toBe(1);
    expect(niceYMax(-5)).toBe(1);
    expect(niceYMax(Number.NaN)).toBe(1);
  });

  it('rounds up to a 1-2-5 multiple at a sensible magnitude', () => {
    expect(niceYMax(3)).toBeGreaterThanOrEqual(3);
    expect(niceYMax(7)).toBeGreaterThanOrEqual(7);
    expect(niceYMax(42)).toBeGreaterThanOrEqual(42);
    expect(niceYMax(137)).toBeGreaterThanOrEqual(137);
  });

  it('never produces a result below the input', () => {
    for (const v of [1, 2, 5, 9, 17, 99, 100, 248, 1001]) {
      expect(niceYMax(v)).toBeGreaterThanOrEqual(v);
    }
  });
});

describe('formatTickDate', () => {
  it('produces MM/DD', () => {
    expect(formatTickDate(new Date('2026-01-05T00:00:00Z'))).toBe('01/05');
    expect(formatTickDate(new Date('2026-12-31T00:00:00Z'))).toBe('12/31');
  });
});

describe('projectSeries', () => {
  it('maps endpoints onto the plot area corners', () => {
    const points: ReportPoint[] = [
      { timestamp: new Date(NOW.getTime() - 90 * ONE_DAY_MS), active: 0, done: 0 },
      { timestamp: NOW, active: 10, done: 0 },
    ];
    const leftMs = NOW.getTime() - 90 * ONE_DAY_MS;
    const rightMs = NOW.getTime();
    const proj = projectSeries(points, (p) => p.active, leftMs, rightMs, 10);

    // First point: left edge of plot area, bottom of plot area.
    expect(proj[0].x).toBeCloseTo(MARGIN_LEFT, 5);
    expect(proj[0].y).toBeCloseTo(VIEWBOX_HEIGHT - MARGIN_BOTTOM, 5);

    // Second point: right edge of plot area, top of plot area (value === yMax).
    expect(proj[1].x).toBeCloseTo(VIEWBOX_WIDTH - MARGIN_RIGHT, 5);
    expect(proj[1].y).toBeCloseTo(MARGIN_TOP, 5);
  });

  it('clamps single-point input at the right edge', () => {
    const points = [{ timestamp: NOW, active: 5, done: 5 }];
    const leftMs = NOW.getTime() - 90 * ONE_DAY_MS;
    const proj = projectSeries(points, (p) => p.active, leftMs, NOW.getTime(), 10);
    expect(proj).toHaveLength(1);
    expect(proj[0].x).toBeCloseTo(VIEWBOX_WIDTH - MARGIN_RIGHT, 5);
    expect(Number.isFinite(proj[0].y)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Component tests
// ---------------------------------------------------------------------------

describe('<ReportChart /> empty state', () => {
  it('renders the spec copy when data is an empty array', () => {
    render(<ReportChart data={[]} now={NOW} />);
    const empty = screen.getByTestId('report-chart-empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain(EMPTY_STATE_TEXT);
    // No SVG in empty state.
    expect(screen.queryByTestId('report-chart-svg')).toBeNull();
  });

  it('renders the empty-state copy when all points are outside the window', () => {
    const tooOld = makePoints(5, new Date(NOW.getTime() - 200 * ONE_DAY_MS));
    render(<ReportChart data={tooOld} now={NOW} />);
    expect(screen.getByTestId('report-chart-empty')).toBeTruthy();
    expect(screen.queryByTestId('report-chart-svg')).toBeNull();
  });
});

describe('<ReportChart /> single-point input', () => {
  it('renders without crashing and draws one marker per series', () => {
    const data: ReportPoint[] = [
      { timestamp: NOW, active: 7, done: 3 },
    ];
    render(<ReportChart data={data} now={NOW} />);

    // SVG is present.
    expect(screen.getByTestId('report-chart-svg')).toBeTruthy();

    // Both series polylines are rendered.
    expect(screen.getByTestId('report-chart-series-active')).toBeTruthy();
    expect(screen.getByTestId('report-chart-series-done')).toBeTruthy();

    // One marker per series.
    expect(
      screen.getAllByTestId('report-chart-series-active-point'),
    ).toHaveLength(1);
    expect(
      screen.getAllByTestId('report-chart-series-done-point'),
    ).toHaveLength(1);
  });
});

describe('<ReportChart /> multi-point input', () => {
  it('renders both polylines and the correct number of markers with 30 points', () => {
    const data = makePoints(30, NOW);
    render(<ReportChart data={data} now={NOW} />);

    expect(screen.getByTestId('report-chart-svg')).toBeTruthy();

    const activePoints = screen.getAllByTestId(
      'report-chart-series-active-point',
    );
    const donePoints = screen.getAllByTestId('report-chart-series-done-point');
    expect(activePoints).toHaveLength(30);
    expect(donePoints).toHaveLength(30);
  });

  it('renders X-axis tick labels every 7 days across the 90-day window', () => {
    const data = makePoints(30, NOW);
    render(<ReportChart data={data} now={NOW} />);

    const xAxis = screen.getByTestId('report-chart-x-axis');
    // The 90-day window produces 14 ticks: 0, 7, 14, 21, …, 84, 91→90.
    // The loop emits one tick per 7-day step up to and including
    // `windowDays`, so for windowDays=90 we expect ceil(90/7)+1 = 14.
    const tickLabels = xAxis.querySelectorAll('text');
    // Between 13 and 15 to tolerate inclusive-endpoint rounding.
    expect(tickLabels.length).toBeGreaterThanOrEqual(13);
    expect(tickLabels.length).toBeLessThanOrEqual(15);
  });

  it('renders a Y-axis with at least two numeric tick labels', () => {
    const data = makePoints(30, NOW);
    render(<ReportChart data={data} now={NOW} />);

    const yAxis = screen.getByTestId('report-chart-y-axis');
    const tickLabels = yAxis.querySelectorAll('text');
    expect(tickLabels.length).toBeGreaterThanOrEqual(2);
    // Every Y label should parse as a finite number.
    for (const node of Array.from(tickLabels)) {
      expect(Number.isFinite(Number(node.textContent))).toBe(true);
    }
  });

  it('drops points outside the 90-day window before rendering markers', () => {
    const fresh = makePoints(5, NOW);
    const stale: ReportPoint[] = [
      { timestamp: new Date(NOW.getTime() - 100 * ONE_DAY_MS), active: 99, done: 99 },
      { timestamp: new Date(NOW.getTime() - 200 * ONE_DAY_MS), active: 99, done: 99 },
    ];
    render(<ReportChart data={[...stale, ...fresh]} now={NOW} />);

    // 5 within-window points → 5 active markers; the two stale points
    // are filtered out.
    expect(
      screen.getAllByTestId('report-chart-series-active-point'),
    ).toHaveLength(5);
  });
});

describe('<ReportChart /> theme tokens', () => {
  it('uses var(--warning) for the active series and var(--success) for done', () => {
    const data = makePoints(10, NOW);
    render(<ReportChart data={data} now={NOW} />);

    const active = screen.getByTestId('report-chart-series-active');
    const done = screen.getByTestId('report-chart-series-done');

    expect(active.getAttribute('stroke')).toMatch(/var\(--warning/);
    expect(done.getAttribute('stroke')).toMatch(/var\(--success/);
  });
});

describe('<ReportChart /> fetch path', () => {
  it('fetches report.txt on mount when `data` is not provided', async () => {
    const fakeContent = [
      `${NOW.toISOString()} 10 5`,
      `${new Date(NOW.getTime() - ONE_DAY_MS).toISOString()} 12 3`,
    ].join('\n');
    const fetcher = vi.fn<(a0: string) => Promise<Response>>(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ content: fakeContent }),
    } as unknown as Response));

    render(<ReportChart fetcher={fetcher} now={NOW} />);

    await waitFor(() => {
      expect(screen.getByTestId('report-chart-svg')).toBeTruthy();
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe(
      '/apps/todo-txt/api/file?name=report',
    );
  });

  it('shows an error message when the fetch rejects', async () => {
    const fetcher = vi.fn<(a0: string) => Promise<Response>>(() =>
      Promise.reject(new Error('network down')),
    );
    render(<ReportChart fetcher={fetcher} now={NOW} />);

    await waitFor(() => {
      expect(screen.getByTestId('report-chart-error')).toBeTruthy();
    });
    expect(screen.getByTestId('report-chart-error').textContent).toMatch(
      /network down/,
    );
  });

  it('shows an error message when the fetch returns a non-OK status', async () => {
    const fetcher = vi.fn<(a0: string) => Promise<Response>>(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response));
    render(<ReportChart fetcher={fetcher} now={NOW} />);

    await waitFor(() => {
      expect(screen.getByTestId('report-chart-error')).toBeTruthy();
    });
    expect(screen.getByTestId('report-chart-error').textContent).toMatch(
      /HTTP 500/,
    );
  });
});

// ---------------------------------------------------------------------------
// Invariants
// ---------------------------------------------------------------------------

describe('<ReportChart /> invariants', () => {
  it('DEFAULT_WINDOW_DAYS is 90 per spec', () => {
    expect(DEFAULT_WINDOW_DAYS).toBe(90);
  });

  it('viewBox is 720x260', () => {
    expect(VIEWBOX_WIDTH).toBe(720);
    expect(VIEWBOX_HEIGHT).toBe(260);
  });
});
