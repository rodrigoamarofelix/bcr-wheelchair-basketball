import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';

const KEYS = [
  { key: 'team_name', label: 'Nome do Time' },
  { key: 'team_description', label: 'Descrição do Time' },
  { key: 'hero_title', label: 'Título do Hero' },
  { key: 'hero_subtitle', label: 'Subtítulo do Hero' },
  { key: 'contact_email', label: 'Email de Contato' },
  { key: 'contact_phone', label: 'Telefone' },
  { key: 'contact_address', label: 'Endereço' },
  { key: 'instagram_url', label: 'Instagram' },
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'youtube_url', label: 'YouTube' },
  { key: 'whatsapp_number', label: 'WhatsApp (com código do país, ex: 5511999998888)' },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.settings.get().then(setSettings).catch(console.error);
  }, []);

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.settings.update(settings);
      toast('Configurações salvas!');
    } catch (err) { toast(String(err), 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {KEYS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {key === 'team_description' || key === 'hero_subtitle' ? (
              <textarea value={settings[key] || ''} onChange={(e) => set(key, e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" rows={3} />
            ) : (
              <input value={settings[key] || ''} onChange={(e) => set(key, e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            )}
          </div>
        ))}

        <div>
          <ImageUpload
            value={settings.hero_background || ''}
            onChange={(url) => set('hero_background', url)}
            label="Imagem de Fundo do Hero"
          />
        </div>

        <button type="submit" disabled={saving}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}
