import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhatsAppButton from '../components/WhatsAppButton';

describe('WhatsAppButton', () => {
  it('renders with a number', () => {
    render(<WhatsAppButton number="5511999998888" />);
    const link = screen.getByLabelText('Fale conosco pelo WhatsApp');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://wa.me/5511999998888');
  });

  it('does not render when number is missing', () => {
    const { container } = render(<WhatsAppButton number="" />);
    expect(container.innerHTML).toBe('');
  });
});
