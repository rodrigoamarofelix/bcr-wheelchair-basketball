const SECTIONS = [
  { href: '/', label: 'Página Inicial' },
  { href: '/#sobre', label: 'Sobre Nós' },
  { href: '/#jogadores', label: 'Jogadores' },
  { href: '/#eventos', label: 'Eventos' },
  { href: '/#noticias', label: 'Notícias' },
  { href: '/#galeria', label: 'Galeria' },
  { href: '/#contato', label: 'Contato' },
];

const PAGES = [
  { href: '/sitemap', label: 'Mapa do Site' },
];

export default function Sitemap() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mapa do Site</h1>
        <p className="text-gray-600 mb-10">
          Navegue por todas as seções do site.
        </p>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Seções</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {SECTIONS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-primary-400 transition-all"
            >
              <svg className="w-5 h-5 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="font-medium text-gray-900">{label}</span>
            </a>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Páginas</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PAGES.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-primary-400 transition-all"
            >
              <svg className="w-5 h-5 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="font-medium text-gray-900">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
