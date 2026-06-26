import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { MatchSkeleton } from './Skeleton';

interface Match {
  id: number;
  opponent: string;
  date: string;
  location: string;
  homeScore: number | null;
  opponentScore: number | null;
  isFinished: boolean;
  isActive: boolean;
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.matches.list().then(setMatches).catch(console.error).finally(() => setLoading(false));
  }, []);

  const active = matches.filter((m) => m.isActive);
  const upcoming = active.filter((m) => !m.isFinished).slice(0, 6);
  const past = active.filter((m) => m.isFinished).slice(0, 6);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  return (
    <section id="jogos" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Jogos</h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <MatchSkeleton key={i} />)}
          </div>
        ) : matches.length === 0 ? (
          <p className="text-center text-gray-400">Nenhum jogo cadastrado ainda</p>
        ) : (<>
          {upcoming.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Próximos Jogos</h3>
              <div className="space-y-3">
                {upcoming.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-gray-900">vs {m.opponent}</p>
                      <p className="text-sm text-gray-500">{formatDate(m.date)} — {m.location}</p>
                    </div>
                    <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">Agendado</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Resultados</h3>
              <div className="space-y-3">
                {past.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-gray-900">vs {m.opponent}</p>
                      <p className="text-sm text-gray-500">{formatDate(m.date)} — {m.location}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{m.homeScore} x {m.opponentScore}</span>
                      {(m.homeScore ?? 0) > (m.opponentScore ?? 0) ? (
                        <p className="text-xs text-green-600 font-medium">Vitória</p>
                      ) : (m.homeScore ?? 0) < (m.opponentScore ?? 0) ? (
                        <p className="text-xs text-red-600 font-medium">Derrota</p>
                      ) : (
                        <p className="text-xs text-gray-500 font-medium">Empate</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>)}
      </div>
    </section>
  );
}
