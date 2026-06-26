import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Props {
  title?: string;
  subtitle?: string;
  bgImage?: string;
}

export default function Hero({ title: staticTitle, subtitle: staticSubtitle }: Props) {
  const [bgImage, setBgImage] = useState('');
  const [title, setTitle] = useState(staticTitle || 'Basquete sem Limites');
  const [subtitle, setSubtitle] = useState(staticSubtitle || 'Força, superação e esporte para todos');

  useEffect(() => {
    api.settings.get().then((settings) => {
      if (settings.hero_background) setBgImage(settings.hero_background);
      if (settings.hero_title) setTitle(settings.hero_title);
      if (settings.hero_subtitle) setSubtitle(settings.hero_subtitle);
    }).catch(console.error);
  }, []);

  return (
    <section className={`relative min-h-screen flex items-center justify-center text-white ${bgImage ? '' : 'bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700'}`}>
      {bgImage && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">{title}</h1>
        <p className="text-xl md:text-2xl text-primary-100 mb-10">{subtitle}</p>
        <a href="#sobre"
          className="inline-block bg-white text-primary-700 font-semibold px-8 py-3 rounded-full hover:bg-primary-50 transition-colors">
          Conheça o Time
        </a>
      </div>
      <div aria-hidden="true" className="absolute bottom-8 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
