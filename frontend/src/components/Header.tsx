import { useState } from 'react';
import { Link } from 'react-router-dom';
import AccessibilityBar from './AccessibilityBar';
import Search from './Search';

interface Props {
  teamName?: string;
}

export default function Header({ teamName }: Props) {
  const [open, setOpen] = useState(false);
  const name = teamName || 'Time BCR';

  const links = [
    { href: '#sobre', label: 'Sobre' },
    { href: '#jogadores', label: 'Jogadores' },
    { href: '#jogos', label: 'Jogos' },
    { href: '#noticias', label: 'Notícias' },
    { href: '#galeria', label: 'Galeria' },
    { href: '#contato', label: 'Contato' },
    { href: '/sitemap', label: 'Mapa do Site' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <span className="text-xl font-bold text-primary-700">{name}</span>
          <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                {l.label}
              </a>
            ))}
            <Search />
            <AccessibilityBar />
            <Link to="/admin/login" className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
              Admin
            </Link>
          </nav>
          <button aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="mobile-menu" className="md:hidden p-2" onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" role="navigation" aria-label="Navegação mobile" className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block text-sm font-medium text-gray-600 hover:text-primary-600">
                {l.label}
              </a>
            ))}
            <Link to="/admin/login" onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-400 hover:text-gray-600">
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
