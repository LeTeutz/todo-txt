// Tailwind utilities are compiled here and injected into the DOM at module
// load time via vite-plugin-css-injected-by-js. This makes the bundle
// self-contained and removes the dependency on the dashboard shipping
// Tailwind globally.
import './index.css';
import TodoTxtPage from './TodoTxtPage';

export default function TodoTxtApp() {
  return <TodoTxtPage />;
}
