import React, { useState } from 'react';
import { InspectionCheckPoint, InspectionLogEntry, UserProfile } from '../../types/index.ts';
import { SOCIETY_INFO } from '../../data/mockData';
import {
  ShieldCheck,
  PlusCircle,
  FileText,
  Printer,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Search,
  Filter,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';

interface InspectionLogViewProps {
  checkPoints: InspectionCheckPoint[];
  logs: InspectionLogEntry[];
  currentUser: UserProfile;
  onAddLog: (newEntry: InspectionLogEntry) => void;
  onResolveLog: (id: string) => void;
}

export const InspectionLogView: React.FC<InspectionLogViewProps> = ({
  checkPoints,
  logs,
  currentUser,
  onAddLog,
  onResolveLog,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unresolved' | 'defects'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [showSummaryAct, setShowSummaryAct] = useState(false);

  // New Log Form State
  const [selectedPointId, setSelectedPointId] = useState(checkPoints[0]?.id || '');
  const [logStatus, setLogStatus] = useState<'ok' | 'minor_issue' | 'defect' | 'emergency'>('ok');
  const [findings, setFindings] = useState('');
  const [measuresRequired, setMeasuresRequired] = useState('');
  const [deadline, setDeadline] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (selectedFilter === 'unresolved' && log.resolved) return false;
    if (selectedFilter === 'defects' && (log.status === 'ok' || log.status === 'minor_issue')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.pointName.toLowerCase().includes(q) ||
        log.assetCode.toLowerCase().includes(q) ||
        log.findings.toLowerCase().includes(q) ||
        log.inspectorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    const point = checkPoints.find((p) => p.id === selectedPointId) || checkPoints[0];
    const newLog: InspectionLogEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      inspectorName: currentUser.name,
      inspectorRole: currentUser.roleTitle,
      pointId: point.id,
      pointName: point.name,
      assetCode: point.targetAssetCode,
      status: logStatus,
      findings: findings || 'Плановый осмотр завершен. Замечаний не выявлено.',
      measuresRequired: measuresRequired || (logStatus === 'ok' ? 'Не требуется.' : 'Требуется устранение.'),
      deadline: deadline || undefined,
      resolved: logStatus === 'ok',
    };

    onAddLog(newLog);
    setIsAddingLog(false);
    setFindings('');
    setMeasuresRequired('');
    setDeadline('');
  };

  const selectedPointObj = checkPoints.find((p) => p.id === selectedPointId);

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Журнал периодических осмотров и маршруты обхода</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Контроль состояния 10 узловых точек территории (КТПН, колодцы, пожарные гидранты, ГРПШ, ливнёвка, снегоотвалы)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSummaryAct(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Сформировать сводный акт техосмотра</span>
          </button>

          {currentUser.permissions.canLogInspections && (
            <button
              onClick={() => setIsAddingLog(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Зафиксировать осмотр</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Points Overview Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
          <span>Маршрут патрулирования (10 контрольных точек)</span>
          <span className="text-[11px] text-purple-600 font-mono">Периодичность: ежедневно / еженедельно</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {checkPoints.map((cp) => (
            <div
              key={cp.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-purple-700 font-bold">КП № {cp.order}</span>
                <span className="text-[10px] text-slate-400">{cp.frequency}</span>
              </div>
              <p className="font-semibold text-slate-900 truncate text-[11px]">{cp.targetAssetCode}</p>
              <p className="text-[10px] text-slate-500 truncate">{cp.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Все записи ({logs.length})
          </button>
          <button
            onClick={() => setSelectedFilter('unresolved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedFilter === 'unresolved' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Требуют устранения ({logs.filter((l) => !l.resolved).length})
          </button>
          <button
            onClick={() => setSelectedFilter('defects')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedFilter === 'defects' ? 'bg-white text-rose-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Дефекты & Аварии
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-72 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <Search className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по объекту или описанию..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Table of Inspection Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Дата / Время</th>
                <th className="py-3 px-4">Контрольная точка / Объект</th>
                <th className="py-3 px-4">Проверяющий</th>
                <th className="py-3 px-4">Статус</th>
                <th className="py-3 px-4">Результаты осмотра</th>
                <th className="py-3 px-4">Меры / Срок</th>
                <th className="py-3 px-4 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{log.assetCode}</span>
                    <span className="text-[11px] text-slate-500">{log.pointName}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-medium text-slate-800 block">{log.inspectorName}</span>
                    <span className="text-[10px] text-slate-400">{log.inspectorRole}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        log.status === 'ok'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : log.status === 'minor_issue'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {log.status === 'ok' && <CheckCircle className="w-3 h-3" />}
                      {log.status === 'minor_issue' && <AlertTriangle className="w-3 h-3" />}
                      {log.status === 'defect' && <AlertOctagon className="w-3 h-3" />}
                      {log.status === 'emergency' && <AlertOctagon className="w-3 h-3" />}
                      {log.status === 'ok'
                        ? 'Норма'
                        : log.status === 'minor_issue'
                        ? 'Замечание'
                        : log.status === 'defect'
                        ? 'Дефект'
                        : 'Авария'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px]">
                    {log.findings}
                  </td>
                  <td className="py-3.5 px-4 text-[11px]">
                    <span className="text-slate-800 block">{log.measuresRequired}</span>
                    {log.deadline && (
                      <span className="text-rose-600 font-mono text-[10px] block mt-0.5 font-semibold">
                        Срок: {log.deadline}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {!log.resolved ? (
                      <button
                        onClick={() => onResolveLog(log.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        Отметить устраненным
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-medium">
                        Устранено ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record New Inspection */}
      {isAddingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Внесение записи в журнал осмотра</h3>
              <button onClick={() => setIsAddingLog(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Выберите контрольную точку / объект:</label>
                <select
                  value={selectedPointId}
                  onChange={(e) => setSelectedPointId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                >
                  {checkPoints.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      КП № {cp.order}: {cp.name} ({cp.targetAssetCode})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPointObj && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1 text-[11px]">Обязательный чек-лист проверки:</span>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    {selectedPointObj.checkItems.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="text-slate-600 font-medium block mb-1">Техническое состояние объекта:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogStatus('ok')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      logStatus === 'ok' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    В норме
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogStatus('minor_issue')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      logStatus === 'minor_issue' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Замечание
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogStatus('defect')}
                    className={`py-2 rounded-lg font-semibold transition-all ${
                      logStatus === 'defect' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Дефект / Авария
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Фактические результаты осмотра:</label>
                <textarea
                  rows={3}
                  required
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Опишите текущие параметры (давление, нагрев, уровень масла, наличие снега)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {logStatus !== 'ok' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Необходимые мероприятия:</label>
                    <input
                      type="text"
                      value={measuresRequired}
                      onChange={(e) => setMeasuresRequired(e.target.value)}
                      placeholder="Например: вызов трактора, очистка..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-1">Срок устранения:</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingLog(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow"
                >
                  Сохранить запись
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Official Summary Inspection Report (Акт техосмотра) */}
      {showSummaryAct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Акт комплексного технического осмотра инфраструктуры ДТСН «Пенсионер»
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl border border-slate-200"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-600" />
                  <span>Печать акта</span>
                </button>
                <button onClick={() => setShowSummaryAct(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-4">
              <div className="text-center space-y-1 border-b border-slate-200 pb-3">
                <p className="font-bold text-sm text-slate-900 uppercase">{SOCIETY_INFO.fullName}</p>
                <p className="text-slate-500 font-mono">АКТ № АТО-2026/10</p>
                <p className="text-slate-500">от {new Date().toLocaleDateString('ru-RU')}</p>
              </div>

              <p className="leading-relaxed">
                Настоящий акт составлен комиссией в составе: Главного инженера <b>{SOCIETY_INFO.chiefEngineer}</b>, Председателя Правления <b>{SOCIETY_INFO.chairmanName}</b> о том, что в период с 01.10.2026 по {new Date().toLocaleDateString('ru-RU')} проведен плановый осмотр инженерных сетей водопровода, электроснабжения, газоснабжения и готовности дорожной инфраструктуры к эксплуатации.
              </p>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900">Результаты по контрольным точкам:</h5>
                <div className="space-y-1.5">
                  {logs.map((log) => (
                    <div key={log.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-start">
                      <div>
                        <span className="font-bold text-sky-700">{log.assetCode} ({log.pointName}):</span>
                        <span className="text-slate-600 ml-2">{log.findings}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                        {log.status === 'ok' ? 'Норма' : 'Замечание'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-slate-500">Председатель Правления ДТСН:</p>
                  <p className="font-bold text-slate-900 mt-1">{SOCIETY_INFO.chairmanName} __________</p>
                </div>
                <div>
                  <p className="text-slate-500">Главный инженер ДТСН:</p>
                  <p className="font-bold text-slate-900 mt-1">{SOCIETY_INFO.chiefEngineer} __________</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
