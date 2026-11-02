import React, { useState, useEffect } from 'react';
import {
  Plot,
  Well,
  Valve,
  Substation,
  LightPole,
  GasRegulatorStation,
  PipelineSegment,
  FireHydrant,
  SnowDump,
  WasteCollectionSite,
  FireTurnaround,
  InspectionCheckPoint,
  InspectionLogEntry,
  WorkTask,
  WorkEstimate,
  MaintenanceRecord,
  WinterConnectionRequest,
  SeasonMode,
  UserProfile,
  Coordinates,
  WifiHotspot,
  BarrierGate,
  AdministrationFacility,
  Switchboard,
  AssetPhoto,
  CctvCamera,
  WaterMeteringNode,
} from './types/index.ts';
import {
  INITIAL_PLOTS,
  INITIAL_WELLS,
  INITIAL_VALVES,
  INITIAL_SUBSTATIONS,
  INITIAL_LIGHT_POLES,
  INITIAL_GAS_REGULATOR,
  INITIAL_PIPELINES,
  INITIAL_FIRE_HYDRANTS,
  INITIAL_SNOW_DUMPS,
  INITIAL_WASTE_SITES,
  INITIAL_FIRE_TURNAROUNDS,
  INITIAL_INSPECTION_POINTS,
  INITIAL_INSPECTION_LOGS,
  INITIAL_WORK_TASKS,
  INITIAL_ESTIMATES,
  INITIAL_MAINTENANCE_RECORDS,
  INITIAL_WINTER_REQUESTS,
  INITIAL_USERS,
  INITIAL_WIFI_HOTSPOTS,
  INITIAL_BARRIER_GATES,
  INITIAL_ADMIN_FACILITIES,
  INITIAL_SWITCHBOARDS,
  INITIAL_CCTV_CAMERAS,
  INITIAL_WATER_METERING_NODES,
  SOCIETY_INFO,
  DTSN_PENSIONER_BOUNDARY,
} from './data/mockData';
import {
  fetchNetworkData,
  apiSaveBoundary,
  apiSavePipeline,
  apiDeletePipeline,
  apiSaveWell,
  apiDeleteWell,
  apiSaveValve,
  apiDeleteValve,
  apiSaveSwitchboard,
  apiDeleteSwitchboard,
  apiSaveSubstation,
  apiDeleteSubstation,
  apiSaveFireHydrant,
  apiDeleteFireHydrant,
  apiSaveLightPole,
  apiDeleteLightPole,
  apiSaveWifiHotspot,
  apiDeleteWifiHotspot,
  apiSaveBarrierGate,
  apiDeleteBarrierGate,
  apiSaveAdminFacility,
  apiDeleteAdminFacility,
  apiSavePlot,
  apiUpdateCoordinates,
} from './utils/api';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { findNearestWellWithFreePorts } from './utils/geoUtils';
import { Navbar } from './components/Navbar';
import { EngineeringMap } from './components/Map/EngineeringMap';
import { WinterWaterManagement } from './components/WinterWater/WinterWaterManagement';
import { WinterWaterWizard } from './components/WinterWater/WinterWaterWizard';
import { DocumentPackageModal } from './components/Documents/DocumentPackageModal';
import { InspectionLogView } from './components/Inspections/InspectionLogView';
import { WorkScheduleView } from './components/WorkOrders/WorkScheduleView';
import { AdminPanel } from './components/Admin/AdminPanel';
import { PlotsDirectory } from './components/Plots/PlotsDirectory';
import { MapPin, Droplet, Shield, Calendar, Users, Home, RotateCw, Snowflake, Sun, Sprout, Leaf, Database, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation & 4-Season Mode State
  const [activeTab, setActiveTab] = useState<'map' | 'winter_water' | 'inspections' | 'schedule' | 'plots' | 'admin'>('map');
  const [season, setSeason] = useState<SeasonMode>(() =>
    loadFromStorage('dtsn_active_season', 'winter')
  );

  // Boundary Points (Territory contour saved in PostgreSQL & LocalStorage)
  const [boundaryPoints, setBoundaryPoints] = useState<Coordinates[]>(() => {
    const loaded = loadFromStorage<Coordinates[]>('dtsn_boundary', DTSN_PENSIONER_BOUNDARY);
    if (Array.isArray(loaded) && loaded.length >= 3 && loaded.every((pt) => pt && typeof pt.lat === 'number')) {
      return loaded;
    }
    return DTSN_PENSIONER_BOUNDARY;
  });
  const [isCloudSqlLoaded, setIsCloudSqlLoaded] = useState<boolean>(false);

  // Users & Active Profile (persisted)
  const [users, setUsers] = useState<UserProfile[]>(() =>
    loadFromStorage('dtsn_users', INITIAL_USERS)
  );
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadFromStorage('dtsn_current_user_id', 'u-1')
  );
  const rawCurrentUser = (users && users.length > 0 ? users.find((u) => u.id === currentUserId) || users[0] : null) || INITIAL_USERS[0];
  const currentUser: UserProfile = {
    ...INITIAL_USERS[0],
    ...rawCurrentUser,
    permissions: {
      ...INITIAL_USERS[0].permissions,
      ...(rawCurrentUser?.permissions || {}),
    },
  };

  // Core Datasets (Loaded from LocalStorage to avoid losing edited networks/polygons)
  const [plots, setPlots] = useState<Plot[]>(() => {
    const loaded = loadFromStorage<Plot[]>('dtsn_plots', INITIAL_PLOTS);
    if (!Array.isArray(loaded) || loaded.length === 0) return INITIAL_PLOTS;
    return loaded.map((p) => {
      const canonical = INITIAL_PLOTS.find((ip) => ip.id === p.id || ip.number === p.number) || INITIAL_PLOTS[0];
      return {
        ...canonical,
        ...p,
        coordinates: p?.coordinates && typeof p.coordinates.lat === 'number' ? p.coordinates : canonical.coordinates,
        polygon: Array.isArray(p?.polygon) && p.polygon.length >= 3 ? p.polygon : canonical.polygon,
        utilities: {
          ...canonical.utilities,
          ...(p?.utilities || {}),
          winterWater: {
            ...canonical.utilities.winterWater,
            ...(p?.utilities?.winterWater || {}),
          },
          electricity: {
            ...canonical.utilities.electricity,
            ...(p?.utilities?.electricity || {}),
          },
          gas: {
            ...canonical.utilities.gas,
            ...(p?.utilities?.gas || {}),
          },
        },
      };
    });
  });
  const [wells, setWells] = useState<Well[]>(() =>
    loadFromStorage('dtsn_wells', INITIAL_WELLS)
  );
  const [valves, setValves] = useState<Valve[]>(() =>
    loadFromStorage('dtsn_valves', INITIAL_VALVES)
  );
  const [substations, setSubstations] = useState<Substation[]>(() =>
    loadFromStorage('dtsn_substations', INITIAL_SUBSTATIONS)
  );
  const [lightPoles, setLightPoles] = useState<LightPole[]>(() =>
    loadFromStorage('dtsn_light_poles', INITIAL_LIGHT_POLES)
  );
  const [gasRegulator, setGasRegulator] = useState<GasRegulatorStation>(() => {
    const loaded = loadFromStorage<GasRegulatorStation>('dtsn_gas_regulator', INITIAL_GAS_REGULATOR);
    if (!loaded || !loaded.coordinates || typeof loaded.coordinates.lat !== 'number') {
      return INITIAL_GAS_REGULATOR;
    }
    return {
      ...INITIAL_GAS_REGULATOR,
      ...loaded,
    };
  });
  const [pipelines, setPipelines] = useState<PipelineSegment[]>(() =>
    loadFromStorage('dtsn_pipelines', INITIAL_PIPELINES)
  );
  const [fireHydrants, setFireHydrants] = useState<FireHydrant[]>(() =>
    loadFromStorage('dtsn_fire_hydrants', INITIAL_FIRE_HYDRANTS)
  );
  const [snowDumps, setSnowDumps] = useState<SnowDump[]>(() =>
    loadFromStorage('dtsn_snow_dumps', INITIAL_SNOW_DUMPS)
  );
  const [wasteSites, setWasteSites] = useState<WasteCollectionSite[]>(() =>
    loadFromStorage('dtsn_waste_sites', INITIAL_WASTE_SITES)
  );
  const [fireTurnarounds, setFireTurnarounds] = useState<FireTurnaround[]>(() =>
    loadFromStorage('dtsn_fire_turnarounds', INITIAL_FIRE_TURNAROUNDS)
  );
  const [inspectionPoints, setInspectionPoints] = useState<InspectionCheckPoint[]>(() =>
    loadFromStorage('dtsn_inspection_points', INITIAL_INSPECTION_POINTS)
  );
  const [inspectionLogs, setInspectionLogs] = useState<InspectionLogEntry[]>(() =>
    loadFromStorage('dtsn_inspection_logs', INITIAL_INSPECTION_LOGS)
  );
  const [workTasks, setWorkTasks] = useState<WorkTask[]>(() =>
    loadFromStorage('dtsn_work_tasks', INITIAL_WORK_TASKS)
  );
  const [estimates, setEstimates] = useState<WorkEstimate[]>(() =>
    loadFromStorage('dtsn_estimates', INITIAL_ESTIMATES)
  );
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() =>
    loadFromStorage('dtsn_maintenance_records', INITIAL_MAINTENANCE_RECORDS)
  );
  const [winterRequests, setWinterRequests] = useState<WinterConnectionRequest[]>(() =>
    loadFromStorage('dtsn_winter_requests', INITIAL_WINTER_REQUESTS)
  );
  const [wifiHotspots, setWifiHotspots] = useState<WifiHotspot[]>(() =>
    loadFromStorage('dtsn_wifi_hotspots', INITIAL_WIFI_HOTSPOTS)
  );
  const [barrierGates, setBarrierGates] = useState<BarrierGate[]>(() =>
    loadFromStorage('dtsn_barrier_gates', INITIAL_BARRIER_GATES)
  );
  const [adminFacilities, setAdminFacilities] = useState<AdministrationFacility[]>(() =>
    loadFromStorage('dtsn_admin_facilities', INITIAL_ADMIN_FACILITIES)
  );
  const [switchboards, setSwitchboards] = useState<Switchboard[]>(() =>
    loadFromStorage('dtsn_switchboards', INITIAL_SWITCHBOARDS)
  );
  const [cctvCameras, setCctvCameras] = useState<CctvCamera[]>(() =>
    loadFromStorage('dtsn_cctv_cameras', INITIAL_CCTV_CAMERAS)
  );
  const [waterMeteringNodes, setWaterMeteringNodes] = useState<WaterMeteringNode[]>(() =>
    loadFromStorage('dtsn_water_metering_nodes', INITIAL_WATER_METERING_NODES)
  );

  // Interaction State
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [highlightedRoute, setHighlightedRoute] = useState<{
    plotCoords: Coordinates;
    wellCoords: Coordinates;
    wellCode: string;
  } | null>(null);

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardPreselectedPlot, setWizardPreselectedPlot] = useState<Plot | null>(null);
  const [documentModalData, setDocumentModalData] = useState<{
    request: WinterConnectionRequest;
    plot: Plot;
    well: Well;
  } | null>(null);

  // Start Winter Water Connection Flow
  const handleStartWinterConnection = (plot: Plot) => {
    setWizardPreselectedPlot(plot);
    setIsWizardOpen(true);
  };

  // Select Plot on Map & Highlight Route to nearest well with free ports
  const handleSelectPlot = (plot: Plot) => {
    setSelectedPlotId(plot.id);
    const nearest = findNearestWellWithFreePorts(plot.coordinates, wells);
    if (nearest.well) {
      setHighlightedRoute({
        plotCoords: plot.coordinates,
        wellCoords: nearest.well.coordinates,
        wellCode: nearest.well.code,
      });
    } else {
      setHighlightedRoute(null);
    }
  };

  const handleSelectPlotFromOtherTab = (plot: Plot) => {
    handleSelectPlot(plot);
    setActiveTab('map');
  };

  const handleSelectWell = (well: Well) => {
    // well selection
  };

  // Season & User Switching with persistence
  const handleSeasonChange = (newSeason: SeasonMode) => {
    setSeason(newSeason);
    saveToStorage('dtsn_active_season', newSeason);
  };

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    saveToStorage('dtsn_current_user_id', userId);
  };

  const handleUpdateUserProfile = (updatedUser: UserProfile) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      saveToStorage('dtsn_users', next);
      return next;
    });
  };

  // Save New Winter Connection Request
  const handleSaveWinterRequest = (newRequest: WinterConnectionRequest) => {
    setWinterRequests((prev) => {
      const next = [newRequest, ...prev];
      saveToStorage('dtsn_winter_requests', next);
      return next;
    });

    // Update Plot status
    setPlots((prev) => {
      const next = prev.map((p) => {
        if (p.number === newRequest.plotNumber) {
          return {
            ...p,
            utilities: {
              ...p.utilities,
              winterWater: {
                ...p.utilities.winterWater,
                status: 'tu_issued' as const,
                wellId: newRequest.selectedWellId,
                tuNumber: `ТУ-В-2026/${p.number}`,
              },
            },
          };
        }
        return p;
      });
      saveToStorage('dtsn_plots', next);
      return next;
    });

    // Update Well ports
    setWells((prev) => {
      const next = prev.map((w) => {
        if (w.id === newRequest.selectedWellId && w.freePorts > 0) {
          return {
            ...w,
            usedPorts: w.usedPorts + 1,
            freePorts: w.freePorts - 1,
          };
        }
        return w;
      });
      saveToStorage('dtsn_wells', next);
      return next;
    });

    // Add Audit Log in Maintenance Records
    const newMaint: MaintenanceRecord = {
      id: `mr-conn-${Date.now()}`,
      assetId: newRequest.selectedWellId,
      assetCode: newRequest.selectedWellCode,
      assetType: 'well',
      date: new Date().toISOString().split('T')[0],
      performedBy: currentUser.name,
      workDescription: `Выданы Технические условия на подключение участка № ${newRequest.plotNumber} (${newRequest.ownerName}). Зарезервирован штуцер врезки d32.`,
      nextScheduledDate: '2026-11-01',
      costRub: 0,
    };
    handleAddMaintenanceRecord(newMaint);

    setIsWizardOpen(false);
  };

  // Approve & Sign Package in Modal
  const handleApproveAndSignPackage = () => {
    if (!documentModalData) return;
    const { request, plot } = documentModalData;

    setWinterRequests((prev) => {
      const next = prev.map((r) => {
        if (r.id === request.id) {
          return {
            ...r,
            approvedByChairman: true,
            approvedByEngineer: true,
            status: 'contract_signed' as const,
            contractNumber: `ДЗВ-${plot.number}/26`,
            contractSignDate: new Date().toISOString().split('T')[0],
          };
        }
        return r;
      });
      saveToStorage('dtsn_winter_requests', next);
      return next;
    });

    setDocumentModalData((prev) =>
      prev
        ? {
            ...prev,
            request: {
              ...prev.request,
              approvedByChairman: true,
              approvedByEngineer: true,
              status: 'contract_signed',
              contractNumber: `ДЗВ-${plot.number}/26`,
            },
          }
        : null
    );
  };

  // Inspection Log Handlers
  const handleAddInspectionLog = (newEntry: InspectionLogEntry) => {
    setInspectionLogs((prev) => {
      const next = [newEntry, ...prev];
      saveToStorage('dtsn_inspection_logs', next);
      return next;
    });
  };

  const handleResolveInspectionLog = (id: string) => {
    setInspectionLogs((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, resolved: true, resolvedDate: new Date().toISOString().split('T')[0] } : l));
      saveToStorage('dtsn_inspection_logs', next);
      return next;
    });
  };

  // Work Schedule & Estimates Handlers
  const handleAddWorkTask = (task: WorkTask, estimate?: WorkEstimate) => {
    setWorkTasks((prev) => {
      const next = [task, ...prev];
      saveToStorage('dtsn_work_tasks', next);
      return next;
    });
    if (estimate) {
      setEstimates((prev) => {
        const next = [estimate, ...prev];
        saveToStorage('dtsn_estimates', next);
        return next;
      });
    }
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: WorkTask['status']) => {
    setWorkTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
      saveToStorage('dtsn_work_tasks', next);
      return next;
    });
  };

  const handleApproveEstimate = (estimateId: string) => {
    setEstimates((prev) => {
      const next = prev.map((e) =>
        e.id === estimateId
          ? { ...e, approvedByBoard: true, approvalDate: new Date().toISOString().split('T')[0] }
          : e
      );
      saveToStorage('dtsn_estimates', next);
      return next;
    });
  };

  // Admin Handlers
  const handleUpdateUserPermissions = (userId: string, permissions: UserProfile['permissions']) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, permissions } : u));
      saveToStorage('dtsn_users', next);
      return next;
    });
  };

  const handleAddMaintenanceRecord = (record: MaintenanceRecord) => {
    setMaintenanceRecords((prev) => {
      const next = [record, ...prev];
      saveToStorage('dtsn_maintenance_records', next);
      return next;
    });
  };

  // LOAD FROM POSTGRESQL ON MOUNT
  useEffect(() => {
    let isMounted = true;
    fetchNetworkData()
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.boundary && data.boundary.length > 0) setBoundaryPoints(data.boundary);
        if (data.pipelines && data.pipelines.length > 0) setPipelines(data.pipelines);
        if (data.wells && data.wells.length > 0) setWells(data.wells);
        if (data.valves && data.valves.length > 0) setValves(data.valves);
        if (data.switchboards && data.switchboards.length > 0) setSwitchboards(data.switchboards);
        if (data.substations && data.substations.length > 0) setSubstations(data.substations);
        if (data.fireHydrants && data.fireHydrants.length > 0) setFireHydrants(data.fireHydrants);
        if (data.lightPoles && data.lightPoles.length > 0) setLightPoles(data.lightPoles);
        if (data.wifiHotspots && data.wifiHotspots.length > 0) setWifiHotspots(data.wifiHotspots);
        if (data.barrierGates && data.barrierGates.length > 0) setBarrierGates(data.barrierGates);
        if (data.adminFacilities && data.adminFacilities.length > 0) setAdminFacilities(data.adminFacilities);
        if (data.gasRegulator) setGasRegulator(data.gasRegulator);
        if (data.plots && data.plots.length > 0) setPlots(data.plots);
        setIsCloudSqlLoaded(true);
      })
      .catch((err) => {
        console.warn('Initial PostgreSQL fetch failed:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveBoundary = (newBoundary: Coordinates[]) => {
    setBoundaryPoints(newBoundary);
    saveToStorage('dtsn_boundary', newBoundary);
    apiSaveBoundary(newBoundary);
  };

  // Network & Pipeline CRUD Handlers
  const handleAddPipeline = (newPipe: PipelineSegment) => {
    setPipelines((prev) => {
      const next = [newPipe, ...prev];
      saveToStorage('dtsn_pipelines', next);
      return next;
    });
    apiSavePipeline(newPipe);
    handleAddMaintenanceRecord({
      id: `mr-pipe-${Date.now()}`,
      assetId: newPipe.id,
      assetCode: newPipe.code,
      assetType: 'pipeline',
      date: new Date().toISOString().split('T')[0],
      performedBy: currentUser.name,
      workDescription: `Прокладка и постановка на баланс участка сети ${newPipe.code} (${newPipe.material}, Ду ${newPipe.diameterMm}мм).`,
      nextScheduledDate: '2027-05-01',
      costRub: 0,
    });
  };

  const handleUpdatePipeline = (updatedPipe: PipelineSegment) => {
    setPipelines((prev) => {
      const next = prev.map((p) => (p.id === updatedPipe.id ? updatedPipe : p));
      saveToStorage('dtsn_pipelines', next);
      return next;
    });
    apiSavePipeline(updatedPipe);
    handleAddMaintenanceRecord({
      id: `mr-pipe-upd-${Date.now()}`,
      assetId: updatedPipe.id,
      assetCode: updatedPipe.code,
      assetType: 'pipeline',
      date: new Date().toISOString().split('T')[0],
      performedBy: currentUser.name,
      workDescription: `Обновление технических характеристик и регламентных задач сети ${updatedPipe.code}. Состояние: ${updatedPipe.condition}.`,
      nextScheduledDate: '2027-05-01',
      costRub: 0,
    });
  };

  const handleDeletePipeline = (id: string) => {
    setPipelines((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToStorage('dtsn_pipelines', next);
      return next;
    });
    apiDeletePipeline(id);
  };

  const handleAddWell = (newWell: Well) => {
    setWells((prev) => {
      const next = [newWell, ...prev];
      saveToStorage('dtsn_wells', next);
      return next;
    });
    apiSaveWell(newWell);
    handleAddMaintenanceRecord({
      id: `mr-well-${Date.now()}`,
      assetId: newWell.id,
      assetCode: newWell.code,
      assetType: 'well',
      date: new Date().toISOString().split('T')[0],
      performedBy: currentUser.name,
      workDescription: `Монтаж и ввод в эксплуатацию колодца ${newWell.code} (${newWell.name}). Свободных врезок: ${newWell.freePorts}.`,
      nextScheduledDate: '2027-06-01',
      costRub: 0,
    });
  };

  const handleUpdateWell = (updatedWell: Well) => {
    setWells((prev) => {
      const next = prev.map((w) => (w.id === updatedWell.id ? updatedWell : w));
      saveToStorage('dtsn_wells', next);
      return next;
    });
    apiSaveWell(updatedWell);
    handleAddMaintenanceRecord({
      id: `mr-well-upd-${Date.now()}`,
      assetId: updatedWell.id,
      assetCode: updatedWell.code,
      assetType: 'well',
      date: new Date().toISOString().split('T')[0],
      performedBy: currentUser.name,
      workDescription: `Корректировка узла обвязки колодца ${updatedWell.code}. Состояние: ${updatedWell.condition}. Задачи: ${updatedWell.maintenanceTasks?.join(', ') || 'нет'}.`,
      nextScheduledDate: '2027-06-01',
      costRub: 0,
    });
  };

  const handleDeleteWell = (id: string) => {
    setWells((prev) => {
      const next = prev.filter((w) => w.id !== id);
      saveToStorage('dtsn_wells', next);
      return next;
    });
    apiDeleteWell(id);
  };

  const handleAddValve = (newValve: Valve) => {
    setValves((prev) => {
      const next = [newValve, ...prev];
      saveToStorage('dtsn_valves', next);
      return next;
    });
    apiSaveValve(newValve);
    handleAddMaintenanceRecord({
      id: `mr-valve-${Date.now()}`,
      assetId: newValve.id,
      assetCode: newValve.code,
      assetType: 'valve',
      date: new Date().toISOString().split('T')[0],
      performedBy: currentUser.name,
      workDescription: `Установка запорной арматуры ${newValve.code} (Ду ${newValve.diameterMm}мм).`,
      nextScheduledDate: '2027-05-15',
      costRub: 0,
    });
  };

  const handleUpdateValve = (updatedValve: Valve) => {
    setValves((prev) => {
      const next = prev.map((v) => (v.id === updatedValve.id ? updatedValve : v));
      saveToStorage('dtsn_valves', next);
      return next;
    });
    apiSaveValve(updatedValve);
  };

  const handleDeleteValve = (id: string) => {
    setValves((prev) => {
      const next = prev.filter((v) => v.id !== id);
      saveToStorage('dtsn_valves', next);
      return next;
    });
    apiDeleteValve(id);
  };

  const handleToggleValve = (valveId: string) => {
    setValves((prev) => {
      const next = prev.map((v) => {
        if (v.id === valveId) {
          const nextState: 'open' | 'closed' = v.state === 'open' ? 'closed' : 'open';
          const updated: Valve = { ...v, state: nextState };
          apiSaveValve(updated);
          handleAddMaintenanceRecord({
            id: `mr-valve-toggle-${Date.now()}`,
            assetId: v.id,
            assetCode: v.code,
            assetType: 'valve',
            date: new Date().toISOString().split('T')[0],
            performedBy: currentUser.name,
            workDescription: `Переключение положения задвижки ${v.code} в положение: ${nextState === 'open' ? 'ОТКРЫТО' : 'ЗАКРЫТО'}.`,
            nextScheduledDate: '2027-05-15',
            costRub: 0,
          });
          return updated;
        }
        return v;
      });
      saveToStorage('dtsn_valves', next);
      return next;
    });
  };

  const handleAddSwitchboard = (newSb: Switchboard) => {
    setSwitchboards((prev) => {
      const next = [newSb, ...prev];
      saveToStorage('dtsn_switchboards', next);
      return next;
    });
    apiSaveSwitchboard(newSb);
    handleAddMaintenanceRecord({
      id: `mr-sb-${Date.now()}`,
      assetId: newSb.id,
      assetCode: newSb.code,
      assetType: 'substation',
      date: new Date().toISOString().split('T')[0],
      performedBy: currentUser.name,
      workDescription: `Монтаж распределительного шкафа ${newSb.code} (${newSb.substationCode}, ввод ${newSb.mainBreakerAmps}А). Прибор учета: ${newSb.meterModel}.`,
      nextScheduledDate: '2027-05-01',
      costRub: 0,
    });
  };

  const handleUpdateSwitchboard = (updatedSb: Switchboard) => {
    setSwitchboards((prev) => {
      const next = prev.map((sb) => (sb.id === updatedSb.id ? updatedSb : sb));
      saveToStorage('dtsn_switchboards', next);
      return next;
    });
    apiSaveSwitchboard(updatedSb);
  };

  const handleDeleteSwitchboard = (id: string) => {
    setSwitchboards((prev) => {
      const next = prev.filter((sb) => sb.id !== id);
      saveToStorage('dtsn_switchboards', next);
      return next;
    });
    apiDeleteSwitchboard(id);
  };

  const handleAddSubstation = (newSub: Substation) => {
    setSubstations((prev) => {
      const next = [newSub, ...prev];
      saveToStorage('dtsn_substations', next);
      return next;
    });
    apiSaveSubstation(newSub);
  };

  const handleUpdateSubstation = (updatedSub: Substation) => {
    setSubstations((prev) => {
      const next = prev.map((s) => (s.id === updatedSub.id ? updatedSub : s));
      saveToStorage('dtsn_substations', next);
      return next;
    });
    apiSaveSubstation(updatedSub);
  };

  const handleDeleteSubstation = (id: string) => {
    setSubstations((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveToStorage('dtsn_substations', next);
      return next;
    });
    apiDeleteSubstation(id);
  };

  const handleAddFireHydrant = (newFh: FireHydrant) => {
    setFireHydrants((prev) => {
      const next = [newFh, ...prev];
      saveToStorage('dtsn_fire_hydrants', next);
      return next;
    });
    apiSaveFireHydrant(newFh);
  };

  const handleUpdateFireHydrant = (updatedFh: FireHydrant) => {
    setFireHydrants((prev) => {
      const next = prev.map((fh) => (fh.id === updatedFh.id ? updatedFh : fh));
      saveToStorage('dtsn_fire_hydrants', next);
      return next;
    });
    apiSaveFireHydrant(updatedFh);
  };

  const handleDeleteFireHydrant = (id: string) => {
    setFireHydrants((prev) => {
      const next = prev.filter((fh) => fh.id !== id);
      saveToStorage('dtsn_fire_hydrants', next);
      return next;
    });
    apiDeleteFireHydrant(id);
  };

  const handleAddLightPole = (newPole: LightPole) => {
    setLightPoles((prev) => {
      const next = [newPole, ...prev];
      saveToStorage('dtsn_light_poles', next);
      return next;
    });
    apiSaveLightPole(newPole);
  };

  const handleUpdateLightPole = (updatedPole: LightPole) => {
    setLightPoles((prev) => {
      const next = prev.map((lp) => (lp.id === updatedPole.id ? updatedPole : lp));
      saveToStorage('dtsn_light_poles', next);
      return next;
    });
    apiSaveLightPole(updatedPole);
  };

  const handleDeleteLightPole = (id: string) => {
    setLightPoles((prev) => {
      const next = prev.filter((lp) => lp.id !== id);
      saveToStorage('dtsn_light_poles', next);
      return next;
    });
    apiDeleteLightPole(id);
  };

  const handleAddWifiHotspot = (newHs: WifiHotspot) => {
    setWifiHotspots((prev) => {
      const next = [newHs, ...prev];
      saveToStorage('dtsn_wifi_hotspots', next);
      return next;
    });
    apiSaveWifiHotspot(newHs);
  };

  const handleUpdateWifiHotspot = (updatedHs: WifiHotspot) => {
    setWifiHotspots((prev) => {
      const next = prev.map((wh) => (wh.id === updatedHs.id ? updatedHs : wh));
      saveToStorage('dtsn_wifi_hotspots', next);
      return next;
    });
    apiSaveWifiHotspot(updatedHs);
  };

  const handleDeleteWifiHotspot = (id: string) => {
    setWifiHotspots((prev) => {
      const next = prev.filter((wh) => wh.id !== id);
      saveToStorage('dtsn_wifi_hotspots', next);
      return next;
    });
    apiDeleteWifiHotspot(id);
  };

  // Barrier Gates CRUD Handlers
  const handleAddBarrierGate = (newBg: BarrierGate) => {
    setBarrierGates((prev) => {
      const next = [newBg, ...prev];
      saveToStorage('dtsn_barrier_gates', next);
      return next;
    });
    apiSaveBarrierGate(newBg);
  };

  const handleUpdateBarrierGate = (updatedBg: BarrierGate) => {
    setBarrierGates((prev) => {
      const next = prev.map((bg) => (bg.id === updatedBg.id ? updatedBg : bg));
      saveToStorage('dtsn_barrier_gates', next);
      return next;
    });
    apiSaveBarrierGate(updatedBg);
  };

  const handleDeleteBarrierGate = (id: string) => {
    setBarrierGates((prev) => {
      const next = prev.filter((bg) => bg.id !== id);
      saveToStorage('dtsn_barrier_gates', next);
      return next;
    });
    apiDeleteBarrierGate(id);
  };

  // Administration Facilities CRUD Handlers
  const handleAddAdminFacility = (newFac: AdministrationFacility) => {
    setAdminFacilities((prev) => {
      const next = [newFac, ...prev];
      saveToStorage('dtsn_admin_facilities', next);
      return next;
    });
    apiSaveAdminFacility(newFac);
  };

  const handleUpdateAdminFacility = (updatedFac: AdministrationFacility) => {
    setAdminFacilities((prev) => {
      const next = prev.map((fac) => (fac.id === updatedFac.id ? updatedFac : fac));
      saveToStorage('dtsn_admin_facilities', next);
      return next;
    });
    apiSaveAdminFacility(updatedFac);
  };

  const handleDeleteAdminFacility = (id: string) => {
    setAdminFacilities((prev) => {
      const next = prev.filter((fac) => fac.id !== id);
      saveToStorage('dtsn_admin_facilities', next);
      return next;
    });
    apiDeleteAdminFacility(id);
  };

  // Waste Collection Sites CRUD Handlers
  const handleAddWasteSite = (newWs: WasteCollectionSite) => {
    setWasteSites((prev) => {
      const next = [newWs, ...prev];
      saveToStorage('dtsn_waste_sites', next);
      return next;
    });
  };

  const handleUpdateWasteSite = (updatedWs: WasteCollectionSite) => {
    setWasteSites((prev) => {
      const next = prev.map((ws) => (ws.id === updatedWs.id ? updatedWs : ws));
      saveToStorage('dtsn_waste_sites', next);
      return next;
    });
  };

  const handleDeleteWasteSite = (id: string) => {
    setWasteSites((prev) => {
      const next = prev.filter((ws) => ws.id !== id);
      saveToStorage('dtsn_waste_sites', next);
      return next;
    });
  };

  // Snow Dumps CRUD Handlers
  const handleAddSnowDump = (newSd: SnowDump) => {
    setSnowDumps((prev) => {
      const next = [newSd, ...prev];
      saveToStorage('dtsn_snow_dumps', next);
      return next;
    });
  };

  const handleUpdateSnowDump = (updatedSd: SnowDump) => {
    setSnowDumps((prev) => {
      const next = prev.map((sd) => (sd.id === updatedSd.id ? updatedSd : sd));
      saveToStorage('dtsn_snow_dumps', next);
      return next;
    });
  };

  const handleDeleteSnowDump = (id: string) => {
    setSnowDumps((prev) => {
      const next = prev.filter((sd) => sd.id !== id);
      saveToStorage('dtsn_snow_dumps', next);
      return next;
    });
  };

  // Fire Turnarounds CRUD Handlers
  const handleAddFireTurnaround = (newFt: FireTurnaround) => {
    setFireTurnarounds((prev) => {
      const next = [newFt, ...prev];
      saveToStorage('dtsn_fire_turnarounds', next);
      return next;
    });
  };

  const handleUpdateFireTurnaround = (updatedFt: FireTurnaround) => {
    setFireTurnarounds((prev) => {
      const next = prev.map((ft) => (ft.id === updatedFt.id ? updatedFt : ft));
      saveToStorage('dtsn_fire_turnarounds', next);
      return next;
    });
  };

  const handleDeleteFireTurnaround = (id: string) => {
    setFireTurnarounds((prev) => {
      const next = prev.filter((ft) => ft.id !== id);
      saveToStorage('dtsn_fire_turnarounds', next);
      return next;
    });
  };

  // Inspection Points CRUD Handlers
  const handleAddInspectionPoint = (newIp: InspectionCheckPoint) => {
    setInspectionPoints((prev) => {
      const next = [newIp, ...prev];
      saveToStorage('dtsn_inspection_points', next);
      return next;
    });
  };

  const handleUpdateInspectionPoint = (updatedIp: InspectionCheckPoint) => {
    setInspectionPoints((prev) => {
      const next = prev.map((ip) => (ip.id === updatedIp.id ? updatedIp : ip));
      saveToStorage('dtsn_inspection_points', next);
      return next;
    });
  };

  const handleDeleteInspectionPoint = (id: string) => {
    setInspectionPoints((prev) => {
      const next = prev.filter((ip) => ip.id !== id);
      saveToStorage('dtsn_inspection_points', next);
      return next;
    });
  };

  // Gas Regulator Station Update Handler
  const handleUpdateGasRegulator = (updatedGr: GasRegulatorStation) => {
    setGasRegulator(updatedGr);
    saveToStorage('dtsn_gas_regulator', updatedGr);
  };

  const handleAddPlot = (newPlot: Plot) => {
    setPlots((prev) => {
      const next = [newPlot, ...prev];
      saveToStorage('dtsn_plots', next);
      return next;
    });
    apiSavePlot(newPlot);
  };

  const handleUpdatePlot = (updatedPlot: Plot) => {
    setPlots((prev) => {
      const next = prev.map((p) => (p.id === updatedPlot.id ? updatedPlot : p));
      saveToStorage('dtsn_plots', next);
      return next;
    });
    apiSavePlot(updatedPlot);
  };

  const handleDeletePlot = (plotId: string) => {
    setPlots((prev) => {
      const next = prev.filter((p) => p.id !== plotId);
      saveToStorage('dtsn_plots', next);
      return next;
    });
  };

  const handleBatchImportPlots = (importedPlots: Plot[]) => {
    setPlots((prev) => {
      const updatedList = [...prev];
      importedPlots.forEach((imp) => {
        const idx = updatedList.findIndex((p) => p.id === imp.id || p.number === imp.number);
        if (idx !== -1) {
          updatedList[idx] = {
            ...updatedList[idx],
            ...imp,
            coordinates: imp.coordinates?.lat ? imp.coordinates : updatedList[idx].coordinates,
            polygon: imp.polygon && imp.polygon.length >= 3 ? imp.polygon : updatedList[idx].polygon,
            utilities: {
              ...updatedList[idx].utilities,
              ...imp.utilities,
            },
          };
          apiSavePlot(updatedList[idx]);
        } else {
          updatedList.push(imp);
          apiSavePlot(imp);
        }
      });
      saveToStorage('dtsn_plots', updatedList);
      return updatedList;
    });
  };

  // Water Metering Nodes (УУВ) Handlers
  const handleAddWaterMeteringNode = (node: WaterMeteringNode) => {
    setWaterMeteringNodes((prev) => {
      const next = [node, ...prev];
      saveToStorage('dtsn_water_metering_nodes', next);
      return next;
    });
  };

  const handleUpdateWaterMeteringNode = (node: WaterMeteringNode) => {
    setWaterMeteringNodes((prev) => {
      const next = prev.map((n) => (n.id === node.id ? node : n));
      saveToStorage('dtsn_water_metering_nodes', next);
      return next;
    });
  };

  const handleDeleteWaterMeteringNode = (id: string) => {
    setWaterMeteringNodes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveToStorage('dtsn_water_metering_nodes', next);
      return next;
    });
  };

  // Dedicated Photo Updater for Wells and Network Assets (persists to storage & database)
  const handleUpdateItemPhotos = (type: string, id: string, photos: AssetPhoto[]) => {
    if (type === 'well') {
      setWells((prev) => {
        const next = prev.map((w) => (w.id === id ? { ...w, photos } : w));
        saveToStorage('dtsn_wells', next);
        const target = next.find((w) => w.id === id);
        if (target) apiSaveWell(target);
        return next;
      });
    } else if (type === 'valve') {
      setValves((prev) => {
        const next = prev.map((v) => (v.id === id ? { ...v, photos } : v));
        saveToStorage('dtsn_valves', next);
        const target = next.find((v) => v.id === id);
        if (target) apiSaveValve(target);
        return next;
      });
    } else if (type === 'switchboard') {
      setSwitchboards((prev) => {
        const next = prev.map((sb) => (sb.id === id ? { ...sb, photos } : sb));
        saveToStorage('dtsn_switchboards', next);
        const target = next.find((sb) => sb.id === id);
        if (target) apiSaveSwitchboard(target);
        return next;
      });
    } else if (type === 'substation') {
      setSubstations((prev) => {
        const next = prev.map((sub) => (sub.id === id ? { ...sub, photos } : sub));
        saveToStorage('dtsn_substations', next);
        const target = next.find((sub) => sub.id === id);
        if (target) apiSaveSubstation(target);
        return next;
      });
    } else if (type === 'fireHydrant') {
      setFireHydrants((prev) => {
        const next = prev.map((fh) => (fh.id === id ? { ...fh, photos } : fh));
        saveToStorage('dtsn_fire_hydrants', next);
        const target = next.find((fh) => fh.id === id);
        if (target) apiSaveFireHydrant(target);
        return next;
      });
    } else if (type === 'pipeline') {
      setPipelines((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, photos } : p));
        saveToStorage('dtsn_pipelines', next);
        const target = next.find((p) => p.id === id);
        if (target) apiSavePipeline(target);
        return next;
      });
    } else if (type === 'plot') {
      setPlots((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, photos } : p));
        saveToStorage('dtsn_plots', next);
        const target = next.find((p) => p.id === id);
        if (target) apiSavePlot(target);
        return next;
      });
    } else if (type === 'barrierGate') {
      setBarrierGates((prev) => {
        const next = prev.map((bg) => (bg.id === id ? { ...bg, photos } : bg));
        saveToStorage('dtsn_barrier_gates', next);
        const target = next.find((bg) => bg.id === id);
        if (target) apiSaveBarrierGate(target);
        return next;
      });
    } else if (type === 'adminFacility') {
      setAdminFacilities((prev) => {
        const next = prev.map((af) => (af.id === id ? { ...af, photos } : af));
        saveToStorage('dtsn_admin_facilities', next);
        const target = next.find((af) => af.id === id);
        if (target) apiSaveAdminFacility(target);
        return next;
      });
    } else if (type === 'lightPole') {
      setLightPoles((prev) => {
        const next = prev.map((lp) => (lp.id === id ? { ...lp, photos } : lp));
        saveToStorage('dtsn_light_poles', next);
        const target = next.find((lp) => lp.id === id);
        if (target) apiSaveLightPole(target);
        return next;
      });
    } else if (type === 'wifiHotspot') {
      setWifiHotspots((prev) => {
        const next = prev.map((wh) => (wh.id === id ? { ...wh, photos } : wh));
        saveToStorage('dtsn_wifi_hotspots', next);
        const target = next.find((wh) => wh.id === id);
        if (target) apiSaveWifiHotspot(target);
        return next;
      });
    } else if (type === 'waterMeteringNode') {
      setWaterMeteringNodes((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, photos } : n));
        saveToStorage('dtsn_water_metering_nodes', next);
        return next;
      });
    }
  };

  // CCTV Camera CRUD Handlers
  const handleAddCctvCamera = (cam: CctvCamera) => {
    setCctvCameras((prev) => {
      const next = [cam, ...prev];
      saveToStorage('dtsn_cctv_cameras', next);
      return next;
    });
  };

  const handleUpdateCctvCamera = (cam: CctvCamera) => {
    setCctvCameras((prev) => {
      const next = prev.map((c) => (c.id === cam.id ? cam : c));
      saveToStorage('dtsn_cctv_cameras', next);
      return next;
    });
  };

  const handleDeleteCctvCamera = (id: string) => {
    setCctvCameras((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveToStorage('dtsn_cctv_cameras', next);
      return next;
    });
  };

  // Universal Coordinate Updater for Drag & Drop (Push & Pull)
  const handleUpdateObjectCoordinates = (type: string, id: string, coordinates: Coordinates) => {
    if (type === 'barrierGate') {
      setBarrierGates((prev) => {
        const next = prev.map((bg) => (bg.id === id ? { ...bg, coordinates } : bg));
        saveToStorage('dtsn_barrier_gates', next);
        return next;
      });
    } else if (type === 'adminFacility') {
      setAdminFacilities((prev) => {
        const next = prev.map((fac) => (fac.id === id ? { ...fac, coordinates } : fac));
        saveToStorage('dtsn_admin_facilities', next);
        return next;
      });
    } else if (type === 'well') {
      setWells((prev) => {
        const next = prev.map((w) => (w.id === id ? { ...w, coordinates } : w));
        saveToStorage('dtsn_wells', next);
        return next;
      });
    } else if (type === 'valve') {
      setValves((prev) => {
        const next = prev.map((v) => (v.id === id ? { ...v, coordinates } : v));
        saveToStorage('dtsn_valves', next);
        return next;
      });
    } else if (type === 'switchboard') {
      setSwitchboards((prev) => {
        const next = prev.map((sb) => (sb.id === id ? { ...sb, coordinates } : sb));
        saveToStorage('dtsn_switchboards', next);
        return next;
      });
    } else if (type === 'substation') {
      setSubstations((prev) => {
        const next = prev.map((sub) => (sub.id === id ? { ...sub, coordinates } : sub));
        saveToStorage('dtsn_substations', next);
        return next;
      });
    } else if (type === 'fireHydrant') {
      setFireHydrants((prev) => {
        const next = prev.map((fh) => (fh.id === id ? { ...fh, coordinates } : fh));
        saveToStorage('dtsn_fire_hydrants', next);
        return next;
      });
    } else if (type === 'lightPole') {
      setLightPoles((prev) => {
        const next = prev.map((lp) => (lp.id === id ? { ...lp, coordinates } : lp));
        saveToStorage('dtsn_light_poles', next);
        return next;
      });
    } else if (type === 'wifiHotspot') {
      setWifiHotspots((prev) => {
        const next = prev.map((wh) => (wh.id === id ? { ...wh, coordinates } : wh));
        saveToStorage('dtsn_wifi_hotspots', next);
        return next;
      });
    } else if (type === 'cctvCamera') {
      setCctvCameras((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, coordinates } : c));
        saveToStorage('dtsn_cctv_cameras', next);
        return next;
      });
    } else if (type === 'gasRegulator') {
      setGasRegulator((prev) => {
        const next = { ...prev, coordinates };
        saveToStorage('dtsn_gas_regulator', next);
        return next;
      });
    } else if (type === 'wasteSite') {
      setWasteSites((prev) => {
        const next = prev.map((ws) => (ws.id === id ? { ...ws, coordinates } : ws));
        saveToStorage('dtsn_waste_sites', next);
        return next;
      });
    } else if (type === 'snowDump') {
      setSnowDumps((prev) => {
        const next = prev.map((sd) => {
          if (sd.id === id) {
            const deltaLat = coordinates.lat - sd.coordinates.lat;
            const deltaLng = coordinates.lng - sd.coordinates.lng;
            const newPolygon = (sd.polygon || []).map((pt) => ({
              lat: Number((pt.lat + deltaLat).toFixed(6)),
              lng: Number((pt.lng + deltaLng).toFixed(6)),
            }));
            return { ...sd, coordinates, polygon: newPolygon };
          }
          return sd;
        });
        saveToStorage('dtsn_snow_dumps', next);
        return next;
      });
    } else if (type === 'fireTurnaround') {
      setFireTurnarounds((prev) => {
        const next = prev.map((ft) => (ft.id === id ? { ...ft, coordinates } : ft));
        saveToStorage('dtsn_fire_turnarounds', next);
        return next;
      });
    } else if (type === 'inspectionPoint') {
      setInspectionPoints((prev) => {
        const next = prev.map((ip) => (ip.id === id ? { ...ip, coordinates } : ip));
        saveToStorage('dtsn_inspection_points', next);
        return next;
      });
    } else if (type === 'waterMeteringNode') {
      setWaterMeteringNodes((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, coordinates } : n));
        saveToStorage('dtsn_water_metering_nodes', next);
        return next;
      });
    } else if (type === 'plot') {
      setPlots((prev) => {
        const next = prev.map((p) => {
          if (p.id === id) {
            const deltaLat = coordinates.lat - p.coordinates.lat;
            const deltaLng = coordinates.lng - p.coordinates.lng;
            const newPolygon = p.polygon.map((pt) => ({
              lat: Number((pt.lat + deltaLat).toFixed(6)),
              lng: Number((pt.lng + deltaLng).toFixed(6)),
            }));
            const updated: Plot = { ...p, coordinates, polygon: newPolygon };
            apiSavePlot(updated);
            return updated;
          }
          return p;
        });
        saveToStorage('dtsn_plots', next);
        return next;
      });
    }
    apiUpdateCoordinates(type, id, coordinates);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-clip">
      {/* 3-Zone Navigation Top Bar with Smart Search */}
      <Navbar
        activeTab={activeTab}
        season={season}
        currentUser={currentUser}
        allUsers={users}
        plots={plots}
        wells={wells}
        valves={valves}
        substations={substations}
        switchboards={switchboards}
        fireHydrants={fireHydrants}
        workTasks={workTasks}
        inspectionLogs={inspectionLogs}
        onSelectTab={setActiveTab}
        onSelectSeason={handleSeasonChange}
        onSwitchUser={handleSwitchUser}
        onSelectPlot={handleSelectPlotFromOtherTab}
        onSelectNetworkItem={(type, data) => {
          setSelectedPlotId(null);
          setActiveTab('map');
        }}
        onUpdateCurrentUser={handleUpdateUserProfile}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6 overflow-x-clip">
        {/* TAB 1: GIS ENGINEERING MAP */}
        {activeTab === 'map' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>Интерактивная карта инженерных сетей ДТСН «Пенсионер»</span>
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Геокоординаты: <span className="font-mono text-slate-700">55.098612, 82.900919</span> · Квартал НСПД: <span className="font-mono text-slate-700 font-semibold">54:19:112001</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold font-mono text-[11px] shadow-xs">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>PostgreSQL Cloud SQL</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <span>5 типов сетей</span>
                </span>
              </div>
            </div>

            <EngineeringMap
              wells={wells}
              valves={valves}
              substations={substations}
              switchboards={switchboards}
              lightPoles={lightPoles}
              gasRegulator={gasRegulator}
              pipelines={pipelines}
              fireHydrants={fireHydrants}
              snowDumps={snowDumps}
              wasteSites={wasteSites}
              fireTurnarounds={fireTurnarounds}
              inspectionPoints={inspectionPoints}
              plots={plots}
              season={season}
              wifiHotspots={wifiHotspots}
              barrierGates={barrierGates}
              adminFacilities={adminFacilities}
              selectedPlotId={selectedPlotId}
              highlightedRoute={highlightedRoute}
              canEditNetworks={Boolean(currentUser?.permissions?.canEditNetworks || currentUser?.role === 'chairman' || currentUser?.role === 'engineer')}
              onSelectPlot={handleSelectPlot}
              onSelectWell={handleSelectWell}
              onStartWinterConnection={handleStartWinterConnection}
              onSeasonChange={handleSeasonChange}
              boundaryPoints={boundaryPoints}
              onSaveBoundaryPoints={handleSaveBoundary}
              onAddPipeline={handleAddPipeline}
              onUpdatePipeline={handleUpdatePipeline}
              onDeletePipeline={handleDeletePipeline}
              onAddWell={handleAddWell}
              onUpdateWell={handleUpdateWell}
              onDeleteWell={handleDeleteWell}
              onAddValve={handleAddValve}
              onUpdateValve={handleUpdateValve}
              onDeleteValve={handleDeleteValve}
              onAddSwitchboard={handleAddSwitchboard}
              onUpdateSwitchboard={handleUpdateSwitchboard}
              onDeleteSwitchboard={handleDeleteSwitchboard}
              onAddSubstation={handleAddSubstation}
              onUpdateSubstation={handleUpdateSubstation}
              onDeleteSubstation={handleDeleteSubstation}
              onAddFireHydrant={handleAddFireHydrant}
              onUpdateFireHydrant={handleUpdateFireHydrant}
              onDeleteFireHydrant={handleDeleteFireHydrant}
              onAddLightPole={handleAddLightPole}
              onUpdateLightPole={handleUpdateLightPole}
              onDeleteLightPole={handleDeleteLightPole}
              onAddWifiHotspot={handleAddWifiHotspot}
              onUpdateWifiHotspot={handleUpdateWifiHotspot}
              onDeleteWifiHotspot={handleDeleteWifiHotspot}
              onAddBarrierGate={handleAddBarrierGate}
              onUpdateBarrierGate={handleUpdateBarrierGate}
              onDeleteBarrierGate={handleDeleteBarrierGate}
              onAddAdminFacility={handleAddAdminFacility}
              onUpdateAdminFacility={handleUpdateAdminFacility}
              onDeleteAdminFacility={handleDeleteAdminFacility}
              onAddWasteSite={handleAddWasteSite}
              onUpdateWasteSite={handleUpdateWasteSite}
              onDeleteWasteSite={handleDeleteWasteSite}
              onAddSnowDump={handleAddSnowDump}
              onUpdateSnowDump={handleUpdateSnowDump}
              onDeleteSnowDump={handleDeleteSnowDump}
              onAddFireTurnaround={handleAddFireTurnaround}
              onUpdateFireTurnaround={handleUpdateFireTurnaround}
              onDeleteFireTurnaround={handleDeleteFireTurnaround}
              onAddInspectionPoint={handleAddInspectionPoint}
              onUpdateInspectionPoint={handleUpdateInspectionPoint}
              onDeleteInspectionPoint={handleDeleteInspectionPoint}
              onUpdateGasRegulator={handleUpdateGasRegulator}
              onUpdateCoordinates={handleUpdateObjectCoordinates}
              onUpdatePlot={handleUpdatePlot}
              onToggleValve={handleToggleValve}
              onUpdatePhotos={handleUpdateItemPhotos}
              cctvCameras={cctvCameras}
              onAddCctvCamera={handleAddCctvCamera}
              onUpdateCctvCamera={handleUpdateCctvCamera}
              onDeleteCctvCamera={handleDeleteCctvCamera}
              waterMeteringNodes={waterMeteringNodes}
              onAddWaterMeteringNode={handleAddWaterMeteringNode}
              onUpdateWaterMeteringNode={handleUpdateWaterMeteringNode}
              onDeleteWaterMeteringNode={handleDeleteWaterMeteringNode}
              onAddPlot={handleAddPlot}
              onDeletePlot={handleDeletePlot}
            />
          </div>
        )}

        {/* TAB 2: WINTER WATER SUPPLY & BOARD ASSISTANCE */}
        {activeTab === 'winter_water' && (
          <WinterWaterManagement
            requests={winterRequests}
            plots={plots}
            wells={wells}
            currentUser={currentUser}
            onOpenWizard={() => {
              setWizardPreselectedPlot(null);
              setIsWizardOpen(true);
            }}
            onViewDocuments={(req, plot, well) => setDocumentModalData({ request: req, plot, well })}
            onViewOnMap={(plot, well) => {
              handleSelectPlot(plot);
              setActiveTab('map');
            }}
            onApproveRequest={(reqId) => {
              setWinterRequests((prev) => {
                const next = prev.map((r) => (r.id === reqId ? { ...r, approvedByChairman: true, status: 'tu_issued' as const } : r));
                saveToStorage('dtsn_winter_requests', next);
                return next;
              });
            }}
          />
        )}

        {/* TAB 3: INSPECTION LOGS & PATROL ROUTE */}
        {activeTab === 'inspections' && (
          <InspectionLogView
            checkPoints={inspectionPoints}
            logs={inspectionLogs}
            currentUser={currentUser}
            onAddLog={handleAddInspectionLog}
            onResolveLog={handleResolveInspectionLog}
          />
        )}

        {/* TAB 4: WORK SCHEDULE, MONTH CALENDAR & DETAILED ESTIMATES */}
        {activeTab === 'schedule' && (
          <WorkScheduleView
            tasks={workTasks}
            estimates={estimates}
            currentUser={currentUser}
            activeSeason={season}
            onAddTask={handleAddWorkTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onApproveEstimate={handleApproveEstimate}
          />
        )}

        {/* TAB 5: PLOTS DIRECTORY & SUBSCRIBER MATRIX */}
        {activeTab === 'plots' && (
          <PlotsDirectory
            plots={plots}
            winterRequests={winterRequests}
            canEdit={Boolean(currentUser?.role === 'chairman' || currentUser?.role === 'engineer' || currentUser?.permissions?.canEditNetworks)}
            onSelectPlotOnMap={handleSelectPlotFromOtherTab}
            onStartWinterConnection={handleStartWinterConnection}
            onUpdatePlot={handleUpdatePlot}
            onAddPlot={handleAddPlot}
            onDeletePlot={handleDeletePlot}
            onBatchImportPlots={handleBatchImportPlots}
            onViewDocumentsForPlot={(plot) => {
              const req = winterRequests.find((r) => r.plotNumber === plot.number);
              const well = wells.find((w) => w.id === req?.selectedWellId) || wells[0];
              if (req) {
                setDocumentModalData({ request: req, plot, well });
              }
            }}
          />
        )}

        {/* TAB 6: ADMIN PANEL & MAINTENANCE HISTORY */}
        {activeTab === 'admin' && (
          <AdminPanel
            users={users}
            maintenanceRecords={maintenanceRecords}
            currentUser={currentUser}
            onUpdateUserPermissions={handleUpdateUserPermissions}
            onAddMaintenanceRecord={handleAddMaintenanceRecord}
            onSwitchUser={handleSwitchUser}
            onUpdateUserProfile={handleUpdateUserProfile}
          />
        )}
      </main>

      {/* MODAL: Winter Water Connection Wizard */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl my-auto">
            <WinterWaterWizard
              plots={plots}
              wells={wells}
              currentUser={currentUser}
              preselectedPlot={wizardPreselectedPlot}
              onSaveRequest={handleSaveWinterRequest}
              onOpenDocuments={(req, plot, well) => setDocumentModalData({ request: req, plot, well })}
              onClose={() => setIsWizardOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL: Official Document Package Viewer (ТУ, Схема, Договор, Акты) */}
      {documentModalData && (
        <DocumentPackageModal
          request={documentModalData.request}
          plot={documentModalData.plot}
          well={documentModalData.well}
          onClose={() => setDocumentModalData(null)}
          onApproveAndSign={handleApproveAndSignPackage}
          canApprove={Boolean(currentUser?.permissions?.canApproveTU || currentUser?.role === 'chairman')}
        />
      )}

      {/* Clean Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          {SOCIETY_INFO.fullName} · Геоинформационная система управления сетями · Координаты: 55.098612, 82.900919 · Круглосуточная дежурная служба: {SOCIETY_INFO.emergencyPhone}
        </p>
      </footer>
    </div>
  );
}
