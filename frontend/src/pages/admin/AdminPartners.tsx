import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/client';
import ImageUpload from '../../components/ImageUpload';
import HistoryModal from '../../components/HistoryModal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import type { Admin } from './AdminLayout';

interface Partner {
  id: number;
  name: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = { name: '', imageUrl: '', sortOrder: 0 };

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

export default function AdminPartners() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const admin = useOutletContext<Admin>();
  const isAdmin = admin?.role === 'admin';
  const [partners, setPartners] = useState<Partner[]>([]);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<Partner | null>(null);

  function load() { api.partners.list().then(setPartners).catch(console.error); }
  useEffect(load, []);

  function openEdit(partner: Partner) {
    setIsCreating(false);
    setEditing(partner);
    setForm({ name: partner.name, imageUrl: partner.imageUrl, sortOrder: partner.sortOrder });
  }

  function openCreate() {
    setIsCreating(true);
    setEditing(null);
    const nextOrder = partners.length > 0 ? Math.max(...partners.map((p) => p.sortOrder)) + 1 : 1;
    setForm({ ...emptyForm, sortOrder: nextOrder });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageUrl) {
      toast('Envie a imagem do parceiro', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.partners.update(editing.id, form);
      } else {
        await api.partners.create(form);
      }
      load();
      setEditing(null);
      setIsCreating(false);
      setForm(emptyForm);
      toast(editing ? 'Parceiro atualizado!' : 'Parceiro criado!');
    } catch (err) { toast(String(err), 'error'); }
    finally { setSaving(false); }
  }

  async function handleInactivate(id: number) {
    if (!(await confirm('Tem certeza que deseja inativar este parceiro?'))) return;
    try {
      await api.partners.delete(id);
      load();
      toast('Parceiro inativado');
    } catch (err) { toast(String(err), 'error'); }
  }

  async function handleReactivate(id: number) {
    try {
      await api.partners.toggleStatus(id, true);
      load();
      toast('Parceiro reativado');
    } catch (err) { toast(String(err), 'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Parceiros</h1>
        <button onClick={openCreate}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          + Novo Parceiro
        </button>
      </div>

      {(editing || isCreating) && (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-lg">{editing ? 'Editar Parceiro' : 'Novo Parceiro'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="partner-name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input id="partner-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="partner-order" className="block text-sm font-medium text-gray-700 mb-1">Ordem de exibição</label>
              <input id="partner-order" type="number" min={0} value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Logo / Imagem" />
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
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Ordem</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Imagem</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Ativo</th>
              <th scope="col" className="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {partners.map((p) => (
              <tr key={p.id} className={`hover:bg-gray-50 ${!p.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">{p.sortOrder}</td>
                <td className="px-4 py-3">
                  <img src={p.imageUrl} alt={p.name} className="w-16 h-12 object-cover rounded-lg grayscale" />
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
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
        {partners.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum parceiro cadastrado</p>}
      </div>

      {historyTarget && (
        <HistoryModal
          title={historyTarget.name}
          fetchHistory={() => api.partners.getHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
