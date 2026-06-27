export default function FeaturedVideo() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.32em] text-primary-600 mb-4">Ação ao Vivo</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Assista às melhores jogadas
          </h2>
          <p className="text-lg text-gray-600">
            Confira os momentos mais emocionantes dos nossos jogos
          </p>
        </div>
        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/tWU8CXFLOgk?autoplay=0&rel=0"
            title="Basquete em Cadeira de Rodas - Melhores Momentos"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
