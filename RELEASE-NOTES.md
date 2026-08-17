# todo.txt — v1.0.0

A crash-safe [todo.txt](https://github.com/todotxt/todo.txt) editor for KiroCrew.
Plain text on your disk, a real editor around it, and an AI edit that shows you
the diff before it touches anything.

- **App id** `todo-txt` · **Author** LeTeutz · **License** Apache-2.0
- **Platform** KiroCrew 0.1.2+ · Python backend (aiohttp) + React/CodeMirror 6 UI

---

## What it does

**Your file stays yours.** Point it at the `todo.txt` you already keep in
Dropbox, git or Syncthing (`set-root`), and it notices external edits on a
5-second poll. A buffer with unsaved work is never replaced under you: the
reload is offered, and only a clean buffer refreshes on its own. Nothing is
stored in a database; the file on disk is the only state.

**Crash-safe editing.** Edits save 400 ms after you stop typing, through a
conflict-checked write, with a forced flush if you type continuously. An
interrupted session comes back as a recovery draft you accept or discard. A save
is refused — not merged, not clobbered — if the file changed on disk since you
opened it.

**A real editor.** CodeMirror 6 with multi-cursor, syntax-highlighted
priorities, projects and contexts, due-date urgency tints, Tab-completion for
`+projects` and `@contexts` as you type, and an optional VIM mode with todo.txt
leader commands (`\x` done, `\d` due, `\a`/`\b`/`\c`
priority, `\s` sort).

**todo.txt semantics that actually run.** Not just highlighted — honoured:
`rec:` recurrence on every completion path (strict `+` and non-strict anchors,
month-end clamping, business days), `t:` threshold dates, `h:1` hidden tasks,
and a filter layer (`filter @work pri:A-C due:<=7d`) that dims without touching
the file.

**Command palette with todo.txt CLI parity** — `add`, `do`, `pri`, `depri`,
`append`, `prepend`, `sort`, `deduplicate`, `archive`, `move`, `report`,
`filter`, `listproj`, `listcon`, `set-root`, `where` — plus `!!date` shortcuts
for relative due dates.

**AI edit, two ways.** Select a task, describe the change, then either
**Just do it** — the app rewrites the line through its own restricted agent,
where an additive change applies after a snapshot and anything that *removes* a
line is held back as a diff you approve or discard — or **Chat**, which hands
the selection to a KiroCrew conversation when you would rather talk it through.

**done.txt and report.txt** are first-class tabs. `todo.txt` and `done.txt` each
get rotating backups with a family-aware restore; `report.txt` is append-only
and regenerated, so it is not backed up.

## Permissions, and why each one

| Permission | Why |
|---|---|
| `storage` | reads and writes your `todo.txt` / `done.txt` / `report.txt` and its own backups |
| `spawn` + `/api/spawn` | the AI edit runs through the app's **own** restricted agent (`agents/ai-edit.json`, zero tools), not your default agent |
| `memory: app-scoped` | app settings only |
| `events: notification` | save/conflict toasts |
| `network: false` | **no outbound network access**; nothing leaves the machine |
| `cron: false`, `mcpTools: []` | no background jobs, no MCP surface |

The backend binds to loopback on a gateway-assigned port and refuses any
unsigned request (HMAC `X-KiroCrew-Proxy`), so it is reachable only through the
KiroCrew gateway.

## Safety posture

Your file is the only copy of your data, so every operation that could damage
it is designed to fail safe. Concretely:

- **Destructive commands are ordered to conserve data.** `archive` and `move`
  grow the destination before shrinking the source and roll back on failure, so
  a partial write can duplicate a line but never lose one.
- **Every destructive path leaves a recoverable copy** in the right file family,
  with a wall-clock timestamp and a collision-safe name. A backup that cannot
  be written aborts the operation instead of proceeding silently.
- **The file boundary is enforced.** Archive is todo-only, recurrence never
  spawns into `done.txt`, restore routes a `done-*` backup to `done.txt`, and a
  recovery draft is scoped to the data root it was typed against.
- **Hidden lines cannot be edited unseen.** With `h:1`/`t:` hiding on, any line
  under a selection is revealed before an action can rewrite it.
- **Configurable roots fail closed.** A candidate path must be absolute, inside
  `$HOME`, not a symlink into `~/.ssh` / `~/.aws` / `~/.gnupg` / `~/.kiro`, not
  any top-level dotfile directory, and writable — verified *before* the setting
  is stored, with rollback if creation still fails.
- **The destructive-AI-edit review has exactly one escape hatch, and it is
  off.** Setting `TODO_TXT_AI_YOLO=1` (or `true`/`yes`/`on`) in the environment
  the gateway starts with makes a line-removing edit apply directly instead of
  staging as a diff. It exists for people who would rather undo than approve.
  Two things it does *not* change: the snapshot is still written before any
  write, so the edit stays recoverable, and a response the classifier judges
  pathological is still rejected outright. Unset, which is the default, every
  removal is held for approval.

Verified at every commit: **329 backend tests · 1145 UI tests · 104 Playwright
end-to-end tests**, source *and* test typechecking — all run by
`npm run verify`. The install-time `npm run build` is deliberately just
`vite build`: running typechecks on a user's machine adds failure modes that
would abort an install (`set -euo pipefail`) for no user benefit.

## Known limitations

- **Windows is not a supported platform.** `app.json` declares
  `platform.os: ["linux", "macos"]`. CI runs the backend suite on Windows anyway,
  because a Windows gateway can install a server-mode app, and it reports nine
  failures there: test fixtures compare `\n` against a CRLF read, the `$HOME`
  containment check on a configured root does not hold, and — the one that
  matters — the writability probe passes a directory it cannot write, so the
  "fails closed" refusal in `set-root` does not fail closed on Windows. Those
  legs are non-gating rather than fixed. Use Linux or macOS.

- **Vim `Ctrl+D`/`Ctrl+U` scroll the editor**, so the app's plain `Ctrl+D`
  mark-done is unavailable while VIM mode is on. Use `\x`, or `Ctrl+Shift+D`
  (both shown in the status bar), or `⌘D` on macOS.
- **`G` in VIM mode lands on the trailing empty line**, because a todo.txt file
  ends with a newline. `G` then `k` reaches the last task. Standard editor
  behaviour, but surprising the first time.
- **`report.txt` is append-only.** The tab renders a chart; snapshots are
  captured by the `report` palette command.
- **macOS is the only platform this has been used interactively on.** Nothing
  is macOS-specific by design: no macOS-only commands, no hardcoded POSIX
  paths, `pathlib` throughout, the one external-open call branches to
  `os.startfile` on Windows and `xdg-open` on Linux, and CRLF files are read
  and rewritten with their own terminator preserved (covered by tests). A
  cross-platform CI matrix runs the suites on Linux and Windows, but a hands-on
  report from either is still welcome.

## Deliberate decisions people sometimes report as bugs

- **`rec:` needs a `due:` or `t:` to count from.** On a task carrying neither,
  completing it produces a next instance identical to the line you just
  finished — which looks like a duplicate. That is deliberate: inventing a
  deadline you never wrote would change the meaning of your file, and the
  alternative (guessing) is worse than being available immediately. Add a
  `due:` or `t:` and the recurrence moves the date forward; `rec:+1w` anchors on
  that date, `rec:1w` anchors on the day you completed it.

- **Undo after an `!!date` expansion is ONE step, not two.** It removes the
  expansion *and* the trigger you typed, returning you to the text you had
  before you started. The alternative — surfacing the intermediate
  `buy milk !!done ` — exposes a state you never meant to be in and costs a
  second undo to get past, because `!!done` is a command rather than content.
  When you *do* want the literal trigger back, Backspace immediately after an
  expansion restores exactly what you typed. Pinned by a regression test in the
  VIM mode suite.

## Install

```
kirocrew app install <repo-url>
kirocrew app enable todo-txt
```

Store art (hero banners, screenshots) is declared with **repo-relative** paths,
which the gateway rewrites into blob-proxy URLs for a registry install. A
manually sideloaded copy shows a placeholder banner instead — the two path forms
are mutually exclusive and publication is the one that matters.

Then open **todo.txt** in the sidebar. On first run it seeds an example file
demonstrating the syntax; `set-root ~/path/to/your/notes` points it at your own.
Third-party apps require `apps_allow_third_party: true` in
`~/.kiro/crew/config.json`.
