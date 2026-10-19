import React, { useState } from 'react';
import { UserProfile, MaintenanceRecord, UserRole } from '../../types/index.ts';
import { UtilityConsumptionWidget } from './UtilityConsumptionWidget';
import { MonthlyConsumptionAreaChart } from './MonthlyConsumptionAreaChart';
import {
  Users,
  Wrench,
  ShieldAlert,
  PlusCircle,
  Clock,
  CheckCircle,
  FileText,
  Search,
  KeyRound,
  Filter,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

interface AdminPanelProps {
  users: UserProfile[];
  maintenanceRecords: MaintenanceRecord[];
  currentUser: UserProfile;
  onUpdateUserPermissions: (userId: string, permissions: UserProfile['permissions']) => void;
  onAddMaintenanceRecord: (record: MaintenanceRecord) => void;
  onSwitchUser: (userId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  maintenanceRecords,
  currentUser,
  onUpdateUserPermissions,
  onAddMaintenanceRecord,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'maintenance' | 'users'>('analytics');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMaintenance, setIsAddingMaintenance] = useState(false);

  // New Maintenance Form State
  const [assetCode, setAssetCode] = useState('КВ-04');
  const [assetType, setAssetType] = useState<MaintenanceRecord['assetType']>('well');
  const [performedBy, setPerformedBy] = useState('Кузнецов М.В.');
  const [workDescription, setWorkDescription] = useState('');
  const [replacedParts, setReplacedParts] = useState('');
  const [nextScheduledDate, setNextScheduledDate] = useState('2027-05-15');
  const [costRub, setCostRub] = useState(3500);

  const filteredRecords = maintenanceRecords.filter((rec) => {
    if (assetTypeFilter !== 'all' && rec.assetType !== assetTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.assetCode.toLowerCase().includes(q) ||
        rec.workDescription.toLowerCase().includes(q) ||
        rec.performedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MaintenanceRecord = {
      id: `mr-${Date.now()}`,
      assetId: `asset-${assetCode}`,
      assetCode,
      assetType,
      date: new Date().toISOString().split('T')[0],
      performedBy,
      workDescription,
      replacedParts: replacedParts || undefined,
      nextScheduledDate,
      costRub,
    };

    onAddMaintenanceRecord(newRecord);
    setIsAddingMaintenance(false);
    setWorkDescription('');
    setReplacedParts('');
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <KeyRound className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Панель администратора ДТСН «Пенсионер»</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Сводный баланс ресурсов (вода и электроэнергия), права доступа пользователей и история технического обслуживания
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'maintenance' && (
            <button
              onClick={() => setIsAddingMaintenance(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Внести техобслуживание</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit text-xs">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
          <span>Потребление воды и э/э (Recharts)</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'maintenance'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-slate-700" />
          <span>История техобслуживания ({maintenanceRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          <span>Пользователи & Права ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: CONSUMPTION ANALYTICS WIDGET (RECHARTS) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <MonthlyConsumptionAreaChart />
          <UtilityConsumptionWidget />
        </div>
      )}

      {/* TAB 2: MAINTENANCE RECORDS */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <select
                value={assetTypeFilter}
                onChange={(e) => setAssetTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 font-medium"
              >
                <option value="all">Все инженерные объекты</option>
                <option value="well">Колодцы (КВ)</option>
                <option value="pipeline">Магистрали водопровода</option>
                <option value="substation">Трансформаторные подстанции (КТПН)</option>
                <option value="hydrant">Пожарные гидранты (ПГ)</option>
                <option value="road">Дорожное полотно</option>
                <option value="barrier">Шлагбаумы (ШЛ)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-72 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <Search className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по коду объекта или описанию..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Дата</th>
                    <th className="py-3 px-4">Объект сети</th>
                    <th className="py-3 px-4">Исполнитель / Мастер</th>
                    <th className="py-3 px-4">Содержание выполненных работ</th>
                    <th className="py-3 px-4">Замененные детали</th>
                    <th className="py-3 px-4">След. ТО</th>
                    <th className="py-3 px-4 text-right">Затраты, ₽</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{rec.assetCode}</span>
                        <span className="text-[10px] text-sky-700 uppercase font-mono">
                          {rec.assetType === 'well'
                            ? 'Колодец'
                            : rec.assetType === 'pipeline'
                            ? 'Магистраль'
                            : rec.assetType === 'substation'
                            ? 'Подстанция'
                            : rec.assetType === 'hydrant'
                            ? 'Гидрант'
                            : rec.assetType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800">{rec.performedBy}</td>
                      <td className="py-3 px-4 max-w-sm text-slate-600">{rec.workDescription}</td>
                      <td className="py-3 px-4 text-[11px] text-slate-500">
                        {rec.replacedParts || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-emerald-700 whitespace-nowrap font-medium">
                        {rec.nextScheduledDate}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {rec.costRub.toLocaleString('ru-RU')} ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT & PERMISSIONS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <div
                  key={u.id}
                  className={`p-5 rounded-2xl border space-y-3 transition-all ${
                    isCurrent ? 'border-sky-300 bg-sky-50/40 shadow-sm' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{u.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] rounded-full font-mono font-semibold">
                            Текущий вход
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-sky-700 font-semibold">{u.roleTitle}</p>
                      <p className="text-[11px] text-slate-500">{u.phone} · {u.email}</p>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => onSwitchUser(u.id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                      >
                        Войти под ролью
                      </button>
                    )}
                  </div>

                  {/* Permissions matrix */}
                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Права доступа:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <label className="flex items-center gap-1.5 text-slate-700">
                        <input
                          type="checkbox"
                          checked={u.permissions.canApproveTU}
                          onChange={(e) =>
                            onUpdateUserPermissions(u.id, { ...u.permissions, canApproveTU: e.target.checked })
                          }
                          className="rounded text-sky-600 focus:ring-0"
                        />
                        <span>Выдача и утверждение ТУ</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-700">
                        <input
                          type="checkbox"
                          checked={u.permissions.canSignContracts}
                          onChange={(e) =>
                            onUpdateUserPermissions(u.id, { ...u.permissions, canSignContracts: e.target.checked })
                          }
                          className="rounded text-sky-600 focus:ring-0"
                        />
                        <span>Подписание договоров</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-700">
                        <input
                          type="checkbox"
                          checked={u.permissions.canEditNetworks}
                          onChange={(e) =>
                            onUpdateUserPermissions(u.id, { ...u.permissions, canEditNetworks: e.target.checked })
                          }
                          className="rounded text-sky-600 focus:ring-0"
                        />
                        <span>Редактирование сетей</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-700">
                        <input
                          type="checkbox"
                          checked={u.permissions.canLogInspections}
                          onChange={(e) =>
                            onUpdateUserPermissions(u.id, { ...u.permissions, canLogInspections: e.target.checked })
                          }
                          className="rounded text-sky-600 focus:ring-0"
                        />
                        <span>Ведение журнала осмотров</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-700">
                        <input
                          type="checkbox"
                          checked={u.permissions.canEditEstimates}
                          onChange={(e) =>
                            onUpdateUserPermissions(u.id, { ...u.permissions, canEditEstimates: e.target.checked })
                          }
                          className="rounded text-sky-600 focus:ring-0"
                        />
                        <span>Составление смет</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-slate-700">
                        <input
                          type="checkbox"
                          checked={u.permissions.canManageUsers}
                          onChange={(e) =>
                            onUpdateUserPermissions(u.id, { ...u.permissions, canManageUsers: e.target.checked })
                          }
                          className="rounded text-sky-600 focus:ring-0"
                        />
                        <span>Администрирование</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Record Maintenance Action */}
      {isAddingMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Внесение записи о техническом обслуживании</h3>
              <button onClick={() => setIsAddingMaintenance(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Код объекта (КВ, КТПН, ПГ, ШЛ):</label>
                  <input
                    type="text"
                    required
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value)}
                    placeholder="Например КВ-04, КТПН-1..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Тип актива:</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                  >
                    <option value="well">Колодец водопровода</option>
                    <option value="pipeline">Магистраль</option>
                    <option value="substation">Трансформаторная подстанция КТПН</option>
                    <option value="hydrant">Пожарный гидрант</option>
                    <option value="barrier">Шлагбаум GSM</option>
                    <option value="facility">Здание Правления</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Мастер / Сервисная организация:</label>
                <input
                  type="text"
                  required
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Описание выполненных работ:</label>
                <textarea
                  rows={3}
                  required
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Замена сальника, гидроиспытания, проверка сопротивления..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Замененные комплектующие:</label>
                <input
                  type="text"
                  value={replacedParts}
                  onChange={(e) => setReplacedParts(e.target.value)}
                  placeholder="Сальник, кран, пеноплекс..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Дата следующей ревизии:</label>
                  <input
                    type="date"
                    required
                    value={nextScheduledDate}
                    onChange={(e) => setNextScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Затраты (₽):</label>
                  <input
                    type="number"
                    value={costRub}
                    onChange={(e) => setCostRub(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingMaintenance(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow"
                >
                  Зафиксировать в журнале
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
