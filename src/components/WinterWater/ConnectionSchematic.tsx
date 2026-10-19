import React from 'react';

interface ConnectionSchematicProps {
  plotNumber: number;
  wellCode: string;
  pipeDiameterMm: number;
  pipeMaterial: string;
  meterModel: string;
  meterSerial: string;
  sealNumber: string;
  trenchDepthMeters: number;
  cableWatts: number;
  pressureAtm: number;
}

export const ConnectionSchematic: React.FC<ConnectionSchematicProps> = ({
  plotNumber,
  wellCode,
  pipeDiameterMm,
  pipeMaterial,
  meterModel,
  meterSerial,
  sealNumber,
  trenchDepthMeters,
  cableWatts,
  pressureAtm,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-bold text-sm text-sky-400">
            Графическая схема узла врезки и прибора учета (СП 30.13330 / ТУ ДТСН «Пенсионер»)
          </h4>
          <p className="text-xs text-slate-400">
            Участок № {plotNumber} &harr; Колодец {wellCode} | Рабочее давление сети: {pressureAtm} атм
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300">
          СХЕМА-ТИП-2026/В
        </span>
      </div>

      {/* SVG Technical Drawing */}
      <div className="w-full overflow-x-auto bg-slate-950 rounded-lg p-3 border border-slate-800">
        <svg
          viewBox="0 0 880 340"
          className="w-full min-w-[700px] h-auto font-sans select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Grid & Dimension Lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>
          <rect width="880" height="340" fill="url(#grid)" />

          {/* Ground Level Line */}
          <line x1="20" y1="70" x2="860" y2="70" stroke="#78716c" strokeWidth="3" strokeDasharray="6,4" />
          <text x="30" y="62" fill="#a8a29e" fontSize="11" fontWeight="600">
            Уровень поверхности земли (±0.000)
          </text>
          <text x="440" y="62" fill="#38bdf8" fontSize="11" fontWeight="600" textAnchor="middle">
            Глубина заложения траншеи H = {trenchDepthMeters.toFixed(1)} м (ниже глубины промерзания 2.4 м)
          </text>

          {/* LEFT: INSPECTION WELL SECTION (КОЛОДЕЦ КВ) */}
          <g transform="translate(60, 50)">
            {/* Well Shaft */}
            <rect x="0" y="20" width="160" height="230" fill="#1e293b" stroke="#64748b" strokeWidth="3" rx="4" />
            {/* Double Insulated Cover */}
            <rect x="25" y="10" width="110" height="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" rx="2" />
            <text x="80" y="2" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
              Люк + Пеноплекс 50мм
            </text>

            {/* Main Water Pipe in Well */}
            <rect x="-20" y="170" width="200" height="36" fill="#0369a1" stroke="#0284c7" strokeWidth="2" />
            <text x="80" y="192" fill="#e0f2fe" fontSize="10" textAnchor="middle" fontWeight="bold">
              Магистраль ПНД d110 (P={pressureAtm} атм)
            </text>

            {/* Saddle & Free Port Valve */}
            <rect x="70" y="145" width="20" height="25" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" />
            <circle cx="80" cy="140" r="10" fill="#dc2626" stroke="#f87171" strokeWidth="2" />
            <text x="80" y="125" fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">
              1. Кран Ду25 (латунь)
            </text>

            {/* Well Label */}
            <text x="80" y="270" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">
              Колодец {wellCode} (ж/б кольца КС-15.9)
            </text>
          </g>

          {/* MIDDLE: BURIED PIPELINE ROUTE WITH HEATING CABLE & INSULATION */}
          <g transform="translate(240, 50)">
            {/* Pipe Route */}
            <rect x="0" y="180" width="300" height="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" rx="3" />
            {/* Heating Cable Line (Red zigzag / strip) */}
            <line x1="0" y1="184" x2="300" y2="184" stroke="#ef4444" strokeWidth="3" strokeDasharray="8,4" />
            {/* Warning Tape */}
            <line x1="0" y1="120" x2="300" y2="120" stroke="#facc15" strokeWidth="3" strokeDasharray="10,5" />
            <text x="150" y="112" fill="#facc15" fontSize="9" textAnchor="middle" fontWeight="bold">
              Сигнальная лента «ОСТОРОЖНО, ВОДОПРОВОД»
            </text>

            {/* Labels */}
            <text x="150" y="218" fill="#93c5fd" fontSize="10" textAnchor="middle">
              Труба ПНД-100 d{pipeDiameterMm} в изоляции Energoflex 13мм + защитный кожух
            </text>
            <text x="150" y="172" fill="#f87171" fontSize="9" textAnchor="middle">
              Греющий кабель саморегулирующийся {cableWatts} Вт/м
            </text>

            {/* Dimension Arrow */}
            <line x1="10" y1="20" x2="10" y2="180" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x="20" y="100" fill="#94a3b8" fontSize="10">
              H = {trenchDepthMeters} м
            </text>
          </g>

          {/* RIGHT: CONSUMER METERING UNIT (УЗЕЛ УЧЕТА В ДОМЕ / КЕССОНЕ) */}
          <g transform="translate(560, 40)">
            {/* House Wall / Basement Box */}
            <rect x="0" y="15" width="280" height="255" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
            <text x="140" y="5" fill="#f1f5f9" fontSize="11" textAnchor="middle" fontWeight="bold">
              Узел ввода и учета (Дом / Участок № {plotNumber})
            </text>

            {/* Wall Penetration Sleeve (Гильза герметичная) */}
            <rect x="-10" y="185" width="30" height="30" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="5" y="178" fill="#94a3b8" fontSize="8" textAnchor="middle">
              Гильза
            </text>

            {/* In-house Pipe Section */}
            {/* 1. Shutoff Valve */}
            <circle cx="50" cy="200" r="10" fill="#ca8a04" stroke="#eab308" strokeWidth="2" />
            <text x="50" y="224" fill="#fde047" fontSize="8" textAnchor="middle">
              2. Вводной кран
            </text>

            {/* 2. Slanted Strainer Filter (Грязевик / Косой фильтр) */}
            <polygon points="85,190 105,200 85,210" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="95" y="224" fill="#7dd3fc" fontSize="8" textAnchor="middle">
              3. Фильтр 300мкм
            </text>

            {/* 3. Water Meter with Pulse output and SEALS */}
            <rect x="130" y="186" width="60" height="28" fill="#0f766e" stroke="#14b8a6" strokeWidth="2" rx="3" />
            <circle cx="160" cy="200" r="8" fill="#134e4a" />
            <rect x="175" y="182" width="10" height="10" fill="#dc2626" stroke="#f87171" strokeWidth="1.5" />
            <text x="160" y="174" fill="#5eead4" fontSize="9" textAnchor="middle" fontWeight="bold">
              4. {meterModel}
            </text>
            <text x="160" y="225" fill="#fca5a5" fontSize="8" textAnchor="middle">
              Пломба № {sealNumber}
            </text>

            {/* 4. Check Valve (Обратный клапан) */}
            <polygon points="215,200 235,190 235,210" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1.5" />
            <text x="225" y="224" fill="#c4b5fd" fontSize="8" textAnchor="middle">
              5. Обр. клапан
            </text>

            {/* 5. Distribution to house */}
            <line x1="235" y1="200" x2="270" y2="200" stroke="#38bdf8" strokeWidth="4" />
            <text x="255" y="185" fill="#38bdf8" fontSize="8">
              В сеть дома
            </text>

            {/* Thermostat / Cable Power Plug */}
            <rect x="30" y="60" width="90" height="50" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" rx="3" />
            <text x="75" y="80" fill="#f87171" fontSize="9" textAnchor="middle" fontWeight="bold">
              Терморегулятор
            </text>
            <text x="75" y="96" fill="#cbd5e1" fontSize="8" textAnchor="middle">
              Вкл при t &lt; +3°C
            </text>
            <path d="M 75 110 L 75 185" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Meter Serial Spec Box */}
            <rect x="135" y="60" width="135" height="50" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" rx="3" />
            <text x="202" y="78" fill="#5eead4" fontSize="8" textAnchor="middle" fontWeight="bold">
              Зав. № {meterSerial}
            </text>
            <text x="202" y="94" fill="#94a3b8" fontSize="8" textAnchor="middle">
              Импульсный выход (ДУ 15)
            </text>
          </g>
        </svg>
      </div>

      {/* Specification Legend Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-lg border border-slate-800">
        <div>
          <h5 className="font-semibold text-slate-200 mb-1.5">Спецификация оборудования колодца и трассы:</h5>
          <ul className="space-y-1 text-slate-300">
            <li>• Седелка компрессионная ПНД d110х32 с латунным шаровым краном 1"</li>
            <li>• Труба напорная {pipeMaterial}</li>
            <li>• Саморегулирующийся нагревательный кабель мощностью {cableWatts} Вт/м</li>
            <li>• Теплоизоляция из вспененного полиэтилена толщиной не менее 13 мм</li>
            <li>• Песчаная подушка 150 мм под трубу с ручной подбивкой пазух</li>
          </ul>
        </div>
        <div>
          <h5 className="font-semibold text-slate-200 mb-1.5">Требования к узлу учета расхода воды:</h5>
          <ul className="space-y-1 text-slate-300">
            <li>• Прибор учета расхода воды: {meterModel} (поверка до 2032 г.)</li>
            <li>• Номер установленной номерной антимагнитной пломбы: <b>{sealNumber}</b></li>
            <li>• Фильтр магнитно-механический грубой очистки (косой) с проушиной под пломбировку</li>
            <li>• Обратный клапан муфтовый пружинный Ду 15 во избежание обратного тока</li>
            <li>• Пломбировка выполняется главным инженером ДТСН в присутствии собственника</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
