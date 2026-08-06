/**
 * CommandPalette — component tests (T9).
 *
 * Required coverage per spec: 4 tests.
 *   1. open/close:        the modal renders only when `open={true}` and
 *                         calls `onClose` on Escape / backdrop click.
 *   2. type-filter:       typing in the search input narrows the visible
 *                         command list (case-insensitive substring match
 *                         across name + shortName + description).
 *   3. arrow-navigation:  ArrowDown / ArrowUp move the active highlight
 *                         through the filtered list and clamp at ends.
 *   4. Enter-executes:    Enter on a zero-arg command fires `onExecute`
 *                         with an empty args array and calls `onClose`.
 *                         Enter on a command with `argSchema.length > 0`
 *                         reveals the argument form and, after filling
 *                         it, fires `onExecute` with the collected args.
 *
 * Rendering backend: @testing-library/react + userEvent + vitest + jsdom.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommandPalette } from '../ui/src/components/CommandPalette';
import type { Command } from '../ui/src/utils/commands';

// ---------------------------------------------------------------------------
// Fixtures — a minimal 4-command registry that exercises all branches.
// ---------------------------------------------------------------------------

function makeCommands(): Command[] {
  return [
    {
      name: 'add',
      shortName: 'a',
      description: 'Add a new task to todo.txt.',
      argSchema: [
        { name: 'text', type: 'string', description: 'Task text' },
      ],
      apply: () => {
        throw new Error('stub');
      },
    },
    {
      name: 'do',
      shortName: 'x',
      description: 'Mark an item as done.',
      argSchema: [
        { name: 'item#', type: 'number', description: '1-indexed line' },
      ],
      apply: () => {
        throw new Error('stub');
      },
    },
    {
      name: 'archive',
      description: 'Move done items from todo.txt to done.txt.',
      argSchema: [],
      apply: () => {
        throw new Error('stub');
      },
    },
    {
      name: 'help',
      shortName: '?',
      description: 'Show format spec and list of all commands.',
      argSchema: [],
      apply: () => {
        throw new Error('stub');
      },
    },
  ];
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CommandPalette — open/close', () => {
  it('renders nothing when closed and calls onClose on Esc / backdrop', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onExecute = vi.fn();
    const commands = makeCommands();

    // Closed -> nothing in the DOM.
    const { rerender } = render(
      <CommandPalette
        open={false}
        onClose={onClose}
        onExecute={onExecute}
        commands={commands}
      />,
    );
    expect(screen.queryByTestId('command-palette')).toBeNull();

    // Open -> panel is in the DOM and search input is focused.
    rerender(
      <CommandPalette
        open={true}
        onClose={onClose}
        onExecute={onExecute}
        commands={commands}
      />,
    );
    expect(screen.getByTestId('command-palette')).toBeTruthy();
    const search = screen.getByTestId('command-palette-search') as HTMLInputElement;
    expect(search).toBeTruthy();

    // Esc closes even if focus has not reached (or has left) the search input.
    search.blur();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    // Backdrop click also closes.
    onClose.mockClear();
    fireEvent.click(screen.getByTestId('command-palette-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);

    // onExecute must not have fired during any of the above.
    expect(onExecute).not.toHaveBeenCalled();
  });
});

describe('CommandPalette — type-filter', () => {
  it('filters the list by case-insensitive substring match', async () => {
    const user = userEvent.setup();
    const commands = makeCommands();

    render(
      <CommandPalette
        open={true}
        onClose={vi.fn()}
        onExecute={vi.fn()}
        commands={commands}
      />,
    );

    // All 4 commands visible initially.
    expect(screen.getByTestId('command-item-add')).toBeTruthy();
    expect(screen.getByTestId('command-item-do')).toBeTruthy();
    expect(screen.getByTestId('command-item-archive')).toBeTruthy();
    expect(screen.getByTestId('command-item-help')).toBeTruthy();

    // Type "arc" — only "archive" matches (name substring, case-insensitive).
    const search = screen.getByTestId('command-palette-search') as HTMLInputElement;
    await user.type(search, 'ARC');
    expect(screen.queryByTestId('command-item-add')).toBeNull();
    expect(screen.queryByTestId('command-item-do')).toBeNull();
    expect(screen.getByTestId('command-item-archive')).toBeTruthy();
    expect(screen.queryByTestId('command-item-help')).toBeNull();

    // Clear and type "done" — matches "do" (description: "Mark an item as done.")
    // AND "archive" (description mentions "done items"). Both visible.
    await user.clear(search);
    await user.type(search, 'done');
    expect(screen.queryByTestId('command-item-add')).toBeNull();
    expect(screen.getByTestId('command-item-do')).toBeTruthy();
    expect(screen.getByTestId('command-item-archive')).toBeTruthy();
    expect(screen.queryByTestId('command-item-help')).toBeNull();

    // A query that matches nothing surfaces the empty state.
    await user.clear(search);
    await user.type(search, 'zzzzzzz-nope');
    expect(screen.getByTestId('command-palette-empty')).toBeTruthy();
  });
});

describe('CommandPalette — arrow navigation', () => {
  it('moves the active highlight with ArrowDown/ArrowUp and clamps', async () => {
    const user = userEvent.setup();
    const commands = makeCommands();

    render(
      <CommandPalette
        open={true}
        onClose={vi.fn()}
        onExecute={vi.fn()}
        commands={commands}
      />,
    );

    // First item ("add") is active by default.
    expect(
      screen.getByTestId('command-item-add').getAttribute('data-active'),
    ).toBe('true');

    // ArrowDown -> "do" becomes active.
    await user.keyboard('{ArrowDown}');
    expect(
      screen.getByTestId('command-item-add').getAttribute('data-active'),
    ).toBe('false');
    expect(
      screen.getByTestId('command-item-do').getAttribute('data-active'),
    ).toBe('true');

    // ArrowDown twice more -> "help" (last) active.
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(
      screen.getByTestId('command-item-help').getAttribute('data-active'),
    ).toBe('true');

    // Past-end ArrowDown is clamped at "help".
    await user.keyboard('{ArrowDown}');
    expect(
      screen.getByTestId('command-item-help').getAttribute('data-active'),
    ).toBe('true');

    // ArrowUp walks back.
    await user.keyboard('{ArrowUp}');
    expect(
      screen.getByTestId('command-item-archive').getAttribute('data-active'),
    ).toBe('true');

    // Walk all the way up, clamped at "add".
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(
      screen.getByTestId('command-item-add').getAttribute('data-active'),
    ).toBe('true');
  });
});

describe('CommandPalette — Enter executes', () => {
  it('fires onExecute for zero-arg commands and collects args for others', async () => {
    const user = userEvent.setup();
    const commands = makeCommands();

    // ---- zero-arg command ("archive") ------------------------------------
    const onClose1 = vi.fn();
    const onExecute1 = vi.fn();
    const { unmount } = render(
      <CommandPalette
        open={true}
        onClose={onClose1}
        onExecute={onExecute1}
        commands={commands}
      />,
    );

    // Filter to "archive" (so it's the only visible item).
    const search1 = screen.getByTestId('command-palette-search') as HTMLInputElement;
    await user.type(search1, 'archive');
    expect(
      screen.getByTestId('command-item-archive').getAttribute('data-active'),
    ).toBe('true');

    // Enter -> onExecute called with the command and empty args array, then onClose.
    await user.keyboard('{Enter}');
    expect(onExecute1).toHaveBeenCalledTimes(1);
    const [executedCmd, executedArgs] = onExecute1.mock.calls[0];
    expect((executedCmd as Command).name).toBe('archive');
    expect(executedArgs).toEqual([]);
    expect(onClose1).toHaveBeenCalledTimes(1);

    unmount();

    // ---- command with args ("add") ---------------------------------------
    const onClose2 = vi.fn();
    const onExecute2 = vi.fn();
    render(
      <CommandPalette
        open={true}
        onClose={onClose2}
        onExecute={onExecute2}
        commands={commands}
      />,
    );

    const search2 = screen.getByTestId('command-palette-search') as HTMLInputElement;
    await user.type(search2, 'add');
    expect(
      screen.getByTestId('command-item-add').getAttribute('data-active'),
    ).toBe('true');

    // First Enter reveals the argument form; onExecute must NOT fire yet.
    await user.keyboard('{Enter}');
    expect(onExecute2).not.toHaveBeenCalled();
    expect(screen.getByTestId('command-palette-args')).toBeTruthy();

    // Fill the argument (focus is already on arg-input-0) and Enter submits.
    const argInput = screen.getByTestId('arg-input-0') as HTMLInputElement;
    await user.type(argInput, 'write tests');
    await user.keyboard('{Enter}');

    expect(onExecute2).toHaveBeenCalledTimes(1);
    const [addCmd, addArgs] = onExecute2.mock.calls[0];
    expect((addCmd as Command).name).toBe('add');
    expect(addArgs).toEqual(['write tests']);
    expect(onClose2).toHaveBeenCalledTimes(1);
  });
});
