import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

interface Stats {
  players: number;
  matches: number;
  news: number;
  galleries: number;
  unreadMessages: number;
}

const CARDS = [
  { key: 'players' as const, label: 'Jogadores Ativos', icon: '🏀', color: 'bg-blue-500', link: '/admin/jogadores' },
  { key: 'matches' as const, label: 'Jogos Ativos', icon: '📅', color: 'bg-green-500', link: '/admin/jogos' },
  { key: 'news' as const, label: 'Notícias', icon: '📰', color: 'bg-purple-500', link: '/admin/noticias' },
  { key: 'galleries' as const, label: 'Galerias', icon: '🖼️', color: 'bg-orange-500', link: '/admin/galerias' },
  { key: 'unreadMessages' as const, label: 'Mensagens Não Lidas', icon: '✉️', color: 'bg-red-500', link: '/admin/mensagens' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.stats.get().then(setStats).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((card) => {
          const value = stats?.[card.key] ?? '-';
          return (
            <Link key={card.key} to={card.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
