import { renderHook, act } from '@testing-library/react';
import { useMapHint } from 'hooks/useMapHint';

describe('useMapHint', () => {
  it('should initialize with hint visible', () => {
    const { result } = renderHook(() => useMapHint());
    expect(result.current.showHint).toBe(true);
  });

  it('should hide hint when hideHint is called', () => {
    const { result } = renderHook(() => useMapHint());

    act(() => {
      result.current.hideHint();
    });

    expect(result.current.showHint).toBe(false);
  });

  it('should remain hidden after hideHint', () => {
    const { result } = renderHook(() => useMapHint());

    act(() => {
      result.current.hideHint();
    });

    expect(result.current.showHint).toBe(false);

    act(() => {
      result.current.hideHint();
    });

    expect(result.current.showHint).toBe(false);
  });
});
