import React, { useState, useRef } from 'react';
import { UserProfile } from '../../types/index.ts';
import { compressImage } from '../../utils/imageUtils';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  Trash2,
  Check,
  X,
  Upload,
  Shield,
  Home,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
  onClose: () => void;
  isAdminEditing?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onSave,
  onClose,
  isAdminEditing = false,
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name);
  const [roleTitle, setRoleTitle] = useState(user.roleTitle);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState(user.address || '');
  const [plotNumber, setPlotNumber] = useState<number | ''>(
    user.plotNumber !== undefined ? user.plotNumber : ''
  );
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatarUrl);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  if (!isOpen) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    try {
      const compressed = await compressImage(file, 400, 0.85);
      setAvatarUrl(compressed);
    } catch (err) {
      console.error('Failed to compress avatar:', err);
    } finally {
      setIsProcessingPhoto(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: UserProfile = {
      ...user,
      name: name.trim(),
      roleTitle: roleTitle.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || undefined,
      plotNumber: plotNumber === '' ? undefined : Number(plotNumber),
      avatarUrl,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <User className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isAdminEditing ? 'Редактирование профиля пользователя' : 'Персональные данные профиля'}
              </h3>
              <p className="text-xs text-slate-300">
                ДТСН «Пенсионер» · {user.roleTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-sky-500 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-sky-400">
                  {name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
              )}

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  title="Удалить фото"
                  className="absolute -top-1 -right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <span className="font-semibold text-slate-800 block text-xs">
                Фотография профиля
              </span>
              <p className="text-[11px] text-slate-500">
                Загрузите портретное фото или аватар (JPG, PNG). Изображение будет оптимизировано.
              </p>
              <div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="user-avatar-upload"
                />
                <button
                  type="button"
                  disabled={isProcessingPhoto}
                  onClick={() => avatarInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-sky-600" />
                  <span>{isProcessingPhoto ? 'Обработка...' : 'Загрузить фото'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ФИО (Фамилия Имя Отчество):
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иванов Сергей Павлович"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-sky-500 transition-colors"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Role Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Должность / Статус в товариществе:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Председатель Правления / Комендант"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-sky-500 transition-colors"
              />
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Phone & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Контактный телефон:
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (913) 900-11-22"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Электронная почта (E-mail):
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@dtsn-pensioner.ru"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Address & Plot Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Фактический адрес проживания:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Новосибирский р-н, ДТСН «Пенсионер», ул. Береговая..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Участок в ДТСН:
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value ? parseInt(e.target.value, 10) : '')}
                  placeholder="№ уч."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <Home className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Сохранить изменения</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
