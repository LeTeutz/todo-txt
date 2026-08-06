/**
 * SortToolbar — component tests (T16).
 *
 * Coverage:
 *   1. renders all four sort buttons in the documented order.
 *   2. the active mode button is marked aria-pressed=true and styled
 *      with bold weight + accent colour.
 *   3. clicking an inactive mode calls onChange with that mode.
 *   4. clicking the already-active mode is a no-op (no onChange).
 *   5. Clear sort link is hidden when mode === null, visible otherwise,
 *      and calling it fires onChange(null).
 *   6. Persist checkbox reflects the `persist` prop and toggling fires
 *      onPersistChange with the new boolean.
 *   7. SORT_BUTTONS ordering is exactly ['priority', 'date', 'project',
 *      'context'] — regression guard.
 *   8. Semantics guard: onChange is independent of onPersistChange.
 *      Toggling Persist while a mode is active does NOT re-fire
 *      onChange (parent owns the write-back side-effect, not this
 *      component).
 *
 * Rendering backend: @testing-library/react + vitest + jsdom — same as
 * FileTabs.test.tsx.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import {
  SortToolbar,
  SORT_BUTTONS,
} from '../ui/src/components/SortToolbar';
import type { SortMode } from '../ui/src/utils/sortModes';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SORT_BUTTONS constant', () => {
  it('is declared in the expected visual order', () => {
    expect(SORT_BUTTONS.map((b) => b.mode)).toEqual([
      'priority',
      'date',
      'project',
      'context',
    ]);
  });

  it('has a unique, non-empty label for every button', () => {
    const labels = SORT_BUTTONS.map((b) => b.label);
    expect(new Set(labels).size).toBe(labels.length);
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe('<SortToolbar />', () => {
  const noop = () => undefined;

  it('renders all four sort buttons', () => {
    render(
      <SortToolbar
        mode={null}
        onChange={noop}
        persist={false}
        onPersistChange={noop}
      />,
    );
    expect(screen.getByTestId('todo-txt-sort-priority')).toBeTruthy();
    expect(screen.getByTestId('todo-txt-sort-date')).toBeTruthy();
    expect(screen.getByTestId('todo-txt-sort-project')).toBeTruthy();
    expect(screen.getByTestId('todo-txt-sort-context')).toBeTruthy();

    // Toolbar wrapper always present.
    expect(screen.getByTestId('todo-txt-sort-toolbar')).toBeTruthy();
  });

  it('marks the active button with aria-pressed=true and bold weight', () => {
    render(
      <SortToolbar
        mode="date"
        onChange={noop}
        persist={false}
        onPersistChange={noop}
      />,
    );
    const active = screen.getByTestId('todo-txt-sort-date');
    const inactive = screen.getByTestId('todo-txt-sort-priority');

    expect(active.getAttribute('aria-pressed')).toBe('true');
    expect(inactive.getAttribute('aria-pressed')).toBe('false');

    expect(active.style.fontWeight).toBe('700');
    expect(inactive.style.fontWeight).not.toBe('700');

    // Accent colour on active; muted on inactive.
    expect(active.style.color).toMatch(/var\(--accent/);
    expect(inactive.style.color).toMatch(
      /var\(--text-muted|var\(--color-muted-fg/,
    );
  });

  it('calls onChange with the clicked mode when a different button is clicked', () => {
    const onChange = vi.fn<(a0: SortMode | null) => void>();
    render(
      <SortToolbar
        mode="priority"
        onChange={onChange}
        persist={false}
        onPersistChange={noop}
      />,
    );

    fireEvent.click(screen.getByTestId('todo-txt-sort-date'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('date');

    fireEvent.click(screen.getByTestId('todo-txt-sort-project'));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('project');
  });

  it('does not call onChange when the already-active mode is clicked', () => {
    const onChange = vi.fn<(a0: SortMode | null) => void>();
    render(
      <SortToolbar
        mode="project"
        onChange={onChange}
        persist={false}
        onPersistChange={noop}
      />,
    );

    fireEvent.click(screen.getByTestId('todo-txt-sort-project'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('hides the Clear sort link when mode === null', () => {
    render(
      <SortToolbar
        mode={null}
        onChange={noop}
        persist={false}
        onPersistChange={noop}
      />,
    );
    expect(screen.queryByTestId('todo-txt-sort-clear')).toBeNull();
  });

  it('shows the Clear sort link when a mode is active and fires onChange(null) on click', () => {
    const onChange = vi.fn<(a0: SortMode | null) => void>();
    render(
      <SortToolbar
        mode="context"
        onChange={onChange}
        persist={false}
        onPersistChange={noop}
      />,
    );
    const clearBtn = screen.getByTestId('todo-txt-sort-clear');
    expect(clearBtn).toBeTruthy();

    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('reflects the persist prop in the checkbox state', () => {
    const { rerender } = render(
      <SortToolbar
        mode={null}
        onChange={noop}
        persist={false}
        onPersistChange={noop}
      />,
    );
    const checkbox = screen.getByTestId(
      'todo-txt-sort-persist',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    rerender(
      <SortToolbar
        mode={null}
        onChange={noop}
        persist={true}
        onPersistChange={noop}
      />,
    );
    expect(checkbox.checked).toBe(true);
  });

  it('calls onPersistChange when the checkbox is toggled', () => {
    const onPersistChange = vi.fn<(a0: boolean) => void>();
    render(
      <SortToolbar
        mode={null}
        onChange={noop}
        persist={false}
        onPersistChange={onPersistChange}
      />,
    );
    const checkbox = screen.getByTestId('todo-txt-sort-persist');
    fireEvent.click(checkbox);
    expect(onPersistChange).toHaveBeenCalledTimes(1);
    expect(onPersistChange).toHaveBeenCalledWith(true);
  });

  it('keeps onChange and onPersistChange independent', () => {
    // Toggling persist should NOT re-fire onChange, and clicking a
    // sort button should NOT re-fire onPersistChange. This guards the
    // contract that write-back is the parent's concern.
    const onChange = vi.fn<(a0: SortMode | null) => void>();
    const onPersistChange = vi.fn<(a0: boolean) => void>();
    render(
      <SortToolbar
        mode="priority"
        onChange={onChange}
        persist={false}
        onPersistChange={onPersistChange}
      />,
    );

    fireEvent.click(screen.getByTestId('todo-txt-sort-persist'));
    expect(onPersistChange).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('todo-txt-sort-date'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('date');
    // Persist handler should not have fired again.
    expect(onPersistChange).toHaveBeenCalledTimes(1);
  });

  it('re-renders correctly when the parent flips mode', () => {
    const { rerender } = render(
      <SortToolbar
        mode="priority"
        onChange={noop}
        persist={false}
        onPersistChange={noop}
      />,
    );
    expect(
      screen.getByTestId('todo-txt-sort-priority').getAttribute('aria-pressed'),
    ).toBe('true');

    rerender(
      <SortToolbar
        mode="context"
        onChange={noop}
        persist={false}
        onPersistChange={noop}
      />,
    );
    expect(
      screen.getByTestId('todo-txt-sort-priority').getAttribute('aria-pressed'),
    ).toBe('false');
    expect(
      screen.getByTestId('todo-txt-sort-context').getAttribute('aria-pressed'),
    ).toBe('true');
  });
});
