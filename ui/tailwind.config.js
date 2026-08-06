/** @type {import('tailwindcss').Config} */
// Scans only our app sources so Tailwind JIT emits only the utilities we use.
// Deliberately scoped to src/ — components under node_modules and test files
// are not built into the dashboard bundle, so we skip them.
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {},
  },
  // Prevent Tailwind's preflight (base reset) from colliding with the
  // dashboard's own global styles. The app renders inside the dashboard's
  // iframe/container and inherits host typography, so we only need
  // utilities, not a reset.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
