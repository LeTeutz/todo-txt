/**
 * useSyntaxHighlight — reactive hook for the todo-txt syntax-highlight
 * preference.
 *
 * Behaviour:
 *   - Persists a boolean under localStorage key `todotxt.syntaxHighlight`
 *     (default ON so highlighting is visible out of the box; an explicit
 *     toggle to OFF persists and is respected).
 *   - Hook consumers re-render whenever the preference changes.
 *   - Multi-tab sync via the browser `storage` event (one tab flipping the
 *     toggle updates every other open tab).
 *   - Same-tab sync across components via a custom
 *     `TODOTXT_SYNTAX_HIGHLIGHT_CHANGED_EVENT` that fires on every
 *     `setEnabled` call. This mirrors the `useCustomFonts` /
 *     `useTimeFormat` patterns elsewhere in the codebase.
 *
 * Storage value: the literal string `"true"` or `"false"`. A missing /
 * unparseable value is treated as OFF (never throws).
 *
 * Scope: this hook OWNS the persistence + reactive plumbing. The overlay
 * component (`TodoTxtSyntaxOverlay`) consumes the `enabled` flag via props
 * — it never reads localStorage directly. Keeping the two separate means
 * the overlay stays a pure presentational layer that is easy to unit-test
 * in isolation (just pass `enabled={true}`).
 */
import { useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Constants (exported for tests + cross-component broadcasting)
// ---------------------------------------------------------------------------

/** localStorage key holding `"true"` | `"false"`. */
export const SYNTAX_HIGHLIGHT_STORAGE_KEY = 'todotxt.syntaxHighlight';

/** Custom event name for same-tab fan-out when the flag flips. */
export const TODOTXT_SYNTAX_HIGHLIGHT_CHANGED_EVENT =
  'todotxt-syntax-highlight-changed';

/** Default when storage is empty or unreadable. ON so highlighting is
 *  visible out of the box; an explicit user toggle to OFF still persists. */
export const SYNTAX_HIGHLIGHT_DEFAULT = true;

// ---------------------------------------------------------------------------
// Pure helpers (exported for unit tests)
// ---------------------------------------------------------------------------

/**
 * Parse a stored string into the boolean preference. Anything other than
 * the literal `"true"` (case-insensitive, trimmed) evaluates to OFF —
 * this fails closed on typos, legacy values, or tampering.
 */
export function parseStoredValue(raw: string | null | undefined): boolean {
  if (typeof raw !== 'string') return SYNTAX_HIGHLIGHT_DEFAULT;
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return SYNTAX_HIGHLIGHT_DEFAULT;
}

/**
 * Read the current preference from localStorage. Never throws — any
 * SSR / sandboxed-iframe / privacy-mode exception is swallowed and the
 * default is returned.
 */
export function getSyntaxHighlight(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return SYNTAX_HIGHLIGHT_DEFAULT;
    }
    return parseStoredValue(
      window.localStorage.getItem(SYNTAX_HIGHLIGHT_STORAGE_KEY),
    );
  } catch {
    return SYNTAX_HIGHLIGHT_DEFAULT;
  }
}

/**
 * Persist the preference and broadcast the change to same-tab consumers.
 * Cross-tab consumers pick it up via the native `storage` event, which
 * fires automatically on localStorage writes.
 *
 * The broadcast is guarded against `CustomEvent` being unavailable
 * (older jsdom builds) so tests that don't care about fan-out still work.
 */
export function setSyntaxHighlight(enabled: boolean): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(
      SYNTAX_HIGHLIGHT_STORAGE_KEY,
      enabled ? 'true' : 'false',
    );
  } catch {
    // localStorage unavailable — swallow. The hook will still show the
    // in-memory update via setState; persistence is best-effort.
  }

  try {
    if (typeof window === 'undefined') return;
    if (typeof CustomEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent(TODOTXT_SYNTAX_HIGHLIGHT_CHANGED_EVENT, {
          detail: { enabled },
        }),
      );
    } else if (typeof (window as any).Event === 'function') {
      window.dispatchEvent(
        new Event(TODOTXT_SYNTAX_HIGHLIGHT_CHANGED_EVENT),
      );
    }
  } catch {
    // Event dispatch failed (exotic sandbox) — not fatal.
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseSyntaxHighlightResult {
  /** Current preference. `true` = overlay visible, `false` = plain text. */
  enabled: boolean;
  /** Replace the preference with the given boolean. Persists + broadcasts. */
  setEnabled: (next: boolean) => void;
  /** Flip the preference (convenience wrapper). */
  toggle: () => void;
}

/**
 * React hook reading the todo-txt syntax-highlight flag and keeping in
 * sync with:
 *   - Same-tab updates (another component calling `setEnabled` / `toggle`)
 *   - Cross-tab updates (another browser tab flipping the toggle)
 *
 * Call this from any component that needs to react to the preference.
 * It is safe to instantiate in N components on the same page; each
 * instance subscribes independently and they stay in lockstep via the
 * two event listeners below.
 */
export function useSyntaxHighlight(): UseSyntaxHighlightResult {
  const [enabled, setEnabledState] = useState<boolean>(() =>
    getSyntaxHighlight(),
  );

  // Same-tab fan-out: another hook instance flipped the preference.
  useEffect(() => {
    const onCustom = () => setEnabledState(getSyntaxHighlight());
    window.addEventListener(
      TODOTXT_SYNTAX_HIGHLIGHT_CHANGED_EVENT,
      onCustom,
    );
    return () =>
      window.removeEventListener(
        TODOTXT_SYNTAX_HIGHLIGHT_CHANGED_EVENT,
        onCustom,
      );
  }, []);

  // Cross-tab sync: another tab wrote the storage key.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== SYNTAX_HIGHLIGHT_STORAGE_KEY) return;
      setEnabledState(parseStoredValue(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setSyntaxHighlight(next);
    setEnabledState(next);
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      setSyntaxHighlight(next);
      return next;
    });
  }, []);

  return { enabled, setEnabled, toggle };
}

export default useSyntaxHighlight;
