/**
 * FileTabs — component tests (T15).
 *
 * Coverage:
 *   1. renders all three tabs in the documented order.
 *   2. the tab matching `activeFile` is marked `aria-selected={true}`
 *      and renders with bold weight + the accent-coloured bottom border.
 *   3. clicking an inactive tab calls `onChange` with that tab's name.
 *   4. clicking the already-active tab is a no-op (no `onChange` call).
 *   5. FILE_TABS ordering is exactly ['todo', 'done', 'report'] — a
 *      regression guard against accidental re-ordering that would
 *      change the visual header layout.
 *   6. Arrow keys cycle and Home/End jump according to the ARIA tabs
 *      keyboard interaction pattern.
 *
 * Rendering backend: @testing-library/react + vitest + jsdom (same as
 * CommandPalette.test.tsx).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import {
  FileTabs,
  FILE_TABS,
  type FileName,
} from '../ui/src/components/FileTabs';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('FILE_TABS constant', () => {
  it('is declared in the expected visual order', () => {
    expect(FILE_TABS.map((t) => t.name)).toEqual([
      'todo',
      'done',
      'report',
    ]);
  });

  it('has a unique, non-empty label for every tab', () => {
    const labels = FILE_TABS.map((t) => t.label);
    expect(new Set(labels).size).toBe(labels.length);
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe('<FileTabs />', () => {
  it('renders all three tabs', () => {
    render(<FileTabs activeFile="todo" onChange={() => undefined} />);
    expect(screen.getByTestId('todo-txt-file-tab-todo')).toBeTruthy();
    expect(screen.getByTestId('todo-txt-file-tab-done')).toBeTruthy();
    expect(screen.getByTestId('todo-txt-file-tab-report')).toBeTruthy();

    // The tablist wrapper is always present.
    expect(screen.getByTestId('todo-txt-file-tabs')).toBeTruthy();
  });

  it('marks the active tab with aria-selected, bold weight, and an accent underline', () => {
    render(<FileTabs activeFile="done" onChange={() => undefined} />);
    const active = screen.getByTestId('todo-txt-file-tab-done');
    const other = screen.getByTestId('todo-txt-file-tab-todo');

    expect(active.getAttribute('aria-selected')).toBe('true');
    expect(other.getAttribute('aria-selected')).toBe('false');

    // Bold / non-bold.
    expect(active.style.fontWeight).toBe('700');
    expect(other.style.fontWeight).not.toBe('700');

    // Accent underline: present on active, transparent on inactive.
    expect(active.style.borderBottom).toMatch(/var\(--accent/);
    expect(active.style.color).toMatch(/var\(--accent/);
    expect(other.style.borderBottom).toMatch(/transparent/);
    expect(other.style.color).toMatch(/var\(--text-muted|var\(--color-muted-fg/);
  });

  it('calls onChange with the clicked tab name when a different tab is clicked', () => {
    const onChange = vi.fn<(a0: FileName) => void>();
    render(<FileTabs activeFile="todo" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('todo-txt-file-tab-done'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('done');

    fireEvent.click(screen.getByTestId('todo-txt-file-tab-report'));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('report');
  });

  it('does not call onChange when the already-active tab is clicked', () => {
    const onChange = vi.fn<(a0: FileName) => void>();
    render(<FileTabs activeFile="report" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('todo-txt-file-tab-report'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('cycles with arrow keys and jumps with Home/End', () => {
    const onChange = vi.fn<(a0: FileName) => void>();
    const { rerender } = render(
      <FileTabs activeFile="todo" onChange={onChange} />,
    );

    fireEvent.keyDown(screen.getByTestId('todo-txt-file-tab-todo'), {
      key: 'ArrowRight',
    });
    expect(onChange).toHaveBeenLastCalledWith('done');
    expect(document.activeElement).toBe(
      screen.getByTestId('todo-txt-file-tab-done'),
    );

    onChange.mockClear();
    rerender(<FileTabs activeFile="done" onChange={onChange} />);
    const doneTab = screen.getByTestId('todo-txt-file-tab-done');
    fireEvent.keyDown(doneTab, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('todo');
    fireEvent.keyDown(doneTab, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('report');
    fireEvent.keyDown(doneTab, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('todo');

    onChange.mockClear();
    rerender(<FileTabs activeFile="todo" onChange={onChange} />);
    fireEvent.keyDown(screen.getByTestId('todo-txt-file-tab-todo'), {
      key: 'ArrowLeft',
    });
    expect(onChange).toHaveBeenLastCalledWith('report');
  });

  it('sets tabIndex=0 only on the active tab (roving-tabindex pattern)', () => {
    render(<FileTabs activeFile="done" onChange={() => undefined} />);
    expect(
      screen.getByTestId('todo-txt-file-tab-todo').getAttribute('tabindex'),
    ).toBe('-1');
    expect(
      screen.getByTestId('todo-txt-file-tab-done').getAttribute('tabindex'),
    ).toBe('0');
    expect(
      screen.getByTestId('todo-txt-file-tab-report').getAttribute('tabindex'),
    ).toBe('-1');
  });

  it('re-renders correctly when the parent flips activeFile', () => {
    const { rerender } = render(
      <FileTabs activeFile="todo" onChange={() => undefined} />,
    );
    expect(
      screen.getByTestId('todo-txt-file-tab-todo').getAttribute('aria-selected'),
    ).toBe('true');

    rerender(<FileTabs activeFile="report" onChange={() => undefined} />);
    expect(
      screen.getByTestId('todo-txt-file-tab-todo').getAttribute('aria-selected'),
    ).toBe('false');
    expect(
      screen.getByTestId('todo-txt-file-tab-report').getAttribute('aria-selected'),
    ).toBe('true');
  });
});
