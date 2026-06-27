import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CardSkeleton } from './Skeleton';

interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  functionalClassification: number | null;
  photoUrl: string | null;
  bio: string | null;
  isActive: boolean;
}

const POSITION_LABELS: Record<string, string> = {
  armador: 'Armador',
  ala: 'Ala',
  pivo: 'Pivô',
  ala_pivo: 'Ala/Pivô',
};

function playerSubtitle(player: Player) {
  const position = POSITION_LABELS[player.position] || player.position;
  if (player.functionalClassification) {
    return `${position} • Classe ${player.functionalClassification.toFixed(1)}`;
  }
  return position;
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.players.list().then(setPlayers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const active = players.filter((p) => p.isActive);

  return (
    <section id="jogadores" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            Nosso Time Brilhante
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : active.length === 0 ? (
          <p className="text-center text-gray-400">Em breve...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {active.map((player) => {
              const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=f1f5f9&color=1e293b&size=512`;
              return (
                <article key={player.id} className="flex flex-col">
                  <div className="mb-3 overflow-hidden rounded-lg bg-slate-100">
                    <img
                      loading="lazy"
                      src={player.photoUrl || placeholderUrl}
                      alt={player.name}
                      className="w-full h-[400px] object-cover"
                    />
                  </div>
                  <div className="text-center px-1">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                      {player.name}
                    </h3>
                    <p className="text-base text-slate-700 mb-1">
                      {playerSubtitle(player)}
                    </p>
                    <p className="text-sm text-slate-500">#{player.number}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
