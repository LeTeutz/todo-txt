import type { EditorView } from '@codemirror/view';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import TodoTxtSelectionPopover from '../ui/src/components/TodoTxtSelectionPopover';
import {
  bindAmoledThemeSync,
  bindCurrentLineDoneShortcut,
  bindHelpRailShortcut,
} from '../ui/src/utils/todoTxtUiBehavior';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

function keyboardEvent(
  key: string,
  options: KeyboardEventInit = {},
): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
    ...options,
  });
}

function editorView(
  text = 'ship the feature',
  selection = { from: 0, to: 0 },
): { view: EditorView; dispatch: ReturnType<typeof vi.fn> } {
  const dispatch = vi.fn();
  const view = {
    hasFocus: true,
    state: {
      selection: { main: selection },
      doc: {
        lineAt: () => ({ from: 0, to: text.length, text }),
      },
    },
    dispatch,
  } as unknown as EditorView;
  return { view, dispatch };
}

const anchorRect = {
  x: 10,
  y: 10,
  width: 40,
  height: 18,
  top: 10,
  right: 50,
  bottom: 28,
  left: 10,
  toJSON: () => ({}),
} as DOMRect;

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-theme');
  document.body.replaceChildren();
  document.head.querySelectorAll('[data-todotxt-test-theme]').forEach((node) => node.remove());
});

describe('global todo.txt shortcuts', () => {
  it('Ctrl+/ toggles help, prevents the browser action, and cleans up', () => {
    const onToggle = vi.fn();
    const unbind = bindHelpRailShortcut(onToggle);
    const first = keyboardEvent('/', { ctrlKey: true });

    window.dispatchEvent(first);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(first.defaultPrevented).toBe(true);

    unbind();
    window.dispatchEvent(keyboardEvent('/', { ctrlKey: true }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('Ctrl+D toggles the focused current line outside Vim mode', () => {
    const { view, dispatch } = editorView();
    const unbind = bindCurrentLineDoneShortcut(() => view, false);
    const event = keyboardEvent('d', { ctrlKey: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(dispatch).toHaveBeenCalledTimes(1);
    const transaction = dispatch.mock.calls[0][0];
    expect(transaction.changes).toMatchObject({ from: 0, to: 16 });
    expect(transaction.changes.insert).toMatch(/^x \d{4}-\d{2}-\d{2} ship the feature$/);
    unbind();
  });

  it('preserves Vim Ctrl+D while keeping macOS Command+D available', () => {
    const { view, dispatch } = editorView();
    const unbind = bindCurrentLineDoneShortcut(() => view, true);
    const ctrlD = keyboardEvent('d', { ctrlKey: true });

    window.dispatchEvent(ctrlD);
    expect(ctrlD.defaultPrevented).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();

    const commandD = keyboardEvent('d', { metaKey: true });
    window.dispatchEvent(commandD);
    expect(commandD.defaultPrevented).toBe(true);
    expect(dispatch).toHaveBeenCalledTimes(1);
    unbind();
  });

  it('defers selected text and blank lines to their existing handlers', () => {
    const selected = editorView('selected task', { from: 0, to: 4 });
    const blank = editorView('   ');
    const unbindSelected = bindCurrentLineDoneShortcut(() => selected.view, false);
    window.dispatchEvent(keyboardEvent('d', { ctrlKey: true }));
    expect(selected.dispatch).not.toHaveBeenCalled();
    unbindSelected();

    const unbindBlank = bindCurrentLineDoneShortcut(() => blank.view, false);
    window.dispatchEvent(keyboardEvent('d', { ctrlKey: true }));
    expect(blank.dispatch).not.toHaveBeenCalled();
    unbindBlank();
  });
});

describe('selection-popover Vim compatibility', () => {
  it('preserves Vim Ctrl+D but accepts Command+D for mark done', () => {
    const onMarkDone = vi.fn();
    render(
      <TodoTxtSelectionPopover
        selection="ship the feature"
        anchorRect={anchorRect}
        vimMode={true}
        onClose={vi.fn()}
        onMarkDone={onMarkDone}
        onSetPriority={vi.fn()}
        onAddCreationDate={vi.fn()}
        onCopy={vi.fn()}
        onDeleteLine={vi.fn()}
        onDuplicateLine={vi.fn()}
        onArchiveSelection={vi.fn()}
        onSetDueDate={vi.fn()}
        onAddComment={vi.fn()}
        onAskInChat={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: 'd', ctrlKey: true });
    expect(onMarkDone).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'd', metaKey: true });
    expect(onMarkDone).toHaveBeenCalledTimes(1);
  });
});

describe('AMOLED host-theme synchronization', () => {
  it('turns AMOLED off and back on across live light/dark theme changes', async () => {
    const style = document.createElement('style');
    style.dataset.todotxtTestTheme = 'true';
    style.textContent = `
      .theme-dark .probe { background-color: rgb(10, 10, 12); }
      .theme-light .probe { background-color: rgb(248, 248, 250); }
      html .probe[data-amoled="true"] { background-color: rgb(0, 0, 0); }
    `;
    document.head.appendChild(style);

    const host = document.createElement('div');
    host.className = 'theme-dark';
    const app = document.createElement('div');
    app.className = 'probe';
    host.appendChild(app);
    document.body.appendChild(host);

    const unbind = bindAmoledThemeSync(() => app, true);
    expect(app).toHaveAttribute('data-amoled', 'true');
    expect(getComputedStyle(app).backgroundColor).toBe('rgb(0, 0, 0)');

    host.className = 'theme-light';
    await waitFor(() => expect(app).not.toHaveAttribute('data-amoled'));

    host.className = 'theme-dark';
    await waitFor(() => expect(app).toHaveAttribute('data-amoled', 'true'));

    unbind();
    expect(app).not.toHaveAttribute('data-amoled');
  });

  it('never applies AMOLED when the preference is disabled', () => {
    const app = document.createElement('div');
    app.style.backgroundColor = 'rgb(8, 8, 8)';
    document.body.appendChild(app);

    const unbind = bindAmoledThemeSync(() => app, false);
    expect(app).not.toHaveAttribute('data-amoled');
    unbind();
  });
});
