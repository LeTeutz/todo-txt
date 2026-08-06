import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@kirocrew/app-sdk', () => ({
  useChatLauncher: () => ({ openChat: vi.fn() }),
}));

vi.mock('../ui/src/components/CmEditor', async () => {
  const React = await import('react');
  const CmEditorStub = React.forwardRef<
    { focus: () => void; getView: () => null },
    { value: string; onChange: (value: string) => void }
  >(({ value, onChange }, ref) => {
    React.useImperativeHandle(ref, () => ({
      focus: () => undefined,
      getView: () => null,
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

function contentResponse() {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => ({ content: 'ship the feature\n', mtime: 1 }),
    text: async () => '',
  };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal('fetch', vi.fn(async () => contentResponse()));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('TodoTxtPage global shortcuts', () => {
  it('one Ctrl+/ keypress opens the rail and the next closes it', async () => {
    render(<TodoTxtPage />);
    await screen.findByTestId('todo-txt-cm-editor-stub');
    expect(screen.queryByTestId('todo-txt-help-panel')).not.toBeInTheDocument();

    const openEvent = new KeyboardEvent('keydown', {
      key: '/',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    act(() => window.dispatchEvent(openEvent));

    await waitFor(() =>
      expect(screen.getByTestId('todo-txt-help-panel')).toBeInTheDocument(),
    );
    expect(openEvent.defaultPrevented).toBe(true);

    const closeEvent = new KeyboardEvent('keydown', {
      key: '/',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    act(() => window.dispatchEvent(closeEvent));

    await waitFor(() =>
      expect(screen.queryByTestId('todo-txt-help-panel')).not.toBeInTheDocument(),
    );
    expect(closeEvent.defaultPrevented).toBe(true);
  });
});
