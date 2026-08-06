import { performance } from 'node:perf_hooks';
import { EditorState } from '@codemirror/state';

const LINE_COUNT = 10_000;
const EDIT_COUNT = 200;
const MAX_MS = 750;
const documentText = Array.from(
  { length: LINE_COUNT },
  (_, index) => `(B) 2026-07-27 task ${index} +release @bench`,
).join('\n');

const startedAt = performance.now();
let state = EditorState.create({ doc: documentText });
for (let index = 0; index < EDIT_COUNT; index += 1) {
  const position = Math.min(state.doc.length, index * 17);
  state = state.update({ changes: { from: position, insert: 'x' } }).state;
  // The controlled wrapper must serialize once per edit to notify React.
  state.doc.toString();
}
const elapsedMs = performance.now() - startedAt;

console.log(
  `todo.txt editor benchmark: ${LINE_COUNT.toLocaleString()} lines, ` +
    `${EDIT_COUNT} edits + serializations in ${elapsedMs.toFixed(1)}ms`,
);

if (elapsedMs > MAX_MS) {
  console.error(`Editor benchmark exceeded ${MAX_MS}ms release budget.`);
  process.exitCode = 1;
}
