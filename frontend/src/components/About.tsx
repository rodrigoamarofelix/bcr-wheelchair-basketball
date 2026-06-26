interface Props {
  description?: string;
}

export default function About({ description }: Props) {
  return (
    <section id="sobre" className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Sobre Nós</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          {description || 'Somos um time de basquete em cadeira de rodas dedicado, competitivo e cheio de garra. Acreditamos que o esporte transforma vidas e quebra barreiras. Nosso time é formado por atletas determinados que superam desafios diariamente dentro e fora das quadras.'}
        </p>
      </div>
    </section>
  );
}
