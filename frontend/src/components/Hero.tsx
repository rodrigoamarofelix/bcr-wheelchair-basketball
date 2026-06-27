import { useEffect, useState } from 'react';
import { api } from '../api/client';

const defaultBgImage = '/hero.jpg';

interface Props {
  title?: string;
  subtitle?: string;
  bgImage?: string;
}

export default function Hero({ title: staticTitle, subtitle: staticSubtitle, bgImage: propBgImage }: Props) {
  const [title, setTitle] = useState(staticTitle || 'Basquete sem Limites');
  const [subtitle, setSubtitle] = useState(staticSubtitle || 'Força, superação e esporte para todos');
  const [bgSrc, setBgSrc] = useState(propBgImage || defaultBgImage);

  useEffect(() => {
    setBgSrc(propBgImage || defaultBgImage);
  }, [propBgImage]);

  useEffect(() => {
    api.settings.get().then((settings) => {
      if (settings.hero_title) setTitle(settings.hero_title);
      if (settings.hero_subtitle) setSubtitle(settings.hero_subtitle);
    }).catch(console.error);
  }, []);

  function handleImageError() {
    if (bgSrc !== defaultBgImage) setBgSrc(defaultBgImage);
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden bg-slate-950">
        <img
          src={bgSrc}
          alt="Basquete em destaque"
          className="absolute top-1/2 left-1/2 w-full min-h-full h-auto max-w-none -translate-x-1/2 -translate-y-1/2"
          onError={handleImageError}
        />
      </div>
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 text-center px-4 max-w-5xl">
        <p className="text-sm uppercase tracking-[0.32em] text-slate-200/80 mb-4">Time de Basquete em Cadeira de Rodas</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight mb-6">{title}</h1>
        <p className="text-lg md:text-2xl text-slate-200/90 max-w-3xl mx-auto mb-10">{subtitle}</p>
        <a href="#contato"
          className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-semibold text-primary-900 shadow-2xl shadow-black/30 transition hover:bg-slate-100">
          Junte-se a Nós
        </a>
      </div>
      <div aria-hidden="true" className="absolute bottom-8 opacity-80 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
