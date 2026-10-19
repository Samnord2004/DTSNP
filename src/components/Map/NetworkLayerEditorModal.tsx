import React, { useState } from 'react';
import {
  Coordinates,
  UtilityType,
  PipelineSegment,
  Well,
  Valve,
  Switchboard,
  Substation,
  FireHydrant,
  BarrierGate,
  AdministrationFacility,
} from '../../types/index.ts';
import {
  Wrench,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Layers,
  MapPin,
  Save,
  X,
  Gauge,
  Zap,
  Droplet,
  Flame,
  Shield,
  FileText,
  Radio,
  Phone,
} from 'lucide-react';

export type EditableObjectType =
  | 'pipeline'
  | 'well'
  | 'valve'
  | 'switchboard'
  | 'substation'
  | 'fireHydrant'
  | 'lightPole'
  | 'wifiHotspot'
  | 'barrierGate'
  | 'adminFacility';

export interface NetworkEditorModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  objectType: EditableObjectType;
  initialData?: any;
  defaultCoordinates?: Coordinates;
  defaultPath?: Coordinates[];
  onSave: (type: EditableObjectType, data: any) => void;
  onDelete?: (type: EditableObjectType, id: string) => void;
  onClose: () => void;
}

export const NetworkLayerEditorModal: React.FC<NetworkEditorModalProps> = ({
  isOpen,
  mode,
  objectType,
  initialData,
  defaultCoordinates,
  defaultPath,
  onSave,
  onDelete,
  onClose,
}) => {
  if (!isOpen) return null;

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Common Fields
  const [code, setCode] = useState(initialData?.code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [condition, setCondition] = useState<
    'excellent' | 'normal' | 'requires_maintenance' | 'critical'
  >(initialData?.condition || 'normal');
  const [deviceSchematic, setDeviceSchematic] = useState(
    initialData?.deviceSchematic || ''
  );
  const [maintenanceTasks, setMaintenanceTasks] = useState<string[]>(
    initialData?.maintenanceTasks || []
  );
  const [newTaskInput, setNewTaskInput] = useState('');
  const [lat, setLat] = useState<number>(
    initialData?.coordinates?.lat || defaultCoordinates?.lat || 55.098612
  );
  const [lng, setLng] = useState<number>(
    initialData?.coordinates?.lng || defaultCoordinates?.lng || 82.900919
  );
  const [locationDetails, setLocationDetails] = useState(
    initialData?.locationDetails || ''
  );

  // Pipeline Specific
  const [networkType, setNetworkType] = useState<UtilityType>(
    initialData?.networkType || 'water_winter'
  );
  const [subType, setSubType] = useState<string>(
    initialData?.subType || 'winter'
  );
  const [diameterMm, setDiameterMm] = useState<number>(
    initialData?.diameterMm || 32
  );
  const [material, setMaterial] = useState<string>(
    initialData?.material || 'ПНД-100 SDR 11 PN16 d32х3.0 мм'
  );
  const [depthMeters, setDepthMeters] = useState<number>(
    initialData?.depthMeters !== undefined ? initialData.depthMeters : 2.8
  );
  const [pressureNominal, setPressureNominal] = useState<string>(
    initialData?.pressureNominal || '4.0 атм'
  );
  const [installYear, setInstallYear] = useState<number>(
    initialData?.installYear || 2024
  );
  const [description, setDescription] = useState(
    initialData?.description || ''
  );

  // Well Specific
  const [wellType, setWellType] = useState<'water_winter' | 'water_summer' | 'sewer'>(
    initialData?.type || 'water_winter'
  );
  const [wellMaterial, setWellMaterial] = useState<'reinforced_concrete' | 'polymer'>(
    initialData?.material || 'reinforced_concrete'
  );
  const [totalPorts, setTotalPorts] = useState<number>(initialData?.totalPorts || 6);
  const [usedPorts, setUsedPorts] = useState<number>(initialData?.usedPorts || 2);
  const [nominalPressureAtm, setNominalPressureAtm] = useState<number>(
    initialData?.nominalPressureAtm || 4.1
  );
  const [hasHeatingCable, setHasHeatingCable] = useState<boolean>(
    initialData?.hasHeatingCable ?? true
  );
  const [hasInsulatedLid, setHasInsulatedLid] = useState<boolean>(
    initialData?.hasInsulatedLid ?? true
  );
  const [wellNotes, setWellNotes] = useState<string>(initialData?.notes || '');
  const [meterModel, setMeterModel] = useState<string>(
    initialData?.meterModel || ''
  );
  const [meterSerial, setMeterSerial] = useState<string>(
    initialData?.meterSerial || ''
  );
  const [sealNumber, setSealNumber] = useState<string>(
    initialData?.sealNumber || ''
  );

  // Valve Specific
  const [valveType, setValveType] = useState<
    'gate_valve' | 'ball_valve' | 'check_valve' | 'air_vent'
  >(initialData?.type || 'gate_valve');
  const [valveState, setValveState] = useState<'open' | 'closed' | 'emergency'>(
    initialData?.state || 'open'
  );

  // Switchboard Specific
  const [substationCode, setSubstationCode] = useState<string>(
    initialData?.substationCode || 'КТПН-1'
  );
  const [mainBreakerAmps, setMainBreakerAmps] = useState<number>(
    initialData?.mainBreakerAmps || 100
  );
  const [feederCount, setFeederCount] = useState<number>(
    initialData?.feederCount || 4
  );
  const [switchboardMeterModel, setSwitchboardMeterModel] = useState<string>(
    initialData?.meterModel || 'Меркурий 230 АМ-01'
  );
  const [switchboardMeterSerial, setSwitchboardMeterSerial] = useState<string>(
    initialData?.meterSerial || 'М230-' + Math.floor(10000 + Math.random() * 90000)
  );

  // Substation Specific
  const [powerKva, setPowerKva] = useState<number>(initialData?.powerKva || 400);
  const [voltageKv, setVoltageKv] = useState<string>(
    initialData?.voltageKv || '10 / 0.4 кВ'
  );
  const [currentLoadPercent, setCurrentLoadPercent] = useState<number>(
    initialData?.currentLoadPercent || 65
  );
  const [groundingResistanceOhm, setGroundingResistanceOhm] = useState<number>(
    initialData?.groundingResistanceOhm || 3.4
  );

  // Fire Hydrant Specific
  const [hydrantStaticPressureAtm, setHydrantStaticPressureAtm] = useState<number>(
    initialData?.staticPressureAtm || 3.8
  );
  const [hydrantFlowRateLps, setHydrantFlowRateLps] = useState<number>(
    initialData?.flowRateLps || 22
  );
  const [winterInsulationDone, setWinterInsulationDone] = useState<boolean>(
    initialData?.winterInsulationDone ?? true
  );

  // Add a task to maintenanceTasks
  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setMaintenanceTasks([...maintenanceTasks, newTaskInput.trim()]);
    setNewTaskInput('');
  };

  // Remove a task
  const handleRemoveTask = (index: number) => {
    setMaintenanceTasks(maintenanceTasks.filter((_, i) => i !== index));
  };

  // Quick Schematics Presets
  const applyPresetSchematic = (preset: string) => {
    if (preset === 'winter_well') {
      setDeviceSchematic(
        'Колодец из ЖБ колец КС-15.9, гидроизоляция битумным праймером в 2 слоя. Обвязка: стальной тройник 110х63, гребенка на 6 штуцеров с шаровыми кранами Valtec PN25 d32мм, грязевик сетчатый Ду50, воздухоотводчик автоматический. Ввод греющего саморегулирующегося кабеля 17 Вт/м через муфту сальниковую 1/2".'
      );
      if (maintenanceTasks.length === 0) {
        setMaintenanceTasks([
          'Проверка герметичности сальниковых вводов и кранов',
          'Откачка дренажного приямка от ила и наносов',
          'Проверка целостности термоизоляционного вкладыша крышки',
        ]);
      }
    } else if (preset === 'summer_tap') {
      setDeviceSchematic(
        'Летний поливочный вывод: подземная врезка в магистраль летнего водопровода d63 через седелочный отвод, стояк ПНД d32 мм с защитной металлической гильзой, шаровой латунный кран Valtec 1" со штуцером под шланг. В нижней точке смонтирован сливной кран Ду15 для продувки и консервации на зиму.'
      );
      if (maintenanceTasks.length === 0) {
        setMaintenanceTasks([
          'Весеннее расконсервирование и опрессовка узла',
          'Осенний слив воды и продувка сжатым воздухом до наступления заморозков',
        ]);
      }
    } else if (preset === 'metering_node') {
      setDeviceSchematic(
        'Узел коммерческого учета холодной воды: кран шаровый Valtec Base Ду32, фильтр грубой очистки Valtec 300 мкм, счетчик Бетар СХВ-15 с импульсным датчиком (цена импульса 10 л/имп), обратный клапан пружинный, манометр поверочный 0-10 бар с трехходовым краном.'
      );
      setMeterModel('Бетар СХВ-15 (с импульсным выходом)');
      setSealNumber(`РТ-${Math.floor(100000 + Math.random() * 900000)}`);
      if (maintenanceTasks.length === 0) {
        setMaintenanceTasks([
          'Контрольная проверка пломбы энергоснабжающей организации',
          'Сверка показаний прибора учета с журналом обхода',
          'Очистка фильтра-грязевика перед прибором учета',
        ]);
      }
    } else if (preset === 'switchboard_vr') {
      setDeviceSchematic(
        'Металлический распределительный шкаф IP65 с порошковым напылением. Вводной рубильник ВР32-35В 250А, 3 трансформатора тока Т-0.66 250/5, сборные медные шины ШМТ 30х4мм, 8 групп отходящих 3-фазных автоматических выключателей ВА47-100 с характеристикой D. Блок астротаймера уличного освещения РЭВ-303.'
      );
      setSwitchboardMeterModel('Меркурий 234 ARTM-01 D');
      if (maintenanceTasks.length === 0) {
        setMaintenanceTasks([
          'Протяжка силовых болтовых контактов динамометрическим ключом',
          'Продувка шкафа от пыли сухим сжатым воздухом',
          'Тепловизионный контроль контактных соединений под нагрузкой',
        ]);
      }
    } else if (preset === 'telecom_node') {
      setDeviceSchematic(
        'Слаботочный шкаф уличный климатический IP65 с обогревом. Оптический кросс КРС-16, оптический свитч управляемый 8x 1000BASE-T PoE+ (802.3at) 150W, блок защиты от грозовых перенапряжений, источник бесперебойного питания 12V/7Ah. Подключение видеокамер наблюдения 5Мп и точки доступа Wi-Fi.'
      );
      if (maintenanceTasks.length === 0) {
        setMaintenanceTasks([
          'Проверка работоспособности климатического термостата шкафа',
          'Тестирование резервного АКБ питания телеметрии',
          'Очистка оптики и визуальный контроль гермовводов кабелей',
        ]);
      }
    } else if (preset === 'gate_valve') {
      setDeviceSchematic(
        'Чугунная задвижка с обрезиненным клином и невыдвижным шпинделем Ду100 Ру16 (ГОСТ 5762-2002). Телескопический шток управления с выходом под ковер чугунный тип С на опорной ЖБ плите УОП-6. Закрытие по часовой стрелке.'
      );
      if (maintenanceTasks.length === 0) {
        setMaintenanceTasks([
          'Полная прокрутка штока задвижки (открытие-закрытие) для предотвращения закисания',
          'Смазка резьбовой части штока водостойкой смазкой Литол-24',
          'Очистка ковера от песка и проверка доступности ключа',
        ]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const id = initialData?.id || `${objectType}-${Date.now()}`;
    const baseCoords: Coordinates = { lat: Number(lat), lng: Number(lng) };

    if (objectType === 'pipeline') {
      const pipelineData: PipelineSegment = {
        id,
        code: code || `ТР-${Math.floor(10 + Math.random() * 90)}`,
        networkType,
        subType: subType as any,
        path: initialData?.path || defaultPath || [
          { lat: baseCoords.lat - 0.0005, lng: baseCoords.lng - 0.0005 },
          baseCoords,
          { lat: baseCoords.lat + 0.0005, lng: baseCoords.lng + 0.0005 },
        ],
        diameterMm: Number(diameterMm),
        material,
        depthMeters: Number(depthMeters),
        pressureNominal,
        installYear: Number(installYear),
        condition,
        locationDetails,
        deviceSchematic,
        maintenanceTasks,
        description,
      };
      onSave('pipeline', pipelineData);
    } else if (objectType === 'well') {
      const free = Math.max(0, Number(totalPorts) - Number(usedPorts));
      const wellData: Well = {
        id,
        code: code || `КВ-${Math.floor(10 + Math.random() * 90)}`,
        name: name || `Колодец ${code}`,
        type: wellType,
        coordinates: baseCoords,
        locationDetails,
        depthMeters: Number(depthMeters),
        diameterMm: Number(diameterMm) || 1500,
        material: wellMaterial,
        totalPorts: Number(totalPorts),
        usedPorts: Number(usedPorts),
        freePorts: free,
        mainPipeDiameterMm: 110,
        nominalPressureAtm: Number(nominalPressureAtm),
        hasHeatingCable,
        hasInsulatedLid,
        condition,
        deviceSchematic,
        meterModel: meterModel || undefined,
        meterSerial: meterSerial || undefined,
        sealNumber: sealNumber || undefined,
        maintenanceTasks,
        lastInspectionDate: new Date().toISOString().split('T')[0],
        notes: wellNotes,
        valves: initialData?.valves || [
          { id: `v-${id}-1`, type: 'ball_valve', diameterMm: 32, state: 'open' },
          { id: `v-${id}-2`, type: 'gate_valve', diameterMm: 100, state: 'open' },
        ],
      };
      onSave('well', wellData);
    } else if (objectType === 'valve') {
      const valveData: Valve = {
        id,
        code: code || `ЗК-${Math.floor(10 + Math.random() * 90)}`,
        networkType: (networkType === 'gas' || networkType === 'water_summer' ? networkType : 'water_winter') as any,
        coordinates: baseCoords,
        locationDetails,
        type: valveType,
        diameterMm: Number(diameterMm),
        state: valveState,
        pressureAtm: Number(nominalPressureAtm) || 4.0,
        depthMeters: Number(depthMeters),
        installedYear: Number(installYear),
        condition,
        deviceSchematic,
        maintenanceTasks,
        description: description || `Запорная арматура ${code}`,
      };
      onSave('valve', valveData);
    } else if (objectType === 'switchboard') {
      const switchboardData: Switchboard = {
        id,
        code: code || `ШР-${Math.floor(10 + Math.random() * 90)}`,
        name: name || `Шкаф распределительный ${code}`,
        coordinates: baseCoords,
        locationDetails,
        substationCode,
        mainBreakerAmps: Number(mainBreakerAmps),
        feederCount: Number(feederCount),
        meterModel: switchboardMeterModel,
        meterSerial: switchboardMeterSerial,
        condition,
        installationYear: Number(installYear),
        deviceSchematic,
        maintenanceTasks,
      };
      onSave('switchboard', switchboardData);
    } else if (objectType === 'substation') {
      const subData: Substation = {
        id,
        code: code || `КТПН-${Math.floor(1 + Math.random() * 9)}`,
        name: name || `Трансформаторная подстанция ${code}`,
        coordinates: baseCoords,
        locationDetails,
        powerKva: Number(powerKva),
        voltageKv,
        currentLoadPercent: Number(currentLoadPercent),
        currentPhaseA: Math.round((Number(powerKva) * 1.4 * Number(currentLoadPercent)) / 100),
        currentPhaseB: Math.round((Number(powerKva) * 1.45 * Number(currentLoadPercent)) / 100),
        currentPhaseC: Math.round((Number(powerKva) * 1.38 * Number(currentLoadPercent)) / 100),
        voltagePhaseA: 228,
        voltagePhaseB: 231,
        voltagePhaseC: 226,
        feederCount: 6,
        status: Number(currentLoadPercent) > 85 ? 'warning' : 'nominal',
        groundingResistanceOhm: Number(groundingResistanceOhm),
        deviceSchematic,
        maintenanceTasks,
        lastServiceDate: new Date().toISOString().split('T')[0],
      };
      onSave('substation', subData);
    } else if (objectType === 'fireHydrant') {
      const hydrantData: FireHydrant = {
        id,
        code: code || `ПГ-${Math.floor(1 + Math.random() * 9)}`,
        coordinates: baseCoords,
        type: 'underground',
        diameterMm: Number(diameterMm) || 125,
        staticPressureAtm: Number(hydrantStaticPressureAtm),
        flowRateLps: Number(hydrantFlowRateLps),
        winterInsulationDone,
        accessibilityCondition: 'free',
        status: condition === 'critical' ? 'requires_repair' : 'operational',
        lastTestDate: new Date().toISOString().split('T')[0],
      };
      onSave('fireHydrant', hydrantData);
    } else if (objectType === 'lightPole') {
      const poleData = {
        id,
        code: code || `О-${Math.floor(10 + Math.random() * 90)}`,
        lampType: initialData?.lampType || 'Светодиодный Кобра 60Вт',
        phase: initialData?.phase || 'L1',
        isDutyLight: initialData?.isDutyLight ?? true,
        coordinates: baseCoords,
        status: condition === 'critical' ? 'broken' : 'working',
        lastBulbReplaced: new Date().toISOString().split('T')[0],
      };
      onSave('lightPole', poleData);
    } else if (objectType === 'wifiHotspot') {
      const wifiData = {
        id,
        name: name || `Wi-Fi Точка ${code}`,
        ssid: initialData?.ssid || 'DTSN-Pensioner-Free',
        coordinates: baseCoords,
        rangeMeters: initialData?.rangeMeters || 60,
        status: 'active',
      };
      onSave('wifiHotspot', wifiData);
    } else if (objectType === 'barrierGate') {
      const bgData: BarrierGate = {
        id,
        code: code || `ШЛ-${Math.floor(1 + Math.random() * 9)}`,
        name: name || `Шлагбаум ${code}`,
        coordinates: baseCoords,
        type: initialData?.type || 'automatic_gsm',
        openByPhone: initialData?.openByPhone || '+7 (913) 000-01-01',
        winterHeatedDrive: initialData?.winterHeatedDrive ?? true,
        status: condition === 'critical' ? 'fault' : 'operational',
      };
      onSave('barrierGate', bgData);
    } else if (objectType === 'adminFacility') {
      const facData: AdministrationFacility = {
        id,
        code: code || `АДМ-${Math.floor(1 + Math.random() * 9)}`,
        name: name || `Объект правления ${code}`,
        type: initialData?.type || 'board_office',
        coordinates: baseCoords,
        description: description || locationDetails || 'Дом правления и административный пост товарищества',
        workingHours: initialData?.workingHours || 'Сб-Вс 10:00 - 15:00',
        hasCctv: initialData?.hasCctv ?? true,
        hasBackupGenerator: initialData?.hasBackupGenerator ?? true,
      };
      onSave('adminFacility', facData);
    }

    onClose();
  };

  const getTypeNameRussian = () => {
    switch (objectType) {
      case 'pipeline':
        return 'Трасса / Трубопровод / Кабельная линия';
      case 'well':
        return 'Колодец & Узел подключения к водопроводу';
      case 'valve':
        return 'Задвижка / Запорная арматура';
      case 'switchboard':
        return 'Электрощитовая / ВРУ / Шкаф распределительный';
      case 'substation':
        return 'Комплектная подстанция КТПН 10/0.4кВ';
      case 'fireHydrant':
        return 'Пожарный гидрант ПГ';
      case 'lightPole':
        return 'Уличный фонарь / Опора освещения';
      case 'wifiHotspot':
        return 'Точка доступа Wi-Fi';
      case 'barrierGate':
        return 'Въездной шлагбаум / Пост СКУД';
      case 'adminFacility':
        return 'Дом правления / Объект инфраструктуры';
      default:
        return 'Инженерный объект';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-700 border border-sky-200">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'create' ? 'Добавление объекта сети' : 'Редактирование объекта сети'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">{getTypeNameRussian()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Basic Identifiers & Coordinates */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-1 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Идентификация и геолокация</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Код объекта (Шифр) *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="КВ-04, ВЛ-Ф1, ШР-02, ЛВ-Вывод"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Наименование объекта</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Колодец 2-й Линии, Летний вывод полива, ВРУ уч. 18"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Широта (Lat WGS84)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Долгота (Lng WGS84)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Привязка на местности (Ориентир)</label>
                <input
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="Перекресток 2-й Линии и Центральной, опора ОП-4"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specifications depending on object type */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-1 border-b border-slate-100">
              <Gauge className="w-4 h-4 text-emerald-600" />
              <span>Технические параметры узла</span>
            </h3>

            {/* PIPELINE FIELDS */}
            {objectType === 'pipeline' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Слой инженерной сети</label>
                  <select
                    value={networkType}
                    onChange={(e) => setNetworkType(e.target.value as UtilityType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="water_winter">💧 Зимний водопровод (глубокий)</option>
                    <option value="water_summer">☀️ Летний водопровод (поливочный)</option>
                    <option value="electricity">⚡ Электросеть 0.4кВ (ВЛ/КЛ)</option>
                    <option value="gas">🔥 Газопровод</option>
                    <option value="telecom">📡 Слаботочные сети (ВОЛС / CCTV)</option>
                    <option value="stormwater">🌧️ Ливневая канализация</option>
                    <option value="roads">🛣️ Дорожное полотно</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Подтип сети</label>
                  <select
                    value={subType}
                    onChange={(e) => setSubType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    {networkType === 'water_winter' && <option value="winter">❄️ Зимняя магистраль</option>}
                    {networkType === 'water_summer' && (
                      <>
                        <option value="summer">🚿 Летняя распределительная труба</option>
                        <option value="summer_tap">🚰 Летний вывод / поливочный стояк</option>
                      </>
                    )}
                    {networkType === 'electricity' && (
                      <>
                        <option value="sip_power">⚡ ВЛ-0.4кВ провод СИП</option>
                        <option value="lighting_cable">💡 Кабель дежурного освещения</option>
                      </>
                    )}
                    {networkType === 'gas' && (
                      <>
                        <option value="medium_pressure">🔥 Среднее давление к ГРПШ</option>
                        <option value="low_pressure">🔥 Низкое давление абонентское</option>
                      </>
                    )}
                    {networkType === 'telecom' && (
                      <>
                        <option value="optic_fiber">🌐 ВОЛС (Оптоволокно GPON)</option>
                        <option value="cctv">📹 Видеонаблюдение & СКУД</option>
                        <option value="twisted_pair">💻 Витая пара UTP Outdoor</option>
                      </>
                    )}
                    {networkType === 'stormwater' && <option value="drainage">🌧️ Водоотводная канава</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Диаметр / Сечение (Ду, мм)</label>
                  <input
                    type="number"
                    value={diameterMm}
                    onChange={(e) => setDiameterMm(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Глубина заложения (м)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={depthMeters}
                    onChange={(e) => setDepthMeters(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Номинальное давление / Напряжение</label>
                  <input
                    type="text"
                    value={pressureNominal}
                    onChange={(e) => setPressureNominal(e.target.value)}
                    placeholder="4.0 атм / 0.4 кВ / 1 Гбит/с"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-slate-600 font-medium mb-1">Материал трубы / кабеля (ГОСТ)</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="ПНД-100 SDR 11 PN16 d110х10.0 мм / СИП-4 4х70 / ОКМБ-02-16"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* WELL FIELDS */}
            {objectType === 'well' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Назначение колодца</label>
                    <select
                      value={wellType}
                      onChange={(e) => setWellType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                    >
                      <option value="water_winter">❄️ Зимний питьевой водопровод</option>
                      <option value="water_summer">☀️ Летний водопровод</option>
                      <option value="sewer">🚰 Дренаж / Канализация</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Всего штуцеров врезки</label>
                    <input
                      type="number"
                      value={totalPorts}
                      onChange={(e) => setTotalPorts(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Занято абонентами</label>
                    <input
                      type="number"
                      value={usedPorts}
                      onChange={(e) => setUsedPorts(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Рабочее давление (атм)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nominalPressureAtm}
                      onChange={(e) => setNominalPressureAtm(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sky-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Материал шахты колодца</label>
                    <select
                      value={wellMaterial}
                      onChange={(e) => setWellMaterial(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    >
                      <option value="reinforced_concrete">Железобетонные кольца КС-15/КС-20</option>
                      <option value="polymer">Полимерпесчаный / Пластиковый</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Глубина колодца (м)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={depthMeters}
                      onChange={(e) => setDepthMeters(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasHeatingCable}
                        onChange={(e) => setHasHeatingCable(e.target.checked)}
                        className="rounded text-sky-600 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-800">🔥 Греющий кабель</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasInsulatedLid}
                        onChange={(e) => setHasInsulatedLid(e.target.checked)}
                        className="rounded text-emerald-600 w-4 h-4"
                      />
                      <span className="font-semibold text-slate-800">🛡️ Утепленная крышка</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* VALVE FIELDS */}
            {objectType === 'valve' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Тип арматуры</label>
                  <select
                    value={valveType}
                    onChange={(e) => setValveType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="gate_valve">Задвижка клиновая с обрезиненным клином</option>
                    <option value="ball_valve">Шаровой кран латунный / стальной</option>
                    <option value="check_valve">Обратный клапан пружинный</option>
                    <option value="air_vent">Автоматический воздухоотводчик</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Положение арматуры</label>
                  <select
                    value={valveState}
                    onChange={(e) => setValveState(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="open">🟢 Открыта (Штатный проток)</option>
                    <option value="closed">🔴 Закрыта (Перекрыта)</option>
                    <option value="emergency">⚠️ Аварийное перекрытие</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Условный проход (Ду, мм)</label>
                  <input
                    type="number"
                    value={diameterMm}
                    onChange={(e) => setDiameterMm(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Глубина установки (м)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={depthMeters}
                    onChange={(e) => setDepthMeters(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>
            )}

            {/* SWITCHBOARD FIELDS */}
            {objectType === 'switchboard' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Привязка к КТПН</label>
                  <input
                    type="text"
                    value={substationCode}
                    onChange={(e) => setSubstationCode(e.target.value)}
                    placeholder="КТПН-1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Вводной автомат (А)</label>
                  <input
                    type="number"
                    value={mainBreakerAmps}
                    onChange={(e) => setMainBreakerAmps(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Количество фидеров</label>
                  <input
                    type="number"
                    value={feederCount}
                    onChange={(e) => setFeederCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Год монтажа</label>
                  <input
                    type="number"
                    value={installYear}
                    onChange={(e) => setInstallYear(parseInt(e.target.value) || 2024)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>
            )}

            {/* SUBSTATION FIELDS */}
            {objectType === 'substation' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Полная мощность (кВА)</label>
                  <input
                    type="number"
                    value={powerKva}
                    onChange={(e) => setPowerKva(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Класс напряжения</label>
                  <input
                    type="text"
                    value={voltageKv}
                    onChange={(e) => setVoltageKv(e.target.value)}
                    placeholder="10 / 0.4 кВ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Загрузка трансформатора (%)</label>
                  <input
                    type="number"
                    value={currentLoadPercent}
                    onChange={(e) => setCurrentLoadPercent(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Сопротивление заземления (Ом)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={groundingResistanceOhm}
                    onChange={(e) => setGroundingResistanceOhm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>
            )}

            {/* FIRE HYDRANT FIELDS */}
            {objectType === 'fireHydrant' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Статическое давление (атм)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hydrantStaticPressureAtm}
                    onChange={(e) => setHydrantStaticPressureAtm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-rose-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Расход воды (л/сек)</label>
                  <input
                    type="number"
                    value={hydrantFlowRateLps}
                    onChange={(e) => setHydrantFlowRateLps(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={winterInsulationDone}
                      onChange={(e) => setWinterInsulationDone(e.target.checked)}
                      className="rounded text-rose-600 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-800">❄️ Утеплен на зиму (чехол/вкладыш)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Technical Condition & State */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-1 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Оценка технического состояния объекта</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCondition('excellent')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  condition === 'excellent'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 text-emerald-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm mb-1">🟢</div>
                <div className="font-semibold text-xs">Отличное</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Новый узел, замечаний нет</div>
              </button>

              <button
                type="button"
                onClick={() => setCondition('normal')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  condition === 'normal'
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 text-sky-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm mb-1">🔵</div>
                <div className="font-semibold text-xs">Нормальное</div>
                <div className="text-[10px] text-slate-400 mt-0.5">В регламентной эксплуатации</div>
              </button>

              <button
                type="button"
                onClick={() => setCondition('requires_maintenance')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  condition === 'requires_maintenance'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300 text-amber-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm mb-1">🟡</div>
                <div className="font-semibold text-xs">Требует ТО</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Протяжка, чистка, поверка</div>
              </button>

              <button
                type="button"
                onClick={() => setCondition('critical')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  condition === 'critical'
                    ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-300 text-rose-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm mb-1">🔴</div>
                <div className="font-semibold text-xs">Критическое</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Утечка, замыкание, авария</div>
              </button>
            </div>
          </div>

          {/* Section 4: Metering Nodes & Device Schematics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Устройство узлов учёта, запорной арматуры и щитовых</span>
              </h3>

              {/* Presets Button Bar */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 mr-1">Шаблоны устройства:</span>
                {objectType === 'well' && (
                  <>
                    <button
                      type="button"
                      onClick={() => applyPresetSchematic('winter_well')}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700"
                    >
                      Колодец с гребенкой
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetSchematic('metering_node')}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700"
                    >
                      Узел учета Бетар
                    </button>
                  </>
                )}
                {objectType === 'pipeline' && (
                  <button
                    type="button"
                    onClick={() => applyPresetSchematic('summer_tap')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700"
                  >
                    Летний вывод полива
                  </button>
                )}
                {objectType === 'switchboard' && (
                  <button
                    type="button"
                    onClick={() => applyPresetSchematic('switchboard_vr')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700"
                  >
                    ВРУ Меркурий 234
                  </button>
                )}
                {objectType === 'valve' && (
                  <button
                    type="button"
                    onClick={() => applyPresetSchematic('gate_valve')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700"
                  >
                    Задвижка с ковером
                  </button>
                )}
              </div>
            </div>

            {/* Meter fields for well or switchboard */}
            {(objectType === 'well' || objectType === 'switchboard') && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Прибор учета (Модель)</label>
                  <input
                    type="text"
                    value={objectType === 'well' ? meterModel : switchboardMeterModel}
                    onChange={(e) =>
                      objectType === 'well'
                        ? setMeterModel(e.target.value)
                        : setSwitchboardMeterModel(e.target.value)
                    }
                    placeholder="Бетар СХВ-15 / Меркурий 230"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Заводской серийный номер</label>
                  <input
                    type="text"
                    value={objectType === 'well' ? meterSerial : switchboardMeterSerial}
                    onChange={(e) =>
                      objectType === 'well'
                        ? setMeterSerial(e.target.value)
                        : setSwitchboardMeterSerial(e.target.value)
                    }
                    placeholder="№ 1948201"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Номер антимагнитной пломбы</label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    placeholder="РТ-849102"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Подробное описание устройства узла, арматуры и разводки
              </label>
              <textarea
                rows={3}
                value={deviceSchematic}
                onChange={(e) => setDeviceSchematic(e.target.value)}
                placeholder="Укажите состав запорной арматуры, диаметры, обратные клапаны, грязевики, способ ввода греющего кабеля, расположение штоков и ключей..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 leading-relaxed font-normal"
              />
            </div>
          </div>

          {/* Section 5: Maintenance Tasks */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-600" />
                <span>Необходимые регламентные задачи и работы ({maintenanceTasks.length})</span>
              </span>
            </h3>

            {/* Tasks list */}
            {maintenanceTasks.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {maintenanceTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <span className="text-slate-800 text-xs font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      {task}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Удалить задачу"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-xs py-1">Нет назначенных задач по объекту.</p>
            )}

            {/* Add new task input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                placeholder="Добавить регламентную задачу (напр. «Замена сальниковой набивки»)"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-1 transition-colors text-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {mode === 'edit' && onDelete && initialData?.id ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl animate-fadeIn">
                  <span className="text-xs font-bold text-rose-900">Точно удалить?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(objectType, initialData.id);
                      setIsConfirmingDelete(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    Да, удалить
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-2 text-rose-700 hover:bg-rose-100/80 active:bg-rose-200 font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200 text-xs"
                  title="Удалить данный объект из базы сетей"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Удалить объект</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors text-xs"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-md text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить объект в базе</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
