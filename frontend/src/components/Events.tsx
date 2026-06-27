import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface EventItem {
  id: number;
  title: string;
  schedule: string;
  location: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.events.list()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = events.filter((e) => e.isActive);

  if (!loading && active.length === 0) return null;

  return (
    <section id="eventos" className="py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.32em] text-primary-600 mb-4">Calendário</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Próximos eventos
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {active.map((event) => (
              <div
                key={event.id}
                title={event.title}
                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-200">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-white/90">{event.schedule}</p>
                  <p className="text-xs text-white/70 mt-1">{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
