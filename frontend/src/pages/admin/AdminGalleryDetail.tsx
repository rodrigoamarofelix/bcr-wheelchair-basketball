import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../../api/client';
import GalleryUpload from '../../components/GalleryUpload';
import HistoryModal from '../../components/HistoryModal';
import Spinner from '../../components/Spinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import type { Admin } from './AdminLayout';

interface GalleryItem {
  id: number;
  url: string;
  caption: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
}

interface Gallery {
  id: number;
  title: string;
  description: string | null;
  coverImage: string | null;
  isActive: boolean;
}

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

const IconInactivate = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
);

const IconReactivate = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const IconCover = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);

const IconHistory = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const IconPlay = () => (
  <svg className="w-10 h-10 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
);

export default function AdminGalleryDetail() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const { id } = useParams<{ id: string }>();
  const galleryId = Number(id);
  const admin = useOutletContext<Admin>();
  const isAdmin = admin?.role === 'admin';
  const navigate = useNavigate();

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [historyTarget, setHistoryTarget] = useState<GalleryItem | null>(null);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [savingCaption, setSavingCaption] = useState(false);

  function load() {
    api.galleries.get(galleryId).then(setGallery).catch(() => navigate('/admin/galerias'));
    api.galleries.getImages(galleryId).then(setItems).catch(console.error);
  }
  useEffect(load, [galleryId]);

  function openEdit(item: GalleryItem) {
    setEditing(item);
    setEditCaption(item.caption || '');
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSavingCaption(true);
    try {
      await api.galleries.updateImage(galleryId, editing.id, { caption: editCaption });
      setEditing(null);
      load();
      toast('Legenda atualizada!');
    } catch (err) { toast(String(err), 'error'); }
    finally { setSavingCaption(false); }
  }

  async function handleUploadComplete(results: { url: string; type: string }[]) {
    try {
      await api.galleries.addImages(galleryId, { items: results.map((r) => ({ url: r.url, type: r.type })) });
      load();
      toast('Mídia adicionada!');
    } catch (err) { toast(String(err), 'error'); }
  }

  async function handleInactivate(imageId: number) {
    if (!(await confirm('Tem certeza que deseja inativar esta imagem?'))) return;
    try { await api.galleries.deleteImage(galleryId, imageId); load(); toast('Imagem inativada'); } catch (err) { toast(String(err), 'error'); }
  }

  async function handleReactivate(imageId: number) {
    try { await api.galleries.toggleImageStatus(galleryId, imageId, true); load(); toast('Imagem reativada'); } catch (err) { toast(String(err), 'error'); }
  }

  async function handleSetCover(url: string) {
    try { await api.galleries.update(galleryId, { coverImage: url }); load(); toast('Capa atualizada!'); } catch (err) { toast(String(err), 'error'); }
  }

  if (!gallery) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/galerias')}
          className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{gallery.title}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Adicionar Mídia</h2>
        <GalleryUpload onUpload={handleUploadComplete} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Escolher Capa</h2>
        <p className="text-sm text-gray-500 mb-4">Clique em uma imagem para defini-la como capa da galeria.</p>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma mídia disponível.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {items.filter((i) => i.isActive).map((item) => {
              const isCover = item.url === gallery.coverImage;
              return (
                <button key={item.id} onClick={() => handleSetCover(item.url)}
                  className={`relative shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-gray-100 border-2 transition-all hover:ring-2 hover:ring-primary-400 ${
                    isCover ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-transparent'
                  }`}>
                  {item.type === 'video' ? (
                    <>
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}
                  {isCover && (
                    <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        Capa
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const isCover = item.url === gallery.coverImage;
          return (
            <div key={item.id} className={`group relative aspect-square rounded-lg overflow-hidden bg-gray-100 ${!item.isActive ? 'opacity-40' : ''}`}>
              {isCover && (
                <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  Capa
                </div>
              )}
              {item.type === 'video' ? (
                <>
                  <video src={item.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <IconPlay />
                  </div>
                </>
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                {item.caption && <p className="text-white text-sm truncate">{item.caption}</p>}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-white/50 text-xs">{item.type === 'video' ? 'Vídeo' : 'Imagem'} {!item.isActive && '• Inativo'}</p>
                  <div className="flex gap-1">
                    {isAdmin && (
                      <>
                        {!isCover && (
                          <button title="Definir como capa" onClick={() => handleSetCover(item.url)}
                            className="p-1 bg-white/20 text-white rounded hover:bg-yellow-500 transition-colors">
                            <IconCover />
                          </button>
                        )}
                        <button title="Editar legenda" onClick={() => openEdit(item)}
                          className="p-1 bg-white/20 text-white rounded hover:bg-white/40 transition-colors">
                          <IconEdit />
                        </button>
                        {item.isActive ? (
                          <button title="Inativar" onClick={() => handleInactivate(item.id)}
                            className="p-1 bg-white/20 text-white rounded hover:bg-red-600 transition-colors">
                            <IconInactivate />
                          </button>
                        ) : (
                          <button title="Reativar" onClick={() => handleReactivate(item.id)}
                            className="p-1 bg-white/20 text-white rounded hover:bg-green-600 transition-colors">
                            <IconReactivate />
                          </button>
                        )}
                        <button title="Histórico" onClick={() => setHistoryTarget(item)}
                          className="p-1 bg-white/20 text-white rounded hover:bg-gray-600 transition-colors">
                          <IconHistory />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {items.length === 0 && <p className="text-center text-gray-400 py-8">Nenhuma mídia nesta galeria</p>}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
          <form onSubmit={handleEditSave} className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-lg">Editar Legenda</h2>
            <div>
              <label htmlFor="edit-caption" className="block text-sm font-medium text-gray-700 mb-1">Legenda</label>
              <input id="edit-caption" value={editCaption} onChange={(e) => setEditCaption(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={savingCaption} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                {savingCaption && <Spinner className="w-4 h-4" />}Salvar</button>
              <button type="button" onClick={() => setEditing(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {historyTarget && (
        <HistoryModal
          title={historyTarget.caption || `#${historyTarget.id}`}
          fetchHistory={() => api.galleries.getImageHistory(historyTarget.id)}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
