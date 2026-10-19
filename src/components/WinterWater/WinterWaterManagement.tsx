import React, { useState } from 'react';
import { WinterConnectionRequest, Plot, Well, UserProfile } from '../../types/index.ts';
import {
  Droplet,
  FileText,
  PlusCircle,
  CheckCircle,
  Clock,
  MapPin,
  Printer,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

interface WinterWaterManagementProps {
  requests: WinterConnectionRequest[];
  plots: Plot[];
  wells: Well[];
  currentUser: UserProfile;
  onOpenWizard: () => void;
  onViewDocuments: (req: WinterConnectionRequest, plot: Plot, well: Well) => void;
  onViewOnMap: (plot: Plot, well: Well) => void;
  onApproveRequest: (requestId: string) => void;
}

export const WinterWaterManagement: React.FC<WinterWaterManagementProps> = ({
  requests,
  plots,
  wells,
  currentUser,
  onOpenWizard,
  onViewDocuments,
  onViewOnMap,
  onApproveRequest,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const totalConnected = plots.filter((p) => p.utilities.winterWater.connected).length;
  const totalFreePorts = wells.reduce((sum, w) => sum + (w.type === 'water_winter' ? w.freePorts : 0), 0);

  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.requestNumber.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.plotNumber.toString().includes(q) ||
        r.selectedWellCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and KPI strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <Droplet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Технологическое присоединение к зимнему водопроводу
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Помощь Правлению ДТСН «Пенсионер» в расчете трасс до свободных колодцев и оформлении полного пакета документов
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Новое технологическое присоединение</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-500 block text-[11px]">Действующих абонентов</span>
          <span className="text-2xl font-bold text-slate-900 font-mono">{totalConnected}</span>
          <span className="text-[10px] text-emerald-600 font-medium block">Круглогодичное водопотребление</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-500 block text-[11px]">Заявок в обработке</span>
          <span className="text-2xl font-bold text-amber-600 font-mono">
            {requests.filter((r) => r.status === 'under_review' || r.status === 'tu_issued').length}
          </span>
          <span className="text-[10px] text-slate-500 block">Согласование ТУ и договоров</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-500 block text-[11px]">Свободных точек врезки</span>
          <span className="text-2xl font-bold text-sky-700 font-mono">{totalFreePorts}</span>
          <span className="text-[10px] text-slate-500 block">В 10 колодцах ДТСН</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <span className="text-slate-500 block text-[11px]">Давление в магистрали</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono">4.1 атм</span>
          <span className="text-[10px] text-slate-500 block">Насосная станция ДТСН</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Все дела ({requests.length})
          </button>
          <button
            onClick={() => setFilterStatus('under_review')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'under_review' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            На рассмотрении
          </button>
          <button
            onClick={() => setFilterStatus('tu_issued')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterStatus === 'tu_issued' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ТУ выданы
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-72 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <Search className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по номеру дела, участку..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Table of Connection Cases */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">№ Заявки / Дата</th>
                <th className="py-3 px-4">Участок & Заявитель</th>
                <th className="py-3 px-4">Точка врезки (Колодец)</th>
                <th className="py-3 px-4">Параметры трассы</th>
                <th className="py-3 px-4">Статус ТУ & Правления</th>
                <th className="py-3 px-4 text-right">Пакет документов</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.map((req) => {
                const plot = plots.find((p) => p.number === req.plotNumber) || plots[0];
                const well = wells.find((w) => w.id === req.selectedWellId) || wells[0];

                return (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-sky-700 block">{req.requestNumber}</span>
                      <span className="text-[11px] text-slate-500">{req.appliedDate}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Участок № {req.plotNumber}</span>
                        <span className="text-slate-500 font-normal">({plot.street})</span>
                      </div>
                      <span className="text-[11px] text-slate-600 block">{req.ownerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{req.cadastralNumber}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-emerald-700 block">{req.selectedWellCode}</span>
                      <span className="text-[11px] text-slate-500">{well.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        Давление: {req.pressureAtWellAtm} атм
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px]">
                      <span className="text-slate-800 block">
                        Длина: <b>{req.pipeRouteLengthMeters} м</b> (глубина {req.trenchDepthMeters.toFixed(1)} м)
                      </span>
                      <span className="text-slate-500 block">
                        Труба: d{req.pipeDiameterMm}, кабель {req.heatingCableWattsPerMeter} Вт/м
                      </span>
                      <div className="flex gap-1.5 mt-0.5 text-[10px]">
                        {req.crossesRoad && <span className="text-amber-700 font-medium">Прокол дороги</span>}
                        {req.crossesPowerCable && <span className="text-slate-400">· Кабель 0.4кВ</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          req.status === 'tu_issued'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : req.status === 'contract_signed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.status === 'tu_issued' ? 'ТУ выданы' : req.status === 'contract_signed' ? 'Договор подписан' : 'На согласовании'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {req.approvedByChairman ? '✓ Одобрено Председателем' : 'Ожидает подписи'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => onViewOnMap(plot, well)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition-colors inline-block"
                        title="Показать трассу на карте"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onViewDocuments(req, plot, well)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Документы (ТУ & Договор)</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
