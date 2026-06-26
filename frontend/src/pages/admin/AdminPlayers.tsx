import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/client';
import ImageUpload from '../../components/ImageUpload';
import HistoryModal from '../../components/HistoryModal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import type { Admin } from './AdminLayout';

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

const POSITIONS = [
  { value: 'armador', label: 'Armador' },
  { value: 'ala', label: 'Ala' },
  { value: 'pivô', label: 'Pivô' },
  { value: 'ala_pivo', label: 'Ala/Pivô' },
];

const CLASSIFICATIONS = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5];

const emptyForm = { name: '', number: 0, position: 'armador', functionalClassification: '' as string | number, photoUrl: '', bio: '' };

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

export default function AdminPlayers() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const admin = useOutletContext<Admin>();
  const isAdmin = admin?.role === 'admin';
  const [players, setPlayers] = useState<Player[]>([]);
  const [editing, setEditing] = useState<Player | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<Player | null>(null);

  function load() { api.players.list().then(setPlayers).catch(console.error); }
  useEffect(load, []);

  function openEdit(player: Player) {
    setIsCreating(false);
    setEditing(player);
    setForm({ name: player.name, number: player.number, position: player.position, functionalClassification: player.functionalClassification ?? '', photoUrl: player.photoUrl || '', bio: player.bio || '' });
  }

  function openCreate() {
    setIsCreating(true);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.players.update(editing.id, form);
      } else {
        await api.players.create(form);
      }
      load();
      setEditing(null);
      setIsCreating(false);
      setForm(emptyForm);
      toast(editing ? 'Jogador atualizado!' : 'Jogador criado!');
    } catch (err) { toast(String(err), 'error'); }
    finally { setSaving(false); }
  }

  async function handleInactivate(id: number) {
    if (!(await confirm('Tem certeza que deseja inativar este jogador?'))) return;
    try {
      await api.players.delete(id);
      load();
      toast('Jogador inativado');
    } catch (err) { toast(String(err), 'error'); }
  }

  async function handleReactivate(id: number) {
    try {
      await api.players.toggleStatus(id, true);
      load();
      toast('Jogador reativado');
    } catch (err) { toast(String(err), 'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jogadores</h1>
        <button onClick={openCreate}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          + Novo Jogador
        </button>
      </div>

      {(editing || isCreating) && (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-lg">{editing ? 'Editar Jogador' : 'Novo Jogador'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input id="player-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="player-number" className="block text-sm font-medium text-gray-700 mb-1">Número da Camisa</label>
              <input id="player-number" type="number" value={form.number} onChange={(e) => setForm({ ...form, number: Number(e.target.value) })} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="player-position" className="block text-sm font-medium text-gray-700 mb-1">Posição</label>
              <select id="player-position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="player-classification" className="block text-sm font-medium text-gray-700 mb-1">Classificação Funcional</label>
              <select id="player-classification" value={form.functionalClassification} onChange={(e) => setForm({ ...form, functionalClassification: e.target.value ? Number(e.target.value) : '' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Selecione...</option>
                {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c.toFixed(1)}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <ImageUpload value={form.photoUrl} onChange={(url) => setForm({ ...form, photoUrl: url })} label="Foto" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="player-bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea id="player-bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
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
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Camisa</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Posição</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Classe</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Ativo</th>
              <th scope="col" className="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {players.map((p) => (
              <tr key={p.id} className={`hover:bg-gray-50 ${!p.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium">#{p.number}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 capitalize">{p.position}</td>
                <td className="px-4 py-3">{p.functionalClassification ? p.functionalClassification.toFixed(1) : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.isActive ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button title="Editar" onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <IconEdit />
                  </button>
                  {isAdmin && p.isActive && (
                    <button title="Inativar" onClick={() => handleInactivate(p.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <IconInactivate />
                    </button>
                  )}
                  {isAdmin && !p.isActive && (
                    <button title="Reativar" onClick={() => handleReactivate(p.id)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <IconReactivate />
                    </button>
                  )}
                  {isAdmin && (
                    <button title="Histórico" onClick={() => setHistoryTarget(p)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <IconHistory />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {players.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum jogador cadastrado</p>}
      </div>

      {historyTarget && (
        <HistoryModal
          title={historyTarget.name}
          fetchHistory={() => api.players.getHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
