import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccessibilityBar from './AccessibilityBar';
import Search from './Search';

interface Props {
  teamName?: string;
}

export default function Header({ teamName }: Props) {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const name = teamName || 'Time BCR';

  const links = [
    { href: '#sobre', label: 'Sobre' },
    { href: '#jogadores', label: 'Jogadores' },
    { href: '#eventos', label: 'Eventos' },
    { href: '#noticias', label: 'Notícias' },
    { href: '#galeria', label: 'Galeria' },
    { href: '#contato', label: 'Contato' },
    { href: '/sitemap', label: 'Mapa do Site' },
  ];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-xl transition-all duration-300">
        <a href="/" className="text-lg font-bold tracking-tight text-slate-900">
          {name}
        </a>

        <nav aria-label="Navegação principal" className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-slate-900 transition-colors hover:text-primary-600">
                {l.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Search />
          <AccessibilityBar />
          <a href="#contato" className="inline-flex items-center rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors">
            Junte-se a Nós
          </a>
          <Link to="/admin/login" className="inline-flex items-center rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors">
            Admin
          </Link>
        </div>

        <button aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="mobile-menu" className="md:hidden p-2 text-slate-900 transition-colors" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div id="mobile-menu" role="navigation" aria-label="Navegação mobile" className="md:hidden bg-white border-t border-slate-200 transition-colors">
          <div className="px-4 py-4 space-y-2">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-slate-700 hover:bg-slate-100 hover:text-primary-600' : 'text-white hover:bg-white/10 hover:text-primary-200'}`}>
                {l.label}
              </a>
            ))}
            <a href="#contato" onClick={() => setOpen(false)}
              className="block rounded-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
              Junte-se a Nós
            </a>
            <Link to="/admin/login" onClick={() => setOpen(false)}
              className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors ${isScrolled ? 'text-slate-900 bg-slate-100 hover:bg-slate-200' : 'text-white bg-white/10 hover:bg-white/20'}`}>
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
