import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AccessibilityBar from '../components/AccessibilityBar';

describe('AccessibilityBar', () => {
  it('renders font size buttons', () => {
    render(<AccessibilityBar />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('A+')).toBeInTheDocument();
    expect(screen.getByText('A++')).toBeInTheDocument();
  });

  it('renders contrast button', () => {
    render(<AccessibilityBar />);
    expect(screen.getByLabelText('Ativar alto contraste')).toBeInTheDocument();
  });
});
