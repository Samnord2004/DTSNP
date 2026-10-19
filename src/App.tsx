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
  const [season, setSeason] = useState<SeasonMode>('winter');

  // Boundary Points (Territory contour saved in PostgreSQL)
  const [boundaryPoints, setBoundaryPoints] = useState<Coordinates[]>(DTSN_PENSIONER_BOUNDARY);
  const [isCloudSqlLoaded, setIsCloudSqlLoaded] = useState<boolean>(false);

  // Users & Active Profile
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('u-1');
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Core Datasets
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [wells, setWells] = useState<Well[]>(INITIAL_WELLS);
  const [valves, setValves] = useState<Valve[]>(INITIAL_VALVES);
  const [substations, setSubstations] = useState<Substation[]>(INITIAL_SUBSTATIONS);
  const [lightPoles, setLightPoles] = useState<LightPole[]>(INITIAL_LIGHT_POLES);
  const [gasRegulator, setGasRegulator] = useState<GasRegulatorStation>(INITIAL_GAS_REGULATOR);
  const [pipelines, setPipelines] = useState<PipelineSegment[]>(INITIAL_PIPELINES);
  const [fireHydrants, setFireHydrants] = useState<FireHydrant[]>(INITIAL_FIRE_HYDRANTS);
  const [snowDumps, setSnowDumps] = useState<SnowDump[]>(INITIAL_SNOW_DUMPS);
  const [wasteSites, setWasteSites] = useState<WasteCollectionSite[]>(INITIAL_WASTE_SITES);
  const [fireTurnarounds, setFireTurnarounds] = useState<FireTurnaround[]>(INITIAL_FIRE_TURNAROUNDS);
  const [inspectionPoints, setInspectionPoints] = useState<InspectionCheckPoint[]>(INITIAL_INSPECTION_POINTS);
  const [inspectionLogs, setInspectionLogs] = useState<InspectionLogEntry[]>(INITIAL_INSPECTION_LOGS);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>(INITIAL_WORK_TASKS);
  const [estimates, setEstimates] = useState<WorkEstimate[]>(INITIAL_ESTIMATES);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE_RECORDS);
  const [winterRequests, setWinterRequests] = useState<WinterConnectionRequest[]>(INITIAL_WINTER_REQUESTS);
  const [wifiHotspots, setWifiHotspots] = useState<WifiHotspot[]>(INITIAL_WIFI_HOTSPOTS);
  const [barrierGates, setBarrierGates] = useState<BarrierGate[]>(INITIAL_BARRIER_GATES);
  const [adminFacilities, setAdminFacilities] = useState<AdministrationFacility[]>(INITIAL_ADMIN_FACILITIES);
  const [switchboards, setSwitchboards] = useState<Switchboard[]>(INITIAL_SWITCHBOARDS);

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

  // Save New Winter Connection Request
  const handleSaveWinterRequest = (newRequest: WinterConnectionRequest) => {
    setWinterRequests((prev) => [newRequest, ...prev]);

    // Update Plot status
    setPlots((prev) =>
      prev.map((p) => {
        if (p.number === newRequest.plotNumber) {
          return {
            ...p,
            utilities: {
              ...p.utilities,
              winterWater: {
                ...p.utilities.winterWater,
                status: 'tu_issued',
                wellId: newRequest.selectedWellId,
                tuNumber: `ТУ-В-2026/${p.number}`,
              },
            },
          };
        }
        return p;
      })
    );

    // Update Well ports
    setWells((prev) =>
      prev.map((w) => {
        if (w.id === newRequest.selectedWellId && w.freePorts > 0) {
          return {
            ...w,
            usedPorts: w.usedPorts + 1,
            freePorts: w.freePorts - 1,
          };
        }
        return w;
      })
    );

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
    setMaintenanceRecords((prev) => [newMaint, ...prev]);

    setIsWizardOpen(false);
  };

  // Approve & Sign Package in Modal
  const handleApproveAndSignPackage = () => {
    if (!documentModalData) return;
    const { request, plot, well } = documentModalData;

    setWinterRequests((prev) =>
      prev.map((r) => {
        if (r.id === request.id) {
          return {
            ...r,
            approvedByChairman: true,
            approvedByEngineer: true,
            status: 'contract_signed',
            contractNumber: `ДЗВ-${plot.number}/26`,
            contractSignDate: new Date().toISOString().split('T')[0],
          };
        }
        return r;
      })
    );

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
    setInspectionLogs((prev) => [newEntry, ...prev]);
  };

  const handleResolveInspectionLog = (id: string) => {
    setInspectionLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, resolved: true, resolvedDate: new Date().toISOString().split('T')[0] } : l))
    );
  };

  // Work Schedule & Estimates Handlers
  const handleAddWorkTask = (task: WorkTask, estimate?: WorkEstimate) => {
    setWorkTasks((prev) => [task, ...prev]);
    if (estimate) {
      setEstimates((prev) => [estimate, ...prev]);
    }
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: WorkTask['status']) => {
    setWorkTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleApproveEstimate = (estimateId: string) => {
    setEstimates((prev) =>
      prev.map((e) =>
        e.id === estimateId
          ? { ...e, approvedByBoard: true, approvalDate: new Date().toISOString().split('T')[0] }
          : e
      )
    );
  };

  // Admin Handlers
  const handleUpdateUserPermissions = (userId: string, permissions: UserProfile['permissions']) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permissions } : u))
    );
  };

  const handleAddMaintenanceRecord = (record: MaintenanceRecord) => {
    setMaintenanceRecords((prev) => [record, ...prev]);
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
    apiSaveBoundary(newBoundary);
  };

  // Network & Pipeline CRUD Handlers
  const handleAddPipeline = (newPipe: PipelineSegment) => {
    setPipelines((prev) => [newPipe, ...prev]);
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
    setPipelines((prev) => prev.map((p) => (p.id === updatedPipe.id ? updatedPipe : p)));
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
    setPipelines((prev) => prev.filter((p) => p.id !== id));
    apiDeletePipeline(id);
  };

  const handleAddWell = (newWell: Well) => {
    setWells((prev) => [newWell, ...prev]);
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
    setWells((prev) => prev.map((w) => (w.id === updatedWell.id ? updatedWell : w)));
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
    setWells((prev) => prev.filter((w) => w.id !== id));
    apiDeleteWell(id);
  };

  const handleAddValve = (newValve: Valve) => {
    setValves((prev) => [newValve, ...prev]);
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
    setValves((prev) => prev.map((v) => (v.id === updatedValve.id ? updatedValve : v)));
    apiSaveValve(updatedValve);
  };

  const handleDeleteValve = (id: string) => {
    setValves((prev) => prev.filter((v) => v.id !== id));
    apiDeleteValve(id);
  };

  const handleToggleValve = (valveId: string) => {
    setValves((prev) =>
      prev.map((v) => {
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
      })
    );
  };

  const handleAddSwitchboard = (newSb: Switchboard) => {
    setSwitchboards((prev) => [newSb, ...prev]);
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
    setSwitchboards((prev) => prev.map((sb) => (sb.id === updatedSb.id ? updatedSb : sb)));
    apiSaveSwitchboard(updatedSb);
  };

  const handleDeleteSwitchboard = (id: string) => {
    setSwitchboards((prev) => prev.filter((sb) => sb.id !== id));
    apiDeleteSwitchboard(id);
  };

  const handleAddSubstation = (newSub: Substation) => {
    setSubstations((prev) => [newSub, ...prev]);
    apiSaveSubstation(newSub);
  };

  const handleUpdateSubstation = (updatedSub: Substation) => {
    setSubstations((prev) => prev.map((s) => (s.id === updatedSub.id ? updatedSub : s)));
    apiSaveSubstation(updatedSub);
  };

  const handleDeleteSubstation = (id: string) => {
    setSubstations((prev) => prev.filter((s) => s.id !== id));
    apiDeleteSubstation(id);
  };

  const handleAddFireHydrant = (newFh: FireHydrant) => {
    setFireHydrants((prev) => [newFh, ...prev]);
    apiSaveFireHydrant(newFh);
  };

  const handleUpdateFireHydrant = (updatedFh: FireHydrant) => {
    setFireHydrants((prev) => prev.map((fh) => (fh.id === updatedFh.id ? updatedFh : fh)));
    apiSaveFireHydrant(updatedFh);
  };

  const handleDeleteFireHydrant = (id: string) => {
    setFireHydrants((prev) => prev.filter((fh) => fh.id !== id));
    apiDeleteFireHydrant(id);
  };

  const handleAddLightPole = (newPole: LightPole) => {
    setLightPoles((prev) => [newPole, ...prev]);
    apiSaveLightPole(newPole);
  };

  const handleUpdateLightPole = (updatedPole: LightPole) => {
    setLightPoles((prev) => prev.map((lp) => (lp.id === updatedPole.id ? updatedPole : lp)));
    apiSaveLightPole(updatedPole);
  };

  const handleDeleteLightPole = (id: string) => {
    setLightPoles((prev) => prev.filter((lp) => lp.id !== id));
    apiDeleteLightPole(id);
  };

  const handleAddWifiHotspot = (newHs: WifiHotspot) => {
    setWifiHotspots((prev) => [newHs, ...prev]);
    apiSaveWifiHotspot(newHs);
  };

  const handleUpdateWifiHotspot = (updatedHs: WifiHotspot) => {
    setWifiHotspots((prev) => prev.map((wh) => (wh.id === updatedHs.id ? updatedHs : wh)));
    apiSaveWifiHotspot(updatedHs);
  };

  const handleDeleteWifiHotspot = (id: string) => {
    setWifiHotspots((prev) => prev.filter((wh) => wh.id !== id));
    apiDeleteWifiHotspot(id);
  };

  // Barrier Gates CRUD Handlers
  const handleAddBarrierGate = (newBg: BarrierGate) => {
    setBarrierGates((prev) => [newBg, ...prev]);
    apiSaveBarrierGate(newBg);
  };

  const handleUpdateBarrierGate = (updatedBg: BarrierGate) => {
    setBarrierGates((prev) => prev.map((bg) => (bg.id === updatedBg.id ? updatedBg : bg)));
    apiSaveBarrierGate(updatedBg);
  };

  const handleDeleteBarrierGate = (id: string) => {
    setBarrierGates((prev) => prev.filter((bg) => bg.id !== id));
    apiDeleteBarrierGate(id);
  };

  // Administration Facilities CRUD Handlers
  const handleAddAdminFacility = (newFac: AdministrationFacility) => {
    setAdminFacilities((prev) => [newFac, ...prev]);
    apiSaveAdminFacility(newFac);
  };

  const handleUpdateAdminFacility = (updatedFac: AdministrationFacility) => {
    setAdminFacilities((prev) => prev.map((fac) => (fac.id === updatedFac.id ? updatedFac : fac)));
    apiSaveAdminFacility(updatedFac);
  };

  const handleDeleteAdminFacility = (id: string) => {
    setAdminFacilities((prev) => prev.filter((fac) => fac.id !== id));
    apiDeleteAdminFacility(id);
  };

  const handleUpdatePlot = (updatedPlot: Plot) => {
    setPlots((prev) => prev.map((p) => (p.id === updatedPlot.id ? updatedPlot : p)));
    apiSavePlot(updatedPlot);
  };

  // Universal Coordinate Updater for Drag & Drop (Push & Pull)
  const handleUpdateObjectCoordinates = (type: string, id: string, coordinates: Coordinates) => {
    if (type === 'barrierGate') {
      setBarrierGates((prev) => prev.map((bg) => (bg.id === id ? { ...bg, coordinates } : bg)));
    } else if (type === 'adminFacility') {
      setAdminFacilities((prev) => prev.map((fac) => (fac.id === id ? { ...fac, coordinates } : fac)));
    } else if (type === 'well') {
      setWells((prev) => prev.map((w) => (w.id === id ? { ...w, coordinates } : w)));
    } else if (type === 'valve') {
      setValves((prev) => prev.map((v) => (v.id === id ? { ...v, coordinates } : v)));
    } else if (type === 'switchboard') {
      setSwitchboards((prev) => prev.map((sb) => (sb.id === id ? { ...sb, coordinates } : sb)));
    } else if (type === 'substation') {
      setSubstations((prev) => prev.map((sub) => (sub.id === id ? { ...sub, coordinates } : sub)));
    } else if (type === 'fireHydrant') {
      setFireHydrants((prev) => prev.map((fh) => (fh.id === id ? { ...fh, coordinates } : fh)));
    } else if (type === 'lightPole') {
      setLightPoles((prev) => prev.map((lp) => (lp.id === id ? { ...lp, coordinates } : lp)));
    } else if (type === 'wifiHotspot') {
      setWifiHotspots((prev) => prev.map((wh) => (wh.id === id ? { ...wh, coordinates } : wh)));
    } else if (type === 'gasRegulator') {
      setGasRegulator((prev) => ({ ...prev, coordinates }));
    } else if (type === 'plot') {
      setPlots((prev) =>
        prev.map((p) => {
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
        })
      );
    }
    apiUpdateCoordinates(type, id, coordinates);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        season={season}
        currentUser={currentUser}
        allUsers={users}
        onSelectTab={setActiveTab}
        onSelectSeason={setSeason}
        onSwitchUser={setCurrentUserId}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: GIS ENGINEERING MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-600" />
                  <span>Интерактивная карта инженерных сетей ДТСН «Пенсионер»</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Геокоординаты: <span className="font-mono text-slate-700">55.098612, 82.900919</span> · Поворот карты и ориентация по улицам
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold font-mono text-[11px] shadow-xs">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>PostgreSQL Cloud SQL: Подключено (Хранение сетей и контура)</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px]">
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
              canEditNetworks={currentUser.permissions.canEditNetworks || currentUser.role === 'chairman' || currentUser.role === 'engineer'}
              onSelectPlot={handleSelectPlot}
              onSelectWell={handleSelectWell}
              onStartWinterConnection={handleStartWinterConnection}
              onSeasonChange={setSeason}
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
              onUpdateCoordinates={handleUpdateObjectCoordinates}
              onUpdatePlot={handleUpdatePlot}
              onToggleValve={handleToggleValve}
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
              setWinterRequests((prev) =>
                prev.map((r) => (r.id === reqId ? { ...r, approvedByChairman: true, status: 'tu_issued' } : r))
              );
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
            onSelectPlotOnMap={handleSelectPlotFromOtherTab}
            onStartWinterConnection={handleStartWinterConnection}
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
            onSwitchUser={setCurrentUserId}
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
          canApprove={currentUser.permissions.canApproveTU || currentUser.role === 'chairman'}
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
