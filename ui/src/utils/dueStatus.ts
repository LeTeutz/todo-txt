/**
 * dueStatus — classify a line's `due:` date relative to today.
 *
 * The editor tints a `due:` token by urgency: overdue in the danger colour,
 * due-today in the warning colour, everything else left as ordinary metadata.
 * That decision is pure and date-only, so it lives here rather than inside the
 * decoration plugin, where it could not be tested without an EditorView.
 *
 * `lineDue` is reused from utils/filterExpr so the tint and the `due:overdue`
 * / `due:today` filter terms can never disagree about which token on a line is
 * the due date.
 *
 * Nothing in this module mutates anything.
 */
import { isRealIsoDate, lineDue } from './filterExpr';

/**
 * Re-exported from utils/filterExpr, where the definition lives.
 *
 * It belongs there because the `due:` filter terms and `threshold hide` need
 * the same validity gate, and filterExpr is the leaf module of the three —
 * defining it here and importing it there would make the pair circular. Kept
 * exported from this module so `classifyDue`'s own callers and tests can reach
 * the gate without a second import.
 */
export { isRealIsoDate };

/**
 * Urgency of a line's `due:` date.
 *
 *   past    strictly before today — overdue
 *   today   exactly today
 *   future  after today — no tint; a deadline that has not arrived is not news
 *   null    no `due:` token, or one whose date is not a real calendar date
 */
export type DueStatus = 'past' | 'today' | 'future' | null;

/**
 * Classify the line's `due:` date against `today` (both `YYYY-MM-DD`).
 *
 * String comparison is exact for zero-padded ISO dates, so no Date arithmetic
 * is needed once validity is established.
 *
 * Completion state is deliberately NOT considered here. This function answers
 * one question — "how urgent is this date" — and the caller decides who gets
 * asked: the decoration plugin only reaches this code on non-completed lines
 * (a completed line is dimmed and struck through as a whole, and painting a
 * red deadline on a task the user already finished would be a lie). Keeping
 * the two concerns apart is what makes this testable in isolation.
 */
export function classifyDue(line: string, today: string): DueStatus {
  const due = lineDue(line);
  if (due === null || !isRealIsoDate(due)) return null;
  if (due < today) return 'past';
  if (due === today) return 'today';
  return 'future';
}
