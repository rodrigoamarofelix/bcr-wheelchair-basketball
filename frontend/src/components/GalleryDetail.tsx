import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import type { Gallery } from './GalleriesList';

interface GalleryItem {
  id: number;
  url: string;
  caption: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
}

const IconPlay = () => (
  <svg className="w-14 h-14 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
);

const IconLeft = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);

const IconRight = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);

interface Props {
  gallery: Gallery;
  onClose: () => void;
}

export default function GalleryDetail({ gallery, onClose }: Props) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    api.galleries.getImages(gallery.id).then((all: GalleryItem[]) => setItems(all.filter((i: GalleryItem) => i.isActive))).catch(console.error);
  }, [gallery.id]);

  const goNext = useCallback(() => {
    if (selectedIdx !== null && selectedIdx < items.length - 1) setSelectedIdx(selectedIdx + 1);
  }, [selectedIdx, items.length]);

  const goPrev = useCallback(() => {
    if (selectedIdx !== null && selectedIdx > 0) setSelectedIdx(selectedIdx - 1);
  }, [selectedIdx]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (selectedIdx !== null) setSelectedIdx(null);
        else onClose();
      }
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIdx, onClose, goNext, goPrev]);

  const selected = selectedIdx !== null ? items[selectedIdx] : null;

  return (
    <div role="dialog" aria-modal="true" aria-label={gallery.title} className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 text-white shrink-0">
        <div>
          <h2 className="text-xl font-bold">{gallery.title}</h2>
          {gallery.description && <p className="text-white/60 text-sm">{gallery.description}</p>}
        </div>
        <button onClick={onClose} aria-label="Fechar galeria" className="text-3xl leading-none hover:text-white/60">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 mt-20">Nenhuma mídia nesta galeria</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto">
            {items.map((item, i) => (
              <button key={item.id} onClick={() => setSelectedIdx(i)}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800 hover:ring-2 hover:ring-primary-400 transition-all">
                {item.type === 'video' ? (
                  <>
                    <video src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <IconPlay />
                    </div>
                  </>
                ) : (
                  <img loading="lazy" src={item.url} alt={item.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm truncate">{item.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedIdx(null)}>
          <div className="relative max-w-6xl w-full flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
            {selectedIdx! > 0 && (
              <button onClick={goPrev} aria-label="Anterior" className="shrink-0 text-white/60 hover:text-white transition-colors p-2">
                <IconLeft />
              </button>
            )}
            <div className="flex-1 flex flex-col items-center min-w-0">
              {selected.type === 'video' ? (
                <video key={selected.id} src={selected.url} controls autoPlay className="max-w-full max-h-[75vh] rounded-lg" />
              ) : (
                <img loading="lazy" key={selected.id} src={selected.url} alt={selected.caption || ''} className="max-w-full max-h-[75vh] rounded-lg" />
              )}
              <div className="mt-3 text-center space-y-1">
                {selected.caption && <p className="text-white/70 text-sm">{selected.caption}</p>}
                <p className="text-white/40 text-xs">{selectedIdx! + 1} / {items.length}</p>
              </div>
            </div>
            {selectedIdx! < items.length - 1 && (
              <button onClick={goNext} aria-label="Próximo" className="shrink-0 text-white/60 hover:text-white transition-colors p-2">
                <IconRight />
              </button>
            )}
          </div>
          <button onClick={() => setSelectedIdx(null)} aria-label="Fechar" className="absolute top-4 right-4 text-white text-3xl leading-none">&times;</button>
        </div>
      )}
    </div>
  );
}
