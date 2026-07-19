//eslint-disable-next-line
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

function renderWithProvider() {
  return render(
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  );
}

describe('LanguageToggle', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to English active', () => {
    renderWithProvider();
    expect(screen.getByText('EN')).toHaveClass('rg-lang-active');
  });

  it('switches to Albanian on click', () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole('button', { name: /switch language/i }));
    expect(screen.getByText('SQ')).toHaveClass('rg-lang-active');
  });
});