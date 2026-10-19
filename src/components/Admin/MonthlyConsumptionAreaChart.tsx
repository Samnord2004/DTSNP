import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  ANNUAL_CONSUMPTION_2026,
  MonthlyConsumptionData,
} from './UtilityConsumptionWidget';
import {
  Droplet,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  Info,
  Maximize2,
  ChevronRight,
  Sun,
  Snowflake,
} from 'lucide-react';

export type ChartTrendMode = 'dual_trend' | 'water_layers' | 'electricity_layers' | 'relative_index';

interface MonthlyConsumptionAreaChartProps {
  data?: MonthlyConsumptionData[];
  title?: string;
  subtitle?: string;
}

export const MonthlyConsumptionAreaChart: React.FC<MonthlyConsumptionAreaChartProps> = ({
  data = ANNUAL_CONSUMPTION_2026,
  title = 'Интерактивный анализ динамики потребления (Area Chart)',
  subtitle = 'Помесячные тренды водоснабжения и электропотребления ДТСН «Пенсионер» за 2026 год',
}) => {
  const [trendMode, setTrendMode] = useState<ChartTrendMode>('dual_trend');
  const [selectedMonth, setSelectedMonth] = useState<MonthlyConsumptionData | null>(null);
  const [showDots, setShowDots] = useState<boolean>(true);
  const [fillOpacity, setFillOpacity] = useState<number>(0.35);

  // Computations
  const maxWaterMonth = useMemo(() => {
    return [...data].sort((a, b) => b.waterTotalM3 - a.waterTotalM3)[0];
  }, [data]);

  const maxElectricityMonth = useMemo(() => {
    return [...data].sort((a, b) => b.electricityTotalKwh - a.electricityTotalKwh)[0];
  }, [data]);

  const avgWaterM3 = useMemo(() => {
    return Math.round(data.reduce((s, i) => s + i.waterTotalM3, 0) / data.length);
  }, [data]);

  const avgElectricityKwh = useMemo(() => {
    return Math.round(data.reduce((s, i) => s + i.electricityTotalKwh, 0) / data.length);
  }, [data]);

  // Normalized data for relative trend index comparison
  const normalizedData = useMemo(() => {
    const maxW = Math.max(...data.map((d) => d.waterTotalM3));
    const maxE = Math.max(...data.map((d) => d.electricityTotalKwh));
    return data.map((d) => ({
      ...d,
      waterIndex: Math.round((d.waterTotalM3 / maxW) * 100),
      electricityIndex: Math.round((d.electricityTotalKwh / maxE) * 100),
    }));
  }, [data]);

  // Active month default to July or hover
  const activeMonthData = selectedMonth || maxWaterMonth;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header and Control Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          <button
            onClick={() => setTrendMode('dual_trend')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              trendMode === 'dual_trend'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Сводный тренд (Э/э & Вода)
          </button>

          <button
            onClick={() => setTrendMode('water_layers')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              trendMode === 'water_layers'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Слои воды (Зима + Лето)
          </button>

          <button
            onClick={() => setTrendMode('electricity_layers')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              trendMode === 'electricity_layers'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Слои э/э (День Т1 + Ночь Т2)
          </button>

          <button
            onClick={() => setTrendMode('relative_index')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              trendMode === 'relative_index'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Сезонный индекс (%)
          </button>
        </div>
      </div>

      {/* Seasonal Insights Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-sky-800 font-semibold text-[11px]">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Пик водопотребления
            </span>
            <span className="font-mono">{maxWaterMonth.monthFull}</span>
          </div>
          <p className="text-xl font-bold font-mono text-sky-950">
            {maxWaterMonth.waterTotalM3.toLocaleString('ru-RU')} <span className="text-xs font-normal">м³</span>
          </p>
          <p className="text-[10px] text-sky-700">
            +{Math.round(((maxWaterMonth.waterTotalM3 - avgWaterM3) / avgWaterM3) * 100)}% выше среднемесячного
          </p>
        </div>

        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-amber-800 font-semibold text-[11px]">
            <span className="flex items-center gap-1">
              <Snowflake className="w-3.5 h-3.5 text-sky-500" />
              Пик электропотребления
            </span>
            <span className="font-mono">{maxElectricityMonth.monthFull}</span>
          </div>
          <p className="text-xl font-bold font-mono text-amber-950">
            {maxElectricityMonth.electricityTotalKwh.toLocaleString('ru-RU')} <span className="text-xs font-normal">кВт·ч</span>
          </p>
          <p className="text-[10px] text-amber-700">
            +{Math.round(((maxElectricityMonth.electricityTotalKwh - avgElectricityKwh) / avgElectricityKwh) * 100)}% нагрузка в морозы
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-700 font-semibold text-[11px]">
            <span>Среднее водопотребление</span>
            <span className="font-mono text-slate-500">12 мес.</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">
            {avgWaterM3.toLocaleString('ru-RU')} <span className="text-xs font-normal">м³/мес</span>
          </p>
          <p className="text-[10px] text-slate-500">
            Базовый зимний расход: ~1 600 м³/мес
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-700 font-semibold text-[11px]">
            <span>Среднее электропотребление</span>
            <span className="font-mono text-slate-500">12 мес.</span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">
            {avgElectricityKwh.toLocaleString('ru-RU')} <span className="text-xs font-normal">кВт·ч/мес</span>
          </p>
          <p className="text-[10px] text-slate-500">
            Летний минимум: ~30 300 кВт·ч (Июнь)
          </p>
        </div>
      </div>

      {/* Main Interactive Recharts Area Chart Container */}
      <div className="w-full h-84 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendMode === 'relative_index' ? normalizedData : data}
            margin={{ top: 15, right: 25, left: 10, bottom: 0 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload[0]) {
                setSelectedMonth(e.activePayload[0].payload as MonthlyConsumptionData);
              }
            }}
          >
            <defs>
              {/* Electricity Area Gradient */}
              <linearGradient id="electricityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>

              {/* Electricity Day Gradient */}
              <linearGradient id="elecDayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>

              {/* Electricity Night Gradient */}
              <linearGradient id="elecNightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.03} />
              </linearGradient>

              {/* Water Total Gradient */}
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
              </linearGradient>

              {/* Water Summer Gradient */}
              <linearGradient id="waterSummerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
              </linearGradient>

              {/* Water Winter Gradient */}
              <linearGradient id="waterWinterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0369a1" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#0369a1" stopOpacity={0.05} />
              </linearGradient>

              {/* Normalized Index Gradients */}
              <linearGradient id="waterIndexGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="elecIndexGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              tick={{ fill: '#64748b' }}
            />

            {/* DUAL TREND MODE (Left Axis: Electricity, Right Axis: Water) */}
            {trendMode === 'dual_trend' && (
              <>
                <YAxis
                  yAxisId="left"
                  stroke="#d97706"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  label={{
                    value: 'Электроэнергия (кВт·ч)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#d97706',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val}`}
                  label={{
                    value: 'Вода (м³)',
                    angle: 90,
                    position: 'insideRight',
                    fill: '#0284c7',
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    if (name.includes('кВт·ч')) return [`${val.toLocaleString('ru-RU')} кВт·ч`, name];
                    if (name.includes('м³')) return [`${val.toLocaleString('ru-RU')} м³`, name];
                    return [val, name];
                  }}
                  labelFormatter={(lbl) => {
                    const row = data.find((r) => r.month === lbl);
                    return row ? row.monthFull : lbl;
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="electricityTotalKwh"
                  name="Электроэнергия общая (кВт·ч)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#electricityGrad)"
                  dot={showDots ? { r: 3.5, strokeWidth: 1.5, fill: '#fff', stroke: '#d97706' } : false}
                  activeDot={{ r: 6, stroke: '#d97706', strokeWidth: 2, fill: '#fff' }}
                />

                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="waterTotalM3"
                  name="Водопотребление общее (м³)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#waterGrad)"
                  dot={showDots ? { r: 3.5, strokeWidth: 1.5, fill: '#fff', stroke: '#0284c7' } : false}
                  activeDot={{ r: 6, stroke: '#0284c7', strokeWidth: 2, fill: '#fff' }}
                />
              </>
            )}

            {/* WATER LAYERS (Stacked Area: Winter + Summer Water) */}
            {trendMode === 'water_layers' && (
              <>
                <YAxis
                  stroke="#0284c7"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val} м³`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val.toLocaleString('ru-RU')} м³`, name]}
                  labelFormatter={(lbl) => {
                    const row = data.find((r) => r.month === lbl);
                    return row ? row.monthFull : lbl;
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                <Area
                  type="monotone"
                  dataKey="waterWinterM3"
                  stackId="waterStack"
                  name="Зимний питьевой водопровод (м³)"
                  stroke="#0369a1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#waterWinterGrad)"
                />

                <Area
                  type="monotone"
                  dataKey="waterSummerM3"
                  stackId="waterStack"
                  name="Летний поливочный водопровод (м³)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#waterSummerGrad)"
                />
              </>
            )}

            {/* ELECTRICITY LAYERS (Stacked Area: Day T1 + Night T2) */}
            {trendMode === 'electricity_layers' && (
              <>
                <YAxis
                  stroke="#d97706"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k кВт·ч`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val.toLocaleString('ru-RU')} кВт·ч`, name]}
                  labelFormatter={(lbl) => {
                    const row = data.find((r) => r.month === lbl);
                    return row ? row.monthFull : lbl;
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                <Area
                  type="monotone"
                  dataKey="electricityDayKwh"
                  stackId="elecStack"
                  name="Дневная зона Т1 (кВт·ч)"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#elecDayGrad)"
                />

                <Area
                  type="monotone"
                  dataKey="electricityNightKwh"
                  stackId="elecStack"
                  name="Ночная зона Т2 (кВт·ч)"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#elecNightGrad)"
                />
              </>
            )}

            {/* RELATIVE SEASONAL DYNAMICS INDEX (0-100% of peak) */}
            {trendMode === 'relative_index' && (
              <>
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  domain={[0, 100]}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                  label={{
                    value: '% от годового максимума',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}% от максимума`, name]}
                  labelFormatter={(lbl) => {
                    const row = data.find((r) => r.month === lbl);
                    return row ? row.monthFull : lbl;
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                <Area
                  type="monotone"
                  dataKey="waterIndex"
                  name="Индекс водопотребления (пик: Июль 100%)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#waterIndexGrad)"
                  dot={showDots ? { r: 3, fill: '#0284c7' } : false}
                />

                <Area
                  type="monotone"
                  dataKey="electricityIndex"
                  name="Индекс электропотребления (пик: Январь 100%)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#elecIndexGrad)"
                  dot={showDots ? { r: 3, fill: '#d97706' } : false}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Month Inspector Detail Strip */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs font-mono font-bold text-slate-800 text-sm">
            {activeMonthData.monthFull}
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Показатели за выбранный месяц:</span>
            <div className="flex flex-wrap items-center gap-3 font-semibold mt-0.5">
              <span className="text-sky-800 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-sky-600" />
                {activeMonthData.waterTotalM3.toLocaleString('ru-RU')} м³ (Зима: {activeMonthData.waterWinterM3}, Лето: {activeMonthData.waterSummerM3})
              </span>
              <span className="text-amber-800 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                {activeMonthData.electricityTotalKwh.toLocaleString('ru-RU')} кВт·ч (Т1: {activeMonthData.electricityDayKwh}, Т2: {activeMonthData.electricityNightKwh})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Начислено: <b>{activeMonthData.costTotalRub.toLocaleString('ru-RU')} ₽</b>
          </span>
          <span className="font-mono bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
            Оплачено: <b>{activeMonthData.paidRub.toLocaleString('ru-RU')} ₽</b>
          </span>
        </div>
      </div>
    </div>
  );
};
