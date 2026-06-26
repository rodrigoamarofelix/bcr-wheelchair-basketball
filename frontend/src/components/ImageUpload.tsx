import { useState, useRef } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      toast('Apenas arquivos PNG, JPG e JPEG são permitidos', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('A imagem deve ter no máximo 5MB', 'error');
      return;
    }
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao enviar' }));
        throw new Error(err.error || 'Erro ao enviar');
      }
      const data = await res.json();
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
    onChange('');
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-300 w-40 aspect-[3/4]">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
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
