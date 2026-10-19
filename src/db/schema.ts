import { pgTable, text, serial, integer, real, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table (mandatory for Firebase Auth link in Cloud SQL)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('chairman'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Territory Boundary and Contours (сохранение нарисованных контуров и границ ДТСН)
export const territoryContours = pgTable('territory_contours', {
  id: text('id').primaryKey(), // 'dtsn_boundary'
  name: text('name').notNull(),
  polygon: jsonb('polygon').notNull(), // Coordinates[]
  isOfficial: boolean('is_official').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Pipelines (трассы водопровода, электрокабелей, газа, ВОЛС)
export const pipelinesTable = pgTable('pipelines', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  networkType: text('network_type').notNull(), // 'water_winter' | 'water_summer' | 'electricity' | 'gas' | 'telecom'
  subType: text('sub_type'),
  path: jsonb('path').notNull(), // Coordinates[]
  diameterMm: integer('diameter_mm').notNull(),
  material: text('material').notNull(),
  depthMeters: real('depth_meters').notNull(),
  pressureNominal: text('pressure_nominal'),
  installYear: integer('install_year').notNull(),
  condition: text('condition').notNull(),
  locationDetails: text('location_details'),
  deviceSchematic: text('device_schematic'),
  maintenanceTasks: jsonb('maintenance_tasks'),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Wells (водопроводные колодцы КВ)
export const wellsTable = pgTable('wells', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  coordinates: jsonb('coordinates').notNull(), // Coordinates
  locationDetails: text('location_details'),
  depthMeters: real('depth_meters').notNull(),
  diameterMm: integer('diameter_mm').notNull(),
  material: text('material').notNull(),
  totalPorts: integer('total_ports').notNull(),
  usedPorts: integer('used_ports').notNull(),
  freePorts: integer('free_ports').notNull(),
  mainPipeDiameterMm: integer('main_pipe_diameter_mm').notNull(),
  nominalPressureAtm: real('nominal_pressure_atm').notNull(),
  hasHeatingCable: boolean('has_heating_cable').notNull().default(false),
  hasInsulatedLid: boolean('has_insulated_lid').notNull().default(false),
  condition: text('condition').notNull(),
  deviceSchematic: text('device_schematic'),
  meterModel: text('meter_model'),
  meterSerial: text('meter_serial'),
  sealNumber: text('seal_number'),
  lastMeterVerification: text('last_meter_verification'),
  maintenanceTasks: jsonb('maintenance_tasks'),
  lastInspectionDate: text('last_inspection_date'),
  notes: text('notes'),
  valves: jsonb('valves'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Valves (задвижки и запорная арматура ЗК)
export const valvesTable = pgTable('valves', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  networkType: text('network_type').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  locationDetails: text('location_details'),
  type: text('type').notNull(),
  diameterMm: integer('diameter_mm').notNull(),
  state: text('state').notNull(), // 'open' | 'closed' | 'emergency'
  pressureAtm: real('pressure_atm'),
  depthMeters: real('depth_meters').notNull(),
  installedYear: integer('installed_year').notNull(),
  condition: text('condition'),
  deviceSchematic: text('device_schematic'),
  maintenanceTasks: jsonb('maintenance_tasks'),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Switchboards (электрощитовые ВРУ / ШР)
export const switchboardsTable = pgTable('switchboards', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  locationDetails: text('location_details'),
  substationCode: text('substation_code').notNull(),
  mainBreakerAmps: integer('main_breaker_amps').notNull(),
  feederCount: integer('feeder_count').notNull(),
  meterModel: text('meter_model').notNull(),
  meterSerial: text('meter_serial').notNull(),
  condition: text('condition').notNull(),
  installationYear: integer('installation_year').notNull(),
  deviceSchematic: text('device_schematic'),
  maintenanceTasks: jsonb('maintenance_tasks'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Substations (КТПН)
export const substationsTable = pgTable('substations', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  locationDetails: text('location_details'),
  powerKva: integer('power_kva').notNull(),
  voltageKv: text('voltage_kv').notNull(),
  currentLoadPercent: integer('current_load_percent').notNull(),
  currentPhaseA: real('current_phase_a').notNull(),
  currentPhaseB: real('current_phase_b').notNull(),
  currentPhaseC: real('current_phase_c').notNull(),
  voltagePhaseA: real('voltage_phase_a').notNull(),
  voltagePhaseB: real('voltage_phase_b').notNull(),
  voltagePhaseC: real('voltage_phase_c').notNull(),
  feederCount: integer('feeder_count').notNull(),
  status: text('status').notNull(),
  groundingResistanceOhm: real('grounding_resistance_ohm').notNull(),
  deviceSchematic: text('device_schematic'),
  maintenanceTasks: jsonb('maintenance_tasks'),
  lastServiceDate: text('last_service_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Fire Hydrants (ПГ)
export const fireHydrantsTable = pgTable('fire_hydrants', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  type: text('type').notNull(),
  diameterMm: integer('diameter_mm').notNull().default(100),
  staticPressureAtm: real('static_pressure_atm').notNull().default(4.0),
  flowRateLps: real('flow_rate_lps').notNull().default(20.0),
  winterInsulationDone: boolean('winter_insulation_done').notNull().default(false),
  accessibilityCondition: text('accessibility_condition').notNull().default('free'),
  status: text('status').notNull().default('operational'),
  lastTestDate: text('last_test_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Light Poles (опоры освещения)
export const lightPolesTable = pgTable('light_poles', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  phase: text('phase').notNull(),
  lampType: text('lamp_type').notNull(),
  isDutyLight: boolean('is_duty_light').notNull().default(false),
  status: text('status').notNull(),
  hasPhotoSensor: boolean('has_photo_sensor').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Wifi Hotspots (точки доступа Wi-Fi)
export const wifiHotspotsTable = pgTable('wifi_hotspots', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  ssid: text('ssid').notNull(),
  rangeMeters: integer('range_meters').notNull(),
  frequency: text('frequency').notNull(),
  status: text('status').notNull(),
  ipAddress: text('ip_address').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Plots (участки и абоненты сетей)
export const plotsTable = pgTable('plots', {
  id: text('id').primaryKey(),
  number: integer('number').notNull(),
  street: text('street').notNull(),
  ownerName: text('owner_name').notNull(),
  phone: text('phone'),
  cadastralNumber: text('cadastral_number').notNull(),
  areaSqm: real('area_sqm').notNull(),
  residencyType: text('residency_type').notNull(),
  winterClearingPriority: integer('winter_clearing_priority').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  polygon: jsonb('polygon').notNull(),
  utilities: jsonb('utilities').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Barrier Gates (шлагбаумы)
export const barrierGatesTable = pgTable('barrier_gates', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  type: text('type').notNull(),
  openByPhone: text('open_by_phone').notNull(),
  status: text('status').notNull(),
  winterHeatedDrive: boolean('winter_heated_drive').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Administration Facilities (здание Правления, КПП охраны)
export const adminFacilitiesTable = pgTable('admin_facilities', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  description: text('description').notNull(),
  workingHours: text('working_hours').notNull(),
  hasCctv: boolean('has_cctv').notNull().default(true),
  hasBackupGenerator: boolean('has_backup_generator').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Gas Regulator Station (ГРПШ)
export const gasRegulatorsTable = pgTable('gas_regulators', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  coordinates: jsonb('coordinates').notNull(),
  inletPressureMpa: real('inlet_pressure_mpa').notNull(),
  outletPressureKpa: real('outlet_pressure_kpa').notNull(),
  regulatorModel: text('regulator_model').notNull(),
  hasTelemetry: boolean('has_telemetry').notNull().default(true),
  status: text('status').notNull(),
  lastCheckDate: text('last_check_date').notNull(),
  filterDifferentialPressureKpa: real('filter_differential_pressure_kpa').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
