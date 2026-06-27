const stats = [
  { label: 'Vitórias', value: '100+' },
  { label: 'Títulos', value: '20' },
  { label: 'Jogos por ano', value: '25' },
];

export default function Stats() {
  return (
    <section id="metrics" className="py-20 px-4 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm uppercase tracking-[0.32em] text-primary-300 mb-4">Números do time</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">O impacto em quadra</h2>
        <p className="max-w-3xl mx-auto text-slate-300 mb-12">
          Nossa equipe cresce com conquistas, consistência nos jogos e uma comunidade que acredita no esporte como agente de inclusão.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/10">
              <p className="text-5xl font-extrabold text-white mb-3">{stat.value}</p>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
