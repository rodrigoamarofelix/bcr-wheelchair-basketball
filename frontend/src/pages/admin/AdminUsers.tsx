import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/client';
import Spinner from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import type { Admin } from './AdminLayout';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const emptyForm = { name: '', email: '', password: '', role: 'editor' };

export default function AdminUsers() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const admin = useOutletContext<Admin>();
  const isAdmin = admin?.role === 'admin';
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() { api.auth.listUsers().then(setUsers).catch(console.error); }
  useEffect(load, []);

  function openEdit(user: AdminUser) {
    setIsCreating(false);
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
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
        const data: Record<string, unknown> = { name: form.name, email: form.email, role: form.role };
        if (form.password) data.password = form.password;
        await api.auth.updateUser(editing.id, data);
      } else {
        await api.auth.createUser(form);
      }
      load();
      setEditing(null);
      setIsCreating(false);
      setForm(emptyForm);
      toast(editing ? 'Usuário atualizado!' : 'Usuário criado!');
    } catch (err) { toast(String(err), 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!(await confirm('Tem certeza que deseja excluir este usuário?'))) return;
    try {
      await api.auth.deleteUser(id);
      load();
      toast('Usuário excluído');
    } catch (err) { toast(String(err), 'error'); }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  const ROLE_LABELS: Record<string, string> = { admin: 'Administrador', editor: 'Editor' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        {isAdmin && (
          <button onClick={openCreate}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
            + Novo Usuário
          </button>
        )}
      </div>

      {(editing || isCreating) && (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-lg">{editing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input id="user-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="user-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">Senha {editing && '(deixe em branco para manter)'}</label>
              <input id="user-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? 'Nova senha (opcional)' : 'Senha'}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
              <select id="user-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
              </select>
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
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Perfil</th>
              <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Criado em</th>
              <th scope="col" className="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  {isAdmin && u.id !== admin.id && (
                    <button onClick={() => openEdit(u)} className="text-primary-600 hover:text-primary-800 text-sm font-medium">Editar</button>
                  )}
                  {isAdmin && u.id !== admin.id && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Excluir</button>
                  )}
                  {u.id === admin.id && (
                    <span className="text-xs text-gray-400">Você</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum usuário cadastrado</p>}
      </div>
    </div>
  );
}
