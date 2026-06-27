import { useState, useRef, useEffect } from 'react';
import { useToast } from './Toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const { toast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewSrc = localPreview || value;

  useEffect(() => {
    setLoadError(false);
  }, [previewSrc]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function uploadFile(file: File) {
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      toast('Apenas arquivos PNG, JPG e JPEG são permitidos', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('A imagem deve ter no máximo 5MB', 'error');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(objectUrl);
    setLoadError(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('files', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.status === 401) {
        toast('Sessão expirada. Faça login novamente.', 'error');
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Erro ao enviar (status ${res.status})` }));
        throw new Error(err.error || `Erro ao enviar (status ${res.status})`);
      }
      const data = await res.json();
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
      onChange(data[0]?.url ?? '');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao fazer upload', 'error');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRemove() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setLoadError(false);
    onChange('');
  }

  function handleImageError() {
    if (localPreview) return;
    setLoadError(true);
    toast('Não foi possível carregar a imagem. Faça upload novamente ou remova.', 'error');
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      {previewSrc ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-300 w-40 aspect-[3/4]">
          {loadError ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-3 text-center">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-500">Imagem indisponível</p>
            </div>
          ) : (
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <p className="text-white text-sm font-medium">Enviando...</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={handleRemove}
              className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700">
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          aria-label={label ? `Selecionar ${label.toLowerCase()}` : 'Selecionar imagem'}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          {uploading ? (
            <p className="text-sm text-gray-500">Enviando...</p>
          ) : (
            <div>
              <p className="text-sm text-gray-500">
                Arraste uma imagem aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG • até 5MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
