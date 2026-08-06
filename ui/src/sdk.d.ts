/**
 * TypeScript module declarations for host-provided SDK modules.
 *
 * At runtime these modules are resolved via the dashboard's import map to
 * vendor stubs at `/vendor/kirocrew-*.mjs`, which re-export from
 * `window.__kirocrew_modules.*`. This file exists only to give TypeScript
 * the prop types — Vite treats these imports as externals per vite.config.ts.
 *
 * Only the hooks we actually use are declared here to keep the surface
 * minimal. Add more if/when needed. Types mirror the host SDK's actual
 * exported signatures.
 *
 * Compatibility note: these declarations describe a CONTRACT, not a
 * bundled dependency. The host resolves the real modules at runtime, so
 * a host older than the hook you declare here will type-check fine and
 * then fail at import time because its vendor stub does not re-export
 * that symbol. If a hook goes missing at runtime, check the installed
 * host's SDK version before assuming a bug in this app.
 */
declare module '@kirocrew/app-sdk' {
  /**
   * Launch a chat session in the host dashboard.
   *
   * Writes launch intent to window.__mc_chat_launch then calls the
   * dashboard's client-side navigate('/chat'). CRITICAL: the SDK uses
   * React Router's navigate — NOT window.location.href — so the global
   * survives the route change. A hand-rolled version using
   * window.location.href would trigger a full page reload which wipes
   * the window global before ChatPage can read it (the exact bug B1
   * addressed).
   *
   * `agent` is optional — omit to let the user pick / keep their
   * current default agent. `message` is optional — omit for "just open
   * a new chat".
   */
  export function useChatLauncher(): {
    openChat: (opts?: { agent?: string; message?: string }) => void;
  };
}
