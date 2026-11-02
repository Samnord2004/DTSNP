import React, { useState, useRef, useEffect } from 'react';
import {
  SeasonMode,
  UserProfile,
  Plot,
  Well,
  Valve,
  Substation,
  Switchboard,
  FireHydrant,
  WorkTask,
  InspectionLogEntry,
} from '../types/index.ts';
import { UserProfileModal } from './Profile/UserProfileModal';
import { LocalRunModal } from './LocalRunModal';
import {
  Snowflake,
  Sun,
  Sprout,
  Leaf,
  Layers,
  FileText,
  Calendar,
  Home,
  User,
  Check,
  Search,
  Edit3,
  Droplet,
  Zap,
  Flame,
  ShieldCheck,
  MapPin,
  Wrench,
  X,
  ChevronRight,
  ChevronDown,
  Activity,
  ArrowRight,
  Sparkles,
  Monitor,
} from 'lucide-react';

const SEASONS: {
  id: SeasonMode;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  desc: string;
}[] = [
  { id: 'winter', name: 'Зима', icon: Snowflake, color: 'text-sky-600', bg: 'bg-sky-50 text-sky-800 border-sky-200', desc: 'Снегоотвалы, расчистка, МЧС, КТПН, фонари' },
  { id: 'spring', name: 'Весна', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', desc: 'Пропуск паводка, ливнёвка, расконсервация' },
  { id: 'summer', name: 'Лето', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 text-amber-800 border-amber-200', desc: 'Поливочный водопровод, ремонт дорог, покос' },
  { id: 'autumn', name: 'Осень', icon: Leaf, color: 'text-orange-600', bg: 'bg-orange-50 text-orange-800 border-orange-200', desc: 'Консервация водопровода, утепление узлов' },
];

interface NavbarProps {
  activeTab: 'map' | 'winter_water' | 'inspections' | 'schedule' | 'plots' | 'admin';
  season: SeasonMode;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  plots?: Plot[];
  wells?: Well[];
  valves?: Valve[];
  substations?: Substation[];
  switchboards?: Switchboard[];
  fireHydrants?: FireHydrant[];
  workTasks?: WorkTask[];
  inspectionLogs?: InspectionLogEntry[];
  onSelectTab: (tab: 'map' | 'winter_water' | 'inspections' | 'schedule' | 'plots' | 'admin') => void;
  onSelectSeason: (season: SeasonMode) => void;
  onSwitchUser: (userId: string) => void;
  onSelectPlot?: (plot: Plot) => void;
  onSelectNetworkItem?: (type: string, item: any) => void;
  onUpdateCurrentUser?: (user: UserProfile) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  season,
  currentUser,
  allUsers,
  plots = [],
  wells = [],
  valves = [],
  substations = [],
  switchboards = [],
  fireHydrants = [],
  workTasks = [],
  inspectionLogs = [],
  onSelectTab,
  onSelectSeason,
  onSwitchUser,
  onSelectPlot,
  onSelectNetworkItem,
  onUpdateCurrentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocalRunModalOpen, setIsLocalRunModalOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const seasonMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const safeCurrentUser: UserProfile = currentUser || (allUsers && allUsers.length > 0 ? allUsers[0] : null) || {
    id: 'u-1',
    name: 'Иванов Сергей Павлович',
    role: 'chairman',
    roleTitle: 'Председатель Правления',
    phone: '+7 (913) 900-11-22',
    email: 'chairman@dtsn-pensioner.ru',
    address: 'ДТСН уч. № 1',
    permissions: {
      canApproveTU: true,
      canSignContracts: true,
      canEditNetworks: true,
      canLogInspections: true,
      canEditEstimates: true,
      canManageUsers: true,
    },
  };

  const currentSeasonInfo = SEASONS.find((s) => s.id === season) || SEASONS[0];
  const SeasonIcon = currentSeasonInfo.icon;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
      if (seasonMenuRef.current && !seasonMenuRef.current.contains(target)) {
        setIsSeasonDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // SMART SEARCH RESULTS CALCULATION
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { plots: [], assets: [], tasks: [], inspections: [] };

    const queryNum = parseInt(q.replace(/\D/g, ''), 10);

    // 1. Plots matching
    const matchingPlots = (plots || [])
      .filter((p) => {
        if (!p) return false;
        if (!isNaN(queryNum) && p.number === queryNum) return true;
        if (p.number && p.number.toString().includes(q)) return true;
        if (p.ownerName && p.ownerName.toLowerCase().includes(q)) return true;
        if (p.phone && p.phone.includes(q)) return true;
        if (p.cadastralNumber && p.cadastralNumber.toLowerCase().includes(q)) return true;
        if (p.street && p.street.toLowerCase().includes(q)) return true;
        return false;
      })
      .slice(0, 4);

    // 2. Engineering Assets matching
    const matchingWells = (wells || [])
      .filter((w) => (w?.code || '').toLowerCase().includes(q) || (w?.name || '').toLowerCase().includes(q))
      .map((w) => ({
        type: 'well',
        data: w,
        title: `${w.name || 'Колодец'} (${w.code})`,
        subtitle: `Свободно врезок: ${w.freePorts ?? 0} из ${w.totalPorts ?? 0}`,
        details: `Глубина: ${w.depthMeters ?? 0} м · ${w.nominalPressureAtm ?? 0} атм`,
      }));
    const matchingValves = (valves || [])
      .filter((v) => (v?.code || '').toLowerCase().includes(q) || ((v?.description || '').toLowerCase().includes(q)))
      .map((v) => ({
        type: 'valve',
        data: v,
        title: `Задвижка ${v.code}`,
        subtitle: `Ду ${v.diameterMm || 0} мм · Состояние: ${v.state === 'open' ? 'Открыта' : 'Закрыта'}`,
        details: v.description || 'Запорная арматура водопровода',
      }));
    const matchingSubs = (substations || [])
      .filter((s) => (s?.code || '').toLowerCase().includes(q) || (s?.name || '').toLowerCase().includes(q))
      .map((s) => ({
        type: 'substation',
        data: s,
        title: `${s.name || 'КТПН'} (${s.code})`,
        subtitle: `Мощность: ${s.powerKva || 0} кВА · Напряжение: ${s.voltageKv || ''}`,
        details: `Загрузка: ${s.currentLoadPercent || 0}% · Земля: ${s.groundingResistanceOhm || 0} Ом`,
      }));
    const matchingSwitches = (switchboards || [])
      .filter((sb) => (sb?.code || '').toLowerCase().includes(q) || (sb?.name || '').toLowerCase().includes(q))
      .map((sb) => ({
        type: 'switchboard',
        data: sb,
        title: `${sb.name || 'ВРУ'} (${sb.code})`,
        subtitle: `Ввод ${sb.mainBreakerAmps || 0}А · Фидеров: ${sb.feederCount || 0}`,
        details: `Счетчик ${sb.meterModel || ''} (№ ${sb.meterSerial || ''})`,
      }));
    const matchingHydrants = (fireHydrants || [])
      .filter((fh) => (fh?.code || '').toLowerCase().includes(q))
      .map((fh) => ({
        type: 'fireHydrant',
        data: fh,
        title: `Пожарный гидрант ${fh.code}`,
        subtitle: `Давление: ${fh.staticPressureAtm || 0} атм · Расход: ${fh.flowRateLps || 0} л/с`,
        details: fh.winterInsulationDone ? '✅ Утепление на зиму выполнено' : '❌ Требует ревизии утепления',
      }));

    const matchingAssets = [
      ...matchingWells,
      ...matchingValves,
      ...matchingSubs,
      ...matchingSwitches,
      ...matchingHydrants,
    ].slice(0, 4);

    // 3. Work tasks matching
    const matchingTasks = (workTasks || [])
      .filter((t) => {
        if (!t) return false;
        if (t.title && t.title.toLowerCase().includes(q)) return true;
        if (t.description && t.description.toLowerCase().includes(q)) return true;
        if (t.assignee && t.assignee.toLowerCase().includes(q)) return true;
        if (t.season && t.season.toLowerCase().includes(q)) return true;
        if (q === 'зима' && t.season === 'winter') return true;
        if (q === 'лето' && t.season === 'summer') return true;
        if (q === 'весна' && t.season === 'spring') return true;
        if (q === 'осень' && t.season === 'autumn') return true;
        return false;
      })
      .slice(0, 3);

    // 4. Inspection logs matching
    const matchingInspections = (inspectionLogs || [])
      .filter((l) => {
        if (!l) return false;
        if (l.pointName && l.pointName.toLowerCase().includes(q)) return true;
        if (l.assetCode && l.assetCode.toLowerCase().includes(q)) return true;
        if (l.findings && l.findings.toLowerCase().includes(q)) return true;
        if (l.inspectorName && l.inspectorName.toLowerCase().includes(q)) return true;
        return false;
      })
      .slice(0, 3);

    return {
      plots: matchingPlots,
      assets: matchingAssets,
      tasks: matchingTasks,
      inspections: matchingInspections,
    };
  }, [searchQuery, plots, wells, valves, substations, switchboards, fireHydrants, workTasks, inspectionLogs]);

  const hasAnyResults =
    searchResults.plots.length > 0 ||
    searchResults.assets.length > 0 ||
    searchResults.tasks.length > 0 ||
    searchResults.inspections.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchResults.plots.length > 0) {
      onSelectTab('map');
      if (onSelectPlot) {
        onSelectPlot(searchResults.plots[0]);
      }
      setIsSearchFocused(false);
    } else if (searchResults.assets.length > 0) {
      onSelectTab('map');
      if (onSelectNetworkItem) {
        onSelectNetworkItem(searchResults.assets[0].type, searchResults.assets[0].data);
      }
      setIsSearchFocused(false);
    } else if (searchResults.tasks.length > 0) {
      onSelectTab('schedule');
      setIsSearchFocused(false);
    } else if (searchResults.inspections.length > 0) {
      onSelectTab('inspections');
      setIsSearchFocused(false);
    }
  };
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs overflow-x-clip">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-3">
        {/* Zone 1: Brand title, one line wordmark */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center font-bold text-white shadow-xs text-xs sm:text-sm shrink-0">
            ДП
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('map');
            }}
            className="text-sm sm:text-base font-bold tracking-tight text-slate-900 hover:text-sky-600 transition-colors whitespace-nowrap"
          >
            ДТСН «Пенсионер»
          </a>
        </div>

        {/* Zone 2: Modern compact navigation pills */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-semibold shrink-0">
          <button
            onClick={() => onSelectTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'map'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Карта</span>
          </button>

          <button
            onClick={() => onSelectTab('winter_water')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'winter_water'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Зимняя вода</span>
          </button>

          <button
            onClick={() => onSelectTab('inspections')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'inspections'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Осмотры</span>
          </button>

          <button
            onClick={() => onSelectTab('schedule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'schedule'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>График</span>
          </button>

          <button
            onClick={() => onSelectTab('plots')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'plots'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Участки</span>
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Админ</span>
          </button>
        </nav>

        {/* Quick Smart Search in Top Header */}
        <div ref={searchContainerRef} className="relative flex items-center shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder="Умный поиск (№, ФИО, кадастр, КТПН, колодец...)"
              className="w-28 sm:w-44 md:w-56 lg:w-48 xl:w-72 focus:w-80 pl-8 pr-7 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl transition-all font-medium text-slate-800 placeholder-slate-400 focus:outline-none shadow-2xs"
              title="Умный поиск по участкам, кадастровым номерам, ФИО, телефонам, колодцам, КТПН, задвижкам, задачам"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs font-bold p-0.5"
              >
                ✕
              </button>
            )}
          </form>

          {/* Smart Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute top-10 left-0 sm:left-auto sm:right-0 w-[320px] sm:w-[420px] max-h-[460px] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 divide-y divide-slate-100 text-left">
              {!hasAnyResults ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 mb-1">Ничего не найдено</p>
                  <p className="text-[11px]">По запросу «{searchQuery}» совпадений не обнаружено. Попробуйте номер участка, фамилию жителя или код объекта (например, «13», «Иванов», «КТПН-1», «В-1»).</p>
                </div>
              ) : (
                <>
                  {/* Plots Section */}
                  {searchResults.plots.length > 0 && (
                    <div className="py-2 first:pt-0">
                      <div className="px-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>🏡 Земельные участки ({searchResults.plots.length})</span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.plots.map((plot) => (
                          <button
                            key={plot.id}
                            type="button"
                            onClick={() => {
                              onSelectTab('map');
                              if (onSelectPlot) onSelectPlot(plot);
                              setIsSearchFocused(false);
                            }}
                            className="w-full text-left p-2 rounded-xl hover:bg-sky-50/80 transition-colors flex items-start gap-2.5 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                              {plot.number}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-slate-900 group-hover:text-sky-700">
                                  Участок №{plot.number}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {plot.street}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-700 truncate font-medium">
                                👤 {plot.ownerName}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px]">
                                {plot.cadastralNumber && (
                                  <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                    {plot.cadastralNumber}
                                  </span>
                                )}
                                {plot.phone && (
                                  <span className="text-slate-500">📞 {plot.phone}</span>
                                )}
                                {plot.utilities?.winterWater?.connected && (
                                  <span className="bg-sky-100 text-sky-700 font-semibold px-1 rounded">
                                    Зимняя вода
                                  </span>
                                )}
                                {plot.utilities?.gas?.connected && (
                                  <span className="bg-amber-100 text-amber-800 font-semibold px-1 rounded">
                                    Газ
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assets Section */}
                  {searchResults.assets.length > 0 && (
                    <div className="py-2">
                      <div className="px-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>⚙️ Инженерные объекты ({searchResults.assets.length})</span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.assets.map((item, idx) => (
                          <button
                            key={`${item.type}-${idx}`}
                            type="button"
                            onClick={() => {
                              onSelectTab('map');
                              if (onSelectNetworkItem) onSelectNetworkItem(item.type, item.data);
                              setIsSearchFocused(false);
                            }}
                            className="w-full text-left p-2 rounded-xl hover:bg-emerald-50/80 transition-colors flex items-start gap-2.5 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              {item.type === 'well' ? 'К' : item.type === 'substation' ? 'ТП' : item.type === 'valve' ? 'З' : item.type === 'hydrant' ? 'ПГ' : 'Щ'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {item.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 truncate">{item.subtitle}</p>
                              <p className="text-[10px] text-slate-400 truncate">{item.details}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks Section */}
                  {searchResults.tasks.length > 0 && (
                    <div className="py-2">
                      <div className="px-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>📋 Задачи & Регламенты ({searchResults.tasks.length})</span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.tasks.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => {
                              onSelectTab('schedule');
                              setIsSearchFocused(false);
                            }}
                            className="w-full text-left p-2 rounded-xl hover:bg-amber-50/80 transition-colors flex items-start gap-2 group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-xs text-slate-900 group-hover:text-amber-800 truncate">
                                  {task.title}
                                </span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {task.season}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-1">{task.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inspections Section */}
                  {searchResults.inspections.length > 0 && (
                    <div className="py-2">
                      <div className="px-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>🔍 Записи осмотров ({searchResults.inspections.length})</span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.inspections.map((insp) => (
                          <button
                            key={insp.id}
                            type="button"
                            onClick={() => {
                              onSelectTab('inspections');
                              setIsSearchFocused(false);
                            }}
                            className="w-full text-left p-2 rounded-xl hover:bg-purple-50/80 transition-colors flex items-start gap-2 group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-xs text-slate-900 group-hover:text-purple-800">
                                  {insp.pointName || insp.assetCode} — {insp.inspectorName}
                                </span>
                                <span className="text-[10px] text-slate-400">{insp.date}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-1">{insp.findings}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Zone 3: Compact Season Selector & Unified Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Local Run & Tunnel Shortcut */}
          <button
            type="button"
            onClick={() => setIsLocalRunModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
            title="Инструкция и запуск приложения на ПК (Windows / Mac) и через туннель"
          >
            <Monitor className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="hidden md:inline">ПК & Туннель</span>
          </button>

          {/* Season Mode Dropdown */}
          <div ref={seasonMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${currentSeasonInfo.bg}`}
              title="Переключить сезонный режим регламентов и сетей"
            >
              <SeasonIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{currentSeasonInfo.name}</span>
              <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
            </button>

            {isSeasonDropdownOpen && (
              <div className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-1.5 space-y-1 animate-fadeIn">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Сезонный регламент сетей
                </div>
                {SEASONS.map((s) => {
                  const Icon = s.icon;
                  const isCur = season === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        onSelectSeason(s.id);
                        setIsSeasonDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                        isCur
                          ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200 shadow-2xs'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isCur ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{s.name}</span>
                          {isCur && <span className="text-[10px] text-sky-600 font-bold">Активен</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{s.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Unified User Profile & Role Switcher Menu */}
          <div ref={userMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-1 sm:pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs cursor-pointer shadow-2xs group"
              title="Меню профиля и переключение роли"
            >
              {safeCurrentUser.avatarUrl ? (
                <img
                  src={safeCurrentUser.avatarUrl}
                  alt={safeCurrentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs shrink-0">
                  {safeCurrentUser.name ? safeCurrentUser.name.slice(0, 1) : 'U'}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="font-bold text-slate-800 text-xs truncate max-w-[100px]">
                  {(safeCurrentUser.name || '').split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[100px]">
                  {safeCurrentUser.roleTitle || safeCurrentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 space-y-2 animate-fadeIn text-left">
                <div className="px-2 py-1 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{safeCurrentUser.name}</p>
                  <p className="text-[11px] text-slate-600">{safeCurrentUser.roleTitle}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{safeCurrentUser.phone}</p>
                </div>

                <div>
                  <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Переключить роль:
                  </span>
                  <div className="space-y-0.5">
                    {(allUsers || []).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onSwitchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          u.id === safeCurrentUser.id
                            ? 'bg-sky-50 text-sky-700 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{u.roleTitle || u.name}</span>
                        {u.id === safeCurrentUser.id && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Редактировать профиль</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 border-t border-slate-100 overflow-x-auto text-xs bg-slate-50">
        <button
          onClick={() => onSelectTab('map')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'map' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Карта</span>
        </button>
        <button
          onClick={() => onSelectTab('winter_water')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'winter_water' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Droplet className="w-3.5 h-3.5" />
          <span>Зимняя вода</span>
        </button>
        <button
          onClick={() => onSelectTab('inspections')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'inspections' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Осмотры</span>
        </button>
        <button
          onClick={() => onSelectTab('schedule')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'schedule' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>График</span>
        </button>
        <button
          onClick={() => onSelectTab('plots')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'plots' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Участки</span>
        </button>
        <button
          onClick={() => onSelectTab('admin')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'admin' ? 'bg-sky-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Админ</span>
        </button>
      </div>

      {/* User Profile Modal for personal details, phone, address, photo */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={true}
          user={safeCurrentUser}
          isAdminEditing={false}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={(updated) => {
            if (onUpdateCurrentUser) {
              onUpdateCurrentUser(updated);
            }
            setIsProfileModalOpen(false);
          }}
        />
      )}

      {/* Local Run & Tunnel Instructions Modal */}
      <LocalRunModal
        isOpen={isLocalRunModalOpen}
        onClose={() => setIsLocalRunModalOpen(false)}
      />
    </header>
  );
};
