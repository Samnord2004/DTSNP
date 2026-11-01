import React, { useState } from 'react';
import { Plot, WinterConnectionRequest, ResidencyType } from '../../types/index.ts';
import {
  Home,
  Droplet,
  Zap,
  Flame,
  Search,
  MapPin,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  UserCheck,
  Edit3,
  X,
  Save,
  Shield,
  Gauge,
  Plus,
  Trash2,
} from 'lucide-react';

interface PlotsDirectoryProps {
  plots: Plot[];
  winterRequests: WinterConnectionRequest[];
  canEdit?: boolean;
  onSelectPlotOnMap: (plot: Plot) => void;
  onStartWinterConnection: (plot: Plot) => void;
  onViewDocumentsForPlot: (plot: Plot) => void;
  onUpdatePlot?: (plot: Plot) => void;
  onAddPlot?: (plot: Plot) => void;
  onDeletePlot?: (id: string) => void;
}

export const PlotsDirectory: React.FC<PlotsDirectoryProps> = ({
  plots,
  winterRequests,
  canEdit = true,
  onSelectPlotOnMap,
  onStartWinterConnection,
  onViewDocumentsForPlot,
  onUpdatePlot,
  onAddPlot,
  onDeletePlot,
}) => {
  const [search, setSearch] = useState('');
  const [filterResidency, setFilterResidency] = useState<'all' | 'permanent' | 'occasional' | 'winter_connected'>('all');
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [isAddingPlot, setIsAddingPlot] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredPlots = (plots || []).filter((plot) => {
    if (!plot) return false;
    const isConn = Boolean(plot.utilities?.winterWater?.connected);
    if (filterResidency === 'permanent' && plot.residencyType !== 'permanent') return false;
    if (filterResidency === 'occasional' && plot.residencyType !== 'occasional') return false;
    if (filterResidency === 'winter_connected' && !isConn) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        plot.number?.toString().includes(q) ||
        (plot.ownerName || '').toLowerCase().includes(q) ||
        (plot.street || '').toLowerCase().includes(q) ||
        (plot.cadastralNumber || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <Home className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Реестр земельных участков и жителей ДТСН</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Постоянное проживание (очистка в 1-ю очередь), периодические приезды, матрица инженерных сетей и договоры
          </p>
        </div>

        {/* Quick Search & Add Plot Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-72 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <Search className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Номер уч., ФИО, улица..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {canEdit && (
            <button
              onClick={() => setIsAddingPlot(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить участок</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit text-xs">
        <button
          onClick={() => setFilterResidency('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            filterResidency === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Все участки ({plots.length})
        </button>

        <button
          onClick={() => setFilterResidency('permanent')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            filterResidency === 'permanent' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏠 Постоянно проживающие ({plots.filter((p) => p.residencyType === 'permanent').length})
        </button>

        <button
          onClick={() => setFilterResidency('occasional')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            filterResidency === 'occasional' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏡 Периодически приезжающие ({plots.filter((p) => p.residencyType === 'occasional').length})
        </button>

        <button
          onClick={() => setFilterResidency('winter_connected')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            filterResidency === 'winter_connected' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          💧 Зимний водопровод ({(plots || []).filter((p) => p?.utilities?.winterWater?.connected).length})
        </button>
      </div>

      {/* Grid of Plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlots.map((plot) => {
          const isWinter = Boolean(plot.utilities?.winterWater?.connected);
          const isApplied = plot.utilities?.winterWater?.status === 'applied';
          const isTu = plot.utilities?.winterWater?.status === 'tu_issued';
          const hasReq = (winterRequests || []).some((r) => r.plotNumber === plot.number);
          const isPermanent = plot.residencyType === 'permanent';

          return (
            <div
              key={plot.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center font-bold text-sm font-mono">
                      {plot.number}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{plot.street}</h4>
                      <p className="text-[11px] text-slate-500">{plot.areaSqm} кв.м · {plot.cadastralNumber}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      isPermanent
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPermanent ? 'ПОСТОЯННЫЙ' : 'ВИЗИТЫ'}
                  </span>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Собственник:</span>
                    <span className="font-semibold text-slate-900">{plot.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Телефон:</span>
                    <span className="text-slate-700">{plot.phone}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Очистка снега:</span>
                    <span className="font-medium text-slate-800">
                      {plot.winterClearingPriority === 1 ? '1-я очередь (въезд)' : '2-я очередь (по звонку)'}
                    </span>
                  </div>
                  {isWinter && (
                    <div className="flex justify-between text-emerald-700 font-mono text-[11px] pt-0.5 border-t border-slate-200/60">
                      <span>Счетчик / Пломба:</span>
                      <span>{plot.utilities?.winterWater?.meterSerial || '—'} ({plot.utilities?.winterWater?.sealNumber || '—'})</span>
                    </div>
                  )}
                </div>

                {/* Utilities badges */}
                <div className="flex items-center gap-2 text-[11px] pt-1">
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <Zap className="w-3.5 h-3.5" />
                    {plot.utilities?.electricity?.phases ?? 1}ф / {plot.utilities?.electricity?.allocatedPowerKw ?? 15}кВт
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className={`flex items-center gap-1 font-medium ${plot.utilities?.gas?.connected ? 'text-yellow-700' : 'text-slate-400'}`}>
                    <Flame className="w-3.5 h-3.5" />
                    {plot.utilities?.gas?.connected ? 'Газ подкл.' : 'Без газа'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className={`font-semibold ${isWinter ? 'text-sky-700' : 'text-slate-400'}`}>
                    {isWinter ? 'Зимняя вода' : 'Без зимней воды'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectPlotOnMap(plot)}
                  className="flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 font-medium"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>На карте</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {canEdit && (
                    <>
                      <button
                        onClick={() => setEditingPlot(plot)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-semibold border border-amber-200 transition-colors cursor-pointer"
                        title="Редактировать данные участка, собственника и сетей"
                      >
                        <Edit3 className="w-3 h-3 text-amber-600" />
                        <span>Правка</span>
                      </button>

                      {onDeletePlot && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Вы действительно хотите удалить участок № ${plot.number} (${plot.ownerName})?`)) {
                              onDeletePlot(plot.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Удалить участок"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}

                  {!isWinter ? (
                    <button
                      onClick={() => onStartWinterConnection(plot)}
                      className="flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-xs"
                    >
                      <Droplet className="w-3 h-3 text-sky-200" />
                      <span>Подключить</span>
                    </button>
                  ) : (
                    hasReq && (
                      <button
                        onClick={() => onViewDocumentsForPlot(plot)}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200 transition-colors"
                      >
                        <FileText className="w-3 h-3 text-emerald-600" />
                        <span>Пакет ТУ</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PLOT & OWNER EDITOR MODAL (Для создания или редактирования участка) */}
      {(editingPlot || isAddingPlot) && (
        <PlotEditorModal
          mode={isAddingPlot ? 'create' : 'edit'}
          plot={editingPlot}
          existingPlots={plots}
          onClose={() => {
            setEditingPlot(null);
            setIsAddingPlot(false);
          }}
          onSave={(saved) => {
            if (isAddingPlot && onAddPlot) {
              onAddPlot(saved);
            } else if (onUpdatePlot) {
              onUpdatePlot(saved);
            }
            setEditingPlot(null);
            setIsAddingPlot(false);
          }}
        />
      )}
    </div>
  );
};

export interface PlotEditorModalProps {
  plot?: Plot | null;
  mode?: 'create' | 'edit';
  existingPlots?: Plot[];
  onClose: () => void;
  onSave: (savedPlot: Plot) => void;
}

export const PlotEditorModal: React.FC<PlotEditorModalProps> = ({
  plot,
  mode = 'edit',
  existingPlots = [],
  onClose,
  onSave,
}) => {
  const isCreate = mode === 'create' || !plot;
  const suggestedNumber = (existingPlots.length > 0 ? Math.max(...existingPlots.map((p) => p.number || 0)) : 24) + 1;

  const [plotNumber, setPlotNumber] = useState<number>(plot?.number || suggestedNumber);
  const [ownerName, setOwnerName] = useState(plot?.ownerName || '');
  const [phone, setPhone] = useState(plot?.phone || '+7 (913) 000-00-00');
  const [street, setStreet] = useState(plot?.street || 'ул. Центральная');
  const [cadastralNumber, setCadastralNumber] = useState(
    plot?.cadastralNumber || `54:19:112001:${100 + suggestedNumber}`
  );
  const [areaSqm, setAreaSqm] = useState(plot?.areaSqm || 1000);
  const [residencyType, setResidencyType] = useState<ResidencyType>(
    plot?.residencyType || 'permanent'
  );
  const [winterClearingPriority, setWinterClearingPriority] = useState<1 | 2 | 3>(
    plot?.winterClearingPriority || 1
  );

  // Winter Water
  const [winterConnected, setWinterConnected] = useState(Boolean(plot?.utilities?.winterWater?.connected));
  const [winterStatus, setWinterStatus] = useState(plot?.utilities?.winterWater?.status || 'none');
  const [meterSerial, setMeterSerial] = useState(plot?.utilities?.winterWater?.meterSerial || '');
  const [sealNumber, setSealNumber] = useState(plot?.utilities?.winterWater?.sealNumber || '');
  const [meterLastReading, setMeterLastReading] = useState(plot?.utilities?.winterWater?.meterLastReading || 0);
  const [contractNumber, setContractNumber] = useState(plot?.utilities?.winterWater?.contractNumber || '');
  const [tuNumber, setTuNumber] = useState(plot?.utilities?.winterWater?.tuNumber || '');

  // Electricity
  const [elecPhases, setElecPhases] = useState<1 | 3>((plot?.utilities?.electricity?.phases === 3 ? 3 : 1) as 1 | 3);
  const [elecPowerKw, setElecPowerKw] = useState(plot?.utilities?.electricity?.allocatedPowerKw ?? 15);
  const [elecMeter, setElecMeter] = useState(plot?.utilities?.electricity?.meterSerial || '');

  // Gas
  const [gasConnected, setGasConnected] = useState(Boolean(plot?.utilities?.gas?.connected));
  const [gasStatus, setGasStatus] = useState(plot?.utilities?.gas?.status || 'none');

  // Summer Water
  const [summerWater, setSummerWater] = useState(plot?.utilities?.summerWater ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseLat = 55.098800 + ((plotNumber % 6) - 3) * 0.00035;
    const baseLng = 82.900500 + (Math.floor(plotNumber / 6) - 2) * 0.00055;
    const coords = plot?.coordinates || { lat: Number(baseLat.toFixed(6)), lng: Number(baseLng.toFixed(6)) };
    const polygon = plot?.polygon || [
      { lat: Number((baseLat - 0.00018).toFixed(6)), lng: Number((baseLng - 0.00028).toFixed(6)) },
      { lat: Number((baseLat + 0.00018).toFixed(6)), lng: Number((baseLng - 0.00028).toFixed(6)) },
      { lat: Number((baseLat + 0.00018).toFixed(6)), lng: Number((baseLng + 0.00028).toFixed(6)) },
      { lat: Number((baseLat - 0.00018).toFixed(6)), lng: Number((baseLng + 0.00028).toFixed(6)) },
    ];

    const savedPlot: Plot = {
      id: plot?.id || `plot-${plotNumber}-${Date.now()}`,
      number: plotNumber,
      cadastralNumber: cadastralNumber.trim() || `54:19:112001:${100 + plotNumber}`,
      ownerName: ownerName.trim() || `Собственник уч. ${plotNumber}`,
      phone: phone.trim() || '+7 (913) 000-00-00',
      street: street.trim() || 'ул. Центральная',
      areaSqm: Number(areaSqm) || 1000,
      residencyType,
      winterClearingPriority,
      coordinates: coords,
      polygon,
      utilities: {
        summerWater,
        winterWater: {
          connected: winterConnected,
          status: winterStatus as any,
          wellId: plot?.utilities?.winterWater?.wellId,
          tuNumber: tuNumber.trim() || undefined,
          contractNumber: contractNumber.trim() || undefined,
          meterSerial: meterSerial.trim() || undefined,
          sealNumber: sealNumber.trim() || undefined,
          meterLastReading: Number(meterLastReading) || undefined,
        },
        electricity: {
          connected: true,
          phases: elecPhases,
          allocatedPowerKw: Number(elecPowerKw),
          substationId: plot?.utilities?.electricity?.substationId || 'sub-1',
          meterSerial: elecMeter.trim() || (plot?.utilities?.electricity?.meterSerial || `Э-${plotNumber}`),
        },
        gas: {
          connected: gasConnected,
          status: gasStatus as any,
        },
      },
    };

    onSave(savedPlot);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400 text-sky-300 flex items-center justify-center font-bold text-base font-mono">
              №{plotNumber}
            </span>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {isCreate ? 'Добавление нового земельного участка' : `Редактирование паспорта участка № ${plotNumber}`}
              </h3>
              <p className="text-xs text-slate-300 font-mono">Кадастр: {cadastralNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Owner and Plot Basic Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <span>Данные собственника и участка</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isCreate && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Номер участка (№):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={plotNumber}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      setPlotNumber(num);
                      if (!plot) {
                        setCadastralNumber(`54:19:112001:${100 + num}`);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ФИО собственника:</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Телефон:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Улица / Линия:</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Кадастровый номер (НСПД):</label>
                <input
                  type="text"
                  required
                  value={cadastralNumber}
                  onChange={(e) => setCadastralNumber(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Площадь (м²):</label>
                <input
                  type="number"
                  required
                  min={100}
                  max={5000}
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Режим проживания:</label>
                <select
                  value={residencyType}
                  onChange={(e) => setResidencyType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="permanent">🏠 Постоянное проживание</option>
                  <option value="occasional">🏡 Периодические приезды (визиты)</option>
                  <option value="summer_only">☀️ Только летний сезон</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Очередь расчистки снега трактором:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 1, label: '1-я очередь (Въезд)', desc: 'Постоянно проживают' },
                    { val: 2, label: '2-я очередь', desc: 'Периодические заезды' },
                    { val: 3, label: '3-я очередь', desc: 'Плановая расчистка' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setWinterClearingPriority(item.val as any)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        winterClearingPriority === item.val
                          ? 'bg-sky-50 border-sky-500 text-sky-950 font-bold ring-2 ring-sky-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs">{item.label}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Winter Water Utilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-sky-600" />
              <span>Зимний водопровод & Приборы учета</span>
            </h4>

            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-sky-950 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={winterConnected}
                    onChange={(e) => {
                      setWinterConnected(e.target.checked);
                      if (e.target.checked) setWinterStatus('connected');
                    }}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <span>Зимний водопровод подключен</span>
                </label>

                <select
                  value={winterStatus}
                  onChange={(e) => setWinterStatus(e.target.value as any)}
                  className="p-1.5 bg-white border border-sky-300 rounded-lg text-xs font-semibold text-sky-900"
                >
                  <option value="connected">🟢 Подключен (действует)</option>
                  <option value="tu_issued">🔵 ТУ выданы (монтаж)</option>
                  <option value="applied">🟡 Заявка на рассмотрении</option>
                  <option value="none">⚪ Не подключен</option>
                </select>
              </div>

              {winterConnected && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Счетчик воды:</label>
                    <input
                      type="text"
                      placeholder="Бетар СХВ-15 № 12345"
                      value={meterSerial}
                      onChange={(e) => setMeterSerial(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Номер пломбы:</label>
                    <input
                      type="text"
                      placeholder="РТ-882104"
                      value={sealNumber}
                      onChange={(e) => setSealNumber(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Показания (м³):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={meterLastReading}
                      onChange={(e) => setMeterLastReading(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Номер договора:</label>
                    <input
                      type="text"
                      placeholder={`ДЗВ-${plot?.number || plotNumber}/24`}
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Номер ТУ:</label>
                    <input
                      type="text"
                      placeholder={`ТУ-В-2024/${plot?.number || plotNumber}`}
                      value={tuNumber}
                      onChange={(e) => setTuNumber(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={summerWater}
                        onChange={(e) => setSummerWater(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Летний поливочный</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Electricity & Gas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Электроснабжение и Газификация</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Electricity */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-amber-950 block">⚡ Электроснабжение:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Фазы:</label>
                    <select
                      value={elecPhases}
                      onChange={(e) => setElecPhases(Number(e.target.value) as 1 | 3)}
                      className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold"
                    >
                      <option value={1}>1 фаза (220В)</option>
                      <option value={3}>3 фазы (380В)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Мощность (кВт):</label>
                    <input
                      type="number"
                      value={elecPowerKw}
                      onChange={(e) => setElecPowerKw(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Счетчик электроэнергии:</label>
                  <input
                    type="text"
                    placeholder="Меркурий 230 № 12345"
                    value={elecMeter}
                    onChange={(e) => setElecMeter(e.target.value)}
                    className="w-full p-1.5 bg-white border border-amber-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Gas */}
              <div className="p-3 bg-yellow-50/60 rounded-xl border border-yellow-200 space-y-2">
                <span className="text-xs font-bold text-yellow-950 block">🔥 Газоснабжение:</span>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={gasConnected}
                    onChange={(e) => {
                      setGasConnected(e.target.checked);
                      if (e.target.checked) setGasStatus('connected');
                    }}
                    className="w-4 h-4 text-yellow-600 rounded"
                  />
                  <span>Газопровод подключен</span>
                </label>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Статус газификации:</label>
                  <select
                    value={gasStatus}
                    onChange={(e) => setGasStatus(e.target.value as any)}
                    className="w-full p-1.5 bg-white border border-yellow-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="connected">🟢 Подключен</option>
                    <option value="planned">🟡 Планируется / ТУ</option>
                    <option value="none">⚪ Не подключен</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить изменения</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
