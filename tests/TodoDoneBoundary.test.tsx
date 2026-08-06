/**
 * The todo.txt ↔ done.txt boundary.
 *
 * Both tabs render the same editor over a different file, so every action that
 * crosses the boundary needs to know which file it is standing on. Four such
 * invariants are pinned here:
 *
 *   1. The popover's "→ Done" (archive) belongs to todo.txt only. The archive
 *      pipeline's save step writes the transformed ACTIVE editor content as
 *      todo.txt, so offering the button on the done tab would overwrite
 *      todo.txt with done.txt wholesale. The button renders only when
 *      `file === 'todo'`, with a defense-in-depth guard in the page handler.
 *   2. Spawning a `rec:` next-instance is a todo.txt semantic. Completing (or
 *      re-completing) a recurring task on the done tab must not plant a fresh
 *      ACTIVE task inside done.txt, where nobody looks. Recurrence generation
 *      is gated to todo.txt on all three surfaces (popover / Cmd+D / vim \x →
 *      `toggleDoneForFile`).
 *   3. `move N todo` FROM the done tab is the sanctioned un-archive path, so
 *      `move` must NOT be gated to the todo tab — `applyMove` is file-aware.
 *      The report tab, which has no file to move within, gets a clear error
 *      instead of a backend 400.
 *   4. Cmd+D accepts an injectable transform so the page can pass the
 *      file-aware closure rather than the recurrence-spawning default.
 */

import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditorView } from '@codemirror/view';

import TodoTxtSelectionPopover from '../ui/src/components/TodoTxtSelectionPopover';
import { toggleDoneForFile } from '../ui/src/components/cm-vim-todotxt';
import { bindCurrentLineDoneShortcut } from '../ui/src/utils/todoTxtUiBehavior';
import { COMMANDS, type ApplyResult } from '../ui/src/utils/commands';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

const anchorRect = new DOMRect(10, 10, 30, 18);

function popoverProps(overrides: Record<string, unknown> = {}) {
  return {
    selection: 'alpha',
    anchorRect,
    onClose: vi.fn(),
    onMarkDone: vi.fn(),
    onSetPriority: vi.fn(),
    onAddCreationDate: vi.fn(),
    onCopy: vi.fn(),
    onDeleteLine: vi.fn(),
    onDuplicateLine: vi.fn(),
    onArchiveSelection: vi.fn(),
    onSetDueDate: vi.fn(),
    onAddComment: vi.fn(),
    // The comment box has two destinations (stage in-app vs hand to chat), so
    // both handlers are required props.
    onAskInChat: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// 1. Archive is todo.txt-only in the popover
// ---------------------------------------------------------------------------

describe('popover archive button file gating', () => {
  it('renders "→ Done" on the todo tab', () => {
    render(<TodoTxtSelectionPopover {...popoverProps({ file: 'todo' })} />);
    expect(
      screen.getByRole('button', { name: /archive line to done\.txt/i }),
    ).toBeInTheDocument();
  });

  it('defaults to the todo behavior when file is omitted (legacy callers)', () => {
    render(<TodoTxtSelectionPopover {...popoverProps()} />);
    expect(
      screen.getByRole('button', { name: /archive line to done\.txt/i }),
    ).toBeInTheDocument();
  });

  it('hides "→ Done" on the done tab — the pipeline saves the active editor content AS todo.txt', () => {
    render(<TodoTxtSelectionPopover {...popoverProps({ file: 'done' })} />);
    expect(
      screen.queryByRole('button', { name: /archive line to done\.txt/i }),
    ).not.toBeInTheDocument();
    // The rest of the quick actions stay: done.txt is still a raw file.
    expect(screen.getByRole('button', { name: /mark done/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete line/i })).toBeInTheDocument();
    // The comment box stays too (chat paste-back flow, file-safe).
    expect(screen.getByTestId('todo-txt-selection-prompt')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 2. Recurrence generation is a todo.txt semantic
// ---------------------------------------------------------------------------

describe('toggleDoneForFile recurrence gating', () => {
  const REC_LINE = 'Water the plants @home rec:3d';

  it('spawns the next instance when completing in todo.txt', () => {
    const out = toggleDoneForFile(REC_LINE, 'todo');
    expect(out.split('\n')).toHaveLength(2);
    expect(out.split('\n')[0]).toMatch(/^x \d{4}-\d{2}-\d{2} /);
    expect(out.split('\n')[1]).toContain('rec:3d');
  });

  it('treats an undefined file as todo (standalone/legacy callers)', () => {
    expect(toggleDoneForFile(REC_LINE, undefined).split('\n')).toHaveLength(2);
  });

  it('does NOT spawn an instance when toggling in done.txt', () => {
    const out = toggleDoneForFile(REC_LINE, 'done');
    expect(out.split('\n')).toHaveLength(1);
    expect(out).toMatch(/^x \d{4}-\d{2}-\d{2} /);
  });

  it('un-toggle in done.txt is a plain correction — no side effects', () => {
    const done = toggleDoneForFile(REC_LINE, 'done');
    const restored = toggleDoneForFile(done, 'done');
    expect(restored).toBe(REC_LINE);
  });
});

// ---------------------------------------------------------------------------
// 3. move is reachable from the done tab; report tab gets a clear error
// ---------------------------------------------------------------------------

describe('move across tabs', () => {
  const moveCmd = COMMANDS.find((c) => c.name === 'move')!;

  it('builds the un-archive server action from the done tab', () => {
    const result = moveCmd.apply('x 2026-08-01 Old task\n', ['1', 'todo'], 'done') as Extract<
      ApplyResult,
      { type: 'server-action' }
    >;
    expect(result.type).toBe('server-action');
    expect(result.body).toMatchObject({ item: 1, from: 'done', to: 'todo' });
  });

  it('rejects the report tab with a tab-switch message, not a backend 400', () => {
    expect(() => moveCmd.apply('snapshot\n', ['1', 'todo'], 'report')).toThrow(
      /switch to the todo or done tab/i,
    );
  });
});

// ---------------------------------------------------------------------------
// 4. Cmd+D uses the injected (file-aware) transform
// ---------------------------------------------------------------------------

describe('bindCurrentLineDoneShortcut transform injection', () => {
  function editorView(text: string) {
    const dispatch = vi.fn();
    const view = {
      hasFocus: true,
      state: {
        selection: { main: { from: 0, to: 0 } },
        doc: { lineAt: () => ({ from: 0, to: text.length, text }) },
      },
      dispatch,
    } as unknown as EditorView;
    return { view, dispatch };
  }

  it('applies the custom transform instead of the recurrence default', () => {
    const { view, dispatch } = editorView('Water the plants rec:3d');
    const transform = vi.fn((line: string) => `x 2026-08-05 ${line}`);
    const unbind = bindCurrentLineDoneShortcut(() => view, false, window, transform);
    window.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'd', ctrlKey: true }),
    );
    expect(transform).toHaveBeenCalledWith('Water the plants rec:3d');
    expect(dispatch).toHaveBeenCalledWith({
      changes: { from: 0, to: 23, insert: 'x 2026-08-05 Water the plants rec:3d' },
    });
    unbind();
  });
});
