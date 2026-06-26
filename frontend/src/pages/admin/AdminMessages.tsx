import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../components/Toast';

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);

  function load() { api.contact.list().then(setMessages).catch(console.error); }
  useEffect(load, []);

  async function markRead(id: number) {
    try {
      await api.contact.markRead(id);
      load();
    } catch (err) { toast(String(err), 'error'); }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('pt-BR');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mensagens</h1>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhuma mensagem recebida</p>
        ) : messages.map((m) => (
          <div key={m.id} className={`bg-white rounded-xl shadow-sm p-5 ${!m.read ? 'ring-2 ring-primary-200' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{m.name}</span>
                  {!m.read && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Nova</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{m.email}</p>
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{m.message}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(m.createdAt)}</p>
              </div>
              {!m.read && (
                <button onClick={() => markRead(m.id)}
                  className="shrink-0 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 font-medium">
                  Marcar como lida
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
