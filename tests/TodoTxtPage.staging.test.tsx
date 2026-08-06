/**
 * AI staged-edit modal — mounted client coverage (break-the-app round,
 * 2026-08-05).
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The Tier-3 (destructive) AI-edit path STAGES its proposal and shows the
 * "Review AI edit" modal so the user can Apply or Reject. Both buttons were
 * DEAD FOR THE APP'S ENTIRE LIFE: the modal POSTs
 *
 *     /apps/todo-txt/api/ai-snapshots/{ts}/apply
 *     /apps/todo-txt/api/ai-snapshots/{ts}/discard
 *
 * but the backend only registered the `/api/ai-edit/{ts}/...` spellings, so
 * Apply 404'd and Reject failed silently — WHILE THE UI TOASTED SUCCESS. The
 * backend now registers both spellings (pinned by tests/test_ai_staging_apply.py),
 * but there was ZERO mounted client coverage of this flow, which is exactly
 * why a dead button survived so long.
 *
 * These tests pin the CLIENT half:
 *   1. the staged modal renders from a `status:'staged'` ai-edit response
 *      (diff, Δ deltas, reason);
 *   2. Apply POSTs the EXACT `/ai-snapshots/<snap>/apply` url, closes the
 *      modal, refetches content, toasts success  <-- the dead-button regression;
 *   3. Reject POSTs the EXACT `/ai-snapshots/<snap>/discard` url and closes;
 *   4. a 409 from apply (todo.txt changed after staging / snapshot base gone)
 *      discards the stale proposal, closes the modal, and toasts an ERROR
 *      telling the user to re-run;
 *   5. a non-409 apply failure (500) toasts an error and KEEPS the modal open
 *      and does NOT discard — the proposal is still applicable;
 *   6. smoke coverage of the sibling ai-edit dispositions reachable through the
 *      same entry point: Tier-4 `rejected` (HTTP 409 envelope) and Tier-2
 *      `applied` (auto-apply).
 *
 * HOW THE FLOW IS TRIGGERED — READ THIS BEFORE EDITING
 * ---------------------------------------------------
 * The flow CANNOT be driven through the selection popover, and that is not a
 * jsdom limitation: it is a production wiring gap. `pendingComments` is the
 * only gate on `onSubmitAll` (`if (pendingComments.length === 0) return;`) and
 * on the two "Submit All" buttons — and NOTHING in ui/src ever adds to it.
 * The popover's "Just do it ▸" button calls `onAddComment` ->
 * `handleAddComment`, which hands off to KiroCrew chat via
 * `useChatLauncher().openChat()` (Wave-2/B1 rewire) and never touches
 * `setPendingComments`. Grep confirms the only writes are `.filter` (remove),
 * `.map` (edit) and `[]` (clear). So no user can currently reach this modal at
 * all — see the report/source-change request that accompanies this file.
 *
 * Rather than lower the bar to a non-mounted unit test, this file mounts the
 * REAL `TodoTxtPage` and seeds the one piece of state the product no longer
 * wires, using a narrow `useState` seam (see `seedPendingComment`). Everything
 * after that seed is the real component: the real "Submit All" button, the real
 * `onSubmitAll`, the real fetch calls, the real modal, and the real
 * apply/reject/409 handlers. What the seam does NOT cover is the
 * popover -> pendingComments hop, because that hop does not exist.
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { forwardRef, useImperativeHandle } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// The `useState` seam.
//
// `pendingComments` is unreachable from the UI (see the header), so we record
// the state setters TodoTxtPage creates with an empty-array initial value and
// probe them until one makes the pending-comments panel appear. Deliberately
// index-free: nothing here hardcodes a hook position, and if the seam ever
// stops working `seedPendingComment` throws with an explicit message instead
// of silently passing.
// ---------------------------------------------------------------------------
const emptyArraySetters: Array<(value: unknown) => void> = [];
const seenSetters = new Set<unknown>();
let capturing = false;

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  const realUseState = actual.useState as (
    init?: unknown,
  ) => [unknown, (value: unknown) => void];
  function useState(init?: unknown) {
    const pair = realUseState(init);
    if (
      capturing &&
      Array.isArray(init) &&
      init.length === 0 &&
      !seenSetters.has(pair[1])
    ) {
      seenSetters.add(pair[1]);
      emptyArraySetters.push(pair[1]);
    }
    return pair;
  }
  return { ...actual, useState };
});

vi.mock('@kirocrew/app-sdk', () => ({
  useChatLauncher: () => ({ openChat: vi.fn() }),
}));

vi.mock('../ui/src/components/CmEditor', async () => {
  const React = await import('react');
  const CmEditorStub = forwardRef<
    {
      focus: () => void;
      getCaret: () => number;
      getView: () => null;
      getSelections: () => never[];
      getScrollElement: () => null;
      getValue: () => string;
      setCaret: () => void;
      setSelection: () => void;
    },
    { value: string; onChange: (value: string) => void }
  >(({ value, onChange }, ref) => {
    useImperativeHandle(ref, () => ({
      focus: () => undefined,
      getCaret: () => value.length,
      getView: () => null,
      getSelections: () => [],
      getScrollElement: () => null,
      getValue: () => value,
      setCaret: () => undefined,
      setSelection: () => undefined,
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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Snapshot id the staged payload carries; every url assertion uses it. */
const SNAP = 'todo-1700000000000.txt';
const APPLY_URL = `/apps/todo-txt/api/ai-snapshots/${SNAP}/apply`;
const DISCARD_URL = `/apps/todo-txt/api/ai-snapshots/${SNAP}/discard`;

const DISK_BEFORE = 'buy milk\nx old thing\nx older thing\n';
const DISK_AFTER_APPLY = 'buy milk\n';

const STAGED_PAYLOAD = {
  status: 'staged' as const,
  tier: 3 as const,
  proposed: DISK_AFTER_APPLY,
  diff: '--- todo.txt\n+++ proposed\n-x old thing\n-x older thing\n',
  snapshot: SNAP,
  line_delta: -2,
  char_delta: -28,
  reason: 'Removes 2 completed lines — review before applying.',
};

function jsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

function errorResponse(status: number, body = '') {
  return {
    ok: false,
    status,
    headers: { get: () => null },
    json: async () => ({ error: body }),
    text: async () => body,
  };
}

interface RouterOptions {
  /** Response for POST /api/ai-edit. Defaults to the staged Tier-3 payload. */
  aiEdit?: () => unknown;
  /** Response for POST /api/ai-snapshots/<snap>/apply. Defaults to 200. */
  apply?: () => unknown;
}

/**
 * Route-aware fetch mock covering mount, autosave, ai-edit, and the
 * staged-snapshot apply/discard pair. Records every call so tests can assert
 * on the EXACT url string (the dead-button regression was a url typo, so a
 * loose `.includes('apply')` match would not have caught it).
 */
function installFetchRouter(options: RouterOptions = {}) {
  const calls: Array<{ url: string; method: string }> = [];
  const state = { disk: DISK_BEFORE, mtime: 11 };

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    calls.push({ url, method });

    if (url === '/apps/todo-txt/api/ai-edit' && method === 'POST') {
      return options.aiEdit
        ? options.aiEdit()
        : jsonResponse(STAGED_PAYLOAD);
    }
    if (url === APPLY_URL && method === 'POST') {
      if (options.apply) return options.apply();
      state.disk = DISK_AFTER_APPLY;
      state.mtime = 22;
      return jsonResponse({ applied: SNAP, mtime: 22, bytes: 9 });
    }
    if (url === DISCARD_URL && method === 'POST') {
      return jsonResponse({ discarded: SNAP });
    }
    if (url.endsWith('/api/content') && method === 'GET') {
      return jsonResponse({ content: state.disk, mtime: state.mtime });
    }
    if (url.endsWith('/api/content') && method === 'PUT') {
      return jsonResponse({ mtime: state.mtime });
    }
    if (url.includes('/api/file?name=') && method === 'GET') {
      return jsonResponse({ content: state.disk, mtime: state.mtime });
    }
    return jsonResponse({ content: state.disk, mtime: state.mtime });
  });

  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, calls, state };
}

function callsTo(
  calls: Array<{ url: string; method: string }>,
  url: string,
  method = 'POST',
) {
  return calls.filter((c) => c.url === url && c.method === method);
}

/**
 * Mount TodoTxtPage and seed exactly one pending AI comment, so the real
 * "Submit All" button renders and the real `onSubmitAll` becomes reachable.
 *
 * Throws loudly (rather than skipping) if the seam stops working — e.g. if
 * `pendingComments` is refactored to a reducer/ref, or if the popover is
 * finally rewired to populate it, at which point this helper should be
 * replaced by a real popover interaction.
 */
async function mountWithPendingComment(): Promise<void> {
  emptyArraySetters.length = 0;
  seenSetters.clear();
  capturing = true;
  render(<TodoTxtPage />);
  const editor = await screen.findByTestId('todo-txt-cm-editor-stub');
  await waitFor(() => expect(editor).toHaveValue(DISK_BEFORE));
  capturing = false;

  const comment = [
    {
      id: 'c1',
      anchor: 'x old thing',
      text: 'drop the completed lines',
      line: 2,
      column: 1,
    },
  ];

  for (const setState of emptyArraySetters) {
    await act(async () => {
      setState(comment);
    });
    if (screen.queryByTestId('todo-txt-pending-comments')) return;
    await act(async () => {
      setState([]);
    });
  }

  throw new Error(
    'useState seam broke: no empty-array state in TodoTxtPage produced the ' +
      'pending-comments panel. If the selection popover now populates ' +
      'pendingComments, drive the flow through it instead of this helper.',
  );
}

/** Submit the seeded comment, driving the real POST /api/ai-edit. */
async function submitAll(): Promise<void> {
  fireEvent.click(screen.getByTestId('todo-txt-pending-submit-all'));
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal('indexedDB', undefined);
});

afterEach(() => {
  cleanup();
  capturing = false;
  emptyArraySetters.length = 0;
  seenSetters.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// 1. The staged modal renders from a Tier-3 `staged` response
// ---------------------------------------------------------------------------

describe('Tier-3 staged AI edit — modal rendering', () => {
  it('opens the review modal with the diff, the Δ deltas, and the reason', async () => {
    const { calls } = installFetchRouter();
    await mountWithPendingComment();
    await submitAll();

    const modal = await screen.findByTestId('todo-txt-staged-modal');
    expect(modal).toHaveTextContent('Review AI edit');

    // The diff the backend proposed must be visible verbatim — this pane is
    // the only thing standing between the user and a destructive write.
    const diff = screen.getByTestId('todo-txt-staged-diff');
    expect(diff).toHaveTextContent('-x old thing');
    expect(diff).toHaveTextContent('-x older thing');

    // Signed deltas, so "-2 lines" can never be read as "+2 lines".
    expect(modal).toHaveTextContent('-2 lines');
    expect(modal).toHaveTextContent('-28 chars');

    // Backend's staging reason, verbatim.
    expect(modal).toHaveTextContent(
      'Removes 2 completed lines — review before applying.',
    );

    // Nothing was written yet: staging must not apply anything by itself.
    expect(callsTo(calls, APPLY_URL)).toHaveLength(0);
    expect(callsTo(calls, DISCARD_URL)).toHaveLength(0);

    // Comments were consumed by the submit, so the pending panel is gone.
    expect(screen.queryByTestId('todo-txt-pending-comments')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. Apply — the dead-button regression
// ---------------------------------------------------------------------------

describe('Tier-3 staged AI edit — Apply', () => {
  it('POSTs the exact /ai-snapshots/<snap>/apply url, closes, refetches, toasts success', async () => {
    const { calls } = installFetchRouter();
    await mountWithPendingComment();
    await submitAll();
    await screen.findByTestId('todo-txt-staged-modal');

    calls.length = 0;
    fireEvent.click(screen.getByTestId('todo-txt-staged-apply'));

    // THE regression. Asserted as an EXACT string, not a substring: the bug
    // was that the client posted /ai-snapshots/... while the backend only
    // served /ai-edit/..., so every Apply 404'd while the UI toasted success.
    // A loose match would have passed against the broken url too.
    await waitFor(() => expect(callsTo(calls, APPLY_URL)).toHaveLength(1));

    // Modal closes only on a genuine success.
    await waitFor(() =>
      expect(screen.queryByTestId('todo-txt-staged-modal')).toBeNull(),
    );

    // Applied content is pulled back from disk, so the editor cannot keep
    // showing pre-apply text (the state the 404 bug left users in).
    await waitFor(() =>
      expect(screen.getByTestId('todo-txt-cm-editor-stub')).toHaveValue(
        DISK_AFTER_APPLY,
      ),
    );
    expect(
      calls.some((c) => c.url.endsWith('/api/content') && c.method === 'GET'),
    ).toBe(true);

    // Success toast — and it must be the SUCCESS tone, since the old bug's
    // whole signature was a success toast over a failed write.
    const toast = await screen.findByTestId('todo-txt-toast-success');
    expect(toast).toHaveTextContent('KiroCrew applied staged edit');
    expect(toast).toHaveTextContent('-2 lines');

    // Applying is not discarding.
    expect(callsTo(calls, DISCARD_URL)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Reject / discard
// ---------------------------------------------------------------------------

describe('Tier-3 staged AI edit — Reject', () => {
  it('POSTs the exact /ai-snapshots/<snap>/discard url and closes the modal', async () => {
    const { calls } = installFetchRouter();
    await mountWithPendingComment();
    await submitAll();
    await screen.findByTestId('todo-txt-staged-modal');

    calls.length = 0;
    fireEvent.click(screen.getByTestId('todo-txt-staged-reject'));

    await waitFor(() => expect(callsTo(calls, DISCARD_URL)).toHaveLength(1));
    await waitFor(() =>
      expect(screen.queryByTestId('todo-txt-staged-modal')).toBeNull(),
    );

    // Rejecting must never write the proposal.
    expect(callsTo(calls, APPLY_URL)).toHaveLength(0);

    const toast = await screen.findByTestId('todo-txt-toast-info');
    expect(toast).toHaveTextContent('Staged AI edit discarded');
  });
});

// ---------------------------------------------------------------------------
// 4. The 409 stale-proposal branch
// ---------------------------------------------------------------------------

describe('Tier-3 staged AI edit — 409 stale proposal', () => {
  it('discards the snapshot, closes the modal, and toasts an error telling the user to re-run', async () => {
    const { calls } = installFetchRouter({
      // todo.txt changed after staging (or the snapshot base is gone): the
      // backend refuses to apply a diff computed against older content.
      apply: () => errorResponse(409, 'stale: todo.txt changed since staging'),
    });
    await mountWithPendingComment();
    await submitAll();
    await screen.findByTestId('todo-txt-staged-modal');

    calls.length = 0;
    fireEvent.click(screen.getByTestId('todo-txt-staged-apply'));

    await waitFor(() => expect(callsTo(calls, APPLY_URL)).toHaveLength(1));

    // (a) the proposal can never become applicable again, so it must be
    // discarded server-side rather than lingering exempt from pruning.
    await waitFor(() => expect(callsTo(calls, DISCARD_URL)).toHaveLength(1));

    // (b) the modal closes — leaving it open would invite an endless retry
    // loop against a proposal that can only ever 409.
    await waitFor(() =>
      expect(screen.queryByTestId('todo-txt-staged-modal')).toBeNull(),
    );

    // (c) ERROR tone, and the copy must say the proposal was stale AND tell
    // the user to re-run — a success/info toast here would be the same class
    // of lie as the original dead-button bug.
    const toast = await screen.findByTestId('todo-txt-toast-error');
    expect(toast).toHaveTextContent('todo.txt changed after this edit was staged');
    expect(toast).toHaveTextContent('Re-run the AI edit');
    expect(screen.queryByTestId('todo-txt-toast-success')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 5. A non-409 apply failure is recoverable — keep the proposal
// ---------------------------------------------------------------------------

describe('Tier-3 staged AI edit — non-409 apply failure', () => {
  it('toasts an error, keeps the modal open, and does NOT discard the proposal', async () => {
    const { calls } = installFetchRouter({
      apply: () => errorResponse(500, 'disk on fire'),
    });
    await mountWithPendingComment();
    await submitAll();
    await screen.findByTestId('todo-txt-staged-modal');

    calls.length = 0;
    fireEvent.click(screen.getByTestId('todo-txt-staged-apply'));

    await waitFor(() => expect(callsTo(calls, APPLY_URL)).toHaveLength(1));

    const toast = await screen.findByTestId('todo-txt-toast-error');
    expect(toast).toHaveTextContent('Apply failed');
    expect(toast).toHaveTextContent('disk on fire');

    // A 500 is transient: the staged proposal is still valid against current
    // content, so it must survive for a retry.
    expect(callsTo(calls, DISCARD_URL)).toHaveLength(0);
    expect(screen.getByTestId('todo-txt-staged-modal')).toBeInTheDocument();

    // Retry is actually possible — the button re-enables once the attempt
    // settles (`submitting` back to false).
    await waitFor(() =>
      expect(screen.getByTestId('todo-txt-staged-apply')).toBeEnabled(),
    );
  });
});

// ---------------------------------------------------------------------------
// 6. Sibling dispositions reachable through the same entry point
// ---------------------------------------------------------------------------

describe('sibling AI-edit dispositions', () => {
  it('Tier-4 rejected (HTTP 409 envelope) toasts the reason and opens no modal', async () => {
    installFetchRouter({
      aiEdit: () =>
        jsonResponse(
          {
            status: 'rejected',
            tier: 4,
            reason: 'proposal would delete 80% of the file',
            snapshot: SNAP,
            diff: '-everything\n',
          },
          409,
        ),
    });
    await mountWithPendingComment();
    await submitAll();

    const toast = await screen.findByTestId('todo-txt-toast-error');
    expect(toast).toHaveTextContent('AI edit rejected');
    expect(toast).toHaveTextContent('proposal would delete 80% of the file');
    expect(screen.queryByTestId('todo-txt-staged-modal')).toBeNull();
  });

  it('Tier-2 applied auto-applies: success toast, refetched content, no modal', async () => {
    const { calls, state } = installFetchRouter({
      aiEdit: () => {
        state.disk = 'buy milk\nx old thing\nx older thing\ncall mum\n';
        state.mtime = 33;
        return jsonResponse({
          status: 'applied',
          tier: 2,
          mtime: 33,
          bytes: 44,
          snapshot: SNAP,
          line_delta: 1,
          char_delta: 9,
        });
      },
    });
    await mountWithPendingComment();
    await submitAll();

    const toast = await screen.findByTestId('todo-txt-toast-success');
    expect(toast).toHaveTextContent('KiroCrew added 1 line');
    expect(screen.queryByTestId('todo-txt-staged-modal')).toBeNull();

    await waitFor(() =>
      expect(screen.getByTestId('todo-txt-cm-editor-stub')).toHaveValue(
        'buy milk\nx old thing\nx older thing\ncall mum\n',
      ),
    );
    // Auto-apply is Tier 2: no staged snapshot to commit or discard.
    expect(callsTo(calls, APPLY_URL)).toHaveLength(0);
    expect(callsTo(calls, DISCARD_URL)).toHaveLength(0);
  });
});
