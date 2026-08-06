import React from 'react';
import { createRoot } from 'react-dom/client';
import TodoTxtApp from '../index.tsx';
// Gives #root a definite height, the way the dashboard's panel does. Without
// it the editor is unbounded and vim's Ctrl+D / Ctrl+U cannot be tested.
import '../../harness.css';

createRoot(document.getElementById('root')!).render(<TodoTxtApp />);
