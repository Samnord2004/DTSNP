import React, { useState } from 'react';
import { Plot, WinterConnectionRequest } from '../../types/index.ts';
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
} from 'lucide-react';

interface PlotsDirectoryProps {
  plots: Plot[];
  winterRequests: WinterConnectionRequest[];
  onSelectPlotOnMap: (plot: Plot) => void;
  onStartWinterConnection: (plot: Plot) => void;
  onViewDocumentsForPlot: (plot: Plot) => void;
}

export const PlotsDirectory: React.FC<PlotsDirectoryProps> = ({
  plots,
  winterRequests,
  onSelectPlotOnMap,
  onStartWinterConnection,
  onViewDocumentsForPlot,
}) => {
  const [search, setSearch] = useState('');
  const [filterResidency, setFilterResidency] = useState<'all' | 'permanent' | 'occasional' | 'winter_connected'>('all');

  const filteredPlots = plots.filter((plot) => {
    const isConn = plot.utilities.winterWater.connected;
    if (filterResidency === 'permanent' && plot.residencyType !== 'permanent') return false;
    if (filterResidency === 'occasional' && plot.residencyType !== 'occasional') return false;
    if (filterResidency === 'winter_connected' && !isConn) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        plot.number.toString().includes(q) ||
        plot.ownerName.toLowerCase().includes(q) ||
        plot.street.toLowerCase().includes(q) ||
        plot.cadastralNumber.toLowerCase().includes(q)
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

        {/* Quick Search */}
        <div className="flex items-center gap-2 w-full sm:w-80 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Номер уч., ФИО собственника, улица..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
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
          💧 Зимний водопровод ({plots.filter((p) => p.utilities.winterWater.connected).length})
        </button>
      </div>

      {/* Grid of Plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlots.map((plot) => {
          const isWinter = plot.utilities.winterWater.connected;
          const isApplied = plot.utilities.winterWater.status === 'applied';
          const isTu = plot.utilities.winterWater.status === 'tu_issued';
          const hasReq = winterRequests.some((r) => r.plotNumber === plot.number);
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
                      <span>{plot.utilities.winterWater.meterSerial} ({plot.utilities.winterWater.sealNumber})</span>
                    </div>
                  )}
                </div>

                {/* Utilities badges */}
                <div className="flex items-center gap-2 text-[11px] pt-1">
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <Zap className="w-3.5 h-3.5" />
                    {plot.utilities.electricity.phases}ф / {plot.utilities.electricity.allocatedPowerKw}кВт
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className={`flex items-center gap-1 font-medium ${plot.utilities.gas.connected ? 'text-yellow-700' : 'text-slate-400'}`}>
                    <Flame className="w-3.5 h-3.5" />
                    {plot.utilities.gas.connected ? 'Газ подкл.' : 'Без газа'}
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
                  <span>Показать на карте</span>
                </button>

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
          );
        })}
      </div>
    </div>
  );
};
