# todo.txt

A local-first todo.txt editor for [KiroCrew](https://github.com/kirodotdev/KiroCrew),
with `done.txt` and `report.txt` companion views.

Version **1.0.0**. Licensed under [Apache-2.0](LICENSE).

## Install

This app is a **third-party app**, so the host must be configured to allow
them. Set the following in your KiroCrew config and restart the gateway:

```yaml
agent:
  apps_allow_third_party: true
```

Without that flag the gateway refuses to install or enable the app.

### From a local directory

Clone this repository, then point the gateway at the checkout:

```bash
git clone <this-repo> todo-txt
kirocrew app install ./todo-txt
kirocrew app enable todo-txt
```

`app install` runs the manifest's `setup.onInstall` hook, which installs the
frontend dependencies and produces `ui/dist/index.mjs`. Node.js and npm must
be on `PATH` for that step to succeed.

### From the app registry

Once published, install by name:

```bash
kirocrew app install todo-txt
kirocrew app enable todo-txt
```

The dashboard's App Store view offers the same thing with a button.

After enabling, the editor appears in the sidebar under **Apps** and is served
at `/apps/todo-txt`.

### Uninstall

```bash
kirocrew app uninstall todo-txt
```

Add `--keep-data` to preserve your todo files.

## Data location

Files live in `$TODO_TXT_ROOT` if set, otherwise the host's default app data
directory. Uninstalling without `--keep-data` removes them, so back up first
if you care about the contents.

## Format

The editor follows the [Gina Trapani todo.txt specification](https://github.com/todotxt/todo.txt):

- `(A)` / `(B)` / `(C)` priority first
- `YYYY-MM-DD` creation date after priority
- `+project` and `@context` tags anywhere in the body
- `key:value` metadata extensions such as `due:2026-07-27`
- `x YYYY-MM-DD` completion prefix

The upstream project publishes a one-page visual cheatsheet of that grammar —
[`description.svg`](https://github.com/todotxt/todo.txt/blob/master/description.svg) —
which is the fastest way to see the whole format at once. It is linked rather
than reproduced here: that repository is GPL-3.0 and this app is Apache-2.0, so
copying or embedding the asset would mix licences for no benefit.

## Editor

- CodeMirror 6 virtualized editing, real line-number gutter, wrapping, history, and visible-range todo.txt highlighting
- Optional Vim mode with todo.txt leader commands
- Multi-cursor editing: Alt+click, Ctrl/Cmd+Alt+Up/Down, and Alt+drag rectangular selections
- Batch quick actions across every selected line, with overlapping ranges deduplicated
- Selection action box modes: **Automatic**, **On demand** (Alt+Enter), and **Off**
- Responsive action-box sizing, viewport flipping, edge clamping, and CodeMirror-scroll dismissal
- Command palette, inline shortcuts, AMOLED mode, backups, file download, and fullscreen

## Data safety

Normal saves are debounced for 400 ms and forced after at most four seconds of
continuous typing. A latest-value queue serializes writes so an older request
cannot race a newer edit. Retryable failures use exponential backoff from one
to 30 seconds and resume automatically when the host returns.

Every dirty edit is also journaled in app-scoped browser storage: a synchronous
localStorage mirror protects crash/unload boundaries while IndexedDB provides a
second durable copy. On restart, a non-destructive banner offers to restore or
discard a draft; disk content is never silently replaced.

Writes include `base_mtime`. A stale write stops with explicit choices to
reload disk content or overwrite it with the local buffer. Unload beacons carry
the same mtime guard. The backend writes through a temporary file, `fsync`, and
atomic rename, and rotates the latest 20 five-minute backup states.

## Build and validation

```bash
cd ui
npm install
npm test -- --run
npm run test:e2e
npm run typecheck
npm run build
npm run benchmark:editor
cd ..
python3 -m pytest -q
```

`npm run test:e2e` launches the local Playwright CLI against the Vite/backend
harness with a fresh disposable `TODO_TXT_ROOT`, then removes that root after
the run. It is a required release-gate check and never touches your normal
todo data directory.

The editor benchmark exercises 200 edits plus full controlled-value
serializations against a realistic 10,000-line file and enforces a 750 ms
release budget.

## Runtime

The gateway starts the aiohttp backend on its assigned `PORT` and reverse-proxies
it at `/apps/todo-txt/api` (forwarding `/api/...` to the backend with a
signed `X-KiroCrew-Proxy` header). The Vite library build produces
`ui/dist/index.mjs` with a `mount(container, options)` export.

## AI edit

Select lines, add comments, and let the AI apply them. The backend calls back
into the local KiroCrew gateway with the app's own identity (an
`X-App-Secret` token exchange) and runs the edit through the app's restricted
`todo-txt-ai-edit` agent (`agents/ai-edit.json`, no tools) as a silent
background spawn. Tiered safeguards snapshot the file before every write,
stage destructive rewrites for review, and reject pathological responses.
