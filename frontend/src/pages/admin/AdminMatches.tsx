import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/client';
import HistoryModal from '../../components/HistoryModal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import type { Admin } from './AdminLayout';

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

const emptyForm = { opponent: '', date: '', location: '' };

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

const IconInactivate = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
);

const IconReactivate = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const IconHistory = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const IconFinish = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
);

export default function AdminMatches() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const admin = useOutletContext<Admin>();
  const isAdmin = admin?.role === 'admin';
  const [matches, setMatches] = useState<Match[]>([]);
  const [editing, setEditing] = useState<Match | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<Match | null>(null);

  function load() { api.matches.list().then(setMatches).catch(console.error); }
  useEffect(load, []);

  function openEdit(m: Match) {
    setIsCreating(false);
    setEditing(m);
    setForm({ opponent: m.opponent, date: new Date(m.date).toISOString().slice(0, 16), location: m.location });
  }

  function openCreate() { setIsCreating(true); setEditing(null); setForm(emptyForm); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.matches.update(editing.id, form);
      } else {
        await api.matches.create(form);
      }
      load();
      setEditing(null);
      setIsCreating(false);
      setForm(emptyForm);
      toast(editing ? 'Jogo atualizado!' : 'Jogo criado!');
    } catch (err) { toast(String(err), 'error'); }
    finally { setSaving(false); }
  }

  async function handleInactivate(id: number) {
    if (!(await confirm('Tem certeza que deseja inativar este jogo?'))) return;
    try { await api.matches.delete(id); load(); toast('Jogo inativado'); } catch (err) { toast(String(err), 'error'); }
  }

  async function handleReactivate(id: number) {
    try { await api.matches.toggleStatus(id, true); load(); toast('Jogo reativado'); } catch (err) { toast(String(err), 'error'); }
  }

  async function finishMatch(m: Match) {
    const home = prompt('Placar do time:');
    if (home === null) return;
    const opp = prompt('Placar do oponente:');
    if (opp === null) return;
    try {
      await api.matches.update(m.id, { homeScore: Number(home), opponentScore: Number(opp), isFinished: true });
      load();
      toast('Jogo finalizado!');
    } catch (err) { toast(String(err), 'error'); }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jogos</h1>
        <button onClick={openCreate}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          + Novo Jogo
        </button>
      </div>

      {(editing || isCreating) && (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-lg">{editing ? 'Editar Jogo' : 'Novo Jogo'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="match-opponent" className="block text-sm font-medium text-gray-700 mb-1">Oponente</label>
              <input id="match-opponent" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="match-date" className="block text-sm font-medium text-gray-700 mb-1">Data do Jogo</label>
              <input id="match-date" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="match-location" className="block text-sm font-medium text-gray-700 mb-1">Local</label>
              <input id="match-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Spinner className="w-4 h-4" />}{editing ? 'Salvar' : 'Criar'}
            </button>
            <button type="button" onClick={() => { setEditing(null); setIsCreating(false); setForm(emptyForm); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Oponente</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Data</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Local</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th scope="col" className="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {matches.map((m) => (
              <tr key={m.id} className={`hover:bg-gray-50 ${!m.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium">vs {m.opponent}</td>
                <td className="px-4 py-3">{formatDate(m.date)}</td>
                <td className="px-4 py-3">{m.location}</td>
                <td className="px-4 py-3">
                  {!m.isActive ? (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Inativo</span>
                  ) : m.isFinished ? (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{m.homeScore} x {m.opponentScore}</span>
                  ) : (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">Agendado</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {m.isActive && !m.isFinished && (
                    <button title="Finalizar" onClick={() => finishMatch(m)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <IconFinish />
                    </button>
                  )}
                  <button title="Editar" onClick={() => openEdit(m)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <IconEdit />
                  </button>
                  {isAdmin && m.isActive && (
                    <button title="Inativar" onClick={() => handleInactivate(m.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <IconInactivate />
                    </button>
                  )}
                  {isAdmin && !m.isActive && (
                    <button title="Reativar" onClick={() => handleReactivate(m.id)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <IconReactivate />
                    </button>
                  )}
                  {isAdmin && (
                    <button title="Histórico" onClick={() => setHistoryTarget(m)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <IconHistory />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {matches.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum jogo cadastrado</p>}
      </div>

      {historyTarget && (
        <HistoryModal
          title={`vs ${historyTarget.opponent}`}
          fetchHistory={() => api.matches.getHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
