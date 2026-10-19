import React, { useState } from 'react';
import { WorkTask, WorkEstimate, UserProfile, SeasonMode } from '../../types/index.ts';
import {
  Calendar as CalendarIcon,
  DollarSign,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Droplet,
  Compass,
  Zap,
  Snowflake,
  Sun,
  Sprout,
  Leaf,
  Filter,
  FileSpreadsheet,
  Check,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Layers,
  MapPin,
} from 'lucide-react';

interface WorkScheduleViewProps {
  tasks: WorkTask[];
  estimates: WorkEstimate[];
  currentUser: UserProfile;
  activeSeason: SeasonMode;
  onAddTask: (task: WorkTask, estimate?: WorkEstimate) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: WorkTask['status']) => void;
  onApproveEstimate: (estimateId: string) => void;
}

export const WorkScheduleView: React.FC<WorkScheduleViewProps> = ({
  tasks,
  estimates,
  currentUser,
  activeSeason,
  onAddTask,
  onUpdateTaskStatus,
  onApproveEstimate,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'estimates'>('calendar');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEstimate, setSelectedEstimate] = useState<WorkEstimate | null>(estimates[0] || null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Calendar month state (defaults to October 2026, where current mock tasks live)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // New task form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkTask['category']>('snow_clearing');
  const [priority, setPriority] = useState<WorkTask['priority']>('high');
  const [scheduledDate, setScheduledDate] = useState('2026-11-15');
  const [scheduledEndDate, setScheduledEndDate] = useState('2026-11-20');
  const [assignee, setAssignee] = useState(currentUser.name);
  const [assignedContractor, setAssignedContractor] = useState('ИП Григорьев (Трактор МТЗ-82)');
  const [locationName, setLocationName] = useState('Центральная, 1-я, 2-я Линии');
  const [description, setDescription] = useState('');
  const [totalCostRub, setTotalCostRub] = useState(35000);
  const [taskSeason, setTaskSeason] = useState<WorkTask['season']>('winter');

  const filteredTasks = tasks.filter((t) => {
    if (selectedSeason !== 'all' && t.season !== selectedSeason && t.season !== 'all') return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar Grid Calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0
  const calendarCells = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const taskId = `task-${Date.now()}`;
    const newTask: WorkTask = {
      id: taskId,
      title,
      category,
      priority,
      status: 'planned',
      scheduledDate,
      scheduledEndDate: scheduledEndDate || undefined,
      assignee,
      assignedContractor: assignedContractor || undefined,
      description,
      season: taskSeason,
      locationName: locationName || 'Территория ДТСН «Пенсионер»',
      totalCostRub: totalCostRub || 0,
    };

    let newEstimate: WorkEstimate | undefined;
    if (totalCostRub > 0) {
      newEstimate = {
        id: `est-${Date.now()}`,
        taskId,
        taskTitle: title,
        dateCreated: new Date().toISOString().split('T')[0],
        approvedByBoard: false,
        items: [
          {
            id: `ei-${Date.now()}-1`,
            name: `Выполнение работ: ${title}`,
            category: 'machinery',
            unit: 'маш.-час',
            quantity: 10,
            unitPriceRub: Math.round(totalCostRub / 10),
            totalRub: totalCostRub,
          },
        ],
        subtotalMaterials: 0,
        subtotalMachinery: totalCostRub,
        subtotalLabor: 0,
        overheadPercent: 0,
        totalAmountRub: totalCostRub,
      };
    }

    onAddTask(newTask, newEstimate);
    setIsAddingTask(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Календарный план и график производства работ
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Комплексное планирование по всем 4 сезонам: снегоочистка, дороги, ливнёвка, ревизия КТПН и сметы
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.permissions.canEditEstimates && (
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Создать наряд / задачу</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation View Switcher & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Календарная сетка</span>
          </button>

          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
            <span>График производства работ ({filteredTasks.length})</span>
          </button>

          <button
            onClick={() => setViewMode('estimates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'estimates' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Сметы и финансирование ({estimates.length})</span>
          </button>
        </div>

        {/* Season & Category Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-medium"
          >
            <option value="all">Все сезоны (Зима / Весна / Лето / Осень)</option>
            <option value="winter">❄️ Зима (Снегоочистка & Обогрев)</option>
            <option value="spring">🌱 Весна (Ливнёвка & Паводок & Запуск)</option>
            <option value="summer">☀️ Лето (Дороги & Полив & Покос)</option>
            <option value="autumn">🍂 Осень (Консервация & Пеноплекс)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-medium"
          >
            <option value="all">Все категории сетей</option>
            <option value="snow_clearing">Очистка снега</option>
            <option value="roads">Дороги и грейдер</option>
            <option value="stormwater">Ливнёвка и канавы</option>
            <option value="water">Водопроводные сети</option>
            <option value="electric">Электроснабжение (КТПН)</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: MONTH CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          {/* Calendar Header with Month/Year Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                {monthNames[currentMonth]} {currentYear} г.
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                План-график производства регламентных работ
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(9);
                  setCurrentYear(2026);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                Текущий месяц
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 py-1">
            <span>Пн</span>
            <span>Вт</span>
            <span>Ср</span>
            <span>Чт</span>
            <span>Пт</span>
            <span className="text-rose-600">Сб</span>
            <span className="text-rose-600">Вс</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-28 bg-slate-50/50 rounded-xl border border-transparent"></div>;
              }

              // Match tasks on this day
              const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const daysTasks = tasks.filter((t) => t.scheduledDate === dateStr);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-28 p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    daysTasks.length > 0 ? 'bg-sky-50/30 border-sky-200' : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-slate-800">{dayNum}</span>
                    {daysTasks.length > 0 && (
                      <span className="text-[10px] px-1.5 rounded-full bg-sky-600 text-white font-bold font-mono">
                        {daysTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Tasks inside cell */}
                  <div className="space-y-1 overflow-y-auto max-h-16 text-[10px]">
                    {daysTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`p-1 rounded font-medium truncate ${
                          t.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : t.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-sky-100 text-sky-800 border border-sky-300'
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>

                  <span className="text-[9px] text-slate-400 font-mono">
                    {daysTasks.length > 0 ? `${daysTasks.reduce((s, i) => s + i.totalCostRub, 0).toLocaleString()} ₽` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: DETAILED TIMELINE & PRODUCTION SCHEDULE */}
      {viewMode === 'timeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => {
              const isWinter = task.season === 'winter';
              const isSpring = task.season === 'spring';
              const isSummer = task.season === 'summer';
              const isAutumn = task.season === 'autumn';

              return (
                <div
                  key={task.id}
                  className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      {/* Season Badge */}
                      <span className="font-semibold text-slate-600 flex items-center gap-1 text-[11px]">
                        {isWinter && <Snowflake className="w-3.5 h-3.5 text-sky-600" />}
                        {isSpring && <Sprout className="w-3.5 h-3.5 text-emerald-600" />}
                        {isSummer && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                        {isAutumn && <Leaf className="w-3.5 h-3.5 text-orange-600" />}
                        <span>
                          {isWinter ? 'Зимний период' : isSpring ? 'Весенний паводок' : isSummer ? 'Летний сезон' : 'Осенняя консервация'}
                        </span>
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          task.priority === 'urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'high'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority === 'urgent' ? 'Срочно' : task.priority === 'high' ? 'Высокий приоритет' : 'Плановый'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{task.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{task.description}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Сроки выполнения:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {task.scheduledDate} {task.scheduledEndDate ? `по ${task.scheduledEndDate}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Исполнитель:</span>
                      <span className="font-medium text-slate-800">{task.assignedContractor || task.assignee}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Локация работ:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[190px]">{task.locationName}</span>
                    </div>

                    <div className="flex items-center justify-between font-mono pt-1">
                      <span className="text-slate-400">Сметная стоимость:</span>
                      <span className="font-bold text-sky-700 text-sm">{task.totalCostRub.toLocaleString('ru-RU')} ₽</span>
                    </div>

                    {/* Status & Action */}
                    <div className="pt-2 flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          task.status === 'completed'
                            ? 'text-emerald-700'
                            : task.status === 'in_progress'
                            ? 'text-sky-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {task.status === 'completed'
                          ? '✓ Выполнено'
                          : task.status === 'in_progress'
                          ? 'В работе'
                          : 'Запланировано'}
                      </span>

                      {task.status !== 'completed' && (
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                        >
                          Завершить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DETAILED ESTIMATES CALCULATOR */}
      {viewMode === 'estimates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Реестр утверждённых смет
            </h4>
            <div className="space-y-2">
              {estimates.map((est) => (
                <div
                  key={est.id}
                  onClick={() => setSelectedEstimate(est)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedEstimate?.id === est.id
                      ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 truncate max-w-[200px]">{est.taskTitle}</span>
                    <span className="font-mono text-xs font-bold text-sky-700">
                      {est.totalAmountRub.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>от {est.dateCreated}</span>
                    <span
                      className={`font-semibold ${
                        est.approvedByBoard ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {est.approvedByBoard ? 'Утверждена Правлением' : 'На согласовании'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown view */}
          {selectedEstimate && (
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedEstimate.taskTitle}</h3>
                  <p className="text-xs text-slate-500">Сметный расчет № {selectedEstimate.id}</p>
                </div>
                {!selectedEstimate.approvedByBoard ? (
                  <button
                    onClick={() => onApproveEstimate(selectedEstimate.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Утвердить смету Правлением</span>
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg">
                    ✓ Утверждено {selectedEstimate.approvalDate}
                  </span>
                )}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Наименование работ / материалов</th>
                      <th className="py-2.5 px-3">Категория</th>
                      <th className="py-2.5 px-3">Ед. изм.</th>
                      <th className="py-2.5 px-3 text-right">Кол-во</th>
                      <th className="py-2.5 px-3 text-right">Цена, ₽</th>
                      <th className="py-2.5 px-3 text-right">Сумма, ₽</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedEstimate.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {item.category === 'machinery'
                            ? 'Спецтехника'
                            : item.category === 'material'
                            ? 'Материалы'
                            : 'Оплата труда (ФОТ)'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{item.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {item.unitPriceRub.toLocaleString('ru-RU')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {item.totalRub.toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Материалы:</span>
                  <span className="font-bold text-slate-800">{selectedEstimate.subtotalMaterials.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Техника / МТЗ-82:</span>
                  <span className="font-bold text-slate-800">{selectedEstimate.subtotalMachinery.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ФОТ персонала:</span>
                  <span className="font-bold text-slate-800">{selectedEstimate.subtotalLabor.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-2">
                <span className="text-xs text-slate-500">ИТОГО К ВЫПЛАТЕ:</span>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {selectedEstimate.totalAmountRub.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: New Work Task */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Создание планового наряда-задания</h3>
              <button onClick={() => setIsAddingTask(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Название работы:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Очистка снега ул. Центральная и разворотов МЧС..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Сезон работ:</label>
                  <select
                    value={taskSeason}
                    onChange={(e) => setTaskSeason(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                  >
                    <option value="winter">❄️ Зима</option>
                    <option value="spring">🌱 Весна</option>
                    <option value="summer">☀️ Лето</option>
                    <option value="autumn">🍂 Осень</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Категория:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                  >
                    <option value="snow_clearing">Очистка снега</option>
                    <option value="roads">Дорожное полотно</option>
                    <option value="stormwater">Ливневая сеть</option>
                    <option value="water">Водопроводные сети</option>
                    <option value="electric">Электроснабжение</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Дата начала:</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Ориентировочная стоимость (₽):</label>
                  <input
                    type="number"
                    value={totalCostRub}
                    onChange={(e) => setTotalCostRub(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Место проведения (улица, разворот):</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="ул. Центральная, 2-я Линия..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Исполнитель / Подрядчик:</label>
                <input
                  type="text"
                  value={assignedContractor}
                  onChange={(e) => setAssignedContractor(e.target.value)}
                  placeholder="ИП Григорьев (Трактор МТЗ-82)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Описание регламента:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow"
                >
                  Создать задачу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
