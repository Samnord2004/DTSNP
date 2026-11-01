import React, { useState, useRef } from 'react';
import { AssetPhoto } from '../../types/index.ts';
import { compressImage } from '../../utils/imageUtils';
import {
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageSquare,
  UploadCloud,
  Check,
} from 'lucide-react';

interface AssetPhotoGalleryProps {
  photos?: AssetPhoto[];
  onPhotosChange?: (photos: AssetPhoto[]) => void;
  readOnly?: boolean;
  title?: string;
  emptyMessage?: string;
  maxPhotos?: number;
}

export const AssetPhotoGallery: React.FC<AssetPhotoGalleryProps> = ({
  photos = [],
  onPhotosChange,
  readOnly = false,
  title = 'Фотографии объекта',
  emptyMessage = 'Реальные фотографии еще не прикреплены к паспорту объекта',
  maxPhotos = 20,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onPhotosChange) return;

    setIsUploading(true);
    try {
      const newPhotos: AssetPhoto[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await compressImage(file, 1400, 0.82);

        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: compressedBase64,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          uploadedAt: new Date().toISOString().split('T')[0],
        });
      }

      onPhotosChange([...photos, ...newPhotos]);
    } catch (err) {
      console.error('Failed to process uploaded photos:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onPhotosChange) return;
    const updated = photos.filter((p) => p.id !== id);
    onPhotosChange(updated);
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex(null);
    }
  };

  const handleSaveCaption = (id: string) => {
    if (!onPhotosChange) return;
    const updated = photos.map((p) =>
      p.id === id ? { ...p, caption: captionInput.trim() || undefined } : p
    );
    onPhotosChange(updated);
    setEditingCaptionId(null);
  };

  const openLightbox = (index: number) => {
    setActiveLightboxIndex(index);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const nextPhoto = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((activeLightboxIndex + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((activeLightboxIndex - 1 + photos.length) % photos.length);
  };

  const currentPhoto = activeLightboxIndex !== null ? photos[activeLightboxIndex] : null;

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Camera className="w-3.5 h-3.5 text-sky-600" />
          <span>{title}</span>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full">
            {photos.length}
          </span>
        </div>

        {!readOnly && onPhotosChange && photos.length < maxPhotos && (
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="asset-photo-upload"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-500 shadow-xs transition-colors cursor-pointer"
              title="Загрузить реальное фото объекта с устройства или камеры"
            >
              {isUploading ? (
                <>
                  <UploadCloud className="w-3.5 h-3.5 animate-bounce" />
                  <span>Сжатие фото...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>+ Загрузить фото</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Grid of Photos */}
      {photos.length === 0 ? (
        <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center">
          <ImageIcon className="w-6 h-6 mx-auto text-slate-400 mb-1" />
          <p className="text-xs text-slate-500">{emptyMessage}</p>
          {!readOnly && onPhotosChange && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-semibold text-sky-600 hover:text-sky-700 underline"
            >
              Загрузить фото с устройства / камеры
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={photo.url}
                alt={photo.caption || `Фото ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Hover Overlay with Actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded">
                    {photo.uploadedAt}
                  </span>
                  {!readOnly && onPhotosChange && (
                    <button
                      type="button"
                      onClick={(e) => handleDeletePhoto(photo.id, e)}
                      title="Удалить фотографию"
                      className="p-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-white font-medium truncate max-w-[85%]">
                    {photo.caption || 'Без описания'}
                  </p>
                  <Maximize2 className="w-3 h-3 text-white/80 shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {currentPhoto && activeLightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            title="Закрыть (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                title="Предыдущее фото"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                title="Следующее фото"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Modal Container */}
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <div className="relative overflow-hidden rounded-xl bg-black max-h-[75vh]">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption || 'Фото актива'}
                className="max-h-[75vh] max-w-full object-contain mx-auto"
              />
            </div>

            {/* Caption & Info bar */}
            <div className="w-full mt-3 bg-slate-900/80 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                {editingCaptionId === currentPhoto.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={captionInput}
                      onChange={(e) => setCaptionInput(e.target.value)}
                      placeholder="Подпись к фотографии (узел, номер, дефект...)"
                      className="flex-1 bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveCaption(currentPhoto.id)}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Сохранить</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCaptionId(null)}
                      className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold truncate text-slate-200">
                      {currentPhoto.caption || 'Без описания'}
                    </p>
                    {!readOnly && onPhotosChange && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCaptionId(currentPhoto.id);
                          setCaptionInput(currentPhoto.caption || '');
                        }}
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-0.5"
                      >
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>изменить подпись</span>
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>Дата съемки: {currentPhoto.uploadedAt}</span>
                  <span>•</span>
                  <span>
                    Фото {activeLightboxIndex + 1} из {photos.length}
                  </span>
                </div>
              </div>

              {!readOnly && onPhotosChange && (
                <button
                  type="button"
                  onClick={(e) => handleDeletePhoto(currentPhoto.id, e)}
                  className="px-2.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Удалить</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
