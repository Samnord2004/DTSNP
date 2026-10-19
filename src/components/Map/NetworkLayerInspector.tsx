import React, { useState } from 'react';
import {
  PipelineSegment,
  Well,
  Valve,
  Switchboard,
  Substation,
  FireHydrant,
  Coordinates,
  BarrierGate,
  AdministrationFacility,
} from '../../types/index.ts';
import {
  Wrench,
  CheckCircle,
  AlertTriangle,
  Edit3,
  Trash2,
  X,
  Gauge,
  Zap,
  Droplet,
  Flame,
  Shield,
  FileText,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Radio,
  Wifi,
  Sun,
  Lock,
  Unlock,
  Move,
  Phone,
} from 'lucide-react';

export interface NetworkLayerInspectorProps {
  selectedItem: {
    type: 'pipeline' | 'well' | 'valve' | 'switchboard' | 'substation' | 'fireHydrant' | 'lightPole' | 'gasRegulator' | 'wifiHotspot' | 'barrierGate' | 'adminFacility';
    data: any;
  } | null;
  isObjectsLocked?: boolean;
  isItemIndividuallyLocked?: boolean;
  onToggleLock?: () => void;
  onToggleItemLock?: (id: string) => void;
  onClose: () => void;
  onEdit: (type: string, data: any) => void;
  onDelete: (type: string, id: string) => void;
  onToggleValve?: (valveId: string) => void;
  onStartWinterConnection?: (well: Well) => void;
}

export const NetworkLayerInspector: React.FC<NetworkLayerInspectorProps> = ({
  selectedItem,
  isObjectsLocked = true,
  isItemIndividuallyLocked = false,
  onToggleLock,
  onToggleItemLock,
  onClose,
  onEdit,
  onDelete,
  onToggleValve,
  onStartWinterConnection,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!selectedItem) return null;

  const { type, data } = selectedItem;

  const getConditionBadge = (condition?: string) => {
    switch (condition) {
      case 'excellent':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Отличное состояние
          </span>
        );
      case 'normal':
      case 'good':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Нормальное / В строю
          </span>
        );
      case 'requires_maintenance':
      case 'fair':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Требует ТО / Ревизии
          </span>
        );
      case 'critical':
      case 'poor':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            Критическое / Авария
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            В эксплуатации
          </span>
        );
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'pipeline':
        if (data.subType === 'summer_tap') return 'Летний водоразборный вывод (стояк)';
        if (data.subType === 'winter') return 'Трасса зимнего водопровода';
        if (data.subType === 'summer') return 'Трасса летнего водопровода';
        if (data.subType === 'optic_fiber') return 'Линия ВОЛС (Оптоволокно)';
        if (data.subType === 'cctv') return 'Линия видеонаблюдения & СКУД';
        if (data.subType === 'medium_pressure') return 'Газопровод среднего давления';
        if (data.subType === 'low_pressure') return 'Газопровод низкого давления';
        return data.networkType === 'water_winter'
          ? 'Зимний водопровод'
          : data.networkType === 'water_summer'
          ? 'Летний водопровод'
          : data.networkType === 'electricity'
          ? 'Линия электропередач ВЛ-0.4кВ'
          : data.networkType === 'gas'
          ? 'Газопровод'
          : data.networkType === 'telecom'
          ? 'Слаботочная линия связи'
          : 'Трубопровод / Инженерная сеть';
      case 'well':
        return data.type === 'water_winter'
          ? 'Водопроводный колодец (Зимний)'
          : data.type === 'water_summer'
          ? 'Водопроводный колодец (Летний)'
          : 'Канализационный колодец';
      case 'valve':
        return data.networkType === 'gas'
          ? 'Газовый кран / Запорная арматура'
          : 'Задвижка / Запорная арматура';
      case 'switchboard':
        return 'Электрощитовая / ВРУ / ШР (Счётчик)';
      case 'substation':
        return 'Трансформаторная подстанция КТПН 10/0.4кВ';
      case 'fireHydrant':
        return 'Пожарный гидрант ПГ';
      case 'lightPole':
        return 'Опора освещения / Уличный фонарь';
      case 'gasRegulator':
        return 'Газорегуляторный пункт шкафной (ГРПШ)';
      case 'wifiHotspot':
        return 'Точка беспроводного доступа Wi-Fi';
      case 'barrierGate':
        return 'Шлагбаум автоматический';
      case 'adminFacility':
        return data.type === 'board_office'
          ? 'Здание Правления ДТСН'
          : data.type === 'security_post'
          ? 'Пост охраны и КПП'
          : 'Служебное сооружение';
      default:
        return 'Объект инженерной сети';
    }
  };

  return (
    <div className="absolute top-3 left-3 bottom-3 w-96 max-w-[92vw] z-30 bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-xs">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-mono font-bold text-xs">
              {data.code || 'СЕТЬ'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">{getTypeTitle()}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            {data.name || data.description || `${getTypeTitle()} ${data.code || ''}`}
          </h3>
          {data.locationDetails && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{data.locationDetails}</span>
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          title="Закрыть карточку"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Scrollable */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1">
        {/* Status Badge Strip */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Состояние объекта:</span>
          {getConditionBadge(data.condition || data.status)}
        </div>

        {/* Positioning & Lock Status */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {isItemIndividuallyLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-rose-800">Объект зафиксирован персонально</span>
                  </>
                ) : isObjectsLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-700">Закреплен (общий режим карты)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span className="text-emerald-800 font-bold">Push & Pull активен: можно двигать</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isItemIndividuallyLocked
                  ? 'Защита от случайного перемещения включена для этого элемента.'
                  : isObjectsLocked
                  ? 'Вся карта в режиме «Закреплено». Включите режим Push & Pull для перемещения.'
                  : 'Зажмите маркер мышкой или пальцем и перетащите на карте.'}
              </p>
            </div>

            {onToggleItemLock && data.id && (
              <button
                type="button"
                onClick={() => onToggleItemLock(data.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 flex items-center gap-1 shadow-xs ${
                  isItemIndividuallyLocked
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
                title={isItemIndividuallyLocked ? 'Снять персональное закрепление' : 'Закрепить данный объект от случайного сдвига'}
              >
                {isItemIndividuallyLocked ? (
                  <>
                    <Unlock className="w-3 h-3 text-rose-600" />
                    <span>Открепить</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-slate-600" />
                    <span>Закрепить</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
            {data.coordinates ? (
              <span className="font-mono text-slate-500">
                GPS: {Number(data.coordinates.lat).toFixed(6)}, {Number(data.coordinates.lng).toFixed(6)}
              </span>
            ) : (
              <span className="text-slate-400">Координаты не заданы</span>
            )}

            {onToggleLock && (
              <button
                type="button"
                onClick={onToggleLock}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
              >
                <span>{isObjectsLocked ? '🔓 Разрешить Drag&Drop на карте' : '🔒 Закрепить всю карту'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Technical Attributes Grid */}
        <div className="grid grid-cols-2 gap-2">
          {data.diameterMm && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Диаметр / Проход</span>
              <span className="font-mono font-bold text-slate-800 text-xs">Ду {data.diameterMm} мм</span>
            </div>
          )}

          {data.nominalPressureAtm && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Рабочее давление</span>
              <span className="font-mono font-bold text-sky-700 text-xs">{data.nominalPressureAtm} атм</span>
            </div>
          )}

          {data.pressureNominal && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Номинал давления</span>
              <span className="font-mono font-bold text-sky-700 text-xs">{data.pressureNominal}</span>
            </div>
          )}

          {data.depthMeters !== undefined && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Глубина заложения</span>
              <span className="font-mono text-slate-800 text-xs">{data.depthMeters} м</span>
            </div>
          )}

          {data.totalPorts !== undefined && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Штуцеры врезки</span>
              <span className="font-mono font-bold text-emerald-700 text-xs">
                {data.freePorts} свободно из {data.totalPorts}
              </span>
            </div>
          )}

          {data.installYear && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Год ввода</span>
              <span className="font-mono font-bold text-slate-700 text-xs">{data.installYear} г.</span>
            </div>
          )}

          {data.powerKva && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Мощность КТПН</span>
              <span className="font-mono font-bold text-amber-700 text-xs">{data.powerKva} кВА</span>
            </div>
          )}

          {data.currentLoadPercent !== undefined && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Текущая нагрузка</span>
              <span className="font-mono font-bold text-amber-900 text-xs">{data.currentLoadPercent}%</span>
            </div>
          )}

          {data.mainBreakerAmps && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Вводной автомат</span>
              <span className="font-mono font-bold text-indigo-700 text-xs">{data.mainBreakerAmps} А</span>
            </div>
          )}

          {data.lampType && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Тип светильника</span>
              <span className="font-mono font-bold text-amber-700 text-xs">{data.lampType}</span>
            </div>
          )}

          {data.inletPressureMpa && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Входное давление</span>
              <span className="font-mono font-bold text-yellow-800 text-xs">{data.inletPressureMpa} МПа</span>
            </div>
          )}

          {data.outletPressureKpa && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Выходное давление</span>
              <span className="font-mono font-bold text-yellow-800 text-xs">{data.outletPressureKpa} кПа</span>
            </div>
          )}
        </div>

        {/* Material & Specs */}
        {data.material && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[10px] font-medium">Марка материала и труб:</span>
            <p className="text-slate-800 font-semibold text-xs">{data.material}</p>
          </div>
        )}

        {/* Metering Instrumentation */}
        {(data.meterModel || data.meterSerial) && (
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              <span>Прибор коммерческого учета</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div>
                <span className="text-emerald-700/80 block text-[10px]">Модель:</span>
                <span className="font-mono font-bold text-slate-900">{data.meterModel || '—'}</span>
              </div>
              <div>
                <span className="text-emerald-700/80 block text-[10px]">Заводской №:</span>
                <span className="font-mono font-bold text-slate-900">{data.meterSerial || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Valve State Toggle */}
        {type === 'valve' && onToggleValve && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-700 block font-semibold">Текущее положение арматуры</span>
              <span className="font-bold text-slate-900 text-xs">
                {data.state === 'open' ? '🟢 ОТКРЫТО (Подача идет)' : '🔴 ЗАКРЫТО (Отсечено)'}
              </span>
            </div>
            <button
              onClick={() => onToggleValve(data.id)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
            >
              Переключить
            </button>
          </div>
        )}

        {/* Maintenance Tasks */}
        {data.maintenanceTasks && data.maintenanceTasks.length > 0 && (
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
            <h4 className="font-bold text-amber-900 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Регламентное ТО</span>
              </span>
              <span className="text-[10px] text-amber-700 font-mono">
                {data.maintenanceTasks.length} задач(и)
              </span>
            </h4>
            <div className="space-y-1.5">
              {data.maintenanceTasks.map((task: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 bg-white rounded-lg border border-amber-200 text-[11px] text-slate-800"
                >
                  <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{task}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barrier Gate Details */}
        {type === 'barrierGate' && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Телефон открытия:</span>
              <a
                href={`tel:${data.openByPhone}`}
                className="font-mono font-bold text-sky-700 hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>{data.openByPhone}</span>
              </a>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Тип привода:</span>
              <span className="font-semibold text-slate-800">
                {data.type === 'automatic_gsm' ? 'GSM-модуль (по звонку)' : 'RFID-метки'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Зимний подогрев редуктора:</span>
              <span className={`font-semibold ${data.winterHeatedDrive ? 'text-emerald-700' : 'text-slate-600'}`}>
                {data.winterHeatedDrive ? '❄️ Включен (до -40°C)' : 'Отсутствует'}
              </span>
            </div>
          </div>
        )}

        {/* Administration Facility Details */}
        {type === 'adminFacility' && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-xs">
              <span className="text-slate-500 block text-[10px] font-medium mb-0.5">Описание объекта:</span>
              <p className="text-slate-800 leading-snug">{data.description}</p>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">График работы:</span>
              <span className="font-semibold text-slate-800">{data.workingHours}</span>
            </div>
            <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-200/60">
              <span className={`flex items-center gap-1 ${data.hasCctv ? 'text-emerald-700' : 'text-slate-400'}`}>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Видеонаблюдение</span>
              </span>
              <span className={`flex items-center gap-1 ${data.hasBackupGenerator ? 'text-emerald-700' : 'text-slate-400'}`}>
                <Zap className="w-3.5 h-3.5" />
                <span>Генератор 15 кВт</span>
              </span>
            </div>
          </div>
        )}

        {/* Well specific winter connection trigger */}
        {type === 'well' && data.freePorts > 0 && onStartWinterConnection && (
          <button
            onClick={() => onStartWinterConnection(data)}
            className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Droplet className="w-4 h-4 text-sky-200" />
            <span>Подключить абонента к этому колодцу</span>
          </button>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
        {/* INLINE CONFIRMATION FOR DELETE - NO WINDOW.CONFIRM BLOCKS! */}
        {isConfirmingDelete ? (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Точно удалить {data.code || 'этот объект'} из инженерной сети?</span>
            </div>
            <p className="text-[10px] text-rose-700">
              Объект будет навсегда исключен из схемы ДТСН «Пенсионер».
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onDelete(type, data.id);
                  setIsConfirmingDelete(false);
                  onClose();
                }}
                className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-colors text-xs text-center"
              >
                Да, удалить безвозвратно
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors text-xs"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="px-3 py-2 text-rose-700 hover:bg-rose-100/80 active:bg-rose-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
              title="Удалить данный объект из сети"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(type, data)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              title="Редактировать паспорт объекта"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-400" />
              <span>Редактировать</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
