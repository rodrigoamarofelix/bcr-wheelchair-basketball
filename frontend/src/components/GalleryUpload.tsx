import { useState, useRef } from 'react';
import { useToast } from './Toast';

interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface Props {
  onUpload: (results: { url: string; type: string }[]) => void;
}

export default function GalleryUpload({ onUpload }: Props) {
  const { toast } = useToast();
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(selected: FileList) {
    const newFiles: FilePreview[] = [];
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      if (file.type.startsWith('image/')) {
        newFiles.push({ file, preview: URL.createObjectURL(file), type: 'image' });
      } else if (file.type.startsWith('video/')) {
        newFiles.push({ file, preview: URL.createObjectURL(file), type: 'video' });
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f.file));
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
      const results = await res.json();
      onUpload(results);
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao fazer upload', 'error');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <p className="text-sm text-gray-500">Arraste arquivos aqui ou clique para selecionar</p>
        <p className="text-xs text-gray-400 mt-1">Imagens (PNG, JPG) e Vídeos (MP4, WebM, MOV) • até 50MB cada</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg,.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-4">
            {files.map((f, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                {f.type === 'image' ? (
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={f.preview} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                {f.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                )}
                <button type="button" onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleUpload} disabled={uploading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {uploading ? 'Enviando...' : `Enviar ${files.length} arquivo${files.length > 1 ? 's' : ''}`}
            </button>
            <button type="button" onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
