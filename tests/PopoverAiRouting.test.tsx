/**
 * Popover → AI-edit routing contract.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The popover's comment box has two destinations with distinct meanings:
 *
 *   "Just do it ▸"  → onAddComment  → pendingComments → POST /api/ai-edit
 *                     (tiered safeguards, snapshot, staged diff for review)
 *   "Ask in chat"   → onAskInChat   → useChatLauncher().openChat()
 *                     (the conversational escape hatch)
 *
 * Nothing but this routing distinguishes them, and getting it wrong is
 * invisible: if the "Just do it" button reaches the chat launcher instead,
 * `pendingComments` never fills, and the staged-edit modal, apply, discard
 * and the whole backend staging pipeline become unreachable dead code while
 * still looking wired (see tests/TodoTxtPage.staging.test.tsx).
 *
 * These tests therefore pin the DESTINATION of each control, not merely that
 * a submit happened — an assertion of the latter kind passes against wiring
 * that goes nowhere.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import TodoTxtSelectionPopover from '../ui/src/components/TodoTxtSelectionPopover';

const anchorRect = new DOMRect(10, 10, 30, 18);

function props(overrides: Record<string, unknown> = {}) {
  return {
    selection: '(A) ship the feature +kirocrew @work due:2026-05-10',
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
    onAskInChat: vi.fn(),
    ...overrides,
  };
}

function typePrompt(text: string) {
  const box = screen.getByTestId('todo-txt-selection-prompt');
  fireEvent.change(box, { target: { value: text } });
  return box;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('popover comment routing — "Just do it" stages an AI edit', () => {
  it('calls onAddComment with the anchor and prompt, NOT onAskInChat', () => {
    const onAddComment = vi.fn();
    const onAskInChat = vi.fn();
    render(
      <TodoTxtSelectionPopover {...props({ onAddComment, onAskInChat })} />,
    );

    typePrompt('split this into 3 subtasks');
    fireEvent.click(screen.getByTestId('todo-txt-just-do-it'));

    expect(onAddComment).toHaveBeenCalledTimes(1);
    expect(onAddComment).toHaveBeenCalledWith({
      anchor: '(A) ship the feature +kirocrew @work due:2026-05-10',
      text: 'split this into 3 subtasks',
    });
    // The load-bearing half: if this button reaches the chat launcher, the
    // staged pipeline has no producer and silently becomes dead code.
    expect(onAskInChat).not.toHaveBeenCalled();
  });

  it('stays open and clears the box so comments can be stacked', () => {
    const onAddComment = vi.fn();
    const onClose = vi.fn();
    render(<TodoTxtSelectionPopover {...props({ onAddComment, onClose })} />);

    typePrompt('add due dates');
    fireEvent.click(screen.getByTestId('todo-txt-just-do-it'));
    expect(screen.getByTestId('todo-txt-selection-prompt')).toHaveValue('');
    expect(onClose).not.toHaveBeenCalled();

    typePrompt('and a +project tag');
    fireEvent.click(screen.getByTestId('todo-txt-just-do-it'));
    expect(onAddComment).toHaveBeenCalledTimes(2);
    expect(onAddComment).toHaveBeenLastCalledWith({
      anchor: '(A) ship the feature +kirocrew @work due:2026-05-10',
      text: 'and a +project tag',
    });
  });

  it('routes Enter to the staged pipeline, matching the primary button', () => {
    const onAddComment = vi.fn();
    const onAskInChat = vi.fn();
    render(
      <TodoTxtSelectionPopover {...props({ onAddComment, onAskInChat })} />,
    );

    const box = typePrompt('tidy this line');
    fireEvent.keyDown(box, { key: 'Enter' });

    expect(onAddComment).toHaveBeenCalledTimes(1);
    expect(onAskInChat).not.toHaveBeenCalled();
  });
});

describe('popover comment routing — "Ask in chat" keeps the handoff', () => {
  it('calls onAskInChat with the anchor and prompt, NOT onAddComment', () => {
    const onAddComment = vi.fn();
    const onAskInChat = vi.fn();
    render(
      <TodoTxtSelectionPopover {...props({ onAddComment, onAskInChat })} />,
    );

    typePrompt('what should I prioritise here?');
    fireEvent.click(screen.getByTestId('todo-txt-ask-in-chat'));

    expect(onAskInChat).toHaveBeenCalledTimes(1);
    expect(onAskInChat).toHaveBeenCalledWith({
      anchor: '(A) ship the feature +kirocrew @work due:2026-05-10',
      text: 'what should I prioritise here?',
    });
    expect(onAddComment).not.toHaveBeenCalled();
  });
});

describe('popover comment routing — shared guards', () => {
  it('disables both destinations while the prompt is empty', () => {
    render(<TodoTxtSelectionPopover {...props()} />);
    expect(screen.getByTestId('todo-txt-just-do-it')).toBeDisabled();
    expect(screen.getByTestId('todo-txt-ask-in-chat')).toBeDisabled();

    typePrompt('   ');
    expect(screen.getByTestId('todo-txt-just-do-it')).toBeDisabled();
    expect(screen.getByTestId('todo-txt-ask-in-chat')).toBeDisabled();

    typePrompt('do the thing');
    expect(screen.getByTestId('todo-txt-just-do-it')).toBeEnabled();
    expect(screen.getByTestId('todo-txt-ask-in-chat')).toBeEnabled();
  });

  it('fires neither destination for a whitespace-only prompt', () => {
    const onAddComment = vi.fn();
    const onAskInChat = vi.fn();
    render(
      <TodoTxtSelectionPopover {...props({ onAddComment, onAskInChat })} />,
    );

    const box = typePrompt('   ');
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onAddComment).not.toHaveBeenCalled();
    expect(onAskInChat).not.toHaveBeenCalled();
  });
});
