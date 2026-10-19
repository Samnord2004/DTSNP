import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Zap, Droplet, TrendingUp, DollarSign, Download, Calendar, Activity } from 'lucide-react';

export interface MonthlyConsumptionData {
  month: string;
  monthFull: string;
  waterWinterM3: number;
  waterSummerM3: number;
  waterTotalM3: number;
  electricityDayKwh: number;
  electricityNightKwh: number;
  electricityTotalKwh: number;
  lossPercent: number;
  costTotalRub: number;
  paidRub: number;
}

export const ANNUAL_CONSUMPTION_2026: MonthlyConsumptionData[] = [
  {
    month: 'Янв',
    monthFull: 'Январь 2026',
    waterWinterM3: 1650,
    waterSummerM3: 0,
    waterTotalM3: 1650,
    electricityDayKwh: 36200,
    electricityNightKwh: 24800,
    electricityTotalKwh: 61000,
    lossPercent: 4.9,
    costTotalRub: 284500,
    paidRub: 279000,
  },
  {
    month: 'Фев',
    monthFull: 'Февраль 2026',
    waterWinterM3: 1520,
    waterSummerM3: 0,
    waterTotalM3: 1520,
    electricityDayKwh: 34100,
    electricityNightKwh: 23400,
    electricityTotalKwh: 57500,
    lossPercent: 4.8,
    costTotalRub: 268200,
    paidRub: 265000,
  },
  {
    month: 'Мар',
    monthFull: 'Март 2026',
    waterWinterM3: 1590,
    waterSummerM3: 0,
    waterTotalM3: 1590,
    electricityDayKwh: 31200,
    electricityNightKwh: 20100,
    electricityTotalKwh: 51300,
    lossPercent: 4.6,
    costTotalRub: 241100,
    paidRub: 238000,
  },
  {
    month: 'Апр',
    monthFull: 'Апрель 2026',
    waterWinterM3: 1480,
    waterSummerM3: 250,
    waterTotalM3: 1730,
    electricityDayKwh: 24500,
    electricityNightKwh: 15200,
    electricityTotalKwh: 39700,
    lossPercent: 4.4,
    costTotalRub: 194300,
    paidRub: 191000,
  },
  {
    month: 'Май',
    monthFull: 'Май 2026',
    waterWinterM3: 1620,
    waterSummerM3: 2800,
    waterTotalM3: 4420,
    electricityDayKwh: 21800,
    electricityNightKwh: 12400,
    electricityTotalKwh: 34200,
    lossPercent: 4.2,
    costTotalRub: 202500,
    paidRub: 198000,
  },
  {
    month: 'Июн',
    monthFull: 'Июнь 2026',
    waterWinterM3: 1710,
    waterSummerM3: 4200,
    waterTotalM3: 5910,
    electricityDayKwh: 19500,
    electricityNightKwh: 10800,
    electricityTotalKwh: 30300,
    lossPercent: 4.1,
    costTotalRub: 214000,
    paidRub: 211000,
  },
  {
    month: 'Июл',
    monthFull: 'Июль 2026',
    waterWinterM3: 1780,
    waterSummerM3: 4650,
    waterTotalM3: 6430,
    electricityDayKwh: 20400,
    electricityNightKwh: 11100,
    electricityTotalKwh: 31500,
    lossPercent: 4.0,
    costTotalRub: 228000,
    paidRub: 224500,
  },
  {
    month: 'Авг',
    monthFull: 'Август 2026',
    waterWinterM3: 1690,
    waterSummerM3: 3900,
    waterTotalM3: 5590,
    electricityDayKwh: 21200,
    electricityNightKwh: 11900,
    electricityTotalKwh: 33100,
    lossPercent: 4.2,
    costTotalRub: 216400,
    paidRub: 214000,
  },
  {
    month: 'Сен',
    monthFull: 'Сентябрь 2026',
    waterWinterM3: 1540,
    waterSummerM3: 850,
    waterTotalM3: 2390,
    electricityDayKwh: 23900,
    electricityNightKwh: 14200,
    electricityTotalKwh: 38100,
    lossPercent: 4.5,
    costTotalRub: 198700,
    paidRub: 194000,
  },
  {
    month: 'Окт',
    monthFull: 'Октябрь 2026',
    waterWinterM3: 1560,
    waterSummerM3: 0,
    waterTotalM3: 1560,
    electricityDayKwh: 28400,
    electricityNightKwh: 17800,
    electricityTotalKwh: 46200,
    lossPercent: 4.7,
    costTotalRub: 226800,
    paidRub: 221000,
  },
  {
    month: 'Ноя',
    monthFull: 'Ноябрь 2026 (план)',
    waterWinterM3: 1610,
    waterSummerM3: 0,
    waterTotalM3: 1610,
    electricityDayKwh: 33500,
    electricityNightKwh: 22100,
    electricityTotalKwh: 55600,
    lossPercent: 4.8,
    costTotalRub: 261400,
    paidRub: 255000,
  },
  {
    month: 'Дек',
    monthFull: 'Декабрь 2026 (план)',
    waterWinterM3: 1680,
    waterSummerM3: 0,
    waterTotalM3: 1680,
    electricityDayKwh: 37800,
    electricityNightKwh: 26200,
    electricityTotalKwh: 64000,
    lossPercent: 5.0,
    costTotalRub: 298000,
    paidRub: 290000,
  },
];

export const UtilityConsumptionWidget: React.FC = () => {
  const [metricTab, setMetricTab] = useState<'both' | 'electricity' | 'water' | 'finance'>('both');
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<'all' | 'winter_period' | 'summer_period'>('all');

  // Filtered dataset
  const displayedData = ANNUAL_CONSUMPTION_2026.filter((d, idx) => {
    if (selectedSeasonFilter === 'winter_period') {
      // Nov, Dec, Jan, Feb, Mar
      return [0, 1, 2, 10, 11].includes(idx);
    }
    if (selectedSeasonFilter === 'summer_period') {
      // May, Jun, Jul, Aug
      return [4, 5, 6, 7].includes(idx);
    }
    return true;
  });

  // Calculate year totals
  const totalElectricityKwh = ANNUAL_CONSUMPTION_2026.reduce((sum, d) => sum + d.electricityTotalKwh, 0);
  const totalWaterM3 = ANNUAL_CONSUMPTION_2026.reduce((sum, d) => sum + d.waterTotalM3, 0);
  const totalWaterWinterM3 = ANNUAL_CONSUMPTION_2026.reduce((sum, d) => sum + d.waterWinterM3, 0);
  const totalWaterSummerM3 = ANNUAL_CONSUMPTION_2026.reduce((sum, d) => sum + d.waterSummerM3, 0);
  const totalCostRub = ANNUAL_CONSUMPTION_2026.reduce((sum, d) => sum + d.costTotalRub, 0);
  const totalPaidRub = ANNUAL_CONSUMPTION_2026.reduce((sum, d) => sum + d.paidRub, 0);
  const collectionRate = Math.round((totalPaidRub / totalCostRub) * 1000) / 10;
  const avgLossPercent = 4.6;

  const handleExportCsv = () => {
    const headers = 'Месяц,Вода зимняя (м3),Вода летняя (м3),Всего воды (м3),Электроэнергия День Т1 (кВтч),Электроэнергия Ночь Т2 (кВтч),Всего э/э (кВтч),Потери (%),Начислено (руб),Оплачено (руб)\n';
    const rows = ANNUAL_CONSUMPTION_2026.map(
      (d) =>
        `${d.monthFull},${d.waterWinterM3},${d.waterSummerM3},${d.waterTotalM3},${d.electricityDayKwh},${d.electricityNightKwh},${d.electricityTotalKwh},${d.lossPercent}%,${d.costTotalRub},${d.paidRub}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Потребление_ресурсов_ДТСН_Пенсионер_2026.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <Activity className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Суммарный баланс потребления воды и электроэнергии по ДТСН «Пенсионер» (2026 г.)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Аналитика общего узла учета ввода зимнего водопровода, фидеров КТПН-1..3 и расчет технологических потерь
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Выгрузить CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Electricity KPI */}
        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-amber-800">
            <span className="font-semibold text-[11px] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Электроэнергия за 2026 г.
            </span>
            <span className="text-[10px] font-mono text-amber-600">КТПН 1..3</span>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-900">
            {totalElectricityKwh.toLocaleString('ru-RU')} <span className="text-xs font-normal">кВт·ч</span>
          </p>
          <p className="text-[11px] text-amber-700 font-mono">
            День Т1: {(ANNUAL_CONSUMPTION_2026.reduce((s, i) => s + i.electricityDayKwh, 0) / 1000).toFixed(1)} тыс. · Ночь Т2: {(ANNUAL_CONSUMPTION_2026.reduce((s, i) => s + i.electricityNightKwh, 0) / 1000).toFixed(1)} тыс.
          </p>
        </div>

        {/* Water KPI */}
        <div className="p-4 bg-sky-50/50 border border-sky-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-sky-800">
            <span className="font-semibold text-[11px] flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-sky-600" />
              Водопотребление общее
            </span>
            <span className="text-[10px] font-mono text-sky-600">КВ-01</span>
          </div>
          <p className="text-2xl font-bold font-mono text-sky-900">
            {totalWaterM3.toLocaleString('ru-RU')} <span className="text-xs font-normal">м³</span>
          </p>
          <p className="text-[11px] text-sky-700 font-mono">
            Зимний водопровод: {totalWaterWinterM3.toLocaleString('ru-RU')} м³ · Летний: {totalWaterSummerM3.toLocaleString('ru-RU')} м³
          </p>
        </div>

        {/* Collection & Finance KPI */}
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="font-semibold text-[11px] flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Финансовый объем начислений
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700">{collectionRate}% оплат</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-900">
            {totalCostRub.toLocaleString('ru-RU')} <span className="text-xs font-normal">₽</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-mono">
            Поступило от жителей: {totalPaidRub.toLocaleString('ru-RU')} ₽
          </p>
        </div>

        {/* Grid Losses KPI */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-semibold text-[11px] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              Потери в сетях ВЛ-0.4кВ
            </span>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">Норма &le;7%</span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900">
            {avgLossPercent}% <span className="text-xs font-normal text-slate-500">в норме</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Потери холостого хода КТПН и сопротивление СИП
          </p>
        </div>
      </div>

      {/* Chart Controls & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
        {/* Metric Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMetricTab('both')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metricTab === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Сводный график (Э/э & Вода)
          </button>
          <button
            onClick={() => setMetricTab('electricity')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metricTab === 'electricity' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Электроэнергия (День / Ночь)
          </button>
          <button
            onClick={() => setMetricTab('water')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metricTab === 'water' ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Водоснабжение (Зимняя / Летняя)
          </button>
          <button
            onClick={() => setMetricTab('finance')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metricTab === 'finance' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Начисления & Оплаты (₽)
          </button>
        </div>

        {/* Season Period Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSeasonFilter}
            onChange={(e) => setSelectedSeasonFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-medium"
          >
            <option value="all">Весь 2026 год (12 месяцев)</option>
            <option value="winter_period">❄️ Зимний отопительный период (Ноя - Мар)</option>
            <option value="summer_period">☀️ Летний поливочный период (Май - Авг)</option>
          </select>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION CONTAINER */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayedData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />

            {metricTab === 'both' && (
              <>
                <YAxis
                  yAxisId="left"
                  stroke="#d97706"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  label={{ value: 'Э/э (кВт·ч)', angle: -90, position: 'insideLeft', fill: '#d97706', fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val} м³`}
                  label={{ value: 'Вода (м³)', angle: 90, position: 'insideRight', fill: '#0284c7', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'Электроэнергия всего (кВт·ч)') return [`${value.toLocaleString()} кВт·ч`, name];
                    if (name === 'Водопотребление всего (м³)') return [`${value.toLocaleString()} м³`, name];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="electricityTotalKwh" name="Электроэнергия всего (кВт·ч)" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Line yAxisId="right" type="monotone" dataKey="waterTotalM3" name="Водопотребление всего (м³)" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7' }} />
              </>
            )}

            {metricTab === 'electricity' && (
              <>
                <YAxis
                  stroke="#d97706"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k кВт·ч`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value.toLocaleString()} кВт·ч`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="electricityDayKwh" name="Дневной тариф Т1 (кВт·ч)" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={40} />
                <Bar dataKey="electricityNightKwh" name="Ночной тариф Т2 (кВт·ч)" fill="#fbbf24" stackId="a" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Line type="monotone" dataKey="electricityTotalKwh" name="Суммарный ввод (кВт·ч)" stroke="#b45309" strokeWidth={2.5} dot={{ r: 3 }} />
              </>
            )}

            {metricTab === 'water' && (
              <>
                <YAxis
                  stroke="#0284c7"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val} м³`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value.toLocaleString()} м³`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="waterWinterM3" name="Зимний питьевой водопровод (м³)" fill="#bae6fd" stroke="#0284c7" strokeWidth={2.5} />
                <Bar dataKey="waterSummerM3" name="Летний поливочный водопровод (м³)" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </>
            )}

            {metricTab === 'finance' && (
              <>
                <YAxis
                  stroke="#10b981"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k ₽`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value.toLocaleString()} ₽`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="costTotalRub" name="Начислено за ресурсы (₽)" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="paidRub" name="Фактически оплачено жителями (₽)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory notes */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>
          💡 <b>Примечание для Правления:</b> Пик электропотребления приходится на январь-февраль (до 61 000 кВт·ч/мес в морозы). Пик водопотребления — июль (до 6 430 м³/мес за счет полива).
        </span>
        <span className="font-mono text-slate-400 shrink-0">Обновлено: 05.10.2026</span>
      </div>
    </div>
  );
};
