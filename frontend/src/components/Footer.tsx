interface Props {
  teamName?: string;
}

export default function Footer({ teamName }: Props) {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 px-4">
      <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">{teamName || 'Time BCR'}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Orgulho de representar o esporte adaptativo e trazer mais visibilidade ao basquete em cadeira de rodas.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Seções</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <a href="#sobre" className="block hover:text-white transition-colors">Sobre</a>
            <a href="#jogadores" className="block hover:text-white transition-colors">Jogadores</a>
            <a href="#eventos" className="block hover:text-white transition-colors">Eventos</a>
            <a href="#noticias" className="block hover:text-white transition-colors">Notícias</a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Contato</h4>
          <p className="text-sm text-slate-300">Quer saber mais? Visite nossa seção de contato e fale com a equipe.</p>
          <a href="#contato" className="inline-flex mt-4 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">Contato</a>
        </div>
      </div>
      <div className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} {teamName || 'Time BCR'}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
