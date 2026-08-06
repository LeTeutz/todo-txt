/**
 * Parser for todo.sh `report.txt` history files.
 *
 * Each line has the shape:
 *   <ISO-8601 timestamp> <active-count> <done-count>
 *
 * Example:
 *   2026-05-06T22:35:00.000Z 42 17
 *
 * Malformed lines (wrong field count, unparseable timestamp, non-integer
 * counts) return null from `parseReportLine` and are silently dropped by
 * `parseReport`.
 */

export interface ReportPoint {
  timestamp: Date;
  active: number;
  done: number;
}

/**
 * Parse a single line from report.txt.
 * Returns null for malformed lines (missing fields, bad timestamp,
 * non-integer counts).
 */
export function parseReportLine(line: string): ReportPoint | null {
  if (typeof line !== 'string') return null;
  const trimmed = line.trim();
  if (trimmed === '') return null;

  // Split on any run of whitespace. Expect exactly 3 fields.
  const parts = trimmed.split(/\s+/);
  if (parts.length !== 3) return null;

  const [tsRaw, activeRaw, doneRaw] = parts;

  // Timestamp: must be ISO-8601 parseable by Date.
  const timestamp = new Date(tsRaw);
  if (Number.isNaN(timestamp.getTime())) return null;

  // Counts: must be non-negative integers (digits only, no signs, no dots).
  if (!/^\d+$/.test(activeRaw)) return null;
  if (!/^\d+$/.test(doneRaw)) return null;

  const active = Number.parseInt(activeRaw, 10);
  const done = Number.parseInt(doneRaw, 10);

  if (!Number.isFinite(active) || !Number.isFinite(done)) return null;

  return { timestamp, active, done };
}

/**
 * Parse the full contents of report.txt into an array of points.
 * Malformed lines are skipped. Empty input returns an empty array.
 * Output preserves file order.
 */
export function parseReport(content: string): ReportPoint[] {
  if (typeof content !== 'string' || content === '') return [];
  const lines = content.split(/\r?\n/);
  const points: ReportPoint[] = [];
  for (const line of lines) {
    const point = parseReportLine(line);
    if (point !== null) points.push(point);
  }
  return points;
}
