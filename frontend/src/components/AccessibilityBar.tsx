import { useEffect, useState } from 'react';

type FontSize = 'normal' | 'md' | 'lg';

const FONT_SIZES: { key: FontSize; label: string; title: string }[] = [
  { key: 'normal', label: 'A', title: 'Fonte normal' },
  { key: 'md', label: 'A+', title: 'Fonte média' },
  { key: 'lg', label: 'A++', title: 'Fonte grande' },
];

export default function AccessibilityBar() {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('highContrast') === 'true';
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('fontSize') as FontSize) || 'normal';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('highContrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.classList.remove('font-size-md', 'font-size-lg');
    if (fontSize !== 'normal') {
      document.documentElement.classList.add(`font-size-${fontSize}`);
    }
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  return (
    <div className="a11y-bar" role="toolbar" aria-label="Barra de acessibilidade">
      {FONT_SIZES.map(({ key, label, title }) => (
        <button
          key={key}
          onClick={() => setFontSize(key)}
          className={`a11y-font-btn ${fontSize === key ? 'ring-2 ring-primary-500' : ''}`}
          aria-label={title}
          aria-pressed={fontSize === key}
          title={title}
        >
          {label}
        </button>
      ))}

      <div className="a11y-bar-divider" aria-hidden="true" />

      <button
        onClick={() => setHighContrast((prev) => !prev)}
        className={`a11y-contrast-btn${highContrast ? ' active' : ''}`}
        aria-label={highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
        aria-pressed={highContrast}
        title={highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6V6z" />
        </svg>
      </button>
    </div>
  );
}
