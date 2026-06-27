import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Partner {
  id: number;
  name: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.partners.list()
      .then(setPartners)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = partners.filter((p) => p.isActive);

  if (!loading && active.length === 0) return null;

  return (
    <section id="parceiros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            Parceiros do Time
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
            {active.map((partner) => (
              <div
                key={partner.id}
                title={partner.name}
                className="group relative overflow-hidden rounded-xl cursor-default"
              >
                <img
                  src={partner.imageUrl}
                  alt={partner.name}
                  className="w-full h-auto object-cover grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  role="tooltip"
                  className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-slate-900/90 px-3 py-2 text-center text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  {partner.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
