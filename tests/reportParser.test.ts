import { describe, it, expect } from 'vitest';
import {
  parseReportLine,
  parseReport,
  type ReportPoint,
} from '../ui/src/utils/reportParser';

describe('parseReportLine', () => {
  it('parses a valid line with ISO timestamp and two integers', () => {
    const result = parseReportLine('2026-05-06T22:35:00.000Z 42 17');
    expect(result).not.toBeNull();
    const point = result as ReportPoint;
    expect(point.active).toBe(42);
    expect(point.done).toBe(17);
    expect(point.timestamp.toISOString()).toBe('2026-05-06T22:35:00.000Z');
  });

  it('returns null for a line missing a field', () => {
    // Only timestamp + one count -- missing done.
    expect(parseReportLine('2026-05-06T22:35:00.000Z 42')).toBeNull();
  });

  it('returns null for a malformed timestamp', () => {
    expect(parseReportLine('not-a-timestamp 42 17')).toBeNull();
  });

  it('returns null / empty for empty content', () => {
    expect(parseReportLine('')).toBeNull();
    expect(parseReportLine('   ')).toBeNull();
    expect(parseReport('')).toEqual([]);
  });

  it('parses multi-line content and skips malformed lines', () => {
    const content = [
      '2026-05-01T00:00:00.000Z 10 0',
      'garbage line here',
      '2026-05-02T00:00:00.000Z 12 1',
      '', // blank line -- skipped
      '2026-05-03T00:00:00.000Z bad 2', // non-integer active -- skipped
      '2026-05-04T00:00:00.000Z 15 4',
    ].join('\n');

    const points = parseReport(content);
    expect(points).toHaveLength(3);
    expect(points[0].active).toBe(10);
    expect(points[0].done).toBe(0);
    expect(points[1].active).toBe(12);
    expect(points[2].active).toBe(15);
    expect(points[2].done).toBe(4);
    // Order preserved.
    expect(points[0].timestamp.toISOString()).toBe('2026-05-01T00:00:00.000Z');
    expect(points[2].timestamp.toISOString()).toBe('2026-05-04T00:00:00.000Z');
  });
});
