import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { GallerySkeleton } from './Skeleton';

export interface Gallery {
  id: number;
  title: string;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
  _count: { images: number };
}

const IconPlay = () => (
  <svg className="w-10 h-10 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
);

interface Props {
  onSelect: (gallery: Gallery) => void;
  selectedId?: number | null;
  onClose?: () => void;
}

export default function GalleriesList({ onSelect, selectedId, onClose }: Props) {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.galleries.list()
      .then((all) => setGalleries(all.filter((g: Gallery) => g.isActive)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="galeria" className="py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.32em] text-primary-600 mb-4">Momentos Capturados</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Galeria</h2>
          <p className="text-gray-600">Explore os melhores momentos do nosso time em ação</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <GallerySkeleton key={i} />)}
          </div>
        ) : galleries.length === 0 ? (
          <p className="text-center text-gray-400">Nenhuma galeria disponível ainda</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((g) => (
              <button key={g.id} onClick={() => onSelect(g)}
                className="group text-left overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  {g.coverImage ? (
                    <img loading="lazy" src={g.coverImage} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{g.title}</h3>
                  {g.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{g.description}</p>}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-400">{g._count.images} imagem(ns)</span>
                    <span className="text-xs font-semibold text-primary-600">Ver galeria →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
