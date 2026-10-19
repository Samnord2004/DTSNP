import React, { useState, useMemo } from 'react';
import { Plot, Well, WinterConnectionRequest, UserProfile } from '../../types/index.ts';
import { findNearestWellWithFreePorts, calculateTrenchParameters } from '../../utils/geoUtils';
import { ConnectionSchematic } from './ConnectionSchematic';
import {
  Droplet,
  Compass,
  CheckCircle,
  AlertCircle,
  FileText,
  Sliders,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Info,
  Layers,
  Sparkles,
  Calculator,
} from 'lucide-react';

interface WinterWaterWizardProps {
  plots: Plot[];
  wells: Well[];
  currentUser: UserProfile;
  preselectedPlot?: Plot | null;
  onSaveRequest: (newRequest: WinterConnectionRequest) => void;
  onOpenDocuments: (req: WinterConnectionRequest, plot: Plot, well: Well) => void;
  onClose: () => void;
}

export const WinterWaterWizard: React.FC<WinterWaterWizardProps> = ({
  plots,
  wells,
  currentUser,
  preselectedPlot,
  onSaveRequest,
  onOpenDocuments,
  onClose,
}) => {
  // Wizard Steps: 1 = Plot & Well Selection, 2 = Tech Specs Verification, 3 = Meter & Schematic, 4 = Final Approval & Documents
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Available candidate plots without active winter connection
  const candidatePlots = useMemo(() => {
    return plots.filter((p) => !p.utilities.winterWater.connected);
  }, [plots]);

  const [selectedPlotId, setSelectedPlotId] = useState<string>(
    preselectedPlot ? preselectedPlot.id : candidatePlots[0]?.id || ''
  );

  const selectedPlot = useMemo(() => {
    return plots.find((p) => p.id === selectedPlotId) || plots[0];
  }, [plots, selectedPlotId]);

  // Nearest well calculation with free ports
  const nearestWellData = useMemo(() => {
    if (!selectedPlot) return null;
    return findNearestWellWithFreePorts(selectedPlot.coordinates, wells);
  }, [selectedPlot, wells]);

  // Selected well override (defaults to nearest)
  const [selectedWellId, setSelectedWellId] = useState<string>('');

  // Sync selected well when nearest changes
  React.useEffect(() => {
    if (nearestWellData?.well) {
      setSelectedWellId(nearestWellData.well.id);
    }
  }, [nearestWellData]);

  const currentWell = useMemo(() => {
    return wells.find((w) => w.id === selectedWellId) || nearestWellData?.well || wells[0];
  }, [wells, selectedWellId, nearestWellData]);

  // Form Parameters
  const [pipeDiameter, setPipeDiameter] = useState<number>(32);
  const [trenchDepth, setTrenchDepth] = useState<number>(2.80);
  const [heatingCableWatts, setHeatingCableWatts] = useState<number>(17);
  const [insulationType, setInsulationType] = useState<string>('Energoflex Super 35/13 мм + защитный ПНД кожух');
  const [meterModel, setMeterModel] = useState<string>('Бетар СХВ-15 (с импульсным выходом)');
  const [meterSerial, setMeterSerial] = useState<string>(`СХВ-${Math.floor(100000 + Math.random() * 900000)}`);
  const [sealNumber, setSealNumber] = useState<string>(`РТ-${Math.floor(100000 + Math.random() * 900000)}`);
  const [initialReading, setInitialReading] = useState<number>(0.0);
  const [crossesRoad, setCrossesRoad] = useState<boolean>(true);
  const [crossesPowerCable, setCrossesPowerCable] = useState<boolean>(true);
  const [crossesGas, setCrossesGas] = useState<boolean>(false);
  const [engineerNotes, setEngineerNotes] = useState<string>(
    'Техническая возможность подключения подтверждена. Рабочее давление в колодце в норме.'
  );

  // Distances and Trench specs
  const routeLengthMeters = useMemo(() => {
    if (!nearestWellData) return 40;
    return nearestWellData.estimatedRouteLengthMeters;
  }, [nearestWellData]);

  const directDistanceMeters = useMemo(() => {
    if (!nearestWellData) return 30;
    return nearestWellData.directDistanceMeters;
  }, [nearestWellData]);

  const trenchParams = useMemo(() => {
    return calculateTrenchParameters(routeLengthMeters, trenchDepth, 0.6);
  }, [routeLengthMeters, trenchDepth]);

  // Tech Specs Validation Warnings
  const validationWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!currentWell) {
      warnings.push('Внимание: не найден доступный колодец со свободными точками подключения.');
      return warnings;
    }
    if (currentWell.freePorts <= 0) {
      warnings.push(`В выбранном колодце ${currentWell.code} отсутствуют свободные точки подключения!`);
    }
    if (trenchDepth < 2.6) {
      warnings.push('Глубина заложения менее 2.6 м! В Новосибирске глубина промерзания достигает 2.2-2.4 м, требуется глубина не менее 2.8 м.');
    }
    if (currentWell.nominalPressureAtm < 3.5) {
      warnings.push('Давление в колодце ниже 3.5 атм. Возможен слабый напор на втором этаже в часы пикового водоразбора.');
    }
    if (heatingCableWatts < 16) {
      warnings.push('Рекомендуется мощность греющего кабеля не менее 16-17 Вт/м для сибирских морозов (-35°C..-40°C).');
    }
    return warnings;
  }, [currentWell, trenchDepth, heatingCableWatts]);

  // Construct request object
  const generatedRequest: WinterConnectionRequest = useMemo(() => {
    return {
      id: `req-${selectedPlot.number}-${Date.now()}`,
      requestNumber: `ЗВ-2026/${selectedPlot.number.toString().padStart(3, '0')}`,
      plotNumber: selectedPlot.number,
      ownerName: selectedPlot.ownerName,
      ownerPhone: selectedPlot.phone,
      cadastralNumber: selectedPlot.cadastralNumber,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'tu_issued',
      selectedWellId: currentWell?.id || 'w-1',
      selectedWellCode: currentWell?.code || 'КВ-01',
      wellDistanceMeters: directDistanceMeters,
      pipeRouteLengthMeters: routeLengthMeters,
      pipeDiameterMm: pipeDiameter,
      pipeMaterial: `ПНД-100 SDR 11 PN16 d${pipeDiameter}х3.0 мм (ГОСТ 18599-2001)`,
      trenchDepthMeters: trenchDepth,
      trenchLengthMeters: routeLengthMeters,
      pressureAtWellAtm: currentWell?.nominalPressureAtm || 4.1,
      hasHeatingCable: true,
      heatingCableWattsPerMeter: heatingCableWatts,
      heatingCableLengthMeters: trenchParams.heatingCableLengthMeters,
      insulationType,
      meterModel,
      meterSerial,
      initialReading,
      sealNumber,
      crossesRoad,
      crossesPowerCable,
      crossesGas,
      tuIssuedDate: new Date().toISOString().split('T')[0],
      contractNumber: `ДЗВ-${selectedPlot.number}/26`,
      approvedByChairman: currentUser.role === 'chairman' || currentUser.permissions.canSignContracts,
      approvedByEngineer: true,
      notes: engineerNotes,
    };
  }, [
    selectedPlot,
    currentWell,
    directDistanceMeters,
    routeLengthMeters,
    pipeDiameter,
    trenchDepth,
    heatingCableWatts,
    trenchParams,
    insulationType,
    meterModel,
    meterSerial,
    initialReading,
    sealNumber,
    crossesRoad,
    crossesPowerCable,
    crossesGas,
    engineerNotes,
    currentUser,
  ]);

  const handleFinalSubmit = () => {
    onSaveRequest(generatedRequest);
    onOpenDocuments(generatedRequest, selectedPlot, currentWell);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 text-slate-100 shadow-2xl space-y-6">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
              <Droplet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">
              Мастер технологического присоединения к зимнему водопроводу
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Автоматизированный расчет трассы до колодца со свободными точками, контроль параметров и выпуск пакета документов
          </p>
        </div>

        <button
          onClick={onClose}
          className="self-start sm:self-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
        >
          Закрыть
        </button>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div
          onClick={() => setCurrentStep(1)}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            currentStep === 1
              ? 'border-sky-500 bg-sky-950/60 text-white font-semibold'
              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] text-slate-500 font-mono">ШАГ 1</div>
          <div className="truncate">Участок & Поиск колодца</div>
        </div>

        <div
          onClick={() => setCurrentStep(2)}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            currentStep === 2
              ? 'border-sky-500 bg-sky-950/60 text-white font-semibold'
              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] text-slate-500 font-mono">ШАГ 2</div>
          <div className="truncate">Контроль ТУ & Земляные работы</div>
        </div>

        <div
          onClick={() => setCurrentStep(3)}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            currentStep === 3
              ? 'border-sky-500 bg-sky-950/60 text-white font-semibold'
              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] text-slate-500 font-mono">ШАГ 3</div>
          <div className="truncate">Схема узла & Счетчик</div>
        </div>

        <div
          onClick={() => setCurrentStep(4)}
          className={`cursor-pointer p-3 rounded-xl border transition-all ${
            currentStep === 4
              ? 'border-sky-500 bg-sky-950/60 text-white font-semibold'
              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] text-slate-500 font-mono">ШАГ 4</div>
          <div className="truncate">Выпуск ТУ & Договор</div>
        </div>
      </div>

      {/* STEP 1: УЧАСТОК И АВТОМАТИЧЕСКИЙ ПОИСК КОЛОДЦА */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plot selection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                1. Выберите земельный участок заявителя:
              </label>
              <select
                value={selectedPlotId}
                onChange={(e) => setSelectedPlotId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {candidatePlots.map((p) => (
                  <option key={p.id} value={p.id}>
                    Участок № {p.number} — {p.street} ({p.ownerName})
                  </option>
                ))}
              </select>

              {/* Plot details card */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Собственник:</span>
                  <span className="font-semibold text-white">{selectedPlot.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Кадастровый номер:</span>
                  <span className="font-mono text-slate-300">{selectedPlot.cadastralNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Площадь участка:</span>
                  <span className="text-slate-300">{selectedPlot.areaSqm} кв.м</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Телефон заявителя:</span>
                  <span className="text-slate-300">{selectedPlot.phone}</span>
                </div>
              </div>
            </div>

            {/* Nearest Well Analysis Card */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                2. Результат поиска ближайшего колодца со свободными точками:
              </label>

              {currentWell ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        {currentWell.name}
                      </h4>
                      <p className="text-[11px] font-mono text-emerald-300">{currentWell.code}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold text-xs">
                      {currentWell.freePorts} своб. врезок
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Прямое расстояние:</span>
                      <span className="font-mono font-bold text-slate-200">{directDistanceMeters} м</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Трасса по меже/улице:</span>
                      <span className="font-mono font-bold text-sky-400">{routeLengthMeters} м</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Давление в колодце:</span>
                      <span className="font-mono font-bold text-slate-200">{currentWell.nominalPressureAtm} атм</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Глубина колодца:</span>
                      <span className="font-mono text-slate-200">{currentWell.depthMeters} м</span>
                    </div>
                  </div>

                  {/* Choose other eligible well if needed */}
                  {nearestWellData && nearestWellData.allEligibleWells.length > 1 && (
                    <div className="pt-2 border-t border-emerald-900/60">
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Или выбрать другой доступный колодец:
                      </label>
                      <select
                        value={selectedWellId}
                        onChange={(e) => setSelectedWellId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white"
                      >
                        {nearestWellData.allEligibleWells.map(({ well, distanceMeters }) => (
                          <option key={well.id} value={well.id}>
                            {well.code} ({well.name}) — {distanceMeters}м, {well.freePorts} своб. врезок
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-rose-950/40 border border-rose-600 rounded-xl text-xs text-rose-300">
                  <AlertCircle className="w-5 h-5 mb-2 text-rose-400" />
                  Нет доступных колодцев со свободными штуцерами! Требуется реконструкция распределительного узла или установка дополнительного коллектора.
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!currentWell || currentWell.freePorts <= 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg shadow-lg transition-all"
            >
              <span>Далее: Технические характеристики и земляные работы</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ И РАСЧЕТ ЗЕМЛЯНЫХ РАБОТ */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Validation Banner */}
          {validationWarnings.length > 0 && (
            <div className="p-3 bg-amber-950/50 border border-amber-600/60 rounded-xl text-xs text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                Контроль соответствия строительным нормам и регламенту ДТСН:
              </div>
              {validationWarnings.map((w, idx) => (
                <p key={idx}>• {w}</p>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left Column: Technical Node Parameters */}
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                Параметры укладки трубопровода
              </h4>

              <div>
                <label className="text-slate-400 block mb-1">
                  Глубина траншеи (м) — норматив для НСО: не менее 2.80 м
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="3.5"
                    value={trenchDepth}
                    onChange={(e) => setTrenchDepth(parseFloat(e.target.value) || 2.8)}
                    className="w-28 bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs"
                  />
                  <span className="text-slate-400">м (с учетом песчаной подушки 150 мм)</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Диаметр трубы (мм) и материал
                </label>
                <select
                  value={pipeDiameter}
                  onChange={(e) => setPipeDiameter(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                >
                  <option value={32}>ПНД-100 SDR 11 PN16 d32х3.0 мм (Стандартный абонентский ввод)</option>
                  <option value={40}>ПНД-100 SDR 11 PN16 d40х3.7 мм (Увеличенный расход / 2 дома)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Мощность греющего кабеля (Вт/пог.м)
                </label>
                <select
                  value={heatingCableWatts}
                  onChange={(e) => setHeatingCableWatts(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                >
                  <option value={17}>17 Вт/м (Саморегулирующийся с терморегулятором +3°C)</option>
                  <option value={24}>24 Вт/м (Усиленный для открытых гильз и проходов под дорогой)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Теплоизоляция трубы</label>
                <input
                  type="text"
                  value={insulationType}
                  onChange={(e) => setInsulationType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs"
                />
              </div>

              {/* Crossing checklist */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block">Пересечения и согласования:</span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={crossesRoad}
                    onChange={(e) => setCrossesRoad(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-0"
                  />
                  <span>Пересекает дорогу (прокол в стальном футляре Ду100)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={crossesPowerCable}
                    onChange={(e) => setCrossesPowerCable(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-0"
                  />
                  <span>Пересекает кабель 0.4кВ (ручная копка в присутствии энергетика)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={crossesGas}
                    onChange={(e) => setCrossesGas(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-0"
                  />
                  <span>Охранная зона газопровода (согласование с газовой службой)</span>
                </label>
              </div>
            </div>

            {/* Right Column: Automated Earthworks Calculation & Estimates */}
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Расчет земляных работ и ориентировочная смета
              </h4>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between p-2 bg-slate-900 rounded">
                  <span className="text-slate-400">Длина трассы трубы:</span>
                  <span className="text-white font-bold">{routeLengthMeters} м</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded">
                  <span className="text-slate-400">Объем выемки грунта траншеи:</span>
                  <span className="text-white font-bold">{trenchParams.trenchVolumeCbm} м³</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded">
                  <span className="text-slate-400">Песчаная подушка (15 см):</span>
                  <span className="text-white">{trenchParams.sandBeddingCbm} м³</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded">
                  <span className="text-slate-400">Кабель греющий (с запасом 8%):</span>
                  <span className="text-white">{trenchParams.heatingCableLengthMeters} м</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-900 rounded">
                  <span className="text-slate-400">Сигнальная лента с надписью:</span>
                  <span className="text-white">{trenchParams.warningTapeLengthMeters} м</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Земляные работы (мини-экскаватор):</span>
                  <span>{trenchParams.costBreakdown.earthworksMechanizedCost.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Труба ПНД d{pipeDiameter} SDR11:</span>
                  <span>{trenchParams.costBreakdown.pipeCost.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Греющий кабель и автоматика:</span>
                  <span>{trenchParams.costBreakdown.cableCost.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Арматура, врезка, запорные краны:</span>
                  <span>{trenchParams.costBreakdown.fittingAndValveCost.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between font-bold text-sky-400 pt-2 border-t border-slate-800">
                  <span>Итого материалы + механизация:</span>
                  <span className="text-sm font-mono">{trenchParams.costBreakdown.totalEstimatedCost.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Особые указания инженера ДТСН в ТУ:</label>
                <textarea
                  rows={2}
                  value={engineerNotes}
                  onChange={(e) => setEngineerNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад: Выбор участка</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-lg transition-all"
            >
              <span>Далее: Графическая схема узла и учет</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ГРАФИЧЕСКАЯ СХЕМА И УЧЕТ */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Модель счетчика воды:</label>
              <input
                type="text"
                value={meterModel}
                onChange={(e) => setMeterModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Заводской номер счетчика:</label>
              <input
                type="text"
                value={meterSerial}
                onChange={(e) => setMeterSerial(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Номер пломбы ДТСН:</label>
              <input
                type="text"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Interactive Schematic View */}
          <ConnectionSchematic
            plotNumber={selectedPlot.number}
            wellCode={currentWell.code}
            pipeDiameterMm={pipeDiameter}
            pipeMaterial={`ПНД-100 SDR 11 PN16 d${pipeDiameter}х3.0`}
            meterModel={meterModel}
            meterSerial={meterSerial}
            sealNumber={sealNumber}
            trenchDepthMeters={trenchDepth}
            cableWatts={heatingCableWatts}
            pressureAtm={currentWell.nominalPressureAtm}
          />

          {/* Stepper Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад: Параметры ТУ</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-lg transition-all"
            >
              <span>Далее: Согласование Правлением и оформление документов</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: СОГЛАСОВАНИЕ ПРАВЛЕНИЕМ И ОФОРМЛЕНИЕ ПАКЕТА ДОКУМЕНТОВ */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Сводная ведомость технологического присоединения № {generatedRequest.requestNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Готовность к утверждению Правлением и выдаче полного пакета документов
                </p>
              </div>
              <span className="px-3 py-1 bg-sky-950 border border-sky-600 text-sky-400 text-xs font-bold rounded-lg">
                Статус: ТУ сформированы
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block">Абонент:</span>
                <p className="font-semibold text-white">{selectedPlot.ownerName}</p>
                <p className="text-slate-400">Участок № {selectedPlot.number} ({selectedPlot.street})</p>
                <p className="font-mono text-slate-500">{selectedPlot.cadastralNumber}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block">Параметры врезки:</span>
                <p className="font-semibold text-sky-400">Колодец {currentWell.code}</p>
                <p className="text-slate-300">Длина трассы: {routeLengthMeters} м (глубина {trenchDepth} м)</p>
                <p className="text-slate-300">Труба: d{pipeDiameter} SDR11, P = {currentWell.nominalPressureAtm} атм</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block">Пакет формируемых актов:</span>
                <p className="text-emerald-400 flex items-center gap-1">✓ 1. Технические условия (ТУ-В-2026/{selectedPlot.number})</p>
                <p className="text-emerald-400 flex items-center gap-1">✓ 2. Графическая схема узла подключения</p>
                <p className="text-emerald-400 flex items-center gap-1">✓ 3. Договор с ДТСН «Пенсионер»</p>
                <p className="text-emerald-400 flex items-center gap-1">✓ 4. Акт гидроиспытаний на 6.0 атм</p>
                <p className="text-emerald-400 flex items-center gap-1">✓ 5. Акт опломбировки прибора учёта</p>
              </div>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад: Схема</span>
            </button>

            <button
              onClick={handleFinalSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white text-xs font-bold rounded-xl shadow-xl transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Открыть и распечатать официальный пакет документов</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
