import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BackToTop from '../components/BackToTop';

describe('BackToTop', () => {
  it('renders the button', () => {
    render(<BackToTop />);
    expect(screen.getByLabelText('Voltar ao topo')).toBeInTheDocument();
  });
});
