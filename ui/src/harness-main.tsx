/**
 * Standalone visual-validation harness for CmEditor.
 * NOT shipped — built via vite.harness.config.ts and screenshotted by
 * Playwright so gutter alignment / divider / AMOLED can be verified
 * pixel-by-pixel without dashboard auth.
 */
import { createRoot } from 'react-dom/client';
import CmEditor from './components/CmEditor';
import './index.css';

const SAMPLE = [
  '2026-05-07 todo.txt — a plain-text format for tasks',
  '(A) 2026-05-07 ship the feature +kirocrew @work due:2026-05-10',
  '(B) 2026-05-07 write tests for the new command palette +kirocrew @work',
  '(C) 2026-05-07 clean up garage @home',
  'x 2026-05-06 2026-05-05 pay the electric bill +home @admin',
  '2026-05-07 call the dentist @phone @admin due:2026-05-09',
  '2026-05-07 review quarterly goals +work @planning id:q4review',
  '2026-05-07 this is a deliberately very long line that should wrap around the editor width to let us inspect how continuation rows behave relative to the line-number gutter +wrap @test',
  '2026-05-07 buy +groceries for the week @errands',
  'ds',
].join('\n');

function Pane({ label, amoled }: { label: string; amoled?: boolean }): JSX.Element {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: 12, color: '#a1a1aa' }}>{label}</div>
      <div
        {...(amoled ? { 'data-amoled': 'true' } : {})}
        style={{
          flex: 1,
          minHeight: 0,
          background: 'var(--color-bg)',
          color: 'var(--color-fg)',
          border: '1px solid #333',
        }}
      >
        <CmEditor value={SAMPLE} onChange={() => undefined} syntaxHighlight placeholder="" />
      </div>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 16, height: '100vh', padding: 12, background: '#1b1e26', boxSizing: 'border-box' }}>
      <Pane label="normal dark (host fallback tokens)" />
      <Pane label="AMOLED (data-amoled=true)" amoled />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
