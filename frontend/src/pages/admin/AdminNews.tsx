import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/client';
import ImageUpload from '../../components/ImageUpload';
import HistoryModal from '../../components/HistoryModal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import type { Admin } from './AdminLayout';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = { title: '', content: '', imageUrl: '', published: false };

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

export default function AdminNews() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const admin = useOutletContext<Admin>();
  const isAdmin = admin?.role === 'admin';
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<NewsItem | null>(null);

  function load() { api.news.list().then(setNews).catch(console.error); }
  useEffect(load, []);

  function openEdit(item: NewsItem) {
    setIsCreating(false);
    setEditing(item);
    setForm({ title: item.title, content: item.content, imageUrl: item.imageUrl || '', published: item.published });
  }

  function openCreate() { setIsCreating(true); setEditing(null); setForm(emptyForm); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.news.update(editing.id, form);
      } else {
        await api.news.create(form);
      }
      load();
      setEditing(null);
      setIsCreating(false);
      setForm(emptyForm);
      toast(editing ? 'Notícia atualizada!' : 'Notícia criada!');
    } catch (err) { toast(String(err), 'error'); }
    finally { setSaving(false); }
  }

  async function handleInactivate(id: number) {
    if (!(await confirm('Tem certeza que deseja inativar esta notícia?'))) return;
    try { await api.news.delete(id); load(); toast('Notícia inativada'); } catch (err) { toast(String(err), 'error'); }
  }

  async function handleReactivate(id: number) {
    try { await api.news.toggleStatus(id, true); load(); toast('Notícia reativada'); } catch (err) { toast(String(err), 'error'); }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
        <button onClick={openCreate}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          + Nova Notícia
        </button>
      </div>

      {(editing || isCreating) && (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-lg">{editing ? 'Editar Notícia' : 'Nova Notícia'}</h2>
          <div>
            <label htmlFor="news-title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input id="news-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label htmlFor="news-content" className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
            <textarea id="news-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Imagem" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Publicar
          </label>
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
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Título</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Data</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Publicação</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Ativo</th>
              <th scope="col" className="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {news.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-50 ${!item.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isActive ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button title="Editar" onClick={() => openEdit(item)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <IconEdit />
                  </button>
                  {isAdmin && item.isActive && (
                    <button title="Inativar" onClick={() => handleInactivate(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <IconInactivate />
                    </button>
                  )}
                  {isAdmin && !item.isActive && (
                    <button title="Reativar" onClick={() => handleReactivate(item.id)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <IconReactivate />
                    </button>
                  )}
                  {isAdmin && (
                    <button title="Histórico" onClick={() => setHistoryTarget(item)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <IconHistory />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {news.length === 0 && <p className="text-center text-gray-400 py-8">Nenhuma notícia cadastrada</p>}
      </div>

      {historyTarget && (
        <HistoryModal
          title={historyTarget.title}
          fetchHistory={() => api.news.getHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
