import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TodoTxtSelectionPopover from '../ui/src/components/TodoTxtSelectionPopover';

const anchorRect = new DOMRect(10, 10, 30, 18);

function props(overrides: Record<string, unknown> = {}) {
  return {
    selection: 'alpha\nbeta',
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
    // Required since the AI-edit rewire split the comment box into two
    // destinations (stage in-app vs hand to chat). Absent here the props
    // object no longer satisfies TodoTxtSelectionPopoverProps — a break the
    // vitest run could not see, because the component only calls it on click.
    onAskInChat: vi.fn(),
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('selection action box responsiveness', () => {
  it('shrinks inside a narrow viewport and labels multiple selections', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(240);
    render(<TodoTxtSelectionPopover {...props({ rangeCount: 3 })} />);

    const dialog = screen.getByRole('dialog', {
      name: 'Todo-txt selection actions',
    });
    expect(dialog).toHaveStyle({ width: '224px' });
    expect(dialog).toHaveClass('box-border');
    expect(screen.getByTestId('todo-txt-selection-count')).toHaveTextContent(
      '3 selections',
    );
    expect(screen.getByTestId('todo-txt-selection-prompt')).toHaveAttribute(
      'placeholder',
      'Tell KiroCrew what to do…',
    );
    expect(screen.getByTestId('todo-txt-selection-prompt')).toHaveAttribute(
      'title',
      'Enter to run · Shift+Enter for a new line',
    );
  });

  it('uses the larger side and scrolls internally in a short viewport', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(240);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(288);
    const shortViewportAnchor = new DOMRect(10, 112, 30, 16);

    render(
      <TodoTxtSelectionPopover
        {...props({ anchorRect: shortViewportAnchor })}
      />,
    );

    const dialog = screen.getByRole('dialog', {
      name: 'Todo-txt selection actions',
    });
    expect(dialog).toHaveStyle({
      top: '136px',
      maxHeight: '144px',
      overflowY: 'auto',
    });
  });

  it('flips above the selection top edge without overlap', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(240);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(288);
    const bottomAnchor = new DOMRect(10, 240, 30, 16);

    render(
      <TodoTxtSelectionPopover {...props({ anchorRect: bottomAnchor })} />,
    );

    const dialog = screen.getByRole('dialog', {
      name: 'Todo-txt selection actions',
    });
    expect(dialog).toHaveStyle({
      top: '12px',
      maxHeight: '224px',
    });
  });

  it('keeps dropdown menus in flow so they are measured and scroll with the card', () => {
    render(<TodoTxtSelectionPopover {...props()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Set priority' }));
    const priorityMenu = screen.getByRole('menu', { name: 'Priority options' });
    expect(priorityMenu).not.toHaveClass('absolute');
    expect(priorityMenu).toHaveClass('w-[120px]', 'max-w-full');

    fireEvent.click(screen.getByRole('button', { name: 'Set priority' }));
    fireEvent.click(screen.getByRole('button', { name: 'Set due date' }));
    const dueMenu = screen.getByRole('menu', { name: 'Due date options' });
    expect(dueMenu).not.toHaveClass('absolute');
    expect(dueMenu).toHaveClass('w-[140px]', 'max-w-full');
  });

  it('emits self-contained theme-token CSS for the opaque action card', async () => {
    const source = await readFile(
      resolve(process.cwd(), 'src/components/TodoTxtSelectionPopover.tsx'),
      'utf8',
    );
    const result = await postcss([
      tailwindcss({
        content: [{ raw: source, extension: 'tsx' }],
        corePlugins: { preflight: false },
      }),
    ]).process('@tailwind utilities;', { from: undefined });

    expect(result.css).toContain(
      'background-color: var(--color-bg-elevated)',
    );
    expect(result.css).toContain('border-color: var(--color-border)');
    expect(result.css).toContain('color: var(--color-fg)');
    expect(result.css).toContain('background-color: var(--color-bg-hover)');
    expect(result.css).toContain('background-color: var(--color-bg)');
    expect(result.css).toContain('background-color: var(--accent)');
    expect(result.css).toContain('color: var(--accent-fg)');
    expect(result.css).toContain('color: var(--muted-aa)');
    expect(result.css).toContain('box-sizing: border-box');
    expect(result.css).toContain('border-style: solid');
  });

  it('dismisses when the actual CodeMirror scroll element scrolls', () => {
    const scrollElement = document.createElement('div');
    const onClose = vi.fn();
    render(
      <TodoTxtSelectionPopover
        {...props({ scrollElement, onClose })}
      />,
    );

    fireEvent.scroll(scrollElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
