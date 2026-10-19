export type UtilityType =
  | 'water_winter'
  | 'water_summer'
  | 'electricity'
  | 'gas'
  | 'stormwater'
  | 'telecom'
  | 'lighting'
  | 'roads';

export type SeasonMode = 'winter' | 'spring' | 'summer' | 'autumn';

export type UserRole = 'chairman' | 'board_member' | 'engineer' | 'accountant' | 'resident';

export type ResidencyType = 'permanent' | 'occasional' | 'summer_only';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  phone: string;
  email: string;
  plotNumber?: number;
  permissions: {
    canApproveTU: boolean;
    canSignContracts: boolean;
    canEditNetworks: boolean;
    canLogInspections: boolean;
    canEditEstimates: boolean;
    canManageUsers: boolean;
  };
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Well {
  id: string;
  code: string;
  name: string;
  type: 'water_winter' | 'water_summer' | 'sewer';
  coordinates: Coordinates;
  locationDetails?: string;
  depthMeters: number;
  diameterMm: number;
  material: 'reinforced_concrete' | 'polymer';
  totalPorts: number;
  usedPorts: number;
  freePorts: number;
  mainPipeDiameterMm: number;
  nominalPressureAtm: number;
  hasHeatingCable: boolean;
  hasInsulatedLid: boolean;
  condition: 'excellent' | 'normal' | 'requires_maintenance' | 'critical';
  deviceSchematic?: string; // Устройство узлов учета, арматуры, грязевиков
  meterModel?: string; // Модель общедомового/магистрального счетчика
  meterSerial?: string; // Заводской номер узла учета
  sealNumber?: string; // Номер пломбы
  lastMeterVerification?: string; // Дата поверки прибора учета
  maintenanceTasks?: string[]; // Необходимые задачи
  lastInspectionDate: string;
  notes: string;
  valves: {
    id: string;
    type: 'ball_valve' | 'gate_valve' | 'vent';
    diameterMm: number;
    state: 'open' | 'closed' | 'restricted';
  }[];
}

export interface Valve {
  id: string;
  code: string;
  networkType: 'water_winter' | 'water_summer' | 'gas';
  coordinates: Coordinates;
  locationDetails?: string;
  type: 'gate_valve' | 'ball_valve' | 'check_valve' | 'air_vent';
  diameterMm: number;
  state: 'open' | 'closed' | 'emergency';
  pressureAtm?: number;
  depthMeters: number;
  installedYear: number;
  condition?: 'excellent' | 'normal' | 'requires_maintenance' | 'critical';
  deviceSchematic?: string;
  maintenanceTasks?: string[];
  description: string;
}

export interface Substation {
  id: string;
  code: string; // "КТПН-1"
  name: string;
  coordinates: Coordinates;
  locationDetails?: string;
  powerKva: number;
  voltageKv: string;
  currentLoadPercent: number;
  currentPhaseA: number;
  currentPhaseB: number;
  currentPhaseC: number;
  voltagePhaseA: number;
  voltagePhaseB: number;
  voltagePhaseC: number;
  feederCount: number;
  status: 'nominal' | 'warning' | 'alert';
  groundingResistanceOhm: number;
  deviceSchematic?: string;
  maintenanceTasks?: string[];
  lastServiceDate: string;
}

export interface Switchboard {
  id: string;
  code: string; // "ВРУ-01", "ЩО-02"
  name: string;
  coordinates: Coordinates;
  locationDetails: string;
  substationCode: string;
  mainBreakerAmps: number;
  feederCount: number;
  meterModel: string;
  meterSerial: string;
  condition: 'excellent' | 'normal' | 'requires_maintenance' | 'critical';
  installationYear: number;
  deviceSchematic: string;
  maintenanceTasks: string[];
}

export interface LightPole {
  id: string;
  code: string;
  coordinates: Coordinates;
  phase: 'A' | 'B' | 'C';
  lampType: 'LED 50W' | 'LED 80W' | 'ДНаТ 150';
  isDutyLight: boolean;
  status: 'working' | 'faulty' | 'maintenance';
  hasPhotoSensor: boolean;
}

export interface WifiHotspot {
  id: string;
  code: string;
  name: string;
  coordinates: Coordinates;
  ssid: string;
  rangeMeters: number;
  frequency: '2.4 GHz / 5 GHz';
  status: 'online' | 'offline';
  ipAddress: string;
}

export interface BarrierGate {
  id: string;
  code: string; // "ШЛ-01"
  name: string;
  coordinates: Coordinates;
  type: 'automatic_gsm' | 'rfid_barrier';
  openByPhone: string;
  status: 'operational' | 'manual_mode' | 'fault';
  winterHeatedDrive: boolean;
}

export interface AdministrationFacility {
  id: string;
  code: string; // "ЗП-01"
  name: string;
  type: 'board_office' | 'security_post' | 'utility_shed';
  coordinates: Coordinates;
  description: string;
  workingHours: string;
  hasCctv: boolean;
  hasBackupGenerator: boolean;
}

export interface GasRegulatorStation {
  id: string;
  code: string;
  name: string;
  coordinates: Coordinates;
  inletPressureMpa: number;
  outletPressureKpa: number;
  regulatorModel: string;
  hasTelemetry: boolean;
  status: 'nominal' | 'warning';
  lastCheckDate: string;
  filterDifferentialPressureKpa: number;
}

export interface PipelineSegment {
  id: string;
  code: string;
  networkType: UtilityType;
  subType?:
    | 'winter'
    | 'summer'
    | 'summer_tap'
    | 'medium_pressure'
    | 'low_pressure'
    | 'drainage'
    | 'optic_fiber'
    | 'twisted_pair'
    | 'cctv'
    | 'sip_power'
    | 'lighting_cable';
  path: Coordinates[];
  diameterMm: number;
  material: string;
  depthMeters: number;
  pressureNominal?: string;
  installYear: number;
  condition: 'excellent' | 'normal' | 'requires_maintenance' | 'critical' | 'good' | 'fair' | 'poor';
  locationDetails?: string;
  deviceSchematic?: string;
  maintenanceTasks?: string[];
  description?: string;
}

export interface Plot {
  id: string;
  number: number;
  street: string;
  ownerName: string;
  phone: string;
  cadastralNumber: string;
  areaSqm: number;
  residencyType: ResidencyType; // permanent (постоянно проживают), occasional (периодически приезжают), summer_only
  winterClearingPriority: 1 | 2 | 3; // 1 = расчистка в 1-ю очередь (постоянное проживание), 2 = выезд по заявкам, 3 = плановый
  coordinates: Coordinates;
  polygon: Coordinates[];
  utilities: {
    winterWater: {
      connected: boolean;
      connectionDate?: string;
      wellId?: string;
      meterSerial?: string;
      meterLastReading?: number;
      sealNumber?: string;
      contractNumber?: string;
      tuNumber?: string;
      status: 'connected' | 'applied' | 'tu_issued' | 'none';
    };
    summerWater: boolean;
    electricity: {
      connected: boolean;
      phases: 1 | 3;
      allocatedPowerKw: number;
      substationId: string;
      meterSerial: string;
    };
    gas: {
      connected: boolean;
      status: 'connected' | 'planned' | 'none';
    };
  };
}

export interface FireHydrant {
  id: string;
  code: string;
  coordinates: Coordinates;
  type: 'underground' | 'standpipe';
  diameterMm: number;
  staticPressureAtm: number;
  flowRateLps: number;
  winterInsulationDone: boolean;
  accessibilityCondition: 'free' | 'snow_covered' | 'blocked';
  status: 'operational' | 'requires_repair';
  lastTestDate: string;
}

export interface SnowDump {
  id: string;
  code: string;
  name: string;
  coordinates: Coordinates;
  polygon: Coordinates[];
  capacityCubicMeters: number;
  currentFillPercent: number;
  status: 'open' | 'almost_full' | 'closed';
  allowedMachinery: string;
}

export interface WasteCollectionSite {
  id: string;
  code: string;
  name: string;
  coordinates: Coordinates;
  containersCount: number;
  containerVolumeCbm: number;
  hasEnclosure: boolean;
  pickupSchedule: string;
  lastPickupDate: string;
  overflowRisk: 'low' | 'medium' | 'high';
  isWinterActive: boolean; // Действующая зимой
}

export interface FireTurnaround {
  id: string;
  code: string;
  name: string;
  coordinates: Coordinates;
  radiusMeters: number;
  surfaceType: 'crushed_stone' | 'concrete' | 'hardened_ground';
  isClearOfObstacles: boolean;
  winterCleared: boolean;
}

export interface InspectionCheckPoint {
  id: string;
  order: number;
  name: string;
  category: 'water' | 'electric' | 'gas' | 'roads_winter' | 'fire_safety' | 'waste';
  coordinates: Coordinates;
  checkItems: string[];
  targetAssetCode: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
}

export interface InspectionLogEntry {
  id: string;
  date: string;
  inspectorName: string;
  inspectorRole: string;
  pointId: string;
  pointName: string;
  assetCode: string;
  status: 'ok' | 'minor_issue' | 'defect' | 'emergency';
  findings: string;
  measuresRequired: string;
  deadline?: string;
  photoUrl?: string;
  resolved: boolean;
  resolvedDate?: string;
}

export interface WorkTask {
  id: string;
  title: string;
  category: 'water' | 'roads' | 'snow_clearing' | 'stormwater' | 'electric' | 'gas' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planned' | 'in_progress' | 'completed' | 'verified';
  scheduledDate: string;
  scheduledEndDate?: string;
  completionDate?: string;
  assignee: string;
  assignedContractor?: string;
  description: string;
  season: 'winter' | 'spring' | 'summer' | 'autumn' | 'all';
  locationName: string;
  locationCoordinates?: Coordinates;
  estimateId?: string;
  totalCostRub: number;
}

export interface EstimateItem {
  id: string;
  name: string;
  category: 'material' | 'machinery' | 'labor';
  unit: string;
  quantity: number;
  unitPriceRub: number;
  totalRub: number;
}

export interface WorkEstimate {
  id: string;
  taskId: string;
  taskTitle: string;
  dateCreated: string;
  approvedByBoard: boolean;
  approvalDate?: string;
  items: EstimateItem[];
  subtotalMaterials: number;
  subtotalMachinery: number;
  subtotalLabor: number;
  overheadPercent: number;
  totalAmountRub: number;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetType: 'well' | 'pipeline' | 'substation' | 'hydrant' | 'road' | 'stormwater' | 'barrier' | 'facility' | 'valve' | 'switchboard';
  date: string;
  performedBy: string;
  workDescription: string;
  replacedParts?: string;
  nextScheduledDate: string;
  costRub: number;
}

export interface WinterConnectionRequest {
  id: string;
  requestNumber: string;
  plotNumber: number;
  ownerName: string;
  ownerPhone: string;
  cadastralNumber: string;
  appliedDate: string;
  status: 'draft' | 'under_review' | 'tu_issued' | 'contract_signed' | 'constructed' | 'inspected_sealed';
  
  selectedWellId: string;
  selectedWellCode: string;
  wellDistanceMeters: number;
  pipeRouteLengthMeters: number;
  
  pipeDiameterMm: number;
  pipeMaterial: string;
  trenchDepthMeters: number;
  trenchLengthMeters: number;
  pressureAtWellAtm: number;
  hasHeatingCable: boolean;
  heatingCableWattsPerMeter: number;
  heatingCableLengthMeters: number;
  insulationType: string;
  
  meterModel: string;
  meterSerial: string;
  initialReading: number;
  sealNumber: string;
  sealDate?: string;
  
  crossesGas: boolean;
  crossesPowerCable: boolean;
  crossesRoad: boolean;
  
  tuIssuedDate?: string;
  contractNumber?: string;
  contractSignDate?: string;
  constructionCompletionDate?: string;
  acceptanceActDate?: string;
  sealingActDate?: string;
  approvedByChairman: boolean;
  approvedByEngineer: boolean;
  notes: string;
}
