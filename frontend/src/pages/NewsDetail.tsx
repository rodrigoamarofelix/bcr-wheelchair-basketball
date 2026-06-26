import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../api/client';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.news.get(Number(id))
      .then(setItem)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>;
  if (!item) return null;

  const siteName = 'BCR - Basquete em Cadeira de Rodas';

  return (
    <>
      <Helmet>
        <title>{item.title} | {siteName}</title>
        <meta property="og:title" content={item.title} />
        <meta property="og:description" content={item.content.slice(0, 200)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {item.imageUrl && <meta property="og:image" content={item.imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={item.title} />
        <meta name="twitter:description" content={item.content.slice(0, 200)} />
        {item.imageUrl && <meta name="twitter:image" content={item.imageUrl} />}
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary-600">BCR</Link>
            <Link to="/" className="text-sm text-gray-500 hover:text-primary-600">Voltar</Link>
          </div>
        </header>

        <article className="max-w-4xl mx-auto px-4 py-8">
          {item.imageUrl && (
            <img loading="lazy" src={item.imageUrl} alt={item.title} className="w-full h-72 object-cover rounded-2xl mb-8" />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{item.title}</h1>
          <p className="text-sm text-gray-400 mb-6">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{item.content}</div>
        </article>
      </div>
    </>
  );
}
