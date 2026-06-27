import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

interface Result {
  type: 'jogador' | 'evento' | 'noticia';
  label: string;
  href: string;
  detail: string;
}

export default function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    const q = query.toLowerCase();
    Promise.all([
      api.news.list(true).then((items: { id: number; title: string; content: string; createdAt: string }[]) =>
        items.filter((i) => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q))
          .map((i) => ({ type: 'noticia' as const, label: i.title, href: `/noticias/${i.id}`, detail: new Date(i.createdAt).toLocaleDateString('pt-BR') }))
      ).catch(() => [] as Result[]),
      api.players.list().then((items: { id: number; name: string; number: number; position: string }[]) =>
        items.filter((i) => i.name.toLowerCase().includes(q))
          .map((i) => ({ type: 'jogador' as const, label: i.name, href: `/#jogadores`, detail: `#${i.number} • ${i.position}` }))
      ).catch(() => [] as Result[]),
      api.events.list().then((items: { id: number; title: string; schedule: string; location: string; isActive: boolean }[]) =>
        items.filter((i) => i.isActive && (i.title.toLowerCase().includes(q) || i.location.toLowerCase().includes(q)))
          .map((i) => ({ type: 'evento' as const, label: i.title, href: `/#eventos`, detail: `${i.schedule} • ${i.location}` }))
      ).catch(() => [] as Result[]),
    ]).then(([news, players, events]) => {
      setResults([...news, ...players, ...events].slice(0, 10));
    }).finally(() => setLoading(false));
  }, [query]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (results.length > 0) window.location.href = results[0].href;
  }

  const openSearch = () => setOpen(true);

  if (!open) {
    return (
      <button onClick={openSearch} aria-label="Pesquisar"
        className="text-gray-600 hover:text-gray-900 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar jogadores, eventos..."
          className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          aria-label="Pesquisar no site"
        />
      </form>

      {query.length >= 2 && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border max-h-80 overflow-y-auto z-50">
          {loading ? (
            <p className="text-sm text-gray-400 p-4 text-center">Pesquisando...</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-gray-400 p-4 text-center">Nenhum resultado</p>
          ) : (
            results.map((r, i) => (
              <Link key={`${r.type}-${i}`} to={r.href}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                onClick={() => { setOpen(false); setQuery(''); setResults([]); }}>
                <span className="text-lg shrink-0">
                  {r.type === 'noticia' ? '📰' : r.type === 'jogador' ? '🏀' : '📆'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.label}</p>
                  <p className="text-xs text-gray-400">{r.detail}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
