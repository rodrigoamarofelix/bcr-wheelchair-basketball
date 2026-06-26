import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { NewsCardSkeleton } from './Skeleton';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsItem | null>(null);

  useEffect(() => {
    api.news.list(true).then(setNews).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelected(null);
  }, []);

  useEffect(() => {
    if (selected) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selected, handleKeyDown]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  return (
    <section id="noticias" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Notícias</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <NewsCardSkeleton key={i} />)}
          </div>
        ) : news.length === 0 ? (
          <p className="text-center text-gray-400">Nenhuma notícia publicada ainda</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <article key={item.id} onClick={() => setSelected(item)}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                {item.imageUrl && (
                  <img loading="lazy" src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-5">
                  <time className="text-xs text-gray-400">{formatDate(item.createdAt)}</time>
                  <h3 className="font-semibold text-lg mt-1 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
                  <Link to={`/noticias/${item.id}`}
                    className="inline-block mt-3 text-sm text-primary-600 font-medium hover:text-primary-700">
                    Leia mais →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div role="dialog" aria-modal="true" aria-label={selected.title} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {selected.imageUrl && (
              <img loading="lazy" src={selected.imageUrl} alt={selected.title} className="w-full h-64 object-cover rounded-t-2xl" />
            )}
            <div className="p-6">
              <time className="text-xs text-gray-400">{formatDate(selected.createdAt)}</time>
              <h3 className="text-2xl font-bold mt-2 mb-4">{selected.title}</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selected.content}</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setSelected(null)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
                  Fechar
                </button>
                <Link to={`/noticias/${selected.id}`}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
                  Ver página completa
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
