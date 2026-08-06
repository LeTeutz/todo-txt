import { EditorSelection, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CmEditor, {
  type CmEditorHandle,
} from '../ui/src/components/CmEditor';

afterEach(() => cleanup());

describe('CmEditor multi-cursor', () => {
  it('retains multiple selections and applies typed text to every range', async () => {
    const ref = createRef<CmEditorHandle>();
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <CmEditor
        ref={ref}
        value={'alpha\nbeta'}
        onChange={onChange}
        onSelectionChange={onSelectionChange}
      />,
    );

    const view = ref.current?.getView();
    expect(view).toBeTruthy();
    expect(view!.state.facet(EditorState.allowMultipleSelections)).toBe(true);

    act(() => {
      view!.dispatch({
        selection: EditorSelection.create([
          EditorSelection.cursor(0),
          EditorSelection.cursor(6),
        ]),
      });
      view!.dispatch(view!.state.replaceSelection('> '));
    });

    expect(ref.current?.getSelections()).toHaveLength(2);
    expect(view!.state.doc.toString()).toBe('> alpha\n> beta');
    await waitFor(() => expect(onSelectionChange).toHaveBeenCalled());
    // Second arg is CmEditor's change provenance (`{typed}`), which the
    // shortcut expander consults to tell real typing from a programmatic edit.
    expect(onChange).toHaveBeenLastCalledWith('> alpha\n> beta', expect.anything());
  });

  it('accepts a controlled rollback to the last raw value after a transform', () => {
    const ref = createRef<CmEditorHandle>();
    const onChange = vi.fn();
    const rendered = render(
      <CmEditor ref={ref} value="" onChange={onChange} />,
    );

    act(() => {
      ref.current!.getView()!.dispatch({
        changes: { from: 0, insert: '!!d ' },
        selection: { anchor: 4 },
      });
    });
    expect(onChange).toHaveBeenLastCalledWith('!!d ', expect.anything());

    rendered.rerender(
      <CmEditor ref={ref} value="2026-07-27 " onChange={onChange} />,
    );
    expect(ref.current?.getValue()).toBe('2026-07-27 ');

    rendered.rerender(
      <CmEditor ref={ref} value="!!d " onChange={onChange} />,
    );
    expect(ref.current?.getValue()).toBe('!!d ');
  });

  it('uses Alt as the add-cursor pointer modifier', () => {
    const ref = createRef<CmEditorHandle>();
    render(<CmEditor ref={ref} value="one" onChange={vi.fn()} />);
    const handlers = ref.current!
      .getView()!
      .state.facet(EditorView.clickAddsSelectionRange);

    expect(handlers[0](new MouseEvent('mousedown', { altKey: true }))).toBe(true);
    expect(handlers[0](new MouseEvent('mousedown', { ctrlKey: true }))).toBe(false);
  });
});
