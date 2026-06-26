import { useEffect, useState } from 'react';

interface HistoryEntry {
  id: number;
  oldStatus: boolean;
  newStatus: boolean;
  changedBy: number;
  createdAt: string;
}

interface Props {
  title: string;
  fetchHistory: () => Promise<HistoryEntry[]>;
  onClose: () => void;
}

export default function HistoryModal({ title, fetchHistory, onClose }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchHistory]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Histórico - ${title}`} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Histórico - {title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {loading ? (
          <p className="text-gray-400 text-center py-4">Carregando...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Nenhuma alteração registrada</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="text-sm flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className={`inline-block w-2 h-2 rounded-full ${h.newStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>
                  {h.newStatus ? 'Ativado' : 'Inativado'}
                </span>
                <span className="text-gray-400 ml-auto">{new Date(h.createdAt).toLocaleString('pt-BR')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
