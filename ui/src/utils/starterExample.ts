/**
 * Starter example / template for todo.txt.
 *
 * Shown once as an empty-state card when todo.txt is blank, and also
 * available on demand via Ctrl+K → "example" for users who already
 * have content.
 *
 * Hand-written, covers:
 *   - priorities (A)/(B)/(C)
 *   - creation dates
 *   - +projects and @contexts (including multiple contexts per task)
 *   - due:, rec: (recurring) and t: (threshold / not-before) key-values
 *   - h:1 (hidden from the default view — see the `hidden` palette command)
 *   - id: tags (unique task id)
 *   - completed line with completion + creation date (done.txt-ready)
 *   - short hint about the command palette
 */
function iso(offsetDays: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + offsetDays);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Build the starter file, dated RELATIVE to the day it is shown.
 *
 * These dates were hardcoded to a fixed day, which meant a brand-new install
 * opened on tasks created months in the past with two `due:` dates already
 * overdue — painted in the app's own overdue tint — and it got worse the
 * longer the release aged. Derived from today, the first screen always reads
 * as a file someone started this morning.
 *
 * Local calendar day, not UTC, matching every other date producer in this app
 * (commands.ts, shortcuts.ts, the decoration plugin). A UTC day would stamp
 * tomorrow's date for users east of UTC late in the evening.
 *
 * Kept in sync with `_starter_example()` in backend/todo_txt_handlers.py —
 * change both.
 */
export function buildStarterExample(from: Date = new Date()): string {
  const created = iso(0, from);
  return [
    `${created} todo.txt — a plain-text format for tasks`,
    `(A) ${created} ship the feature +kirocrew @work due:${iso(3, from)}`,
    `(B) ${created} write tests for the new command palette +kirocrew @work`,
    `(C) ${created} clean up garage @home`,
    // Completed yesterday, created the day before: a done line carrying both
    // dates, which is what a done.txt entry looks like.
    `x ${iso(-1, from)} ${iso(-2, from)} pay the electric bill +home @admin`,
    `${created} call the dentist @phone @admin due:${iso(2, from)}`,
    `${created} review quarterly goals +work @planning id:q4review`,
    // `rec:` needs a due:/t: to anchor to. Without one the engine
    // deliberately invents no deadline, so the next instance is identical
    // to this line and reads as a duplicate. Anchor the starter's example.
    `${created} weekly review +work @meta due:${iso(7, from)} rec:+1w`,
    `${created} renew passport +admin @errands t:${iso(90, from)} rec:+10y`,
    `${created} someday: learn the tin whistle +music h:1`,
    `${created} buy +groceries for the week @errands`,
    `${created} press Ctrl+K to explore the command palette @hint`,
    '',
  ].join('\n');
}

/**
 * The starter template, built once when this module loads.
 *
 * Still a const so every call site reads it as a plain value; it is simply
 * computed rather than frozen into the source. The app writes it once, at
 * first open, so a long-running process that outlives midnight keeping the
 * previous day's date is not a case worth complicating this for.
 */
export const STARTER_EXAMPLE = buildStarterExample();
