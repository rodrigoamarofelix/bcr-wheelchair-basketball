import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import HistoryModal from '../../components/HistoryModal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import type { Admin } from './AdminLayout';

interface Gallery {
  id: number;
  title: string;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { images: number };
}

const IconPlus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);

export default function AdminGalleries() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const admin = useOutletContext<Admin>();
  const isAdmin = admin?.role === 'admin';
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<Gallery | null>(null);

  function load() { api.galleries.list().then(setGalleries).catch(console.error); }
  useEffect(load, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.galleries.update(editingId, form);
      } else {
        await api.galleries.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', description: '' });
      load();
      toast(editingId ? 'Galeria atualizada!' : 'Galeria criada!');
    } catch (err) { toast(String(err), 'error'); }
    finally { setSaving(false); }
  }

  function startEdit(g: Gallery) {
    setEditingId(g.id);
    setForm({ title: g.title, description: g.description || '' });
    setShowForm(true);
  }

  async function handleInactivate(id: number) {
    if (!(await confirm('Tem certeza?'))) return;
    try { await api.galleries.delete(id); load(); toast('Galeria inativada'); } catch (err) { toast(String(err), 'error'); }
  }

  async function handleReactivate(id: number) {
    try { await api.galleries.toggleStatus(id, true); load(); toast('Galeria reativada'); } catch (err) { toast(String(err), 'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Galerias</h1>
        {isAdmin && (
          <button onClick={() => { setEditingId(null); setForm({ title: '', description: '' }); setShowForm(!showForm); }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-1">
            <IconPlus /> {showForm ? 'Cancelar' : 'Nova Galeria'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">{editingId ? 'Editar' : 'Nova'} Galeria</h2>
          <form onSubmit={handleSave} className="space-y-4 max-w-lg">
            <div>
              <label htmlFor="gallery-title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input id="gallery-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required />
            </div>
            <div>
              <label htmlFor="gallery-description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea id="gallery-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <button type="submit" disabled={saving} className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <Spinner className="w-4 h-4" />}{editingId ? 'Salvar' : 'Criar'}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {galleries.map((g) => (
          <div key={g.id} className={`bg-white rounded-xl shadow-sm p-5 ${!g.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-4">
              {g.coverImage ? (
                <img src={g.coverImage} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0 bg-gray-100" />
              ) : (
                <div className="w-20 h-14 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 text-xs">Sem capa</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{g.title}</p>
                {g.description && <p className="text-sm text-gray-500 truncate">{g.description}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{g._count.images} imagem(ns)</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isAdmin && (
                  <>
                    <button title="Gerenciar imagens" onClick={() => navigate(`/admin/galerias/${g.id}`)}
                      className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg hover:bg-primary-100 font-medium">Gerenciar</button>
                    <button title="Editar" onClick={() => startEdit(g)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    {g.isActive ? (
                      <button title="Inativar" onClick={() => handleInactivate(g.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      </button>
                    ) : (
                      <button title="Reativar" onClick={() => handleReactivate(g.id)}
                        className="p-1.5 text-green-500 rounded-lg hover:bg-green-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                    )}
                    <button title="Histórico" onClick={() => setHistoryTarget(g)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {galleries.length === 0 && <p className="text-center text-gray-400 py-8">Nenhuma galeria criada</p>}
      </div>

      {historyTarget && (
        <HistoryModal
          title={historyTarget.title}
          fetchHistory={() => api.galleries.getHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
