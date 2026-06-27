interface Props {
  description?: string;
}

const DEFAULT_PARAGRAPHS = [
  'Mais do que um time de basquete em cadeira de rodas, somos uma família unida pela paixão pelo esporte, pela inclusão e pela superação de desafios. Nossa história é construída diariamente por atletas que transformam dedicação, disciplina e coragem em inspiração dentro e fora das quadras.',
  'Acreditamos que o esporte é uma poderosa ferramenta de transformação social, capaz de promover autonomia, fortalecer a autoestima e criar oportunidades para pessoas com deficiência. Cada treino representa um novo aprendizado, cada jogo é uma chance de evoluir e cada conquista é resultado do esforço coletivo de atletas, comissão técnica, familiares, voluntários, patrocinadores e torcedores.',
  'Nossa missão é desenvolver atletas, incentivar a prática do esporte adaptado e mostrar que limites existem para serem superados. Buscamos promover a inclusão, revelar talentos e representar nossa comunidade com orgulho, respeito e espírito esportivo em todas as competições.',
  'Venha conhecer nossa equipe, acompanhar nossa trajetória e fazer parte dessa história. Seja nas arquibancadas, como apoiador ou patrocinador, sua participação fortalece nosso projeto e nos impulsiona a alcançar novos desafios. Juntos, mostramos que a verdadeira força não está apenas em vencer partidas, mas em inspirar pessoas e transformar vidas por meio do esporte.',
];

export default function About({ description }: Props) {
  const paragraphs = description
    ? description.split(/\n\n+/).filter(Boolean)
    : DEFAULT_PARAGRAPHS;

  return (
    <section id="sobre" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold uppercase tracking-[0.24em] mb-4">
            Sobre o time
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Nossa história e missão</h2>
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={`text-lg text-gray-600 leading-relaxed ${index === paragraphs.length - 1 ? 'mb-8' : 'mb-6'}`}
            >
              {paragraph}
            </p>
          ))}
          <a href="#contato" className="inline-flex items-center justify-center rounded-full bg-primary-600 text-white px-8 py-3 text-sm font-semibold hover:bg-primary-700 transition-colors">
            Fale com a equipe
          </a>
        </div>
        <div className="flex items-center justify-center lg:justify-end">
          <img
            src="/team-logo.jpg"
            alt="Camaleões Sobre Rodas"
            className="w-full max-w-md h-auto"
          />
        </div>
      </div>
    </section>
  );
}
