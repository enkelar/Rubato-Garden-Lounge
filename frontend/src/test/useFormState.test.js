import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormState } from '../hooks/useFormState';

describe('useFormState', () => {
  it('initializes with given values', () => {
    const { result } = renderHook(() => useFormState({ name: '' }));
    expect(result.current[0]).toEqual({ name: '' });
  });

  it('updates a single field without touching others', () => {
    const { result } = renderHook(() => useFormState({ name: '', price: '' }));
    act(() => {
      result.current[1]('name', 'Pizza');
    });
    expect(result.current[0]).toEqual({ name: 'Pizza', price: '' });
  });
});