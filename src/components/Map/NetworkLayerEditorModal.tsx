import React, { useState, useEffect } from 'react';
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
  AssetPhoto,
  GasRegulatorStation,
  WasteCollectionSite,
  SnowDump,
  FireTurnaround,
  InspectionCheckPoint,
  CctvCamera,
  WaterMeteringNode,
} from '../../types/index.ts';
import { AssetPhotoGallery } from '../Common/AssetPhotoGallery';
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
  Snowflake,
  Sun,
  Camera,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Settings2,
  Box,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export type EditableObjectType =
  | 'pipeline'
  | 'well'
  | 'valve'
  | 'switchboard'
  | 'substation'
  | 'fireHydrant'
  | 'waterMeteringNode'
  | 'lightPole'
  | 'wifiHotspot'
  | 'barrierGate'
  | 'adminFacility'
  | 'gasRegulator'
  | 'wasteSite'
  | 'snowDump'
  | 'fireTurnaround'
  | 'inspectionPoint'
  | 'cctvCamera';

export type NetworkCategoryKey = 'water' | 'electric' | 'gas' | 'telecom' | 'infrastructure';

interface NetworkCategoryMeta {
  key: NetworkCategoryKey;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  badgeBg: string;
  elements: {
    type: EditableObjectType;
    title: string;
    codePrefix: string;
    description: string;
    icon: any;
  }[];
}

const NETWORK_CATEGORIES: NetworkCategoryMeta[] = [
  {
    key: 'water',
    title: 'Водоснабжение & Пожаротушение',
    subtitle: 'Зимний и летний водопровод, колодцы обвязки, гидранты, задвижки',
    icon: Droplet,
    color: 'text-sky-600',
    badgeBg: 'bg-sky-50 border-sky-200 text-sky-800',
    elements: [
      {
        type: 'well',
        title: 'Водопроводный колодец (КВ)',
        codePrefix: 'КВ',
        description: 'Узел врезок, гребёнки подключения участков, запорная арматура, учет воды',
        icon: Droplet,
      },
      {
        type: 'valve',
        title: 'Запорная арматура / Задвижка (ЗК)',
        codePrefix: 'ЗК',
        description: 'Магистральные клиновые задвижки, шаровые краны, вантузы стравливания',
        icon: Wrench,
      },
      {
        type: 'fireHydrant',
        title: 'Пожарный гидрант (ПГ)',
        codePrefix: 'ПГ',
        description: 'Точка водозабора для пожарных расчетов МЧС, проверка статического давления',
        icon: Shield,
      },
      {
        type: 'waterMeteringNode',
        title: 'Узел учёта воды (УУВ)',
        codePrefix: 'УУВ',
        description: 'Узел коммерческого / технологического учета, прибор учета расхода с телеметрией и байпасом',
        icon: Gauge,
      },
      {
        type: 'pipeline',
        title: 'Трубопровод / Магистраль',
        codePrefix: 'ТР',
        description: 'Подземные трассы зимнего водопровода (глубина 2.8м), поливочные линии, магистраль Ду 500',
        icon: Layers,
      },
    ],
  },
  {
    key: 'electric',
    title: 'Электроснабжение & Освещение',
    subtitle: 'Трансформаторные подстанции КТПН, ВРУ, фидеры, уличные фонари',
    icon: Zap,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
    elements: [
      {
        type: 'substation',
        title: 'Подстанция КТПН 10/0.4 кВ',
        codePrefix: 'КТПН',
        description: 'Трансформаторная подстанция, учет высокой/низкой стороны, заземление',
        icon: Zap,
      },
      {
        type: 'switchboard',
        title: 'ВРУ / Распределительный щит',
        codePrefix: 'ВРУ',
        description: 'Вводно-распределительное устройство, учет, группы автоматов, астротаймер',
        icon: Box,
      },
      {
        type: 'lightPole',
        title: 'Уличный фонарь / Опора освещения',
        codePrefix: 'ОС',
        description: 'Светодиодные светильники уличного освещения улиц и проездов',
        icon: Sun,
      },
      {
        type: 'pipeline',
        title: 'Кабельная линия / СИП',
        codePrefix: 'КЛ',
        description: 'Воздушные линии СИП-4 и подземные силовые бронированные кабели',
        icon: Layers,
      },
    ],
  },
  {
    key: 'gas',
    title: 'Газоснабжение',
    subtitle: 'ГРПШ, распределительные газопроводы среднего и низкого давления',
    icon: Flame,
    color: 'text-yellow-600',
    badgeBg: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    elements: [
      {
        type: 'gasRegulator',
        title: 'ГРПШ (Газорегуляторный пункт)',
        codePrefix: 'ГРПШ',
        description: 'Шкафной пункт понижения давления, фильтрация, телеметрия параметров',
        icon: Flame,
      },
      {
        type: 'pipeline',
        title: 'Газопровод (ПЭ / Сталь)',
        codePrefix: 'ГП',
        description: 'Подземные газопроводы среднего (0.3 МПа) и низкого давления к участкам',
        icon: Layers,
      },
    ],
  },
  {
    key: 'telecom',
    title: 'Связь, Wi-Fi & СКУД',
    subtitle: 'Беспроводная сеть поселка, въездные шлагбаумы, оптоволокно',
    icon: Radio,
    color: 'text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
    elements: [
      {
        type: 'wifiHotspot',
        title: 'Точка доступа Wi-Fi',
        codePrefix: 'WF',
        description: 'Базовая станция беспроводного интернета общего пользования',
        icon: Radio,
      },
      {
        type: 'barrierGate',
        title: 'Автоматический шлагбаум (ШЛ)',
        codePrefix: 'ШЛ',
        description: 'Въездная группа, GSM-модуль открытия по звонку, зимний подогрев',
        icon: Shield,
      },
      {
        type: 'cctvCamera',
        title: 'Камера видеонаблюдения (ВК)',
        codePrefix: 'ВК',
        description: 'Обзорные и въездные камеры, привязка к опорам ЛЭП, ночное видение, PTZ',
        icon: Camera,
      },
      {
        type: 'pipeline',
        title: 'Оптическая линия связи (ВОЛС)',
        codePrefix: 'ВОЛС',
        description: 'Магистральные оптические кабели телеметрии и высокоскоростного интернета',
        icon: Layers,
      },
    ],
  },
  {
    key: 'infrastructure',
    title: 'Инфраструктура & Территория ДТСН',
    subtitle: 'Здания Правления, КПП, площадки ТБО, снегоотвалы, пожарные развороты',
    icon: Shield,
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    elements: [
      {
        type: 'adminFacility',
        title: 'Здание Правления / КПП / Пост',
        codePrefix: 'АДМ',
        description: 'Административное здание, видеонаблюдение, резервный генератор',
        icon: Box,
      },
      {
        type: 'wasteSite',
        title: 'Площадка ТБО (Мусорные баки)',
        codePrefix: 'ТБО',
        description: 'Контейнерная площадка для сбора отходов с графиком вывоза',
        icon: Trash2,
      },
      {
        type: 'snowDump',
        title: 'Площадка снегоотвала',
        codePrefix: 'СО',
        description: 'Место складирования снега при зимней механизированной расчистке дорог',
        icon: Snowflake,
      },
      {
        type: 'fireTurnaround',
        title: 'Пожарный разворот спецтехники',
        codePrefix: 'ПР',
        description: 'Разворотная тупиковая площадка для пожарных машин и снегоуборщиков',
        icon: Truck,
      },
      {
        type: 'inspectionPoint',
        title: 'Точка регулярного осмотра',
        codePrefix: 'ТО',
        description: 'Обязательный пункт чек-листа планового обхода инженерной службы',
        icon: CheckCircle,
      },
    ],
  },
];

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
  objectType: propObjectType,
  initialData,
  defaultCoordinates,
  defaultPath,
  onSave,
  onDelete,
  onClose,
}) => {
  if (!isOpen) return null;

  // Wizard Step: 1 = Network choice, 2 = Element choice, 3 = Equipment & Filling (Наполнение), 4 = Real Photos & GPS
  const [currentStep, setCurrentStep] = useState<number>(mode === 'create' ? 1 : 3);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<NetworkCategoryKey>('water');
  const [activeObjectType, setActiveObjectType] = useState<EditableObjectType>(propObjectType || 'well');

  const [activeTab, setActiveTab] = useState<'filling' | 'passport' | 'photos'>('filling');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Common Fields
  const [code, setCode] = useState(initialData?.code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [condition, setCondition] = useState<'excellent' | 'normal' | 'requires_maintenance' | 'critical'>(
    initialData?.condition || initialData?.status === 'warning' ? 'requires_maintenance' : 'normal'
  );
  const [locationDetails, setLocationDetails] = useState(initialData?.locationDetails || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [lat, setLat] = useState<number>(
    initialData?.coordinates?.lat || defaultCoordinates?.lat || 55.098612
  );
  const [lng, setLng] = useState<number>(
    initialData?.coordinates?.lng || defaultCoordinates?.lng || 82.900919
  );
  const [photos, setPhotos] = useState<AssetPhoto[]>(initialData?.photos || []);
  const [deviceSchematic, setDeviceSchematic] = useState<string>(initialData?.deviceSchematic || '');
  const [maintenanceTasks, setMaintenanceTasks] = useState<string[]>(initialData?.maintenanceTasks || []);
  const [newTaskInput, setNewTaskInput] = useState('');

  // ----------------------------------------------------
  // WELL FILLING STATE (Наполнение колодца)
  // ----------------------------------------------------
  const [wellType, setWellType] = useState<'water_winter' | 'water_summer' | 'sewer'>(
    initialData?.type || 'water_winter'
  );
  const [wellMaterial, setWellMaterial] = useState<'reinforced_concrete' | 'polymer'>(
    initialData?.material || 'reinforced_concrete'
  );
  const [wellDepthMeters, setWellDepthMeters] = useState<number>(
    initialData?.depthMeters !== undefined ? initialData.depthMeters : 3.0
  );
  const [wellDiameterMm, setWellDiameterMm] = useState<number>(initialData?.diameterMm || 1500);
  const [wellPressureAtm, setWellPressureAtm] = useState<number>(initialData?.nominalPressureAtm || 4.2);

  // Well Component Toggles (Наполнение узла)
  const [hasManifold, setHasManifold] = useState<boolean>(initialData?.totalPorts ? true : true);
  const [manifoldPorts, setManifoldPorts] = useState<number>(initialData?.totalPorts || 6);
  const [usedPorts, setUsedPorts] = useState<number>(initialData?.usedPorts || 2);
  const [manifoldPortDiameter, setManifoldPortDiameter] = useState<string>('d32');
  const [hasFireHydrantInWell, setHasFireHydrantInWell] = useState<boolean>(
    Boolean(initialData?.hasFireHydrant || (initialData?.code && initialData.code.includes('ПГ')))
  );
  const [hasSummerTap, setHasSummerTap] = useState<boolean>(
    Boolean(initialData?.hasSummerTap ?? (initialData?.type === 'water_summer' || initialData?.notes?.includes('летний')))
  );
  const [hasGateValve, setHasGateValve] = useState<boolean>(
    Boolean(initialData?.valves?.length > 0 || true)
  );
  const [gateValveDiameterMm, setGateValveDiameterMm] = useState<number>(
    initialData?.valves?.[0]?.diameterMm || 100
  );
  const [gateValveState, setGateValveState] = useState<'open' | 'closed'>('open');
  const [hasMeteringNode, setHasMeteringNode] = useState<boolean>(
    Boolean(initialData?.meterModel || initialData?.meterSerial)
  );
  const [meterModel, setMeterModel] = useState<string>(initialData?.meterModel || 'Бетар СХВ-15');
  const [meterSerial, setMeterSerial] = useState<string>(
    initialData?.meterSerial || `СХВ-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [sealNumber, setSealNumber] = useState<string>(
    initialData?.sealNumber || `РТ-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [hasHeatingCable, setHasHeatingCable] = useState<boolean>(initialData?.hasHeatingCable ?? true);
  const [hasInsulatedLid, setHasInsulatedLid] = useState<boolean>(initialData?.hasInsulatedLid ?? true);
  const [hasAirVent, setHasAirVent] = useState<boolean>(true);
  const [hasMudFilter, setHasMudFilter] = useState<boolean>(true);
  const [hasDrainageSump, setHasDrainageSump] = useState<boolean>(true);

  // ----------------------------------------------------
  // WATER METERING NODE (УУВ) FILLING STATE
  // ----------------------------------------------------
  const [meterType, setMeterType] = useState<'ultrasonic' | 'electromagnetic' | 'mechanical_pulse' | 'vane_wheel'>(
    initialData?.meterType || 'ultrasonic'
  );
  const [waterMeterDiameterMm, setWaterMeterDiameterMm] = useState<number>(initialData?.pipeDiameterMm || 500);
  const [nominalFlowM3h, setNominalFlowM3h] = useState<number>(initialData?.nominalFlowM3h || 120);
  const [currentFlowM3h, setCurrentFlowM3h] = useState<number>(initialData?.currentFlowM3h || 34.2);
  const [totalConsumptionM3, setTotalConsumptionM3] = useState<number>(initialData?.totalConsumptionM3 || 15840.5);
  const [verificationDate, setVerificationDate] = useState<string>(initialData?.verificationDate || '2024-05-15');
  const [nextVerificationDate, setNextVerificationDate] = useState<string>(initialData?.nextVerificationDate || '2028-05-15');
  const [hasBypassLine, setHasBypassLine] = useState<boolean>(initialData?.hasBypassLine ?? true);

  // ----------------------------------------------------
  // VALVE FILLING STATE
  // ----------------------------------------------------
  const [valveType, setValveType] = useState<'gate_valve' | 'ball_valve' | 'check_valve' | 'air_vent'>(
    initialData?.type || 'gate_valve'
  );
  const [valveDiameterMm, setValveDiameterMm] = useState<number>(initialData?.diameterMm || 100);
  const [valveState, setValveState] = useState<'open' | 'closed' | 'emergency'>(initialData?.state || 'open');

  // ----------------------------------------------------
  // SUBSTATION (КТПН) FILLING STATE
  // ----------------------------------------------------
  const [powerKva, setPowerKva] = useState<number>(initialData?.powerKva || 250);
  const [voltageKv, setVoltageKv] = useState<string>(initialData?.voltageKv || '10 / 0.4 кВ');
  const [currentLoadPercent, setCurrentLoadPercent] = useState<number>(initialData?.currentLoadPercent || 65);
  const [groundingResistanceOhm, setGroundingResistanceOhm] = useState<number>(
    initialData?.groundingResistanceOhm || 3.4
  );
  const [substationFeederCount, setSubstationFeederCount] = useState<number>(initialData?.feederCount || 4);

  // ----------------------------------------------------
  // SWITCHBOARD (ВРУ) FILLING STATE
  // ----------------------------------------------------
  const [substationCodeRef, setSubstationCodeRef] = useState<string>(initialData?.substationCode || 'КТПН-1');
  const [mainBreakerAmps, setMainBreakerAmps] = useState<number>(initialData?.mainBreakerAmps || 160);
  const [switchboardFeederCount, setSwitchboardFeederCount] = useState<number>(initialData?.feederCount || 6);
  const [switchboardMeterModel, setSwitchboardMeterModel] = useState<string>(
    initialData?.meterModel || 'Меркурий 234 ARTM-01 D'
  );
  const [switchboardMeterSerial, setSwitchboardMeterSerial] = useState<string>(
    initialData?.meterSerial || `М234-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [hasAstroTimer, setHasAstroTimer] = useState<boolean>(true);

  // ----------------------------------------------------
  // LIGHT POLE FILLING STATE
  // ----------------------------------------------------
  const [lampType, setLampType] = useState<string>(initialData?.lampType || 'LED 80W (Кобра)');
  const [phase, setPhase] = useState<'A' | 'B' | 'C'>(initialData?.phase || 'A');
  const [isDutyLight, setIsDutyLight] = useState<boolean>(initialData?.isDutyLight ?? true);

  // ----------------------------------------------------
  // BARRIER GATE (ШЛАГБАУМ) FILLING STATE
  // ----------------------------------------------------
  const [openByPhone, setOpenByPhone] = useState<string>(initialData?.openByPhone || '+7 (913) 777-12-34');
  const [winterHeatedDrive, setWinterHeatedDrive] = useState<boolean>(initialData?.winterHeatedDrive ?? true);
  const [barrierType, setBarrierType] = useState<'automatic_gsm' | 'rfid_barrier'>(
    initialData?.type || 'automatic_gsm'
  );

  // ----------------------------------------------------
  // WI-FI HOTSPOT FILLING STATE
  // ----------------------------------------------------
  const [ssid, setSsid] = useState<string>(initialData?.ssid || 'DTSN_PENSIONER_FREE');
  const [wifiRangeMeters, setWifiRangeMeters] = useState<number>(initialData?.rangeMeters || 100);
  const [wifiIp, setWifiIp] = useState<string>(initialData?.ipAddress || '192.168.10.25');

  // ----------------------------------------------------
  // CCTV CAMERA (ВИДЕОНАБЛЮДЕНИЕ) FILLING STATE
  // ----------------------------------------------------
  const [cctvResolution, setCctvResolution] = useState<string>(initialData?.resolution || '4MP (2560x1440)');
  const [cctvViewDirection, setCctvViewDirection] = useState<string>(
    initialData?.viewDirection || 'Северный въезд и шлагбаум'
  );
  const [cctvRotationAngle, setCctvRotationAngle] = useState<number>(
    initialData?.rotationAngle !== undefined ? initialData.rotationAngle : 45
  );
  const [cctvPoleCode, setCctvPoleCode] = useState<string>(initialData?.poleCode || 'О-01');
  const [cctvCloudArchiveDays, setCctvCloudArchiveDays] = useState<number>(
    initialData?.cloudArchiveDays || 30
  );
  const [cctvHasNightVision, setCctvHasNightVision] = useState<boolean>(
    initialData?.hasNightVision ?? true
  );
  const [cctvHasPtz, setCctvHasPtz] = useState<boolean>(initialData?.hasPtz ?? false);
  const [cctvIp, setCctvIp] = useState<string>(initialData?.ipAddress || '192.168.10.60');

  // ----------------------------------------------------
  // GAS REGULATOR (ГРПШ) FILLING STATE
  // ----------------------------------------------------
  const [regulatorModel, setRegulatorModel] = useState<string>(initialData?.regulatorModel || 'РДБК-50');
  const [inletPressureMpa, setInletPressureMpa] = useState<number>(initialData?.inletPressureMpa || 0.3);
  const [outletPressureKpa, setOutletPressureKpa] = useState<number>(initialData?.outletPressureKpa || 3.0);
  const [hasTelemetry, setHasTelemetry] = useState<boolean>(initialData?.hasTelemetry ?? true);

  // ----------------------------------------------------
  // INFRASTRUCTURE & SEASONAL FILLING STATE
  // ----------------------------------------------------
  const [containersCount, setContainersCount] = useState<number>(initialData?.containersCount || 3);
  const [containerVolumeCbm, setContainerVolumeCbm] = useState<number>(initialData?.containerVolumeCbm || 0.75);
  const [pickupSchedule, setPickupSchedule] = useState<string>(
    initialData?.pickupSchedule || 'Вторник, Пятница (Спецавтохозяйство)'
  );
  const [isWinterActive, setIsWinterActive] = useState<boolean>(initialData?.isWinterActive ?? true);

  const [snowCapacityCbm, setSnowCapacityCbm] = useState<number>(initialData?.capacityCubicMeters || 1500);
  const [snowCurrentFill, setSnowCurrentFill] = useState<number>(initialData?.currentFillPercent || 15);

  const [facilityType, setFacilityType] = useState<'board_office' | 'security_post' | 'utility_shed'>(
    initialData?.type || 'board_office'
  );
  const [workingHours, setWorkingHours] = useState<string>(initialData?.workingHours || 'Сб-Вс 10:00 - 15:00');
  const [hasCctv, setHasCctv] = useState<boolean>(initialData?.hasCctv ?? true);
  const [hasBackupGenerator, setHasBackupGenerator] = useState<boolean>(initialData?.hasBackupGenerator ?? true);

  // Pipeline Specific
  const [pipeDiameterMm, setPipeDiameterMm] = useState<number>(initialData?.diameterMm || 32);
  const [pipeMaterial, setPipeMaterial] = useState<string>(
    initialData?.material || 'ПНД-100 SDR 11 PN16 d32х3.0 мм'
  );
  const [pipeDepthMeters, setPipeDepthMeters] = useState<number>(
    initialData?.depthMeters !== undefined ? initialData.depthMeters : 2.8
  );

  // Automatically compose technical schematic & tasks based on filling toggles for Well
  useEffect(() => {
    if (activeObjectType === 'well' && (!initialData?.deviceSchematic || mode === 'create')) {
      const parts: string[] = [];
      const tasks: string[] = [];

      parts.push(`Колодец из колец ${wellMaterial === 'reinforced_concrete' ? 'КС-15.9 ЖБ' : 'полимер-песчаных'}, глубина ${wellDepthMeters} м.`);

      if (hasManifold) {
        parts.push(`Распределительная гребенка на ${manifoldPorts} штуцеров (${manifoldPortDiameter}) с шаровыми кранами Valtec PN25.`);
        tasks.push('Проверка герметичности сальниковых вводов и штуцеров гребенки');
      }
      if (hasFireHydrantInWell) {
        parts.push('Встроенный подземный пожарный гидрант Ду125.');
        tasks.push('Проливка и ревизия пожарного гидранта на водоотдачу');
      }
      if (hasSummerTap) {
        parts.push('Поливочный вывод летнего водопровода с краном 1" и вентилем продувки.');
        tasks.push('Сезонный слив воды и продувка стояка летнего водопровода');
      }
      if (hasGateValve) {
        parts.push(`Магистральная отсекающая задвижка Ду${gateValveDiameterMm}мм (${gateValveState === 'open' ? 'открыта' : 'закрыта'}).`);
        tasks.push('Полная прокрутка штока задвижки для исключения закисания');
      }
      if (hasMeteringNode) {
        parts.push(`Узел коммерческого учета воды: ${meterModel} (№${meterSerial}, пломба №${sealNumber}).`);
        tasks.push('Контрольная проверка целостности контрольной пломбы узла учета');
      }
      if (hasHeatingCable) {
        parts.push('Саморегулирующийся греющий кабель 17 Вт/м с сальниковым гермовводом.');
        tasks.push('Проверка сопротивления изоляции и включение греющего кабеля');
      }
      if (hasInsulatedLid) {
        parts.push('Теплоизолирующий пенополистирольный вкладыш оголовка.');
      }
      if (hasAirVent) {
        parts.push('Автоматический воздухоотводчик для стравливания воздуха.');
      }
      if (hasMudFilter) {
        parts.push('Сетчатый фильтр грубой очистки (грязевик).');
        tasks.push('Промывка сетки грязевика от механических примесей');
      }
      if (hasDrainageSump) {
        parts.push('Дренажный приямок с возможностью откачки.');
        tasks.push('Очистка дренажного приямка от ила и наносов');
      }

      setDeviceSchematic(parts.join(' '));
      if (tasks.length > 0 && maintenanceTasks.length === 0) {
        setMaintenanceTasks(tasks);
      }
    }
  }, [
    activeObjectType,
    wellMaterial,
    wellDepthMeters,
    hasManifold,
    manifoldPorts,
    manifoldPortDiameter,
    hasFireHydrantInWell,
    hasSummerTap,
    hasGateValve,
    gateValveDiameterMm,
    gateValveState,
    hasMeteringNode,
    meterModel,
    meterSerial,
    sealNumber,
    hasHeatingCable,
    hasInsulatedLid,
    hasAirVent,
    hasMudFilter,
    hasDrainageSump,
  ]);

  const handleSelectCategory = (catKey: NetworkCategoryKey) => {
    setSelectedCategoryKey(catKey);
    const cat = NETWORK_CATEGORIES.find((c) => c.key === catKey);
    if (cat && cat.elements.length > 0) {
      setActiveObjectType(cat.elements[0].type);
      setCode(`${cat.elements[0].codePrefix}-${Math.floor(10 + Math.random() * 89)}`);
      setName(`${cat.elements[0].title}`);
    }
    setCurrentStep(2);
  };

  const handleSelectElement = (elemType: EditableObjectType, prefix: string, title: string) => {
    setActiveObjectType(elemType);
    setCode(`${prefix}-${Math.floor(10 + Math.random() * 89)}`);
    setName(title);
    setCurrentStep(3);
  };

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setMaintenanceTasks([...maintenanceTasks, newTaskInput.trim()]);
    setNewTaskInput('');
  };

  const handleRemoveTask = (index: number) => {
    setMaintenanceTasks(maintenanceTasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const id = initialData?.id || `${activeObjectType}-${Date.now()}`;
    const baseCoords: Coordinates = { lat: Number(lat), lng: Number(lng) };

    if (activeObjectType === 'well') {
      const free = Math.max(0, Number(manifoldPorts) - Number(usedPorts));
      const wellData: Well = {
        id,
        code: code || `КВ-${Math.floor(10 + Math.random() * 90)}`,
        name: name || `Колодец ${code}`,
        type: wellType,
        coordinates: baseCoords,
        locationDetails,
        depthMeters: Number(wellDepthMeters),
        diameterMm: Number(wellDiameterMm) || 1500,
        material: wellMaterial,
        totalPorts: hasManifold ? Number(manifoldPorts) : 0,
        usedPorts: hasManifold ? Number(usedPorts) : 0,
        freePorts: hasManifold ? free : 0,
        mainPipeDiameterMm: hasGateValve ? Number(gateValveDiameterMm) : 110,
        nominalPressureAtm: Number(wellPressureAtm),
        hasHeatingCable,
        hasInsulatedLid,
        condition,
        deviceSchematic,
        meterModel: hasMeteringNode ? meterModel : undefined,
        meterSerial: hasMeteringNode ? meterSerial : undefined,
        sealNumber: hasMeteringNode ? sealNumber : undefined,
        maintenanceTasks,
        lastInspectionDate: new Date().toISOString().split('T')[0],
        notes: description,
        photos,
        valves: hasGateValve
          ? [
              {
                id: `v-${id}-1`,
                type: 'gate_valve',
                diameterMm: Number(gateValveDiameterMm),
                state: gateValveState,
              },
            ]
          : [],
      };
      onSave('well', wellData);
    } else if (activeObjectType === 'valve') {
      const valveData: Valve = {
        id,
        code: code || `ЗК-${Math.floor(10 + Math.random() * 90)}`,
        networkType: selectedCategoryKey === 'gas' ? 'gas' : 'water_winter',
        coordinates: baseCoords,
        locationDetails,
        type: valveType,
        diameterMm: Number(valveDiameterMm),
        state: valveState,
        pressureAtm: Number(wellPressureAtm) || 4.0,
        depthMeters: 2.8,
        installedYear: 2024,
        condition,
        deviceSchematic,
        maintenanceTasks,
        description: description || `Запорная арматура ${code}`,
        photos,
      };
      onSave('valve', valveData);
    } else if (activeObjectType === 'fireHydrant') {
      const hydrantData: FireHydrant = {
        id,
        code: code || `ПГ-${Math.floor(1 + Math.random() * 9)}`,
        coordinates: baseCoords,
        type: 'underground',
        diameterMm: 125,
        staticPressureAtm: 4.2,
        flowRateLps: 28,
        winterInsulationDone: hasInsulatedLid,
        accessibilityCondition: 'free',
        status: condition === 'critical' ? 'requires_repair' : 'operational',
        lastTestDate: new Date().toISOString().split('T')[0],
        photos,
      };
      onSave('fireHydrant', hydrantData);
    } else if (activeObjectType === 'waterMeteringNode') {
      const nodeData: WaterMeteringNode = {
        id,
        code: code || `УУВ-${Math.floor(10 + Math.random() * 90)}`,
        name: name || `Узел учёта воды ${code}`,
        coordinates: baseCoords,
        locationDetails,
        meterType,
        meterModel: meterModel || 'ВЗЛЕТ ЭР Ду100',
        meterSerial: meterSerial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        pipeDiameterMm: Number(waterMeterDiameterMm) || 500,
        nominalFlowM3h: Number(nominalFlowM3h) || 120,
        currentFlowM3h: Number(currentFlowM3h) || 34.2,
        totalConsumptionM3: Number(totalConsumptionM3) || 15840.5,
        sealNumber: sealNumber || `ГОСТ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        verificationDate: verificationDate || '2024-05-15',
        nextVerificationDate: nextVerificationDate || '2028-05-15',
        hasTelemetry: Boolean(hasTelemetry),
        hasBypassLine: Boolean(hasBypassLine),
        condition,
        deviceSchematic,
        maintenanceTasks,
        notes: description,
        photos,
      };
      onSave('waterMeteringNode', nodeData);
    } else if (activeObjectType === 'substation') {
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
        feederCount: Number(substationFeederCount),
        status: Number(currentLoadPercent) > 85 ? 'warning' : 'nominal',
        groundingResistanceOhm: Number(groundingResistanceOhm),
        deviceSchematic,
        maintenanceTasks,
        lastServiceDate: new Date().toISOString().split('T')[0],
        photos,
      };
      onSave('substation', subData);
    } else if (activeObjectType === 'switchboard') {
      const switchboardData: Switchboard = {
        id,
        code: code || `ВРУ-${Math.floor(10 + Math.random() * 90)}`,
        name: name || `Шкаф распределительный ${code}`,
        coordinates: baseCoords,
        locationDetails,
        substationCode: substationCodeRef,
        mainBreakerAmps: Number(mainBreakerAmps),
        feederCount: Number(switchboardFeederCount),
        meterModel: switchboardMeterModel,
        meterSerial: switchboardMeterSerial,
        condition,
        installationYear: 2024,
        deviceSchematic,
        maintenanceTasks,
        photos,
      };
      onSave('switchboard', switchboardData);
    } else if (activeObjectType === 'lightPole') {
      const poleData = {
        id,
        code: code || `О-${Math.floor(10 + Math.random() * 90)}`,
        lampType,
        phase,
        isDutyLight,
        coordinates: baseCoords,
        status: condition === 'critical' ? 'broken' : 'working',
        hasPhotoSensor: true,
        photos,
      };
      onSave('lightPole', poleData);
    } else if (activeObjectType === 'barrierGate') {
      const bgData: BarrierGate = {
        id,
        code: code || `ШЛ-${Math.floor(1 + Math.random() * 9)}`,
        name: name || `Шлагбаум ${code}`,
        coordinates: baseCoords,
        type: barrierType,
        openByPhone,
        winterHeatedDrive,
        status: condition === 'critical' ? 'fault' : 'operational',
        photos,
      };
      onSave('barrierGate', bgData);
    } else if (activeObjectType === 'wifiHotspot') {
      const wifiData = {
        id,
        code: code || `WF-${Math.floor(1 + Math.random() * 9)}`,
        name: name || `Wi-Fi Точка ${code}`,
        ssid,
        coordinates: baseCoords,
        rangeMeters: Number(wifiRangeMeters),
        frequency: '2.4 GHz / 5 GHz' as const,
        status: 'online' as const,
        ipAddress: wifiIp,
        photos,
      };
      onSave('wifiHotspot', wifiData);
    } else if (activeObjectType === 'cctvCamera') {
      const cctvData: CctvCamera = {
        id,
        code: code || `ВК-${Math.floor(10 + Math.random() * 90)}`,
        name: name || `Камера видеонаблюдения ${code}`,
        coordinates: baseCoords,
        poleCode: cctvPoleCode,
        resolution: cctvResolution,
        viewDirection: cctvViewDirection,
        rotationAngle: Number(cctvRotationAngle),
        cloudArchiveDays: Number(cctvCloudArchiveDays),
        hasNightVision: cctvHasNightVision,
        hasPtz: cctvHasPtz,
        status: condition === 'critical' ? 'offline' : 'online',
        ipAddress: cctvIp,
        notes: description,
        photos,
      };
      onSave('cctvCamera', cctvData);
    } else if (activeObjectType === 'gasRegulator') {
      const grData: GasRegulatorStation = {
        id,
        code: code || 'ГРПШ-01',
        name: name || 'Газорегуляторный пункт шкафной',
        coordinates: baseCoords,
        inletPressureMpa: Number(inletPressureMpa),
        outletPressureKpa: Number(outletPressureKpa),
        regulatorModel,
        hasTelemetry,
        status: condition === 'critical' ? 'warning' : 'nominal',
        lastCheckDate: new Date().toISOString().split('T')[0],
        filterDifferentialPressureKpa: 1.2,
        photos,
      };
      onSave('gasRegulator', grData);
    } else if (activeObjectType === 'wasteSite') {
      const wsData: WasteCollectionSite = {
        id,
        code: code || `ТБО-${Math.floor(1 + Math.random() * 9)}`,
        name: name || `Площадка ТБО ${code}`,
        coordinates: baseCoords,
        containersCount: Number(containersCount),
        containerVolumeCbm: Number(containerVolumeCbm),
        hasEnclosure: true,
        pickupSchedule,
        lastPickupDate: new Date().toISOString().split('T')[0],
        overflowRisk: 'low',
        isWinterActive,
      };
      onSave('wasteSite', wsData);
    } else if (activeObjectType === 'snowDump') {
      const sdData: SnowDump = {
        id,
        code: code || `СО-${Math.floor(1 + Math.random() * 9)}`,
        name: name || `Площадка снегоотвала ${code}`,
        coordinates: baseCoords,
        polygon: [
          { lat: baseCoords.lat - 0.0003, lng: baseCoords.lng - 0.0004 },
          { lat: baseCoords.lat + 0.0003, lng: baseCoords.lng - 0.0004 },
          { lat: baseCoords.lat + 0.0003, lng: baseCoords.lng + 0.0004 },
          { lat: baseCoords.lat - 0.0003, lng: baseCoords.lng + 0.0004 },
        ],
        capacityCubicMeters: Number(snowCapacityCbm),
        currentFillPercent: Number(snowCurrentFill),
        status: 'open',
        allowedMachinery: 'МТЗ-82, КамАЗ, фронтальные погрузчики',
      };
      onSave('snowDump', sdData);
    } else if (activeObjectType === 'adminFacility') {
      const facData: AdministrationFacility = {
        id,
        code: code || `АДМ-${Math.floor(1 + Math.random() * 9)}`,
        name: name || `Объект правления ${code}`,
        type: facilityType,
        coordinates: baseCoords,
        description: description || locationDetails || 'Административное здание ДТСН «Пенсионер»',
        workingHours,
        hasCctv,
        hasBackupGenerator,
        photos,
      };
      onSave('adminFacility', facData);
    } else if (activeObjectType === 'pipeline') {
      const pipeData: PipelineSegment = {
        id,
        code: code || `ТР-${Math.floor(10 + Math.random() * 90)}`,
        networkType: (selectedCategoryKey === 'water' ? 'water_winter' : selectedCategoryKey === 'gas' ? 'gas' : 'electricity') as any,
        subType: 'winter',
        path: defaultPath || [
          { lat: baseCoords.lat - 0.0004, lng: baseCoords.lng - 0.0004 },
          baseCoords,
          { lat: baseCoords.lat + 0.0004, lng: baseCoords.lng + 0.0004 },
        ],
        diameterMm: Number(pipeDiameterMm),
        material: pipeMaterial,
        depthMeters: Number(pipeDepthMeters),
        pressureNominal: '4.0 атм',
        installYear: 2024,
        condition,
        locationDetails,
        deviceSchematic,
        maintenanceTasks,
        description,
        photos,
      };
      onSave('pipeline', pipeData);
    }

    onClose();
  };

  const activeCategory = NETWORK_CATEGORIES.find((c) => c.key === selectedCategoryKey) || NETWORK_CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fadeIn">
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
              {mode === 'create' ? <Plus className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                {mode === 'create' ? 'Добавление инженерного элемента' : `Редактирование: ${code || name}`}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'create'
                  ? 'Пошаговый мастер: сеть ➔ элемент ➔ наполнение оборудования ➔ реальные фото'
                  : 'Паспорт объекта, характеристики оборудования и прикрепленные фотографии'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP-BY-STEP PROGRESS BAR (In Create Mode) */}
        {mode === 'create' && (
          <div className="px-5 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs font-semibold shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currentStep === 1 ? 'bg-sky-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>1. Выбор сети</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currentStep === 2 ? 'bg-sky-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>2. Выбор элемента</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  currentStep === 3 ? 'bg-sky-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>3. Наполнение & Фото</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Шаг {currentStep} из 3
            </span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* ==================================================== */}
          {/* STEP 1: ВЫБОР СЕТИ К КОТОРОЙ ОТНОСИТСЯ ЭЛЕМЕНТ       */}
          {/* ==================================================== */}
          {mode === 'create' && currentStep === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900">Выберите инженерную сеть</h4>
                <p className="text-xs text-slate-500">К какой системе относится добавляемый объект?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {NETWORK_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategoryKey === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleSelectCategory(cat.key)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-2 ring-sky-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                      }`}
                    >
                      <div className={`p-2 rounded-xl bg-white border border-slate-200 shadow-2xs ${cat.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{cat.title}</h5>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{cat.subtitle}</p>
                        <div className="pt-1 flex flex-wrap gap-1">
                          {cat.elements.slice(0, 3).map((el) => (
                            <span key={el.type} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {el.codePrefix}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: ВЫБОР ЭЛЕМЕНТА ОТНОСЯЩЕГОСЯ К СЕТИ          */}
          {/* ==================================================== */}
          {mode === 'create' && currentStep === 2 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Выберите элемент сети:</span>
                    <span className="text-sky-600 font-bold">{activeCategory.title}</span>
                  </h4>
                  <p className="text-xs text-slate-500">Какой конкретно узел вы хотите разместить на карте?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Сменить сеть</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {activeCategory.elements.map((elem) => {
                  const Icon = elem.icon;
                  const isSelected = activeObjectType === elem.type;
                  return (
                    <button
                      key={elem.type}
                      type="button"
                      onClick={() => handleSelectElement(elem.type, elem.codePrefix, elem.title)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50 shadow-sm ring-2 ring-sky-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-slate-900">{elem.title}</h5>
                          <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                            {elem.codePrefix}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">{elem.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: НАПОЛНЕНИЕ ЭЛЕМЕНТА, ОБОРУДОВАНИЕ И ФОТО     */}
          {/* ==================================================== */}
          {(mode === 'edit' || currentStep === 3) && (
            <form id="network-item-form" onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
              {/* Top Selector / Mode Indicator */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-sky-600 text-white shadow-2xs">
                    {code || activeObjectType.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{name}</span>
                </div>

                {/* Sub-tabs inside Step 3 */}
                <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('filling')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'filling' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🛠️ Наполнение элемента
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('passport')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'passport' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📋 Паспорт & GPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('photos')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'photos' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📸 Реальные фото ({photos.length})
                  </button>
                </div>
              </div>

              {/* TAB 1: НАПОЛНЕНИЕ ЭЛЕМЕНТА (WELL, KTPN, VRU, ETC.) */}
              {activeTab === 'filling' && (
                <div className="space-y-4">
                  {/* SPECIFIC FILLING FOR WELL (ВОДОПРОВОДНЫЙ КОЛОДЕЦ) */}
                  {activeObjectType === 'well' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Droplet className="w-4 h-4 text-sky-600" />
                          <span>Состав оборудования и обвязки колодца</span>
                        </h4>
                        <span className="text-[11px] text-slate-500">Отметьте наполнение колодца</span>
                      </div>

                      {/* Interactive Grid of Well Components */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 1. Гребёнка / распределительный коллектор */}
                        <div
                          className={`p-3 rounded-xl border transition-all ${
                            hasManifold ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-70'
                          }`}
                        >
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>🎛️</span>
                              <span>Гребёнка / Коллектор врезок</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={hasManifold}
                              onChange={(e) => setHasManifold(e.target.checked)}
                              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                            />
                          </label>

                          {hasManifold && (
                            <div className="pt-2.5 mt-2 border-t border-emerald-200/70 space-y-2 text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-600 block">Всего штуцеров:</label>
                                  <select
                                    value={manifoldPorts}
                                    onChange={(e) => setManifoldPorts(Number(e.target.value))}
                                    className="w-full bg-white border border-slate-300 rounded-lg p-1 text-xs font-semibold"
                                  >
                                    <option value={2}>2 штуцера</option>
                                    <option value={4}>4 штуцера</option>
                                    <option value={6}>6 штуцеров</option>
                                    <option value={8}>8 штуцеров</option>
                                    <option value={10}>10 штуцеров</option>
                                    <option value={12}>12 штуцеров</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-600 block">Подключено уч.:</label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={manifoldPorts}
                                    value={usedPorts}
                                    onChange={(e) => setUsedPorts(Number(e.target.value))}
                                    className="w-full bg-white border border-slate-300 rounded-lg p-1 text-xs font-semibold"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                                <span>Свободно врезок для подключения:</span>
                                <span className="font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono">
                                  {Math.max(0, manifoldPorts - usedPorts)} из {manifoldPorts}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. Пожарный гидрант в колодце */}
                        <div
                          className={`p-3 rounded-xl border transition-all ${
                            hasFireHydrantInWell ? 'bg-red-50/70 border-red-300' : 'bg-slate-50 border-slate-200 opacity-70'
                          }`}
                        >
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>🚒</span>
                              <span>Пожарный гидрант (ПГ)</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={hasFireHydrantInWell}
                              onChange={(e) => setHasFireHydrantInWell(e.target.checked)}
                              className="w-4 h-4 text-red-600 rounded cursor-pointer"
                            />
                          </label>
                          {hasFireHydrantInWell && (
                            <p className="text-[11px] text-red-800 pt-1.5 mt-1 border-t border-red-200">
                              В колодце смонтирован подземный гидрант Ду125 (ГОСТ 8220-85). Доступен забор пожарными машинами.
                            </p>
                          )}
                        </div>

                        {/* 3. Вывод летнего поливочного водопровода */}
                        <div
                          className={`p-3 rounded-xl border transition-all ${
                            hasSummerTap ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-70'
                          }`}
                        >
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>☀️</span>
                              <span>Вывод летнего водопровода</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={hasSummerTap}
                              onChange={(e) => setHasSummerTap(e.target.checked)}
                              className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                            />
                          </label>
                          {hasSummerTap && (
                            <p className="text-[11px] text-amber-800 pt-1.5 mt-1 border-t border-amber-200">
                              Поливочный стояк с краном 1" и штуцером под шланг + нижний сливной кран для консервации на зиму.
                            </p>
                          )}
                        </div>

                        {/* 4. Запорная арматура / задвижка */}
                        <div
                          className={`p-3 rounded-xl border transition-all ${
                            hasGateValve ? 'bg-sky-50/70 border-sky-300' : 'bg-slate-50 border-slate-200 opacity-70'
                          }`}
                        >
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>🔒</span>
                              <span>Магистральная задвижка</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={hasGateValve}
                              onChange={(e) => setHasGateValve(e.target.checked)}
                              className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                            />
                          </label>

                          {hasGateValve && (
                            <div className="pt-2 mt-1 border-t border-sky-200 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="text-[10px] text-slate-600 block">Диаметр Ду:</label>
                                <select
                                  value={gateValveDiameterMm}
                                  onChange={(e) => setGateValveDiameterMm(Number(e.target.value))}
                                  className="w-full bg-white border border-slate-300 rounded-lg p-1 text-xs font-semibold"
                                >
                                  <option value={50}>Ду 50 мм</option>
                                  <option value={63}>Ду 63 мм</option>
                                  <option value={100}>Ду 100 мм</option>
                                  <option value={150}>Ду 150 мм</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-600 block">Состояние:</label>
                                <select
                                  value={gateValveState}
                                  onChange={(e) => setGateValveState(e.target.value as any)}
                                  className="w-full bg-white border border-slate-300 rounded-lg p-1 text-xs font-semibold"
                                >
                                  <option value="open">🟢 Открыта</option>
                                  <option value="closed">🔴 Закрыта</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 5. Узел коммерческого учёта (счётчик) */}
                        <div
                          className={`p-3 rounded-xl border transition-all ${
                            hasMeteringNode ? 'bg-indigo-50/70 border-indigo-300' : 'bg-slate-50 border-slate-200 opacity-70'
                          }`}
                        >
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              <span>📊</span>
                              <span>Узел коммерческого учёта</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={hasMeteringNode}
                              onChange={(e) => setHasMeteringNode(e.target.checked)}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                            />
                          </label>

                          {hasMeteringNode && (
                            <div className="pt-2 mt-1 border-t border-indigo-200 space-y-1.5 text-xs">
                              <input
                                type="text"
                                placeholder="Модель (Бетар СХВ-15)"
                                value={meterModel}
                                onChange={(e) => setMeterModel(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg p-1 text-xs"
                              />
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Заводской №"
                                  value={meterSerial}
                                  onChange={(e) => setMeterSerial(e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded-lg p-1 text-xs font-mono"
                                />
                                <input
                                  type="text"
                                  placeholder="№ Пломбы"
                                  value={sealNumber}
                                  onChange={(e) => setSealNumber(e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded-lg p-1 text-xs font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 6. Зимний обогрев и крышка */}
                        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                          <span className="font-bold text-xs text-slate-900 block">❄️ Зимняя защита</span>
                          <div className="space-y-1.5 text-xs">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasHeatingCable}
                                onChange={(e) => setHasHeatingCable(e.target.checked)}
                                className="w-4 h-4 text-sky-600 rounded"
                              />
                              <span>Греющий кабель 17 Вт/м</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasInsulatedLid}
                                onChange={(e) => setHasInsulatedLid(e.target.checked)}
                                className="w-4 h-4 text-sky-600 rounded"
                              />
                              <span>Утеплённая крышка (термоколпак)</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Дополнительные опции: воздухоотводчик, грязевик, приямок */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasAirVent}
                            onChange={(e) => setHasAirVent(e.target.checked)}
                            className="w-4 h-4 text-sky-600 rounded"
                          />
                          <span>💨 Автоматический воздухоотводчик</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasMudFilter}
                            onChange={(e) => setHasMudFilter(e.target.checked)}
                            className="w-4 h-4 text-sky-600 rounded"
                          />
                          <span>🪣 Сетчатый грязевик</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasDrainageSump}
                            onChange={(e) => setHasDrainageSump(e.target.checked)}
                            className="w-4 h-4 text-sky-600 rounded"
                          />
                          <span>💧 Дренажный приямок</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* FILLING FOR УЗЕЛ УЧЁТА ВОДЫ (WATER METERING NODE) */}
                  {activeObjectType === 'waterMeteringNode' && (
                    <div className="space-y-3 p-3.5 bg-sky-50/70 rounded-xl border border-sky-200">
                      <h4 className="text-xs font-bold uppercase text-sky-950 flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-sky-600" />
                        <span>Наполнение узла учёта воды (УУВ) & расходомера</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">Тип прибора учёта:</label>
                          <select
                            value={meterType}
                            onChange={(e) => setMeterType(e.target.value as any)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          >
                            <option value="ultrasonic">Ультразвуковой (ВЗЛЕТ/ЭХО)</option>
                            <option value="electromagnetic">Электромагнитный (ПРОМА)</option>
                            <option value="mechanical_pulse">Крыльчатый с импульсом</option>
                            <option value="vane_wheel">Турбинный фланцевый</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Модель расходомера:</label>
                          <input
                            type="text"
                            value={meterModel}
                            onChange={(e) => setMeterModel(e.target.value)}
                            placeholder="ВЗЛЕТ ЭР Ду100"
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Заводской номер:</label>
                          <input
                            type="text"
                            value={meterSerial}
                            onChange={(e) => setMeterSerial(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Диаметр трубы Ду (мм):</label>
                          <select
                            value={waterMeterDiameterMm}
                            onChange={(e) => setWaterMeterDiameterMm(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          >
                            <option value={50}>Ду 50 мм</option>
                            <option value={100}>Ду 100 мм</option>
                            <option value={150}>Ду 150 мм</option>
                            <option value={200}>Ду 200 мм</option>
                            <option value={300}>Ду 300 мм</option>
                            <option value={500}>Ду 500 мм (Основная магистраль)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Номинал расхода (м³/ч):</label>
                          <input
                            type="number"
                            value={nominalFlowM3h}
                            onChange={(e) => setNominalFlowM3h(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Текущий мгновенный расход (м³/ч):</label>
                          <input
                            type="number"
                            step="0.1"
                            value={currentFlowM3h}
                            onChange={(e) => setCurrentFlowM3h(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono font-bold text-sky-700"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Общий расход (м³):</label>
                          <input
                            type="number"
                            step="0.1"
                            value={totalConsumptionM3}
                            onChange={(e) => setTotalConsumptionM3(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Номер пломбы:</label>
                          <input
                            type="text"
                            value={sealNumber}
                            onChange={(e) => setSealNumber(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Следующая поверка:</label>
                          <input
                            type="date"
                            value={nextVerificationDate}
                            onChange={(e) => setNextVerificationDate(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-3 flex items-center gap-6 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={hasTelemetry}
                              onChange={(e) => setHasTelemetry(e.target.checked)}
                              className="w-4 h-4 text-sky-600 rounded"
                            />
                            <span>📡 GSM / NB-IoT телеметрия расхода</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={hasBypassLine}
                              onChange={(e) => setHasBypassLine(e.target.checked)}
                              className="w-4 h-4 text-sky-600 rounded"
                            />
                            <span>🔄 Обводная (байпасная) линия с задвижкой</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FILLING FOR КТПН (SUBSTATION) */}
                  {activeObjectType === 'substation' && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>Наполнение подстанции КТПН</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">Мощность трансформатора:</label>
                          <select
                            value={powerKva}
                            onChange={(e) => setPowerKva(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          >
                            <option value={100}>100 кВА</option>
                            <option value={160}>160 кВА</option>
                            <option value={250}>250 кВА</option>
                            <option value={400}>400 кВА</option>
                            <option value={630}>630 кВА</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Напряжение:</label>
                          <input
                            type="text"
                            value={voltageKv}
                            onChange={(e) => setVoltageKv(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Заземление (Ом):</label>
                          <input
                            type="number"
                            step="0.1"
                            value={groundingResistanceOhm}
                            onChange={(e) => setGroundingResistanceOhm(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FILLING FOR ВРУ (SWITCHBOARD) */}
                  {activeObjectType === 'switchboard' && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <Box className="w-4 h-4 text-indigo-600" />
                        <span>Наполнение щитовой ВРУ</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">Вводной автомат (А):</label>
                          <select
                            value={mainBreakerAmps}
                            onChange={(e) => setMainBreakerAmps(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          >
                            <option value={63}>63 А</option>
                            <option value={100}>100 А</option>
                            <option value={160}>160 А</option>
                            <option value={250}>250 А</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Счетчик электроэнергии:</label>
                          <input
                            type="text"
                            value={switchboardMeterModel}
                            onChange={(e) => setSwitchboardMeterModel(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Серийный номер:</label>
                          <input
                            type="text"
                            value={switchboardMeterSerial}
                            onChange={(e) => setSwitchboardMeterSerial(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FILLING FOR ШЛАГБАУМ (BARRIER GATE) */}
                  {activeObjectType === 'barrierGate' && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-slate-800" />
                        <span>Наполнение автоматического шлагбаума</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">Номер GSM для открытия:</label>
                          <input
                            type="text"
                            value={openByPhone}
                            onChange={(e) => setOpenByPhone(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono font-bold"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={winterHeatedDrive}
                              onChange={(e) => setWinterHeatedDrive(e.target.checked)}
                              className="w-4 h-4 text-sky-600 rounded"
                            />
                            <span>Зимний обогрев привода (+5°C)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FILLING FOR CCTV CAMERA (ВИДЕОНАБЛЮДЕНИЕ) */}
                  {activeObjectType === 'cctvCamera' && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-sky-600" />
                        <span>Наполнение камеры видеонаблюдения (CCTV)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">Разрешение матрицы:</label>
                          <select
                            value={cctvResolution}
                            onChange={(e) => setCctvResolution(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          >
                            <option value="2MP (1080p)">2MP Full HD (1080p)</option>
                            <option value="4MP (2560x1440)">4MP 2K QHD (2560x1440)</option>
                            <option value="8MP (4K UltraHD)">8MP 4K UltraHD (3840x2160)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Опорный столб ЛЭП:</label>
                          <input
                            type="text"
                            value={cctvPoleCode}
                            onChange={(e) => setCctvPoleCode(e.target.value)}
                            placeholder="Например, О-01"
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Угол обзора (°):</label>
                          <input
                            type="number"
                            min="0"
                            max="360"
                            value={cctvRotationAngle}
                            onChange={(e) => setCctvRotationAngle(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-slate-600 font-medium block">Зона и направление обзора:</label>
                          <input
                            type="text"
                            value={cctvViewDirection}
                            onChange={(e) => setCctvViewDirection(e.target.value)}
                            placeholder="Сектор наблюдения"
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Глубина архива (дней):</label>
                          <input
                            type="number"
                            value={cctvCloudArchiveDays}
                            onChange={(e) => setCctvCloudArchiveDays(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">IP-адрес в подсети:</label>
                          <input
                            type="text"
                            value={cctvIp}
                            onChange={(e) => setCctvIp(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-4 pt-2">
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={cctvHasNightVision}
                              onChange={(e) => setCctvHasNightVision(e.target.checked)}
                              className="w-4 h-4 text-sky-600 rounded"
                            />
                            <span>ИК-ночное видение (до 50м)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                            <input
                              type="checkbox"
                              checked={cctvHasPtz}
                              onChange={(e) => setCctvHasPtz(e.target.checked)}
                              className="w-4 h-4 text-sky-600 rounded"
                            />
                            <span>PTZ (поворотная 360°)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FILLING FOR ГРПШ (GAS REGULATOR) */}
                  {activeObjectType === 'gasRegulator' && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-yellow-600" />
                        <span>Наполнение ГРПШ</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">Модель регулятора:</label>
                          <input
                            type="text"
                            value={regulatorModel}
                            onChange={(e) => setRegulatorModel(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Входное давление (МПа):</label>
                          <input
                            type="number"
                            step="0.01"
                            value={inletPressureMpa}
                            onChange={(e) => setInletPressureMpa(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Выходное давление (кПа):</label>
                          <input
                            type="number"
                            step="0.1"
                            value={outletPressureKpa}
                            onChange={(e) => setOutletPressureKpa(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FILLING FOR ТБО (WASTE SITE) */}
                  {activeObjectType === 'wasteSite' && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <Trash2 className="w-4 h-4 text-slate-700" />
                        <span>Наполнение площадки ТБО (мусорные баки)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">Количество контейнеров:</label>
                          <select
                            value={containersCount}
                            onChange={(e) => setContainersCount(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          >
                            <option value={1}>1 контейнер</option>
                            <option value={2}>2 контейнера</option>
                            <option value={3}>3 контейнера</option>
                            <option value={4}>4 контейнера</option>
                            <option value={6}>6 контейнеров</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Объем контейнера (м³):</label>
                          <select
                            value={containerVolumeCbm}
                            onChange={(e) => setContainerVolumeCbm(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          >
                            <option value={0.75}>0.75 м³ (стандарт)</option>
                            <option value={1.1}>1.1 м³ (евроконтейнер)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">График вывоза:</label>
                          <input
                            type="text"
                            value={pickupSchedule}
                            onChange={(e) => setPickupSchedule(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FILLING FOR ТРУБОПРОВОД / ТРАССА (PIPELINE) */}
                  {activeObjectType === 'pipeline' && (
                    <div className="space-y-3 p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
                      <h4 className="text-xs font-bold uppercase text-blue-950 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>Параметры трубопровода / кабельной трассы</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block">Диаметр трубы Ду (мм):</label>
                          <select
                            value={pipeDiameterMm}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPipeDiameterMm(val);
                              if (val === 500) {
                                setPipeMaterial('ПЭ100 SDR11 DN500 / Сталь 530х9 в ППУ изоляции');
                                setPipeDepthMeters(2.8);
                              } else if (val === 110) {
                                setPipeMaterial('ПНД-100 SDR 11 PN16 d110х10.0 мм');
                              } else if (val === 32) {
                                setPipeMaterial('ПНД-100 SDR 11 PN16 d32х3.0 мм');
                              }
                            }}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          >
                            <option value={32}>Ду 32 мм (Подводка к участку)</option>
                            <option value={63}>Ду 63 мм (Уличный распределитель)</option>
                            <option value={110}>Ду 110 мм (Разводящая магистраль)</option>
                            <option value={160}>Ду 160 мм (Квартальная магистраль)</option>
                            <option value={500}>★ Ду 500 мм (Основная магистраль водопровода)</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-slate-600 font-medium block">Материал и тип изоляции:</label>
                          <input
                            type="text"
                            value={pipeMaterial}
                            onChange={(e) => setPipeMaterial(e.target.value)}
                            placeholder="ПЭ100 SDR11 DN500 / Сталь 530х9 в ППУ изоляции"
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 font-medium block">Глубина заложения (м):</label>
                          <input
                            type="number"
                            step="0.1"
                            value={pipeDepthMeters}
                            onChange={(e) => setPipeDepthMeters(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AUTO-GENERATED TECHNICAL SCHEMATIC (Паспорт обвязки) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Схема обвязки и состав узла:</span>
                      <span className="text-[10px] text-slate-500 font-normal">Сформировано автоматически (можно редактировать)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={deviceSchematic}
                      onChange={(e) => setDeviceSchematic(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 leading-relaxed focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  {/* MAINTENANCE TASKS */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Регламентные задачи обслуживания узла:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Добавить пункт техобслуживания..."
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTask();
                          }
                        }}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddTask}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs"
                      >
                        + Добавить
                      </button>
                    </div>

                    {maintenanceTasks.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {maintenanceTasks.map((task, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                              <span>{task}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(idx)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ПАСПОРТ & КООРДИНАТЫ GPS */}
              {activeTab === 'passport' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Шифр / Код элемента:</label>
                      <input
                        type="text"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="КВ-06, ЗК-03, КТПН-2"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Наименование объекта:</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Колодец разводящий 2-я Линия"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Координата Широта (Lat):</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        value={lat}
                        onChange={(e) => setLat(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Координата Долгота (Lng):</label>
                      <input
                        type="number"
                        step="0.000001"
                        required
                        value={lng}
                        onChange={(e) => setLng(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Техническое состояние:</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                      >
                        <option value="excellent">🟢 Отличное состояние</option>
                        <option value="normal">🔵 Нормальное (рабочее)</option>
                        <option value="requires_maintenance">🟡 Требует обслуживания / ревизии</option>
                        <option value="critical">🔴 Критическое / Требует ремонта</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Привязка на местности (ориентир):</label>
                      <input
                        type="text"
                        value={locationDetails}
                        onChange={(e) => setLocationDetails(e.target.value)}
                        placeholder="Перекресток 2-й Линии и Центральной, напротив уч. 24"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Примечание / Описание:</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Дополнительные сведения для инженера и председателя..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: ТОЛЬКО РЕАЛЬНЫЕ ФОТО (С КЛИЕНТСКИМ СЖАТИЕМ) */}
              {activeTab === 'photos' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <span className="text-amber-900 font-medium">
                      Загружайте только реальные фотографии узла с камеры смартфона или фотоархива.
                    </span>
                    <span className="font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                      Реальные фото
                    </span>
                  </div>

                  <AssetPhotoGallery
                    photos={photos}
                    onPhotosChange={(updated) => setPhotos(updated)}
                    title={`Фотографии: ${code || name}`}
                    emptyMessage="Реальные фотографии узла еще не загружены. Нажмите кнопку «Загрузить фото»."
                  />
                </div>
              )}
            </form>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {mode === 'create' && currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>
            ) : mode === 'edit' && onDelete && initialData?.id ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(activeObjectType, initialData.id);
                      setIsConfirmingDelete(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs"
                  >
                    Да, удалить
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-2 text-rose-700 hover:bg-rose-100 rounded-xl font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить объект</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {mode === 'create' && currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <span>Далее: {currentStep === 1 ? 'Выбор элемента' : 'Наполнение'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                form="network-item-form"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-sky-400" />
                <span>{mode === 'create' ? 'Сохранить и разместить' : 'Сохранить изменения'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
