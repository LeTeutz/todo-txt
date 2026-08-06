/**
 * Sort modes for todo.txt lines.
 *
 * Skeleton: defines the SortMode type and sortLines() signature with a no-op
 * implementation. Real sort logic will be filled in by a later task.
 */

export type SortMode = 'priority' | 'date' | 'project' | 'context';

/**
 * Sort todo.txt lines according to the given mode.
 *
 * Current implementation is a no-op: it returns the input unchanged.
 * A later task will implement the actual sort logic per todo.sh semantics.
 */
export function sortLines(lines: string[], _mode: SortMode): string[] {
  return lines;
}
