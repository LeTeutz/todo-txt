/**
 * ReportChart — inline-SVG line chart for the todo.sh three-file
 * `report.txt` history (T17). Rendered in the body pane of
 * `TodoTxtPage` when the user selects the **Report** tab (see T15
 * `FileTabs`). The chart visualises two series, *active* and *done*,
 * sampled daily by the `report` command or the daily cron.
 *
 * =====================================================================
 * Contract
 * =====================================================================
 *
 *   1. Fetch `GET /apps/todo-txt/api/file?name=report` on mount,
 *      decode `{content: string}` and pipe it through
 *      `parseReport()` from `../utils/reportParser`.
 *   2. Filter the points to the trailing `windowDays` days (default
 *      90).  Earlier snapshots are preserved on disk — they just fall
 *      outside the plot window.
 *   3. Render an **inline-SVG** line chart. No external charting
 *      library. The component must not crash for 0, 1, or 30+ points,
 *      the three cases the task acceptance test requires.
 *   4. Use theme tokens `var(--warning)` (active — amber) and
 *      `var(--success)` (done — green) for the two series. All other
 *      colours fall through to the usual `--color-*` tokens with
 *      plain-gray fallbacks for the test jsdom env.
 *   5. Empty state (zero points after the 90-day filter) shows the
 *      exact copy the spec asks for:
 *        "No snapshots yet. Run `report` from the command palette to capture one.
 *        `report` from the palette."
 *
 * =====================================================================
 * Props
 * =====================================================================
 *
 *   data       — test seam. If provided, the component skips the
 *                network fetch entirely and renders the given points.
 *   fetcher    — test seam. A fetch-like `(url) => Promise<Response>`.
 *                Defaults to the global `fetch`.
 *   now        — test seam. Overrides the right edge of the 90-day
 *                window. Defaults to `new Date()`.
 *   windowDays — chart window in days. Defaults to 90.
 *
 * All four are optional so the production call-site can simply render
 * `<ReportChart />` with no configuration. The seams exist so unit
 * tests can drive the component deterministically without jumping
 * through jsdom fetch-polyfill hoops.
 */
import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { parseReport, type ReportPoint } from '../utils/reportParser';

// ---------------------------------------------------------------------------
// Constants — kept module-scoped so tests can assert layout invariants.
// ---------------------------------------------------------------------------

/** Default trailing-window width in days. */
export const DEFAULT_WINDOW_DAYS = 90;

/** Viewport dimensions. Chose 720x260 for a reasonable default aspect in
 *  the report-tab body pane; the actual on-screen size is driven by the
 *  parent's flex layout via `style={{ width: '100%' }}` on the SVG. */
export const VIEWBOX_WIDTH = 720;
export const VIEWBOX_HEIGHT = 260;

/** Plot-area insets. Left is wider for Y-axis labels; bottom is wider
 *  for rotated date labels. */
export const MARGIN_LEFT = 44;
export const MARGIN_RIGHT = 12;
export const MARGIN_TOP = 12;
export const MARGIN_BOTTOM = 40;

/** Exact empty-state copy — the task spec asks for this verbatim. */
export const EMPTY_STATE_TEXT =
  'No snapshots yet. Run `report` from the command palette to capture one.';

/** Spacing (in days) between X-axis tick marks. */
const X_TICK_INTERVAL_DAYS = 7;

/** Approximate number of Y-axis tick marks. The chart picks a "nice"
 *  count value near `max / Y_TICK_COUNT` so labels are round numbers. */
const Y_TICK_COUNT = 4;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ReportChartProps {
  /**
   * Optional seed data. When provided the component skips the network
   * fetch and renders immediately. Used in tests and by callers that
   * already have the parsed points in memory (e.g. a parent screen
   * pre-fetches as part of a larger request).
   */
  data?: ReportPoint[];
  /**
   * Optional fetch override. Defaults to the global `fetch`. Useful in
   * tests and when callers want to add auth headers / retry behaviour.
   */
  fetcher?: (url: string) => Promise<Response>;
  /**
   * Optional "now" override. The 90-day window extends from
   * `now - windowDays*ONE_DAY_MS` to `now`. Defaults to `new Date()`.
   */
  now?: Date;
  /**
   * Window width in days. Defaults to `DEFAULT_WINDOW_DAYS` (90).
   */
  windowDays?: number;
}

// ---------------------------------------------------------------------------
// Helpers — pure functions, exported for test coverage.
// ---------------------------------------------------------------------------

/**
 * Keep only points whose timestamp falls within
 * `[now - windowDays*ONE_DAY_MS, now]` (inclusive).
 * Preserves input order. Deterministic — no side effects.
 */
export function filterToWindow(
  points: ReportPoint[],
  now: Date,
  windowDays: number,
): ReportPoint[] {
  const rightMs = now.getTime();
  const leftMs = rightMs - windowDays * ONE_DAY_MS;
  return points.filter((p) => {
    const t = p.timestamp.getTime();
    return t >= leftMs && t <= rightMs;
  });
}

/**
 * Pick a "nice" upper Y bound for a given data max. Returns at least
 * 1 so an all-zero chart still renders a visible axis. For non-zero
 * values the upper bound is rounded up to the next multiple of a
 * 1-2-5 step roughly `max / Y_TICK_COUNT` in magnitude.
 */
export function niceYMax(maxVal: number): number {
  if (!Number.isFinite(maxVal) || maxVal <= 0) return 1;
  const rough = maxVal / Y_TICK_COUNT;
  const pow10 = Math.pow(10, Math.floor(Math.log10(rough)));
  const leading = rough / pow10;
  let niceStep: number;
  if (leading <= 1) niceStep = 1 * pow10;
  else if (leading <= 2) niceStep = 2 * pow10;
  else if (leading <= 5) niceStep = 5 * pow10;
  else niceStep = 10 * pow10;
  return Math.ceil(maxVal / niceStep) * niceStep;
}

/**
 * Format a date as `MM/DD` for X-axis tick labels. Uses UTC to stay
 * stable across timezones — the chart is a 90-day smoothed view, day-
 * level precision is fine and local-time drift adds no information.
 */
export function formatTickDate(d: Date): string {
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${mm}/${dd}`;
}

interface ProjectedPoint {
  readonly x: number;
  readonly y: number;
  readonly value: number;
  readonly timestamp: Date;
}

/**
 * Convert a series of points into pixel coordinates inside the SVG
 * viewBox. Callers pass `active` or `done` separately so the caller
 * can stack two polylines sharing the same scales.
 */
export function projectSeries(
  points: ReportPoint[],
  valueFn: (p: ReportPoint) => number,
  leftMs: number,
  rightMs: number,
  yMax: number,
): ProjectedPoint[] {
  const plotLeft = MARGIN_LEFT;
  const plotRight = VIEWBOX_WIDTH - MARGIN_RIGHT;
  const plotTop = MARGIN_TOP;
  const plotBottom = VIEWBOX_HEIGHT - MARGIN_BOTTOM;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const spanMs = Math.max(1, rightMs - leftMs);
  const safeYMax = yMax <= 0 ? 1 : yMax;

  return points.map((p) => {
    const ratioX = (p.timestamp.getTime() - leftMs) / spanMs;
    const value = valueFn(p);
    const ratioY = value / safeYMax;
    return {
      x: plotLeft + ratioX * plotWidth,
      y: plotBottom - ratioY * plotHeight,
      value,
      timestamp: p.timestamp,
    };
  });
}

/** Serialise a list of projected points into a polyline `points` attr. */
function polylineAttr(proj: ProjectedPoint[]): string {
  return proj.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const wrapperStyle: CSSProperties = {
  width: '100%',
  minHeight: 260,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontFamily: 'inherit',
  color: 'var(--color-fg, #222)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  fontSize: 12,
  color: 'var(--color-muted-fg, #888)',
};

const legendSwatchStyle = (
  color: string,
): CSSProperties => ({
  display: 'inline-block',
  width: 10,
  height: 10,
  marginRight: 6,
  borderRadius: 2,
  verticalAlign: 'middle',
  background: color,
});

const svgStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  maxHeight: 360,
  display: 'block',
};

const emptyStateStyle: CSSProperties = {
  padding: '24px 16px',
  textAlign: 'center',
  color: 'var(--color-muted-fg, #888)',
  fontSize: 13,
  fontFamily: 'inherit',
};

const errorStyle: CSSProperties = {
  padding: '12px 16px',
  color: 'var(--color-danger, var(--color-error, #c33))',
  fontSize: 12,
};

// ---------------------------------------------------------------------------
// Load state
// ---------------------------------------------------------------------------

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; points: ReportPoint[] }
  | { status: 'error'; message: string };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ReportChart — see the file-level docstring for the full contract.
 *
 * Exported as a **named export** for consistency with `FileTabs` and
 * `CommandPalette`, with a `default` alias for call-sites that prefer
 * default imports.
 */
export function ReportChart({
  data,
  fetcher,
  now,
  windowDays = DEFAULT_WINDOW_DAYS,
}: ReportChartProps = {}): JSX.Element {
  // When `data` is supplied up-front we start in the `ready` state and
  // skip the network fetch entirely. Otherwise we kick off the fetch in
  // an effect below.
  const [loadState, setLoadState] = useState<LoadState>(() =>
    data !== undefined
      ? { status: 'ready', points: data }
      : { status: 'idle' },
  );

  // Fetch report.txt once on mount (or when `fetcher` changes).
  useEffect(() => {
    // Seed-data short-circuit. Re-sync on `data` prop change so tests
    // can drive the component by passing new arrays.
    if (data !== undefined) {
      setLoadState({ status: 'ready', points: data });
      return;
    }

    let cancelled = false;
    const doFetch = fetcher ?? ((url: string) => fetch(url));

    setLoadState({ status: 'loading' });
    doFetch('/apps/todo-txt/api/file?name=report')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const body = (await res.json()) as { content?: unknown };
        const content = typeof body.content === 'string' ? body.content : '';
        return parseReport(content);
      })
      .then((points) => {
        if (cancelled) return;
        setLoadState({ status: 'ready', points });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setLoadState({ status: 'error', message });
      });

    return () => {
      cancelled = true;
    };
  }, [data, fetcher]);

  // Resolve "now" once per render so the 90-day window is stable within
  // a single paint. `useMemo` also keeps derived arrays stable across
  // re-renders when the inputs haven't changed.
  const resolvedNow = useMemo(
    () => (now instanceof Date ? now : new Date()),
    [now],
  );

  const windowed = useMemo(() => {
    if (loadState.status !== 'ready') return [];
    return filterToWindow(loadState.points, resolvedNow, windowDays);
  }, [loadState, resolvedNow, windowDays]);

  // --------------------------------------------------------------------
  // Non-happy states: loading / error / empty. Each returns early so
  // the chart render below can assume `windowed.length >= 1`.
  // --------------------------------------------------------------------
  if (loadState.status === 'loading') {
    return (
      <div style={wrapperStyle} data-testid="report-chart-loading">
        <div style={emptyStateStyle}>Loading snapshots…</div>
      </div>
    );
  }

  if (loadState.status === 'error') {
    return (
      <div style={wrapperStyle} data-testid="report-chart-error">
        <div style={errorStyle}>
          Failed to load report.txt: {loadState.message}
        </div>
      </div>
    );
  }

  if (windowed.length === 0) {
    return (
      <div style={wrapperStyle} data-testid="report-chart-empty">
        <div style={emptyStateStyle}>{EMPTY_STATE_TEXT}</div>
      </div>
    );
  }

  // --------------------------------------------------------------------
  // Scales
  // --------------------------------------------------------------------
  const rightMs = resolvedNow.getTime();
  const leftMs = rightMs - windowDays * ONE_DAY_MS;

  const maxActive = windowed.reduce((m, p) => Math.max(m, p.active), 0);
  const maxDone = windowed.reduce((m, p) => Math.max(m, p.done), 0);
  const yMax = niceYMax(Math.max(maxActive, maxDone));

  const activeProj = projectSeries(
    windowed,
    (p) => p.active,
    leftMs,
    rightMs,
    yMax,
  );
  const doneProj = projectSeries(
    windowed,
    (p) => p.done,
    leftMs,
    rightMs,
    yMax,
  );

  // --------------------------------------------------------------------
  // Tick coordinates
  // --------------------------------------------------------------------
  const plotLeft = MARGIN_LEFT;
  const plotRight = VIEWBOX_WIDTH - MARGIN_RIGHT;
  const plotTop = MARGIN_TOP;
  const plotBottom = VIEWBOX_HEIGHT - MARGIN_BOTTOM;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  // X ticks: every 7 days from `leftMs` to `rightMs`. Inclusive of both
  // ends so a 90-day window produces 14 ticks (days 0, 7, 14, … 91 gets
  // clamped to 90 by the stopping condition below).
  const xTicks: Array<{ x: number; label: string }> = [];
  for (
    let day = 0;
    day <= windowDays;
    day += X_TICK_INTERVAL_DAYS
  ) {
    const ticMs = leftMs + day * ONE_DAY_MS;
    const ratio = (ticMs - leftMs) / Math.max(1, rightMs - leftMs);
    xTicks.push({
      x: plotLeft + ratio * plotWidth,
      label: formatTickDate(new Date(ticMs)),
    });
  }

  // Y ticks: evenly spaced from 0 to yMax. Uses `Y_TICK_COUNT + 1`
  // positions so both endpoints are labelled.
  const yTicks: Array<{ y: number; label: string }> = [];
  for (let i = 0; i <= Y_TICK_COUNT; i += 1) {
    const value = (yMax * i) / Y_TICK_COUNT;
    const ratio = value / Math.max(1, yMax);
    yTicks.push({
      y: plotBottom - ratio * plotHeight,
      label: Number.isInteger(value) ? String(value) : value.toFixed(1),
    });
  }

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------
  return (
    <div style={wrapperStyle} data-testid="report-chart">
      {/* Legend / header row. Sits above the SVG so the chart itself
          can be read in isolation. */}
      <div style={headerStyle} data-testid="report-chart-legend">
        <span>
          <span
            style={legendSwatchStyle('var(--warning, #f59e0b)')}
            aria-hidden="true"
            data-testid="report-chart-legend-active"
          />
          active
        </span>
        <span>
          <span
            style={legendSwatchStyle('var(--success, #10b981)')}
            aria-hidden="true"
            data-testid="report-chart-legend-done"
          />
          done
        </span>
        <span style={{ marginLeft: 'auto' }}>
          {windowed.length} snapshot{windowed.length === 1 ? '' : 's'} ·{' '}
          last {windowDays} days
        </span>
      </div>

      <svg
        role="img"
        aria-label={`todo.txt history — last ${windowDays} days`}
        data-testid="report-chart-svg"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={svgStyle}
      >
        {/* Plot-area background — invisible by default but adds a hook
            for themed plot surfaces. */}
        <rect
          x={plotLeft}
          y={plotTop}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          data-testid="report-chart-plot-area"
        />

        {/* Y gridlines + labels. Drawn first so the series polylines
            sit on top. */}
        <g data-testid="report-chart-y-axis">
          {yTicks.map((t, idx) => (
            <g key={`ytick-${idx}`}>
              <line
                x1={plotLeft}
                x2={plotRight}
                y1={t.y}
                y2={t.y}
                stroke="var(--color-border, #e5e7eb)"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              <text
                x={plotLeft - 6}
                y={t.y + 3}
                fontSize={10}
                textAnchor="end"
                fill="var(--color-muted-fg, #888)"
              >
                {t.label}
              </text>
            </g>
          ))}
        </g>

        {/* X ticks + labels. Every 7 days per the spec. */}
        <g data-testid="report-chart-x-axis">
          <line
            x1={plotLeft}
            x2={plotRight}
            y1={plotBottom}
            y2={plotBottom}
            stroke="var(--color-border, #e5e7eb)"
            strokeWidth={1}
          />
          {xTicks.map((t, idx) => (
            <g key={`xtick-${idx}`}>
              <line
                x1={t.x}
                x2={t.x}
                y1={plotBottom}
                y2={plotBottom + 4}
                stroke="var(--color-border, #e5e7eb)"
                strokeWidth={1}
              />
              <text
                x={t.x}
                y={plotBottom + 16}
                fontSize={10}
                textAnchor="middle"
                fill="var(--color-muted-fg, #888)"
              >
                {t.label}
              </text>
            </g>
          ))}
        </g>

        {/* Active series — amber. */}
        <polyline
          data-testid="report-chart-series-active"
          fill="none"
          stroke="var(--warning, #f59e0b)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polylineAttr(activeProj)}
        />
        {/* Active series markers — one tiny circle per data point. Keeps
            single-point / two-point charts readable where a polyline
            alone would degenerate into an invisible line. */}
        {activeProj.map((p, idx) => (
          <circle
            key={`active-pt-${idx}`}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill="var(--warning, #f59e0b)"
            data-testid="report-chart-series-active-point"
          >
            <title>
              {formatTickDate(p.timestamp)} · active={p.value}
            </title>
          </circle>
        ))}

        {/* Done series — green. Drawn after active so it sits on top
            in the typical case where `done <= active`. */}
        <polyline
          data-testid="report-chart-series-done"
          fill="none"
          stroke="var(--success, #10b981)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polylineAttr(doneProj)}
        />
        {doneProj.map((p, idx) => (
          <circle
            key={`done-pt-${idx}`}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill="var(--success, #10b981)"
            data-testid="report-chart-series-done-point"
          >
            <title>
              {formatTickDate(p.timestamp)} · done={p.value}
            </title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

export default ReportChart;
