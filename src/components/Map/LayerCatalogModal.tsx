import React, { useState } from 'react';
import {
  PipelineSegment,
  Well,
  Valve,
  Switchboard,
  Substation,
  FireHydrant,
  BarrierGate,
  AdministrationFacility,
} from '../../types/index.ts';
import {
  Layers,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  X,
  Droplet,
  Zap,
  Flame,
  Radio,
  Shield,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Eye,
  MapPin,
  FileSpreadsheet,
  Building,
} from 'lucide-react';

export interface LayerCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?:
    | 'all'
    | 'water'
    | 'electricity'
    | 'gas'
    | 'telecom'
    | 'valves'
    | 'wells'
    | 'switchboards'
    | 'substations'
    | 'facilities';
  pipelines: PipelineSegment[];
  wells: Well[];
  valves: Valve[];
  switchboards: Switchboard[];
  substations: Substation[];
  fireHydrants: FireHydrant[];
  barrierGates?: BarrierGate[];
  adminFacilities?: AdministrationFacility[];
  onSelectItem: (type: string, data: any) => void;
  onAddNew: (type: string) => void;
  onEditItem: (type: string, data: any) => void;
  onDeleteItem: (type: string, id: string) => void;
}

export const LayerCatalogModal: React.FC<LayerCatalogModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'all',
  pipelines,
  wells,
  valves,
  switchboards,
  substations,
  fireHydrants,
  barrierGates = [],
  adminFacilities = [],
  onSelectItem,
  onAddNew,
  onEditItem,
  onDeleteItem,
}) => {
  if (!isOpen) return null;

  const [activeLayerTab, setActiveLayerTab] = useState<
    | 'all'
    | 'water'
    | 'electricity'
    | 'gas'
    | 'telecom'
    | 'valves'
    | 'wells'
    | 'switchboards'
    | 'substations'
    | 'facilities'
  >(initialTab);
  const [conditionFilter, setConditionFilter] = useState<'all' | 'maintenance' | 'critical' | 'normal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Collect unified items
  const allItems: Array<{
    id: string;
    code: string;
    name: string;
    type: string;
    layerName: string;
    specs: string;
    condition: string;
    schematic?: string;
    tasksCount: number;
    meterInfo?: string;
    raw: any;
  }> = [];

  // Pipelines
  pipelines.forEach((p) => {
    let layerName = 'Инженерная сеть';
    if (p.networkType === 'water_winter') {
      layerName = 'Водопровод зимний';
    } else if (p.networkType === 'water_summer') {
      layerName = p.subType === 'summer_tap' ? 'Летний вывод (стояк)' : 'Водопровод летний';
    } else if (p.networkType === 'electricity') {
      layerName = p.subType === 'lighting_cable' ? 'Освещение дежурное' : 'Электросети 0.4кВ';
    } else if (p.networkType === 'gas') {
      layerName = 'Газопровод';
    } else if (p.networkType === 'telecom') {
      layerName = 'Слаботочные сети (ВОЛС/CCTV)';
    } else if (p.networkType === 'stormwater') {
      layerName = 'Ливневая канализация';
    }

    allItems.push({
      id: p.id,
      code: p.code,
      name: p.description || `${layerName} ${p.code}`,
      type: 'pipeline',
      layerName,
      specs: `Ду ${p.diameterMm} мм · ${p.material} · Глубина ${p.depthMeters} м · ${p.pressureNominal || ''}`,
      condition: p.condition,
      schematic: p.deviceSchematic,
      tasksCount: p.maintenanceTasks?.length || 0,
      raw: p,
    });
  });

  // Wells
  wells.forEach((w) => {
    allItems.push({
      id: w.id,
      code: w.code,
      name: w.name,
      type: 'well',
      layerName: w.type === 'water_winter' ? 'Колодец зимний' : 'Колодец летний',
      specs: `Врезки: ${w.freePorts} свободных из ${w.totalPorts} · ${w.nominalPressureAtm} атм · глубина ${w.depthMeters} м`,
      condition: w.condition,
      schematic: w.deviceSchematic,
      tasksCount: w.maintenanceTasks?.length || 0,
      meterInfo: w.meterModel ? `${w.meterModel} (№ ${w.meterSerial || 'б/н'})` : undefined,
      raw: w,
    });
  });

  // Valves
  valves.forEach((v) => {
    allItems.push({
      id: v.id,
      code: v.code,
      name: v.description || `Задвижка ${v.code}`,
      type: 'valve',
      layerName: 'Запорная арматура',
      specs: `Ду ${v.diameterMm} мм · Положение: ${v.state === 'open' ? 'ОТКРЫТА' : 'ЗАКРЫТА'} · глубина ${v.depthMeters} м`,
      condition: v.condition || 'normal',
      schematic: v.deviceSchematic,
      tasksCount: v.maintenanceTasks?.length || 0,
      raw: v,
    });
  });

  // Switchboards
  switchboards.forEach((sb) => {
    allItems.push({
      id: sb.id,
      code: sb.code,
      name: sb.name,
      type: 'switchboard',
      layerName: 'Электрощитовая ВРУ/ШР',
      specs: `${sb.substationCode} · Ввод ${sb.mainBreakerAmps}А · ${sb.feederCount} фидеров`,
      condition: sb.condition,
      schematic: sb.deviceSchematic,
      tasksCount: sb.maintenanceTasks?.length || 0,
      meterInfo: sb.meterModel ? `${sb.meterModel} (№ ${sb.meterSerial})` : undefined,
      raw: sb,
    });
  });

  // Substations
  substations.forEach((sub) => {
    allItems.push({
      id: sub.id,
      code: sub.code,
      name: sub.name,
      type: 'substation',
      layerName: 'Подстанция КТПН',
      specs: `${sub.powerKva} кВА · Нагрузка ${sub.currentLoadPercent}% · ${sub.voltageKv}`,
      condition: sub.status === 'warning' ? 'requires_maintenance' : 'normal',
      schematic: sub.deviceSchematic,
      tasksCount: sub.maintenanceTasks?.length || 0,
      raw: sub,
    });
  });

  // Fire Hydrants
  fireHydrants.forEach((fh) => {
    allItems.push({
      id: fh.id,
      code: fh.code,
      name: `Пожарный гидрант ${fh.code}`,
      type: 'fireHydrant',
      layerName: 'Пожарный гидрант ПГ',
      specs: `Ду ${fh.diameterMm} мм · ${fh.staticPressureAtm} атм · ${fh.flowRateLps} л/с · ${fh.winterInsulationDone ? 'Утеплен' : 'Не утеплен'}`,
      condition: fh.status === 'requires_repair' ? 'critical' : 'normal',
      tasksCount: 0,
      raw: fh,
    });
  });

  // Barrier Gates (Шлагбаумы)
  barrierGates.forEach((bg) => {
    allItems.push({
      id: bg.id,
      code: bg.code,
      name: bg.name,
      type: 'barrierGate',
      layerName: 'Въездной шлагбаум',
      specs: `Открытие по тел: ${bg.openByPhone} · Привод: ${bg.type} · Подогрев: ${bg.winterHeatedDrive ? 'Есть' : 'Нет'}`,
      condition: bg.status === 'fault' ? 'critical' : 'normal',
      tasksCount: 0,
      raw: bg,
    });
  });

  // Administration Facilities (Дом правления и посты)
  adminFacilities.forEach((fac) => {
    allItems.push({
      id: fac.id,
      code: fac.code,
      name: fac.name,
      type: 'adminFacility',
      layerName: 'Инфраструктура / Правление',
      specs: `${fac.description} · График: ${fac.workingHours}`,
      condition: 'normal',
      tasksCount: 0,
      raw: fac,
    });
  });

  // Filter items
  const filteredItems = allItems.filter((item) => {
    // Layer filter
    if (activeLayerTab === 'water') {
      if (!item.layerName.includes('Водопровод') && item.type !== 'well' && !item.layerName.includes('Летний вывод')) return false;
    } else if (activeLayerTab === 'electricity') {
      if (!item.layerName.includes('Электро') && !item.layerName.includes('Освещение') && item.type !== 'switchboard' && item.type !== 'substation') return false;
    } else if (activeLayerTab === 'gas') {
      if (!item.layerName.includes('Газ')) return false;
    } else if (activeLayerTab === 'telecom') {
      if (!item.layerName.includes('Слаботоч')) return false;
    } else if (activeLayerTab === 'valves') {
      if (item.type !== 'valve') return false;
    } else if (activeLayerTab === 'wells') {
      if (item.type !== 'well') return false;
    } else if (activeLayerTab === 'switchboards') {
      if (item.type !== 'switchboard') return false;
    } else if (activeLayerTab === 'substations') {
      if (item.type !== 'substation') return false;
    } else if (activeLayerTab === 'facilities') {
      if (item.type !== 'barrierGate' && item.type !== 'adminFacility') return false;
    }

    // Condition filter
    if (conditionFilter === 'maintenance') {
      if (item.condition !== 'requires_maintenance' && item.condition !== 'fair') return false;
    } else if (conditionFilter === 'critical') {
      if (item.condition !== 'critical' && item.condition !== 'poor') return false;
    } else if (conditionFilter === 'normal') {
      if (item.condition !== 'normal' && item.condition !== 'excellent' && item.condition !== 'good') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.specs.toLowerCase().includes(q) ||
        (item.schematic && item.schematic.toLowerCase().includes(q))
      );
    }

    return true;
  });

  // Counts
  const totalCount = allItems.length;
  const maintenanceCount = allItems.filter(
    (i) => i.condition === 'requires_maintenance' || i.condition === 'fair'
  ).length;
  const criticalCount = allItems.filter(
    (i) => i.condition === 'critical' || i.condition === 'poor'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-700 border border-sky-200">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Каталог объектов и сетей ДТСН «Пенсионер»
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Послойный реестр трубопроводов, колодцев, узлов учёта, задвижек и щитовых (Всего: {totalCount})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddNew('pipeline')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить объект</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Stats Strip */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Layer tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveLayerTab('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeLayerTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Все слои ({allItems.length})
              </button>
              <button
                onClick={() => setActiveLayerTab('water')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeLayerTab === 'water' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💧 Водопровод & Выводы
              </button>
              <button
                onClick={() => setActiveLayerTab('wells')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeLayerTab === 'wells' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🚰 Колодцы ({wells.length})
              </button>
              <button
                onClick={() => setActiveLayerTab('valves')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeLayerTab === 'valves' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚙️ Задвижки ({valves.length})
              </button>
              <button
                onClick={() => setActiveLayerTab('electricity')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeLayerTab === 'electricity' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Электросети
              </button>
              <button
                onClick={() => setActiveLayerTab('switchboards')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeLayerTab === 'switchboards' ? 'bg-white text-indigo-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎛️ Щитовые ВРУ ({switchboards.length})
              </button>
              <button
                onClick={() => setActiveLayerTab('gas')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeLayerTab === 'gas' ? 'bg-white text-yellow-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔥 Газ & ГРПШ
              </button>
              <button
                onClick={() => setActiveLayerTab('telecom')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeLayerTab === 'telecom' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📡 Слаботочные сети
              </button>
              <button
                onClick={() => setActiveLayerTab('facilities')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeLayerTab === 'facilities' ? 'bg-white text-indigo-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏛️ Инфраструктура ({barrierGates.length + adminFacilities.length})
              </button>
            </div>

            {/* Condition Filters */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                onClick={() => setConditionFilter('all')}
                className={`px-2.5 py-1 rounded-lg border font-medium ${
                  conditionFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600'
                }`}
              >
                Все статусы
              </button>
              <button
                onClick={() => setConditionFilter('maintenance')}
                className={`px-2.5 py-1 rounded-lg border font-medium ${
                  conditionFilter === 'maintenance'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                ⚠️ Требуют ТО ({maintenanceCount})
              </button>
              {criticalCount > 0 && (
                <button
                  onClick={() => setConditionFilter('critical')}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    conditionFilter === 'critical'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  🔴 Критические ({criticalCount})
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по шифру (КВ-01, МВ-З-01, ШР-02), материалу, описанию, схеме узла..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="font-medium text-sm">Объектов не найдено</p>
              <p className="text-xs">Попробуйте изменить поисковый запрос или выбрать другой слой</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-xs">
                        {item.code}
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {item.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                        {item.layerName}
                      </span>

                      {/* Condition badge */}
                      {item.condition === 'excellent' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          🟢 Отличное
                        </span>
                      )}
                      {(item.condition === 'normal' || item.condition === 'good') && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-semibold">
                          🔵 Норма
                        </span>
                      )}
                      {(item.condition === 'requires_maintenance' || item.condition === 'fair') && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          ⚠️ Требует ТО
                        </span>
                      )}
                      {(item.condition === 'critical' || item.condition === 'poor') && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          🔴 Критическое
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {item.specs}
                    </p>

                    {item.meterInfo && (
                      <p className="text-[11px] text-emerald-700 font-mono">
                        📊 Прибор учета: <b>{item.meterInfo}</b>
                      </p>
                    )}

                    {item.schematic && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                        ⚙️ {item.schematic}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onSelectItem(item.type, item.raw)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition-colors text-xs"
                      title="Показать на карте"
                    >
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                      <span>На карте</span>
                    </button>

                    <button
                      onClick={() => onEditItem(item.type, item.raw)}
                      className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-semibold flex items-center gap-1 transition-colors text-xs border border-sky-200"
                      title="Редактировать паспорт объекта"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Правка</span>
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1 animate-fadeIn">
                        <span className="text-[10px] font-bold text-rose-800 px-1">Удалить?</span>
                        <button
                          onClick={() => {
                            onDeleteItem(item.type, item.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition-colors"
                        >
                          Да
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-1 bg-white hover:bg-slate-100 text-slate-600 rounded text-[10px] font-semibold border border-slate-200 transition-colors"
                        >
                          Нет
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Удалить объект из сети"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
