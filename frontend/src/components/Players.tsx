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
  pivô: 'Pivô',
  ala_pivo: 'Ala/Pivô',
};

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.players.list().then(setPlayers).catch(console.error).finally(() => setLoading(false));
  }, []);

  const active = players.filter((p) => p.isActive);

  return (
    <section id="jogadores" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Nossos Jogadores</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : active.length === 0 ? (
          <p className="text-center text-gray-400">Em breve...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {active.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
                  {p.photoUrl ? (
                    <img loading="lazy" src={p.photoUrl} alt={p.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    p.name.charAt(0)
                  )}
                </div>
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-primary-600 font-medium">{POSITION_LABELS[p.position] || p.position}</p>
                <p className="text-xs text-gray-400 mt-1">#{p.number} {p.functionalClassification ? `| Classe ${p.functionalClassification.toFixed(1)}` : ''}</p>
                {p.bio && <p className="text-sm text-gray-500 mt-2 line-clamp-3">{p.bio}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
