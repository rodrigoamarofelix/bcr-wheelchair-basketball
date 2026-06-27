import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/client';
import ImageUpload from '../../components/ImageUpload';
import HistoryModal from '../../components/HistoryModal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import type { Admin } from './AdminLayout';

interface EventItem {
  id: number;
  title: string;
  schedule: string;
  location: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = { title: '', schedule: '', location: '', imageUrl: '', sortOrder: 0 };

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

export default function AdminEvents() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const admin = useOutletContext<Admin>();
  const isAdmin = admin?.role === 'admin';
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<EventItem | null>(null);

  function load() { api.events.list().then(setEvents).catch(console.error); }
  useEffect(load, []);

  function openEdit(event: EventItem) {
    setIsCreating(false);
    setEditing(event);
    setForm({
      title: event.title,
      schedule: event.schedule,
      location: event.location,
      imageUrl: event.imageUrl,
      sortOrder: event.sortOrder,
    });
  }

  function openCreate() {
    setIsCreating(true);
    setEditing(null);
    const nextOrder = events.length > 0 ? Math.max(...events.map((e) => e.sortOrder)) + 1 : 1;
    setForm({ ...emptyForm, sortOrder: nextOrder });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageUrl) {
      toast('Envie a imagem do evento', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.events.update(editing.id, form);
      } else {
        await api.events.create(form);
      }
      load();
      setEditing(null);
      setIsCreating(false);
      setForm(emptyForm);
      toast(editing ? 'Evento atualizado!' : 'Evento criado!');
    } catch (err) { toast(String(err), 'error'); }
    finally { setSaving(false); }
  }

  async function handleInactivate(id: number) {
    if (!(await confirm('Tem certeza que deseja inativar este evento?'))) return;
    try {
      await api.events.delete(id);
      load();
      toast('Evento inativado');
    } catch (err) { toast(String(err), 'error'); }
  }

  async function handleReactivate(id: number) {
    try {
      await api.events.toggleStatus(id, true);
      load();
      toast('Evento reativado');
    } catch (err) { toast(String(err), 'error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        <button onClick={openCreate}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          + Novo Evento
        </button>
      </div>

      {(editing || isCreating) && (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-lg">{editing ? 'Editar Evento' : 'Novo Evento'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input id="event-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="event-schedule" className="block text-sm font-medium text-gray-700 mb-1">Data / Horário</label>
              <input id="event-schedule" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} required
                placeholder="Ex: Toda terça e quinta"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">Local</label>
              <input id="event-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required
                placeholder="Ex: Ginásio Municipal"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="event-order" className="block text-sm font-medium text-gray-700 mb-1">Ordem de exibição</label>
              <input id="event-order" type="number" min={0} value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Imagem de capa" />
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
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Título</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Data/Horário</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Local</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Ativo</th>
              <th scope="col" className="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map((ev) => (
              <tr key={ev.id} className={`hover:bg-gray-50 ${!ev.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">{ev.sortOrder}</td>
                <td className="px-4 py-3">
                  <img src={ev.imageUrl} alt={ev.title} className="w-16 h-16 object-cover rounded-lg" />
                </td>
                <td className="px-4 py-3 font-medium">{ev.title}</td>
                <td className="px-4 py-3">{ev.schedule}</td>
                <td className="px-4 py-3">{ev.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${ev.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {ev.isActive ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button title="Editar" onClick={() => openEdit(ev)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <IconEdit />
                  </button>
                  {isAdmin && ev.isActive && (
                    <button title="Inativar" onClick={() => handleInactivate(ev.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <IconInactivate />
                    </button>
                  )}
                  {isAdmin && !ev.isActive && (
                    <button title="Reativar" onClick={() => handleReactivate(ev.id)} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <IconReactivate />
                    </button>
                  )}
                  {isAdmin && (
                    <button title="Histórico" onClick={() => setHistoryTarget(ev)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <IconHistory />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum evento cadastrado</p>}
      </div>

      {historyTarget && (
        <HistoryModal
          title={historyTarget.title}
          fetchHistory={() => api.events.getHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
