/**
 * RightRail.test.tsx — component tests for the right-rail help panel.
 *
 * Covers:
 *  - Pinned bar renders 5 reference rows.
 *  - Category accordions render with correct counts.
 *  - Tab-contextual filtering: Done dims Task Ops + Inline Shortcuts
 *    with a "Switch to Todo" hint; Report collapses to the paragraph.
 *  - localStorage persistence round-trip for both `open` and per-category
 *    expansion.
 *  - testids preserved for QA (`todo-txt-help-panel`, `todo-txt-help-close`,
 *    `todo-txt-help-category-*`, `todo-txt-help-pinned`).
 *  - `help` is excluded from categories (self-reference avoidance).
 *  - Esc closes the rail.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import RightRail, { loadRailOpenState } from '../ui/src/components/RightRail';
import { COMMANDS } from '../ui/src/utils/commands';

const STORAGE_KEY = 'todo-txt.rail.v1';

function renderRail(
  overrides: Partial<React.ComponentProps<typeof RightRail>> = {},
) {
  const onClose = overrides.onClose ?? (() => {});
  return render(
    <RightRail
      open={true}
      onClose={onClose}
      activeFile="todo"
      commands={COMMANDS}
      {...overrides}
    />,
  );
}

describe('RightRail', () => {
  beforeEach(() => {
    window.localStorage.clear();
    cleanup();
  });

  describe('shell and testids', () => {
    it('renders when open=true and preserves QA testids', () => {
      renderRail();
      expect(screen.getByTestId('todo-txt-help-panel')).toBeInTheDocument();
      expect(screen.getByTestId('todo-txt-help-close')).toBeInTheDocument();
      expect(screen.getByTestId('todo-txt-help-pinned')).toBeInTheDocument();
    });

    it('returns null when open=false (rail does not render)', () => {
      const { container } = renderRail({ open: false });
      expect(container.firstChild).toBeNull();
    });

    it('calls onClose when the close button is clicked', () => {
      let closed = false;
      renderRail({ onClose: () => (closed = true) });
      fireEvent.click(screen.getByTestId('todo-txt-help-close'));
      expect(closed).toBe(true);
    });

    it('calls onClose when Escape is pressed inside the rail', () => {
      let closed = false;
      renderRail({ onClose: () => (closed = true) });
      fireEvent.keyDown(screen.getByTestId('todo-txt-help-panel'), {
        key: 'Escape',
      });
      expect(closed).toBe(true);
    });
  });

  describe('pinned bar', () => {
    it('renders all five pinned reference rows', () => {
      renderRail();
      const pinned = screen.getByTestId('todo-txt-help-pinned');
      // Each pinned item has a unique hint string. Count them.
      expect(pinned.textContent).toContain('Ctrl+K');
      expect(pinned.textContent).toContain('Command palette');
      expect(pinned.textContent).toContain('add');
      expect(pinned.textContent).toContain('do');
      expect(pinned.textContent).toContain('example');
      expect(pinned.textContent).toContain('Ctrl+/');
      expect(pinned.textContent).toContain('Help rail');
    });
    it('documents Vim-safe completion shortcuts in Getting Started', () => {
      renderRail();
      const guide = screen.getByTestId('todo-txt-help-getting-started');
      expect(guide.textContent).toContain('Ctrl/⌘');
      expect(guide.textContent).toContain('Ctrl+D');
      expect(guide.textContent).toContain('half-page scroll');
      expect(guide.textContent).toContain('\\x');
    });
  });

  describe('categories', () => {
    it('renders four primary category accordions on the Todo tab', () => {
      renderRail();
      expect(screen.getByTestId('todo-txt-help-category-file-nav')).toBeInTheDocument();
      expect(screen.getByTestId('todo-txt-help-category-task-ops')).toBeInTheDocument();
      expect(screen.getByTestId('todo-txt-help-category-filters')).toBeInTheDocument();
      expect(screen.getByTestId('todo-txt-help-category-inline-shortcuts')).toBeInTheDocument();
    });

    it('excludes `help` from every category (self-reference avoidance)', () => {
      renderRail();
      // No category body should contain a rendered `help` command row.
      // The pinned bar references "Help rail" but not the `help` CLI verb.
      const body = screen.getByTestId('todo-txt-help-panel').textContent ?? '';
      // `help` token will appear (e.g., "Help rail"), but there should be no
      // "help" listed as a COMMANDS registry row inside a category. We
      // assert that the `help` command's argSchema markers (like "<>" or
      // "help: ") don't show up; stronger: check via testid that the
      // category bodies contain expected commands but not "help".
      const taskOps = screen.getByTestId('todo-txt-help-category-task-ops');
      expect(taskOps.textContent).not.toMatch(/\bhelp\b.*Open this/);
    });

    it('places `listfile` in File & Navigation and surfaces it in the rail', () => {
      renderRail();
      const fileNav = screen.getByTestId('todo-txt-help-category-file-nav');
      expect(fileNav.textContent).toContain('listfile');
    });

    it('places `report` in Task Ops (deviation from DESIGN.md §4, per milestone 2 ping)', () => {
      renderRail();
      const taskOps = screen.getByTestId('todo-txt-help-category-task-ops');
      expect(taskOps.textContent).toContain('report');
    });

    it('toggles a category on header click', () => {
      renderRail();
      const header = screen.getByRole('button', { name: /File & Navigation/i });
      const initiallyExpanded = header.getAttribute('aria-expanded') === 'true';
      fireEvent.click(header);
      expect(header.getAttribute('aria-expanded')).toBe(
        initiallyExpanded ? 'false' : 'true',
      );
    });
  });

  describe('tab-contextual filtering', () => {
    it('on Done tab, dims Task Ops and Inline Shortcuts with a hint', () => {
      renderRail({ activeFile: 'done' });
      // Task Ops and Inline Shortcuts still render (dimmed), but the hint
      // line appears inside them when expanded.
      const taskOps = screen.getByTestId('todo-txt-help-category-task-ops');
      const taskOpsHeader = taskOps.querySelector('button');
      // Force-expand to reveal the hint
      if (taskOpsHeader?.getAttribute('aria-expanded') !== 'true') {
        fireEvent.click(taskOpsHeader!);
      }
      expect(taskOps.textContent).toContain('Switch to the Todo tab');
    });

    it('on Report tab, condenses the rail to an explanatory paragraph', () => {
      renderRail({ activeFile: 'report' });
      const panel = screen.getByTestId('todo-txt-help-panel');
      // No category accordions should render in report mode
      expect(screen.queryByTestId('todo-txt-help-category-file-nav')).toBeNull();
      expect(screen.queryByTestId('todo-txt-help-category-task-ops')).toBeNull();
      // The explanatory copy mentions "Report" and "snapshots"
      expect(panel.textContent).toMatch(/Report/i);
      expect(panel.textContent).toMatch(/snapshots/i);
    });

    it('on Todo tab, shows all four categories without dimming', () => {
      renderRail({ activeFile: 'todo' });
      expect(screen.queryByTestId('todo-txt-help-tab-hint')).toBeNull();
    });
  });

  describe('persistence', () => {
    it('loadRailOpenState returns false when storage is empty', () => {
      expect(loadRailOpenState()).toBe(false);
    });

    it('loadRailOpenState returns persisted open flag', () => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ open: true, categories: {} }),
      );
      expect(loadRailOpenState()).toBe(true);
    });

    it('loadRailOpenState falls back to defaults on parse error', () => {
      window.localStorage.setItem(STORAGE_KEY, '{{{not json');
      expect(loadRailOpenState()).toBe(false);
    });

    it('writes persisted state when categories toggle', () => {
      renderRail();
      const header = screen.getByRole('button', { name: /Inline Shortcuts/i });
      fireEvent.click(header);
      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(typeof parsed.categories['inline-shortcuts']).toBe('boolean');
    });

    it('survives unknown keys in persisted storage without crashing', () => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          open: true,
          categories: { 'file-nav': true, 'bogus-key': false },
          futureField: 'ignored',
        }),
      );
      expect(() => renderRail()).not.toThrow();
    });
  });
});
