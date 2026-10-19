import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
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
  SeasonMode,
  Coordinates,
  WifiHotspot,
  BarrierGate,
  AdministrationFacility,
  Switchboard,
} from '../../types/index.ts';
import {
  calculateDistanceMeters,
  findNearestWellWithFreePorts,
  generateRoutePoints,
} from '../../utils/geoUtils';
import { DTSN_PENSIONER_BOUNDARY } from '../../data/mockData';
import { NetworkLayerInspector } from './NetworkLayerInspector';
import { NetworkLayerEditorModal, EditableObjectType } from './NetworkLayerEditorModal';
import { LayerCatalogModal } from './LayerCatalogModal';
import {
  Layers,
  Droplet,
  Zap,
  Flame,
  Radio,
  Home,
  Snowflake,
  Sun,
  ShieldCheck,
  Search,
  Crosshair,
  Maximize2,
  AlertTriangle,
  FileText,
  Activity,
  Compass,
  RotateCw,
  RotateCcw,
  Wifi,
  Building,
  KeyRound,
  Shield,
  Sprout,
  Leaf,
  Wrench,
  Plus,
  Edit3,
  Trash2,
  Check,
  Undo2,
  SlidersHorizontal,
  Table,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  CheckCircle,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Square,
  CornerDownRight,
  Lock,
  Unlock,
  Move,
} from 'lucide-react';

interface EngineeringMapProps {
  wells: Well[];
  valves: Valve[];
  substations: Substation[];
  switchboards: Switchboard[];
  lightPoles: LightPole[];
  gasRegulator: GasRegulatorStation;
  pipelines: PipelineSegment[];
  fireHydrants: FireHydrant[];
  snowDumps: SnowDump[];
  wasteSites: WasteCollectionSite[];
  fireTurnarounds: FireTurnaround[];
  inspectionPoints: InspectionCheckPoint[];
  plots: Plot[];
  season: SeasonMode;
  wifiHotspots: WifiHotspot[];
  barrierGates: BarrierGate[];
  adminFacilities: AdministrationFacility[];
  selectedPlotId: string | null;
  highlightedRoute: {
    plotCoords: Coordinates;
    wellCoords: Coordinates;
    wellCode: string;
  } | null;
  canEditNetworks?: boolean;
  onSelectPlot: (plot: Plot) => void;
  onSelectWell: (well: Well) => void;
  onStartWinterConnection: (plot: Plot) => void;
  onSeasonChange: (season: SeasonMode) => void;
  onAddPipeline?: (pipe: PipelineSegment) => void;
  onUpdatePipeline?: (pipe: PipelineSegment) => void;
  onDeletePipeline?: (id: string) => void;
  onAddWell?: (well: Well) => void;
  onUpdateWell?: (well: Well) => void;
  onDeleteWell?: (id: string) => void;
  onAddValve?: (valve: Valve) => void;
  onUpdateValve?: (valve: Valve) => void;
  onDeleteValve?: (id: string) => void;
  onAddSwitchboard?: (sb: Switchboard) => void;
  onUpdateSwitchboard?: (sb: Switchboard) => void;
  onDeleteSwitchboard?: (id: string) => void;
  onAddSubstation?: (sub: Substation) => void;
  onUpdateSubstation?: (sub: Substation) => void;
  onDeleteSubstation?: (id: string) => void;
  onAddFireHydrant?: (fh: FireHydrant) => void;
  onUpdateFireHydrant?: (fh: FireHydrant) => void;
  onDeleteFireHydrant?: (id: string) => void;
  onAddLightPole?: (pole: LightPole) => void;
  onUpdateLightPole?: (pole: LightPole) => void;
  onDeleteLightPole?: (id: string) => void;
  onAddWifiHotspot?: (hs: WifiHotspot) => void;
  onUpdateWifiHotspot?: (hs: WifiHotspot) => void;
  onDeleteWifiHotspot?: (id: string) => void;
  onAddBarrierGate?: (bg: BarrierGate) => void;
  onUpdateBarrierGate?: (bg: BarrierGate) => void;
  onDeleteBarrierGate?: (id: string) => void;
  onAddAdminFacility?: (fac: AdministrationFacility) => void;
  onUpdateAdminFacility?: (fac: AdministrationFacility) => void;
  onDeleteAdminFacility?: (id: string) => void;
  onUpdateCoordinates?: (type: string, id: string, coordinates: Coordinates) => void;
  onUpdatePlot?: (plot: Plot) => void;
  onToggleValve?: (valveId: string) => void;
  boundaryPoints?: Coordinates[];
  onSaveBoundaryPoints?: (points: Coordinates[]) => void;
}

export const EngineeringMap: React.FC<EngineeringMapProps> = ({
  wells,
  valves,
  substations,
  switchboards,
  lightPoles,
  gasRegulator,
  pipelines,
  fireHydrants,
  snowDumps,
  wasteSites,
  fireTurnarounds,
  inspectionPoints,
  plots,
  season,
  wifiHotspots,
  barrierGates,
  adminFacilities,
  selectedPlotId,
  highlightedRoute,
  canEditNetworks = true,
  onSelectPlot,
  onSelectWell,
  onStartWinterConnection,
  onSeasonChange,
  onAddPipeline,
  onUpdatePipeline,
  onDeletePipeline,
  onAddWell,
  onUpdateWell,
  onDeleteWell,
  onAddValve,
  onUpdateValve,
  onDeleteValve,
  onAddSwitchboard,
  onUpdateSwitchboard,
  onDeleteSwitchboard,
  onAddSubstation,
  onUpdateSubstation,
  onDeleteSubstation,
  onAddFireHydrant,
  onUpdateFireHydrant,
  onDeleteFireHydrant,
  onAddLightPole,
  onUpdateLightPole,
  onDeleteLightPole,
  onAddWifiHotspot,
  onUpdateWifiHotspot,
  onDeleteWifiHotspot,
  onAddBarrierGate,
  onUpdateBarrierGate,
  onDeleteBarrierGate,
  onAddAdminFacility,
  onUpdateAdminFacility,
  onDeleteAdminFacility,
  onUpdateCoordinates,
  onUpdatePlot,
  onToggleValve,
  boundaryPoints: initialBoundaryPoints,
  onSaveBoundaryPoints,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const drawLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryEditLayerRef = useRef<L.LayerGroup | null>(null);

  const [activePlot, setActivePlot] = useState<Plot | null>(null);
  const [activeWell, setActiveWell] = useState<Well | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Inspector & Editor Modals State
  const [selectedNetworkItem, setSelectedNetworkItem] = useState<{
    type:
      | 'pipeline'
      | 'well'
      | 'valve'
      | 'switchboard'
      | 'substation'
      | 'fireHydrant'
      | 'lightPole'
      | 'gasRegulator'
      | 'wifiHotspot'
      | 'barrierGate'
      | 'adminFacility';
    data: any;
  } | null>(null);

  // DRAG & DROP LOCK FUNCTIONALITY (Закрепить / Перемещение)
  const [isObjectsLocked, setIsObjectsLocked] = useState<boolean>(true);
  const [lockedObjectIds, setLockedObjectIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('dtsn_pensioner_locked_objects');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [dragNotification, setDragNotification] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Check if an object can be dragged (Push & Pull):
  // When global lock is true, dragging is disabled for all objects.
  // When global lock is false, dragging is allowed UNLESS this specific object is pinned (locked).
  const isObjectMovable = (id: string): boolean => {
    if (isObjectsLocked) return false;
    return !lockedObjectIds[id];
  };

  // Helper to check if a specific object is locked against accidental drag
  const isObjectIndividuallyLocked = (id: string): boolean => {
    return lockedObjectIds[id] === true;
  };

  const handleToggleObjectLock = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setLockedObjectIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('dtsn_pensioner_locked_objects', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save locked objects to localStorage', err);
      }
      return next;
    });
  };

  const handleLockAllObjects = () => {
    const allIds: Record<string, boolean> = {};
    wells.forEach((w) => (allIds[w.id] = true));
    valves.forEach((v) => (allIds[v.id] = true));
    fireHydrants.forEach((f) => (allIds[f.id] = true));
    plots.forEach((p) => (allIds[p.id] = true));
    substations.forEach((s) => (allIds[s.id] = true));
    switchboards.forEach((s) => (allIds[s.id] = true));
    lightPoles.forEach((l) => (allIds[l.id] = true));
    wifiHotspots.forEach((h) => (allIds[h.id] = true));
    barrierGates.forEach((b) => (allIds[b.id] = true));
    adminFacilities.forEach((a) => (allIds[a.id] = true));
    wasteSites.forEach((w) => (allIds[w.id] = true));
    if (gasRegulator) allIds[gasRegulator.id] = true;
    setLockedObjectIds(allIds);
    try {
      localStorage.setItem('dtsn_pensioner_locked_objects', JSON.stringify(allIds));
    } catch {}
  };

  const handleUnlockAllObjects = () => {
    setLockedObjectIds({});
    try {
      localStorage.removeItem('dtsn_pensioner_locked_objects');
    } catch {}
  };

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorObjectType, setEditorObjectType] = useState<EditableObjectType>('well');
  const [editorInitialData, setEditorInitialData] = useState<any>(null);
  const [editorDefaultCoords, setEditorDefaultCoords] = useState<Coordinates | undefined>(undefined);
  const [editorDefaultPath, setEditorDefaultPath] = useState<Coordinates[] | undefined>(undefined);

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // Universal helper for updating coordinates during drag & drop
  const handleUpdateObjectCoordinates = (type: string, id: string, coords: Coordinates) => {
    if (onUpdateCoordinates) {
      onUpdateCoordinates(type, id, coords);
    }
    if (selectedNetworkItem && selectedNetworkItem.data?.id === id) {
      setSelectedNetworkItem({
        ...selectedNetworkItem,
        data: { ...selectedNetworkItem.data, coordinates: coords },
      });
    }
    setDragNotification({
      name: `${type}: ${id}`,
      lat: coords.lat,
      lng: coords.lng,
    });
    setTimeout(() => setDragNotification(null), 3000);
  };

  // STEP 1: MANUAL BOUNDARY DEFINITION STATE (Выбор области карты вручную для ДТСН Пенсионер)
  const [isBoundaryEditMode, setIsBoundaryEditMode] = useState<boolean>(false);
  const [boundaryPoints, setBoundaryPoints] = useState<Coordinates[]>(
    initialBoundaryPoints && initialBoundaryPoints.length > 0 ? initialBoundaryPoints : DTSN_PENSIONER_BOUNDARY
  );
  const [newBoundaryDraft, setNewBoundaryDraft] = useState<Coordinates[]>([]);

  useEffect(() => {
    if (initialBoundaryPoints && initialBoundaryPoints.length > 0) {
      setBoundaryPoints(initialBoundaryPoints);
    }
  }, [initialBoundaryPoints]);

  // STEP 3: COLLAPSIBLE EXPANDED ACCORDION LAYERS STATE (Раскрывающиеся слои с инженерными сетями)
  const [expandedSection, setExpandedSection] = useState<'water' | 'electric' | 'gas' | 'telecom' | 'cadastre' | null>('water');

  // Detailed layer sub-toggles
  const [networkSubLayers, setNetworkSubLayers] = useState({
    // Water
    waterWinterTraces: true,
    waterWells: true,
    waterSummerTaps: true,
    waterValves: true,
    waterHydrants: true,
    // Electricity
    electricTraces: true,
    electricKtpn: true,
    electricMetersAndVr: true,
    electricLighting: true,
    // Gas
    gasTraces: true,
    gasGrpsh: true,
    gasValves: true,
    // Low-Voltage / Telecom
    telecomFiber: true,
    telecomCctv: true,
    telecomWifi: true,
    // Cadastre & Boundary
    cadastrePolygons: true,
    cadastreLabels: true,
    cadastreQuarterBorder: true,
    focusMaskOutside: true,
  });

  // Layer Editing Mode State
  const [isEditingMode, setIsEditingMode] = useState<boolean>(false);
  const [activeEditTarget, setActiveEditTarget] = useState<
    | 'well'
    | 'valve'
    | 'switchboard'
    | 'substation'
    | 'fireHydrant'
    | 'lightPole'
    | 'wifiHotspot'
    | 'pipe_water_winter'
    | 'pipe_water_summer'
    | 'pipe_water_summer_tap'
    | 'pipe_electricity'
    | 'pipe_gas'
    | 'pipe_telecom'
    | 'pipe_stormwater'
  >('well');
  const [editTool, setEditTool] = useState<'select' | 'add_point' | 'draw_line'>('select');
  const [drawnLinePoints, setDrawnLinePoints] = useState<Coordinates[]>([]);
  const [catalogInitialTab, setCatalogInitialTab] = useState<
    'all' | 'water' | 'electricity' | 'gas' | 'telecom'
  >('all');

  // RESOURCE AVAILABILITY TOGGLE & CONTROLS
  const [resourceAvailabilityMode, setResourceAvailabilityMode] = useState<boolean>(false);
  const [resourceUtilityType, setResourceUtilityType] = useState<'winter_water' | 'electricity' | 'gas'>('winter_water');
  const [resourceFilter, setResourceFilter] = useState<'all' | 'connected' | 'applied' | 'tu_issued' | 'none'>('all');

  // Refs for map events to avoid stale closures
  const isEditingModeRef = useRef(isEditingMode);
  isEditingModeRef.current = isEditingMode;
  const editToolRef = useRef(editTool);
  editToolRef.current = editTool;
  const activeEditTargetRef = useRef(activeEditTarget);
  activeEditTargetRef.current = activeEditTarget;

  const isBoundaryEditModeRef = useRef(isBoundaryEditMode);
  isBoundaryEditModeRef.current = isBoundaryEditMode;

  // Rotation State (in degrees)
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const rotationAngleRef = useRef(rotationAngle);
  rotationAngleRef.current = rotationAngle;

  const [tileProvider, setTileProvider] = useState<'osm' | 'topo' | 'satellite'>('osm');
  const [searchPlotQuery, setSearchPlotQuery] = useState('');

  // Sync rotation angle ref and invalidate map size when rotation changes
  useEffect(() => {
    rotationAngleRef.current = rotationAngle;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize({ pan: false });
    }
  }, [rotationAngle]);

  // Sync selectedPlotId prop
  useEffect(() => {
    if (selectedPlotId) {
      const p = plots.find((x) => x.id === selectedPlotId);
      if (p) {
        setActivePlot(p);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([p.coordinates.lat, p.coordinates.lng], 18, {
            animate: true,
          });
        }
      }
    }
  }, [selectedPlotId, plots]);

  // Open Create Modal Helper
  const openCreateForTarget = (
    target: typeof activeEditTarget,
    coords?: Coordinates,
    path?: Coordinates[]
  ) => {
    let objType: EditableObjectType = 'well';
    let initData: any = null;

    if (target.startsWith('pipe_')) {
      objType = 'pipeline';
      let netType: any = 'water_winter';
      let sType: any = undefined;

      if (target === 'pipe_water_winter') {
        netType = 'water_winter';
        sType = 'winter';
      } else if (target === 'pipe_water_summer') {
        netType = 'water_summer';
        sType = 'summer';
      } else if (target === 'pipe_water_summer_tap') {
        netType = 'water_summer';
        sType = 'summer_tap';
      } else if (target === 'pipe_electricity') {
        netType = 'electricity';
        sType = 'sip_power';
      } else if (target === 'pipe_gas') {
        netType = 'gas';
        sType = 'low_pressure';
      } else if (target === 'pipe_telecom') {
        netType = 'telecom';
        sType = 'optic_fiber';
      } else if (target === 'pipe_stormwater') {
        netType = 'stormwater';
        sType = 'drainage';
      }

      initData = {
        networkType: netType,
        subType: sType,
      };
    } else {
      objType = target as EditableObjectType;
    }

    setEditorMode('create');
    setEditorObjectType(objType);
    setEditorInitialData(initData);
    setEditorDefaultCoords(coords);
    setEditorDefaultPath(path);
    setIsEditorModalOpen(true);
  };

  // Open Edit Modal for existing item
  const openEditForItem = (type: string, data: any) => {
    setEditorMode('edit');
    setEditorObjectType(type as EditableObjectType);
    setEditorInitialData(data);
    setEditorDefaultCoords(data.coordinates);
    setEditorDefaultPath(data.path);
    setIsEditorModalOpen(true);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [55.098612, 82.900919];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 16,
      minZoom: 13,
      maxZoom: 19,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | НСПД nspd.gov.ru | ДТСН Пенсионер GIS',
      maxZoom: 19,
    }).addTo(map);

    // Transform mouse/touch coordinates when map container is rotated
    const origMouseEventToContainerPoint = map.mouseEventToContainerPoint.bind(map);
    map.mouseEventToContainerPoint = function (e: any) {
      const angle = rotationAngleRef.current;
      if (!angle) {
        return origMouseEventToContainerPoint(e);
      }
      const container = this.getContainer();
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const clientX =
        e.touches && e.touches[0]
          ? e.touches[0].clientX
          : e.clientX !== undefined
          ? e.clientX
          : e.originalEvent?.clientX ?? 0;
      const clientY =
        e.touches && e.touches[0]
          ? e.touches[0].clientY
          : e.clientY !== undefined
          ? e.clientY
          : e.originalEvent?.clientY ?? 0;

      const dx = clientX - cx;
      const dy = clientY - cy;
      const rad = (angle * Math.PI) / 180;
      // Invert rotation by -rad to translate from rotated viewport space back to container space
      const cos = Math.cos(-rad);
      const sin = Math.sin(-rad);
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;

      return new L.Point(rx + container.clientWidth / 2, ry + container.clientHeight / 2);
    };

    mapInstanceRef.current = map;

    // Create Layer Groups
    layerGroupsRef.current = {
      boundaryMask: L.layerGroup().addTo(map),
      boundaryLines: L.layerGroup().addTo(map),
      water: L.layerGroup().addTo(map),
      electric: L.layerGroup().addTo(map),
      gas: L.layerGroup().addTo(map),
      telecom: L.layerGroup().addTo(map),
      plots: L.layerGroup().addTo(map),
      plotLabels: L.layerGroup().addTo(map),
      seasonal: L.layerGroup().addTo(map),
      patrolRoute: L.layerGroup().addTo(map),
      drainage: L.layerGroup().addTo(map),
      wifi: L.layerGroup().addTo(map),
      barriers: L.layerGroup().addTo(map),
      facilities: L.layerGroup().addTo(map),
    };

    drawLayerRef.current = L.layerGroup().addTo(map);
    boundaryEditLayerRef.current = L.layerGroup().addTo(map);

    // Map Click Listener
    map.on('click', (e: L.LeafletMouseEvent) => {
      // 1. Boundary Draft Mode
      if (isBoundaryEditModeRef.current) {
        const pt: Coordinates = { lat: e.latlng.lat, lng: e.latlng.lng };
        setNewBoundaryDraft((prev) => [...prev, pt]);
        return;
      }

      // 2. Network Editing Mode
      if (isEditingModeRef.current) {
        if (editToolRef.current === 'add_point') {
          const clickedCoords: Coordinates = { lat: e.latlng.lat, lng: e.latlng.lng };
          openCreateForTarget(activeEditTargetRef.current, clickedCoords);
        } else if (editToolRef.current === 'draw_line') {
          const pt: Coordinates = { lat: e.latlng.lat, lng: e.latlng.lng };
          setDrawnLinePoints((prev) => [...prev, pt]);
        }
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Provider
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let maxZoom = 19;
    if (tileProvider === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      maxZoom = 17;
    } else if (tileProvider === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
    }

    L.tileLayer(url, {
      attribution: 'ДТСН «Пенсионер» · НСПД nspd.gov.ru',
      maxZoom,
    }).addTo(map);

    Object.values(layerGroupsRef.current).forEach((lg) => {
      if (!map.hasLayer(lg)) {
        lg.addTo(map);
      }
    });
    if (drawLayerRef.current && !map.hasLayer(drawLayerRef.current)) {
      drawLayerRef.current.addTo(map);
    }
    if (boundaryEditLayerRef.current && !map.hasLayer(boundaryEditLayerRef.current)) {
      boundaryEditLayerRef.current.addTo(map);
    }
  }, [tileProvider]);

  // Dynamic Drawing Layer for Tracing Line
  useEffect(() => {
    if (!drawLayerRef.current) return;
    drawLayerRef.current.clearLayers();

    if (drawnLinePoints.length > 0) {
      const latLngs = drawnLinePoints.map((p) => [p.lat, p.lng] as [number, number]);

      const polyline = L.polyline(latLngs, {
        color: '#f43f5e',
        weight: 4,
        dashArray: '4, 6',
      });
      drawLayerRef.current.addLayer(polyline);

      drawnLinePoints.forEach((pt, idx) => {
        const marker = L.circleMarker([pt.lat, pt.lng], {
          radius: idx === 0 || idx === drawnLinePoints.length - 1 ? 7 : 5,
          color: '#ffffff',
          weight: 2,
          fillColor: idx === 0 ? '#10b981' : idx === drawnLinePoints.length - 1 ? '#f43f5e' : '#3b82f6',
          fillOpacity: 1,
        });
        marker.bindTooltip(`Точка ${idx + 1}`, { permanent: false, direction: 'top' });
        drawLayerRef.current?.addLayer(marker);
      });
    }
  }, [drawnLinePoints]);

  // Step 1: Render Interactive Draft Boundary on Map
  useEffect(() => {
    if (!boundaryEditLayerRef.current) return;
    boundaryEditLayerRef.current.clearLayers();

    if (isBoundaryEditMode && newBoundaryDraft.length > 0) {
      const latLngs = newBoundaryDraft.map((p) => [p.lat, p.lng] as [number, number]);

      if (newBoundaryDraft.length > 1) {
        const polyline = L.polyline(latLngs, {
          color: '#8b5cf6',
          weight: 3.5,
          dashArray: '6, 6',
        });
        boundaryEditLayerRef.current.addLayer(polyline);
      }

      if (newBoundaryDraft.length >= 3) {
        const polygon = L.polygon(latLngs, {
          color: '#8b5cf6',
          weight: 2,
          fillColor: '#c4b5fd',
          fillOpacity: 0.25,
        });
        boundaryEditLayerRef.current.addLayer(polygon);
      }

      newBoundaryDraft.forEach((pt, idx) => {
        const vertexMarker = L.circleMarker([pt.lat, pt.lng], {
          radius: 6,
          color: '#ffffff',
          weight: 2,
          fillColor: idx === 0 ? '#10b981' : '#7c3aed',
          fillOpacity: 1,
        });
        vertexMarker.bindTooltip(`Угол границы ${idx + 1}`, { direction: 'top' });
        boundaryEditLayerRef.current?.addLayer(vertexMarker);
      });
    }
  }, [isBoundaryEditMode, newBoundaryDraft]);

  // Step 2 & 3: Render Vector Layers, Plots, and Infrastructure Elements
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const {
      boundaryMask,
      boundaryLines,
      water,
      electric,
      gas,
      telecom,
      plots: plotGroup,
      plotLabels,
      seasonal,
      patrolRoute,
      drainage,
      wifi,
      barriers,
      facilities,
    } = layerGroupsRef.current;

    // Clear previous
    boundaryMask?.clearLayers();
    boundaryLines?.clearLayers();
    water?.clearLayers();
    electric?.clearLayers();
    gas?.clearLayers();
    telecom?.clearLayers();
    plotGroup?.clearLayers();
    plotLabels?.clearLayers();
    seasonal?.clearLayers();
    patrolRoute?.clearLayers();
    drainage?.clearLayers();
    wifi?.clearLayers();
    barriers?.clearLayers();
    facilities?.clearLayers();

    // 0. BOUNDARY MASK (Ограничение области ДТСН «Пенсионер»)
    if (networkSubLayers.focusMaskOutside && boundaryMask && boundaryPoints.length >= 3) {
      const worldOuterRing: [number, number][] = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
      ];
      const dtsnHole: [number, number][] = boundaryPoints.map((c) => [c.lat, c.lng]);

      const maskPolygon = L.polygon([worldOuterRing, dtsnHole], {
        color: 'transparent',
        fillColor: '#0f172a',
        fillOpacity: 0.38,
        interactive: false,
      });
      boundaryMask.addLayer(maskPolygon);
    }

    // 0.1 OFFICIAL / CUSTOM BOUNDARY LINE
    if (networkSubLayers.cadastreQuarterBorder && boundaryLines && boundaryPoints.length >= 3) {
      const borderLatLngs = boundaryPoints.map((c) => [c.lat, c.lng] as [number, number]);
      const borderLine = L.polyline(borderLatLngs, {
        color: '#dc2626',
        weight: 3.5,
        dashArray: '8, 6',
        opacity: 0.95,
      });

      borderLine.bindTooltip(
        '<b>Граница ДТСН «Пенсионер»</b><br/>Кадастровый массив: <b>54:19:112001</b><br/>НСПД (nspd.gov.ru) / Росреестр',
        { sticky: true }
      );
      boundaryLines.addLayer(borderLine);
    }

    // 1. ВОДОСНАБЖЕНИЕ: ТРАССА, КОЛОДЦЫ, ЛЕТНИЙ ВЫВОД
    if (water) {
      // 1.1 Трассы водопровода
      if (networkSubLayers.waterWinterTraces) {
        pipelines
          .filter((p) => p.networkType === 'water_winter' || (p.networkType === 'water_summer' && p.subType !== 'summer_tap'))
          .forEach((pipe) => {
            const isWinter = pipe.subType === 'winter' || pipe.networkType === 'water_winter';
            const latLngs = pipe.path.map((c) => [c.lat, c.lng] as [number, number]);
            const line = L.polyline(latLngs, {
              color: isWinter ? '#0284c7' : '#38bdf8',
              weight: isWinter ? 5 : 3.5,
              dashArray: isWinter ? undefined : '6, 6',
              opacity: 0.9,
            });

            line.bindTooltip(
              `<b>${pipe.code}</b><br/>${isWinter ? '❄️ Зимний водопровод' : '☀️ Летний водопровод'}<br/>${pipe.material}<br/>Ду ${pipe.diameterMm} мм, Глубина: ${pipe.depthMeters} м<br/><i>Клик для инспекции и правки</i>`,
              { sticky: true }
            );

            line.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'pipeline', data: pipe });
            });

            water.addLayer(line);
          });
      }

      // 1.2 Летние выводы и поливочные стояки
      if (networkSubLayers.waterSummerTaps) {
        pipelines
          .filter((p) => p.subType === 'summer_tap')
          .forEach((tap) => {
            const latLngs = tap.path.map((c) => [c.lat, c.lng] as [number, number]);
            const tapLine = L.polyline(latLngs, {
              color: '#06b6d4',
              weight: 4,
              dashArray: '3, 4',
            });
            tapLine.bindTooltip(`<b>${tap.code}</b><br/>Летний водоразборный стояк / вывод<br/>Ду ${tap.diameterMm} мм`, { sticky: true });
            tapLine.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'pipeline', data: tap });
            });
            water.addLayer(tapLine);

            const lastPt = tap.path[tap.path.length - 1];
            if (lastPt) {
              const isTapDraggable = isObjectMovable(tap.id);
              const isTapPinned = lockedObjectIds[tap.id] === true;
              const tapIconHtml = `
                <div class="relative group ${isTapDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400 rounded-full' : 'cursor-pointer'}">
                  <div class="w-6 h-6 rounded-full border-2 border-cyan-600 bg-cyan-100 text-cyan-900 flex items-center justify-center font-bold text-[10px] shadow-md hover:scale-125 transition-transform" title="${tap.code}">
                    🚿
                  </div>
                  ${isTapPinned && !isObjectsLocked ? '<div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 rounded-full flex items-center justify-center text-[8px] text-white shadow-xs">🔒</div>' : ''}
                  ${isTapDraggable ? '<div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-white shadow-xs">🖐️</div>' : ''}
                </div>
              `;
              const customTapIcon = L.divIcon({
                html: tapIconHtml,
                className: 'custom-tap-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              });
              const tapMarker = L.marker([lastPt.lat, lastPt.lng], {
                icon: customTapIcon,
                draggable: isTapDraggable,
              });
              tapMarker.bindTooltip(
                `<b>${tap.code}</b><br/>${tap.description || 'Летний поливочный вывод'}<br/>${
                  isTapDraggable
                    ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
                    : isTapPinned && !isObjectsLocked
                    ? '🔒 Закреплено от случайного сдвига'
                    : 'Клик для выбора'
                }`,
                { direction: 'top', offset: [0, -10] }
              );
              tapMarker.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                setSelectedNetworkItem({ type: 'pipeline', data: tap });
              });
              tapMarker.on('dragend', (e: any) => {
                const newLatLng = e.target.getLatLng();
                const updatedPath = [...tap.path];
                updatedPath[updatedPath.length - 1] = {
                  lat: Number(newLatLng.lat.toFixed(6)),
                  lng: Number(newLatLng.lng.toFixed(6)),
                };
                if (onUpdatePipeline) {
                  onUpdatePipeline({ ...tap, path: updatedPath });
                }
                handleUpdateObjectCoordinates('pipeline', tap.id, {
                  lat: Number(newLatLng.lat.toFixed(6)),
                  lng: Number(newLatLng.lng.toFixed(6)),
                });
              });
              water.addLayer(tapMarker);
            }
          });
      }

      // 1.3 Колодцы (КВ)
      if (networkSubLayers.waterWells) {
        wells.forEach((well) => {
          const hasFree = well.freePorts > 0;
          const isSelected = selectedNetworkItem?.type === 'well' && selectedNetworkItem.data?.id === well.id;
          const isWellDraggable = isObjectMovable(well.id);
          const isWellPinned = lockedObjectIds[well.id] === true;
          const iconHtml = `
            <div class="relative group ${isWellDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400 ring-offset-1 rounded-full' : 'cursor-pointer'}">
              <div class="w-8 h-8 rounded-full border-2 ${
                isSelected
                  ? 'border-indigo-500 ring-4 ring-indigo-400/50 bg-indigo-50'
                  : hasFree
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-rose-600 bg-rose-50 text-rose-800'
              } flex items-center justify-center shadow-md transition-transform hover:scale-125">
                <span class="text-xs font-bold font-mono">${well.code.replace(' (Головной)', '').replace(' (Дренажный)', '')}</span>
              </div>
              <div class="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                hasFree ? 'bg-emerald-600 text-white shadow' : 'bg-rose-600 text-white shadow'
              }">
                ${well.freePorts}
              </div>
              ${isWellPinned && !isObjectsLocked ? '<div class="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-rose-600 rounded-full flex items-center justify-center text-[8px] text-white shadow-xs">🔒</div>' : ''}
              ${isWellDraggable ? '<div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-white shadow-xs">🖐️</div>' : ''}
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-well-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([well.coordinates.lat, well.coordinates.lng], {
            icon: customIcon,
            draggable: isWellDraggable,
          });

          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'well', data: well });
            setActiveWell(well);
            onSelectWell(well);
          });

          marker.on('dragend', (e: any) => {
            const newLatLng = e.target.getLatLng();
            handleUpdateObjectCoordinates('well', well.id, {
              lat: Number(newLatLng.lat.toFixed(6)),
              lng: Number(newLatLng.lng.toFixed(6)),
            });
          });

          marker.bindTooltip(
            `<b>${well.name} (${well.code})</b><br/>Свободных врезок: <b>${well.freePorts} из ${well.totalPorts}</b><br/>Глубина: ${well.depthMeters} м, Давление: ${well.nominalPressureAtm} атм<br/>${
              isWellDraggable
                ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
                : isWellPinned && !isObjectsLocked
                ? '🔒 Положение зафиксировано (защита от сдвига)'
                : 'Клик для выбора'
            }`,
            { direction: 'top', offset: [0, -16] }
          );

          water.addLayer(marker);
        });
      }

      // 1.4 Задвижки (ЗК)
      if (networkSubLayers.waterValves) {
        valves
          .filter((v) => v.networkType === 'water_winter' || v.networkType === 'water_summer')
          .forEach((valve) => {
            const isOpen = valve.state === 'open';
            const isSelected = selectedNetworkItem?.type === 'valve' && selectedNetworkItem.data?.id === valve.id;
            const isValveDraggable = isObjectMovable(valve.id);
            const isValvePinned = lockedObjectIds[valve.id] === true;
            const iconHtml = `
              <div class="relative w-6 h-6 rounded-md border ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-400'
                  : isOpen
                  ? 'border-sky-600 bg-sky-100 text-sky-900'
                  : 'border-amber-600 bg-amber-100 text-amber-900'
              } flex items-center justify-center text-[10px] font-bold shadow-sm transition-all ${
                isValveDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400' : 'cursor-pointer hover:scale-125'
              }">
                ЗК
                ${isValvePinned && !isObjectsLocked ? '<span class="absolute -top-1.5 -right-1.5 text-[9px]">🔒</span>' : ''}
              </div>
            `;
            const customIcon = L.divIcon({
              html: iconHtml,
              className: 'custom-valve-icon',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });
            const marker = L.marker([valve.coordinates.lat, valve.coordinates.lng], {
              icon: customIcon,
              draggable: isValveDraggable,
            });

            marker.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'valve', data: valve });
            });

            marker.on('dragend', (e: any) => {
              const newLatLng = e.target.getLatLng();
              handleUpdateObjectCoordinates('valve', valve.id, {
                lat: Number(newLatLng.lat.toFixed(6)),
                lng: Number(newLatLng.lng.toFixed(6)),
              });
            });

            marker.bindTooltip(
              `<b>Задвижка ${valve.code}</b><br/>Ду ${valve.diameterMm} мм, Состояние: <b>${isOpen ? 'ОТКРЫТА' : 'ЗАКРЫТА'}</b><br/>${
                isValveDraggable
                  ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
                  : isValvePinned && !isObjectsLocked
                  ? '🔒 Положение зафиксировано (защита от сдвига)'
                  : 'Клик для выбора'
              }`,
              { direction: 'top', offset: [0, -12] }
            );
            water.addLayer(marker);
          });
      }

      // 1.5 Пожарные гидранты (ПГ)
      if (networkSubLayers.waterHydrants) {
        fireHydrants.forEach((fh) => {
          const isSelected = selectedNetworkItem?.type === 'fireHydrant' && selectedNetworkItem.data?.id === fh.id;
          const isHydrantDraggable = isObjectMovable(fh.id);
          const isHydrantPinned = lockedObjectIds[fh.id] === true;
          const iconHtml = `
            <div class="relative w-7 h-7 rounded-full border-2 ${
              isSelected ? 'border-amber-500 ring-2 ring-amber-400' : 'border-red-600'
            } bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shadow-md transition-all ${
              isHydrantDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400 ring-offset-1' : 'cursor-pointer hover:scale-125'
            }">
              ПГ
              ${isHydrantPinned && !isObjectsLocked ? '<span class="absolute -top-1 -right-1 text-[9px]">🔒</span>' : ''}
              ${isHydrantDraggable ? '<span class="absolute -bottom-1 -right-1 text-[8px]">🖐️</span>' : ''}
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-hydrant-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          const marker = L.marker([fh.coordinates.lat, fh.coordinates.lng], {
            icon: customIcon,
            draggable: isHydrantDraggable,
          });

          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'fireHydrant', data: fh });
          });

          marker.on('dragend', (e: any) => {
            const newLatLng = e.target.getLatLng();
            handleUpdateObjectCoordinates('fireHydrant', fh.id, {
              lat: Number(newLatLng.lat.toFixed(6)),
              lng: Number(newLatLng.lng.toFixed(6)),
            });
          });

          marker.bindTooltip(
            `<b>Пожарный гидрант ${fh.code}</b><br/>Давление: ${fh.staticPressureAtm} атм<br/>Утепление: ${fh.winterInsulationDone ? '✅ Выполнено' : '❌'}<br/>${
              isHydrantDraggable
                ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
                : isHydrantPinned && !isObjectsLocked
                ? '🔒 Положение зафиксировано (защита от сдвига)'
                : 'Клик для выбора'
            }`
          );
          water.addLayer(marker);
        });
      }
    }

    // 2. ЭЛЕКТРОСНАБЖЕНИЕ: ТРАССА, КТПН, СЧЕТЧИКИ, ОСВЕТИТЕЛЬНЫЕ ПРИБОРЫ
    if (electric) {
      // 2.1 Трассы линий электропередач (ВЛ/КЛ)
      if (networkSubLayers.electricTraces) {
        pipelines
          .filter((p) => p.networkType === 'electricity')
          .forEach((line) => {
            const latLngs = line.path.map((c) => [c.lat, c.lng] as [number, number]);
            const poly = L.polyline(latLngs, {
              color: '#d97706',
              weight: 3.5,
              opacity: 0.9,
            });
            poly.bindTooltip(`<b>${line.code}</b><br/>${line.material}, ${line.pressureNominal}`, { sticky: true });
            poly.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'pipeline', data: line });
            });
            electric.addLayer(poly);
          });
      }

      // 2.2 КТПН (Трансформаторные подстанции)
      if (networkSubLayers.electricKtpn) {
        substations.forEach((sub) => {
          const isWarning = sub.status === 'warning';
          const isSelected = selectedNetworkItem?.type === 'substation' && selectedNetworkItem.data?.id === sub.id;
          const isSubDraggable = isObjectMovable(sub.id);
          const isSubPinned = lockedObjectIds[sub.id] === true;
          const iconHtml = `
            <div class="relative w-10 h-10 rounded-lg border-2 ${
              isSelected
                ? 'border-indigo-500 ring-4 ring-indigo-400/50 bg-amber-100 scale-110'
                : isWarning
                ? 'border-amber-500 bg-amber-50 text-amber-800 animate-pulse'
                : 'border-amber-600 bg-amber-100 text-amber-900'
            } flex flex-col items-center justify-center text-[10px] font-bold shadow-md transition-all ${
              isSubDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400 ring-offset-1' : 'cursor-pointer hover:scale-115'
            }">
              <span class="text-xs">⚡</span>
              <span class="font-mono text-[9px] -mt-1 font-bold">${sub.code}</span>
              ${isSubPinned && !isObjectsLocked ? '<span class="absolute -top-1.5 -right-1.5 text-[9px]">🔒</span>' : ''}
              ${isSubDraggable ? '<span class="absolute -bottom-1 -right-1 text-[8px]">🖐️</span>' : ''}
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-ktp-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
          const marker = L.marker([sub.coordinates.lat, sub.coordinates.lng], {
            icon: customIcon,
            draggable: isSubDraggable,
          });

          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'substation', data: sub });
          });

          marker.on('dragend', (e: any) => {
            const newLatLng = e.target.getLatLng();
            handleUpdateObjectCoordinates('substation', sub.id, {
              lat: Number(newLatLng.lat.toFixed(6)),
              lng: Number(newLatLng.lng.toFixed(6)),
            });
          });

          marker.bindTooltip(
            `<b>${sub.name}</b><br/>Мощность: ${sub.powerKva} кВА, ${sub.voltageKv}<br/>Загрузка: <b>${sub.currentLoadPercent}%</b><br/>${
              isSubDraggable
                ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
                : isSubPinned && !isObjectsLocked
                ? '🔒 Положение зафиксировано (защита от сдвига)'
                : 'Клик для выбора'
            }`,
            { direction: 'top', offset: [0, -20] }
          );
          electric.addLayer(marker);
        });
      }

      // 2.3 Расположение счётчиков и щитовых (ВРУ / ШР)
      if (networkSubLayers.electricMetersAndVr) {
        switchboards.forEach((sb) => {
          const isSelected = selectedNetworkItem?.type === 'switchboard' && selectedNetworkItem.data?.id === sb.id;
          const isSbDraggable = isObjectMovable(sb.id);
          const isSbPinned = lockedObjectIds[sb.id] === true;
          const iconHtml = `
            <div class="relative w-7 h-7 rounded-lg border-2 ${
              isSelected ? 'border-amber-500 ring-2 ring-amber-400 bg-indigo-100' : 'border-indigo-600 bg-indigo-50'
            } text-indigo-900 flex items-center justify-center font-bold text-[9px] shadow-md transition-all ${
              isSbDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400 ring-offset-1' : 'cursor-pointer hover:scale-125'
            }">
              ВРУ
              ${isSbPinned && !isObjectsLocked ? '<span class="absolute -top-1.5 -right-1.5 text-[9px]">🔒</span>' : ''}
              ${isSbDraggable ? '<span class="absolute -bottom-1 -right-1 text-[8px]">🖐️</span>' : ''}
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-switchboard-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          const marker = L.marker([sb.coordinates.lat, sb.coordinates.lng], {
            icon: customIcon,
            draggable: isSbDraggable,
          });

          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'switchboard', data: sb });
          });

          marker.on('dragend', (e: any) => {
            const newLatLng = e.target.getLatLng();
            handleUpdateObjectCoordinates('switchboard', sb.id, {
              lat: Number(newLatLng.lat.toFixed(6)),
              lng: Number(newLatLng.lng.toFixed(6)),
            });
          });

          marker.bindTooltip(
            `<b>${sb.name} (${sb.code})</b><br/>${sb.substationCode} · Ввод ${sb.mainBreakerAmps}А<br/>Счетчик: <b>${sb.meterModel}</b> (№ ${sb.meterSerial})<br/>${
              isSbDraggable
                ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
                : isSbPinned && !isObjectsLocked
                ? '🔒 Положение зафиксировано (защита от сдвига)'
                : 'Клик для выбора'
            }`,
            { direction: 'top', offset: [0, -14] }
          );
          electric.addLayer(marker);
        });
      }

      // 2.4 Осветительные приборы и уличные фонари
      if (networkSubLayers.electricLighting) {
        lightPoles.forEach((pole) => {
          const isWorking = pole.status === 'working';
          const isSelected = selectedNetworkItem?.type === 'lightPole' && selectedNetworkItem.data?.id === pole.id;
          const isPoleDraggable = isObjectMovable(pole.id);
          const isPolePinned = lockedObjectIds[pole.id] === true;
          const iconHtml = `
            <div class="relative w-4 h-4 rounded-full border transition-all ${
              isPoleDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400' : 'cursor-pointer hover:scale-125'
            } ${
              isSelected
                ? 'ring-4 ring-indigo-400 scale-125 bg-amber-300 border-amber-600'
                : isWorking
                ? 'border-amber-400 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                : 'border-slate-400 bg-slate-200'
            }">
              ${isPolePinned && !isObjectsLocked ? '<span class="absolute -top-1.5 -right-1.5 text-[8px]">🔒</span>' : ''}
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-lightpole-icon',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          const marker = L.marker([pole.coordinates.lat, pole.coordinates.lng], {
            icon: customIcon,
            draggable: isPoleDraggable,
          });

          marker.bindTooltip(
            `<b>Фонарь ${pole.code}</b><br/>Светильник: ${pole.lampType}<br/>Фаза: ${pole.phase}, Дежурный режим: ${pole.isDutyLight ? 'Вкл' : 'Откл'}<br/>${
              isPoleDraggable
                ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
                : isPolePinned && !isObjectsLocked
                ? '🔒 Положение зафиксировано (защита от сдвига)'
                : 'Клик для выбора'
            }`,
            { direction: 'top', offset: [0, -8] }
          );
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'lightPole', data: pole });
          });
          marker.on('dragend', (e: any) => {
            const newLatLng = e.target.getLatLng();
            handleUpdateObjectCoordinates('lightPole', pole.id, {
              lat: Number(newLatLng.lat.toFixed(6)),
              lng: Number(newLatLng.lng.toFixed(6)),
            });
          });
          electric.addLayer(marker);
        });
      }
    }

    // 3. ГАЗОСНАБЖЕНИЕ: ТРАССА, УСТАНОВКИ ГРПШ
    if (gas) {
      if (networkSubLayers.gasTraces) {
        pipelines
          .filter((p) => p.networkType === 'gas')
          .forEach((pipe) => {
            const isMedium = pipe.subType === 'medium_pressure';
            const latLngs = pipe.path.map((c) => [c.lat, c.lng] as [number, number]);
            const line = L.polyline(latLngs, {
              color: '#ca8a04',
              weight: isMedium ? 5 : 3.5,
              opacity: 0.9,
            });
            line.bindTooltip(
              `<b>${pipe.code}</b><br/>${pipe.material}<br/>Ду ${pipe.diameterMm} мм, Давление: ${pipe.pressureNominal}`,
              { sticky: true }
            );
            line.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'pipeline', data: pipe });
            });
            gas.addLayer(line);
          });
      }

      if (networkSubLayers.gasGrpsh) {
        const isSelected = selectedNetworkItem?.type === 'gasRegulator' && selectedNetworkItem.data?.id === gasRegulator.id;
        const isGrpDraggable = isObjectMovable(gasRegulator.id);
        const isGrpPinned = lockedObjectIds[gasRegulator.id] === true;
        const grpIconHtml = `
          <div class="relative w-9 h-9 rounded-lg border-2 ${
            isSelected ? 'border-amber-500 ring-2 ring-amber-400 bg-yellow-200' : 'border-yellow-600 bg-yellow-100'
          } text-yellow-900 flex flex-col items-center justify-center font-bold text-[10px] shadow-md transition-all ${
            isGrpDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400 ring-offset-1' : 'cursor-pointer hover:scale-115'
          }">
            <span class="text-xs">🔥</span>
            <span class="text-[8px] font-mono -mt-1 font-bold">ГРПШ</span>
            ${isGrpPinned && !isObjectsLocked ? '<span class="absolute -top-1.5 -right-1.5 text-[9px]">🔒</span>' : ''}
            ${isGrpDraggable ? '<span class="absolute -bottom-1 -right-1 text-[8px]">🖐️</span>' : ''}
          </div>
        `;
        const grpIcon = L.divIcon({
          html: grpIconHtml,
          className: 'custom-grp-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const grpMarker = L.marker([gasRegulator.coordinates.lat, gasRegulator.coordinates.lng], {
          icon: grpIcon,
          draggable: isGrpDraggable,
        });
        grpMarker.bindTooltip(
          `<b>${gasRegulator.name} (${gasRegulator.code})</b><br/>Входное: ${gasRegulator.inletPressureMpa} МПа, Выходное: ${gasRegulator.outletPressureKpa} кПа<br/>${
            isGrpDraggable
              ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
              : isGrpPinned && !isObjectsLocked
              ? '🔒 Положение зафиксировано (защита от сдвига)'
              : 'Клик для выбора'
          }`,
          { direction: 'top', offset: [0, -18] }
        );
        grpMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'gasRegulator', data: gasRegulator });
        });
        grpMarker.on('dragend', (e: any) => {
          const newLatLng = e.target.getLatLng();
          handleUpdateObjectCoordinates('gasRegulator', gasRegulator.id, {
            lat: Number(newLatLng.lat.toFixed(6)),
            lng: Number(newLatLng.lng.toFixed(6)),
          });
        });
        gas.addLayer(grpMarker);
      }

      if (networkSubLayers.gasValves) {
        valves
          .filter((v) => v.networkType === 'gas')
          .forEach((valve) => {
            const isSelected = selectedNetworkItem?.type === 'valve' && selectedNetworkItem.data?.id === valve.id;
            const isGvDraggable = isObjectMovable(valve.id);
            const isGvPinned = lockedObjectIds[valve.id] === true;
            const iconHtml = `
              <div class="relative w-6 h-6 rounded-md border border-amber-700 ${
                isSelected ? 'ring-2 ring-amber-400 bg-amber-200' : 'bg-amber-100'
              } text-amber-900 flex items-center justify-center text-[10px] font-bold shadow-sm transition-all ${
                isGvDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400' : 'cursor-pointer hover:scale-125'
              }">
                ГК
                ${isGvPinned && !isObjectsLocked ? '<span class="absolute -top-1.5 -right-1.5 text-[9px]">🔒</span>' : ''}
              </div>
            `;
            const customIcon = L.divIcon({
              html: iconHtml,
              className: 'custom-gas-valve-icon',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });
            const marker = L.marker([valve.coordinates.lat, valve.coordinates.lng], {
              icon: customIcon,
              draggable: isGvDraggable,
            });
            marker.bindTooltip(
              `<b>Газовый кран ${valve.code}</b><br/>Ду ${valve.diameterMm} мм<br/>${
                isGvDraggable
                  ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
                  : isGvPinned && !isObjectsLocked
                  ? '🔒 Положение зафиксировано (защита от сдвига)'
                  : 'Клик для выбора'
              }`
            );
            marker.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'valve', data: valve });
            });
            marker.on('dragend', (e: any) => {
              const newLatLng = e.target.getLatLng();
              handleUpdateObjectCoordinates('valve', valve.id, {
                lat: Number(newLatLng.lat.toFixed(6)),
                lng: Number(newLatLng.lng.toFixed(6)),
              });
            });
            gas.addLayer(marker);
          });
      }
    }

    // 4. СЛАБОТОЧНЫЕ СЕТИ (Оптоволокно, Видеонаблюдение, Wi-Fi)
    if (telecom) {
      if (networkSubLayers.telecomFiber || networkSubLayers.telecomCctv) {
        pipelines
          .filter((p) => p.networkType === 'telecom')
          .forEach((tPipe) => {
            const isFiber = tPipe.subType === 'optic_fiber';
            const isCctv = tPipe.subType === 'cctv';

            if ((isFiber && !networkSubLayers.telecomFiber) || (isCctv && !networkSubLayers.telecomCctv)) {
              return;
            }

            const latLngs = tPipe.path.map((c) => [c.lat, c.lng] as [number, number]);
            const tLine = L.polyline(latLngs, {
              color: isFiber ? '#2563eb' : '#7c3aed',
              weight: 3.5,
              dashArray: isFiber ? '4, 4' : '2, 3',
              opacity: 0.9,
            });
            tLine.bindTooltip(`<b>${tPipe.code}</b><br/>${tPipe.description || tPipe.material}`, { sticky: true });
            tLine.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'pipeline', data: tPipe });
            });
            telecom.addLayer(tLine);
          });
      }

      if (networkSubLayers.telecomWifi) {
        wifiHotspots.forEach((hs) => {
          const circle = L.circle([hs.coordinates.lat, hs.coordinates.lng], {
            radius: hs.rangeMeters,
            color: '#3b82f6',
            weight: 1,
            fillColor: '#60a5fa',
            fillOpacity: 0.12,
            dashArray: '3, 6',
          });
          telecom.addLayer(circle);

          const isSelected = selectedNetworkItem?.type === 'wifiHotspot' && selectedNetworkItem.data?.id === hs.id;
          const isWifiDraggable = isObjectMovable(hs.id);
          const isWifiPinned = lockedObjectIds[hs.id] === true;
          const iconHtml = `
            <div class="relative w-6 h-6 rounded-full border border-blue-600 ${
              isSelected ? 'ring-2 ring-blue-400 bg-blue-200' : 'bg-blue-100'
            } text-blue-800 flex items-center justify-center text-xs shadow-sm transition-all ${
              isWifiDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400' : 'cursor-pointer hover:scale-125'
            }">
              📶
              ${isWifiPinned && !isObjectsLocked ? '<span class="absolute -top-1.5 -right-1.5 text-[8px]">🔒</span>' : ''}
              ${isWifiDraggable ? '<span class="absolute -bottom-1 -right-1 text-[8px]">🖐️</span>' : ''}
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-wifi-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          const marker = L.marker([hs.coordinates.lat, hs.coordinates.lng], {
            icon: customIcon,
            draggable: isWifiDraggable,
          });
          marker.bindTooltip(
            `<b>${hs.name}</b><br/>SSID: <b>${hs.ssid}</b>, Радиус: ${hs.rangeMeters} м<br/>${
              isWifiDraggable
                ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
                : isWifiPinned && !isObjectsLocked
                ? '🔒 Положение зафиксировано (защита от сдвига)'
                : 'Клик для выбора'
            }`,
            { direction: 'top', offset: [0, -12] }
          );
          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'wifiHotspot', data: hs });
          });
          marker.on('dragend', (e: any) => {
            const newLatLng = e.target.getLatLng();
            handleUpdateObjectCoordinates('wifiHotspot', hs.id, {
              lat: Number(newLatLng.lat.toFixed(6)),
              lng: Number(newLatLng.lng.toFixed(6)),
            });
          });
          telecom.addLayer(marker);
        });
      }
    }

    // 5. УПРАВЛЯЕМЫЙ СЛОЙ С КАДАСТРОВЫМИ НОМЕРАМИ И ПЛАНАМИ ГРАНИЦ УЧАСТКОВ
    if (networkSubLayers.cadastrePolygons && plotGroup) {
      plots.forEach((plot) => {
        const isWinterConnected = plot.utilities.winterWater.connected;
        const isTuIssued = plot.utilities.winterWater.status === 'tu_issued';
        const isApplied = plot.utilities.winterWater.status === 'applied';
        const isPermanentResident = plot.residencyType === 'permanent';

        const latLngs = plot.polygon.map((c) => [c.lat, c.lng] as [number, number]);

        let fillColor = isPermanentResident
          ? '#dbeafe'
          : isWinterConnected
          ? '#e0f2fe'
          : isApplied
          ? '#fef3c7'
          : '#f8fafc';
        let strokeColor = isPermanentResident ? '#2563eb' : isWinterConnected ? '#0284c7' : '#94a3b8';
        let fillOpacity = 0.5;
        let strokeWidth = 1.5;

        if (resourceAvailabilityMode && resourceUtilityType === 'winter_water') {
          if (isWinterConnected) {
            fillColor = '#10b981';
            strokeColor = '#047857';
            fillOpacity = 0.65;
          } else if (isApplied) {
            fillColor = '#f59e0b';
            strokeColor = '#b45309';
            fillOpacity = 0.7;
          } else if (isTuIssued) {
            fillColor = '#0284c7';
            strokeColor = '#0369a1';
            fillOpacity = 0.7;
          } else {
            fillColor = '#f43f5e';
            strokeColor = '#be123c';
            fillOpacity = 0.45;
          }
        }

        const isPlotPinned = lockedObjectIds[plot.id] === true;
        const isPlotDraggable = isObjectMovable(plot.id);

        const poly = L.polygon(latLngs, {
          color: strokeColor,
          weight: activePlot?.id === plot.id ? 3 : strokeWidth,
          dashArray: activePlot?.id === plot.id && isPlotDraggable ? '5, 5' : undefined,
          fillColor,
          fillOpacity,
        });

        poly.on('click', () => {
          setActivePlot(plot);
          onSelectPlot(plot);
        });

        const cadTail = plot.cadastralNumber.split(':').pop();
        poly.bindTooltip(
          `<b>Участок № ${plot.number}</b> (:<b>${cadTail}</b>)<br/>Кадастровый номер: <b>${plot.cadastralNumber}</b><br/>Собственник: <b>${plot.ownerName}</b> (${plot.areaSqm} м²)<br/>💧 Зимний водопровод: <b>${
            isWinterConnected ? '🟢 Подключен' : isApplied ? '🟡 Заявка' : isTuIssued ? '🔵 ТУ выданы' : '🔴 Нет'
          }</b><br/>${
            isPlotDraggable
              ? '🖐️ Push & Pull активен: двигайте метку участка или углы контура'
              : isPlotPinned && !isObjectsLocked
              ? '🔒 Участок зафиксирован от случайного сдвига'
              : 'Клик для выбора'
          }`,
          { sticky: true }
        );

        plotGroup.addLayer(poly);

        // Interactive Push & Pull Vertex Handles on active plot polygon corners!
        if (activePlot?.id === plot.id && isPlotDraggable) {
          plot.polygon.forEach((vPt, vIdx) => {
            const vIconHtml = `
              <div class="w-3.5 h-3.5 bg-sky-500 border-2 border-white rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-125 transition-transform" title="Push&Pull: потяните угол участка"></div>
            `;
            const vIcon = L.divIcon({
              html: vIconHtml,
              className: 'custom-plot-vertex',
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            });
            const vMarker = L.marker([vPt.lat, vPt.lng], {
              icon: vIcon,
              draggable: true,
            });
            vMarker.bindTooltip(`Угол ${vIdx + 1}: тяните для Push & Pull границы`, { direction: 'top', offset: [0, -8] });
            vMarker.on('dragend', (e: any) => {
              const newPos = e.target.getLatLng();
              const newPoly = [...plot.polygon];
              newPoly[vIdx] = {
                lat: Number(newPos.lat.toFixed(6)),
                lng: Number(newPos.lng.toFixed(6)),
              };
              const updatedPlot: Plot = {
                ...plot,
                polygon: newPoly,
              };
              if (onUpdatePlot) {
                onUpdatePlot(updatedPlot);
              }
              setActivePlot(updatedPlot);
              setDragNotification({
                name: `Участок № ${plot.number} (угол ${vIdx + 1})`,
                lat: newPos.lat,
                lng: newPos.lng,
              });
              setTimeout(() => setDragNotification(null), 3000);
            });
            plotGroup.addLayer(vMarker);
          });
        }

        // Постоянные подписи с кадастровыми номерами и номерами участков
        if (networkSubLayers.cadastreLabels && plotLabels) {
          const labelHtml = `
            <div class="flex flex-col items-center justify-center select-none text-center ${
              isPlotDraggable ? 'cursor-grab active:cursor-grabbing hover:scale-110' : 'pointer-events-none'
            }">
              <span class="px-1.5 py-0.5 rounded font-bold font-mono text-[11px] ${
                isPlotDraggable ? 'bg-amber-600 text-white ring-2 ring-amber-300' : 'bg-slate-900/90 text-white'
              } shadow-sm leading-none whitespace-nowrap flex items-center gap-0.5">
                ${isPlotDraggable ? '🖐️ ' : ''}№ ${plot.number}
                ${isPlotPinned && !isObjectsLocked ? '<span class="text-[9px]">🔒</span>' : ''}
              </span>
              <span class="text-[9px] font-mono font-semibold px-1 rounded bg-white/95 text-slate-700 shadow-xs mt-0.5 whitespace-nowrap border border-slate-300">
                :${cadTail}
              </span>
            </div>
          `;

          const labelIcon = L.divIcon({
            html: labelHtml,
            className: 'custom-plot-label',
            iconSize: [44, 30],
            iconAnchor: [22, 15],
          });

          const labelMarker = L.marker([plot.coordinates.lat, plot.coordinates.lng], {
            icon: labelIcon,
            interactive: isPlotDraggable,
            draggable: isPlotDraggable,
          });

          if (isPlotDraggable) {
            labelMarker.bindTooltip(
              `<b>Участок № ${plot.number}</b><br/>🖐️ Push & Pull: зажмите и тяните для смещения всего участка`,
              { direction: 'top', offset: [0, -14] }
            );
            labelMarker.on('dragend', (e: any) => {
              const newLatLng = e.target.getLatLng();
              const dLat = Number(newLatLng.lat.toFixed(6)) - plot.coordinates.lat;
              const dLng = Number(newLatLng.lng.toFixed(6)) - plot.coordinates.lng;
              const newPolygon = plot.polygon.map((pt) => ({
                lat: Number((pt.lat + dLat).toFixed(6)),
                lng: Number((pt.lng + dLng).toFixed(6)),
              }));
              const updatedPlot: Plot = {
                ...plot,
                coordinates: {
                  lat: Number(newLatLng.lat.toFixed(6)),
                  lng: Number(newLatLng.lng.toFixed(6)),
                },
                polygon: newPolygon,
              };
              if (onUpdatePlot) {
                onUpdatePlot(updatedPlot);
              }
              handleUpdateObjectCoordinates('plot', plot.id, updatedPlot.coordinates);
            });
          }

          plotLabels.addLayer(labelMarker);
        }
      });
    }

    // 6. FACILITIES & BARRIERS (Дом правления, шлагбаумы, посты охраны)
    if (facilities) {
      adminFacilities.forEach((fac) => {
        const isSelected = selectedNetworkItem?.type === 'adminFacility' && selectedNetworkItem.data?.id === fac.id;
        const isFacDraggable = isObjectMovable(fac.id);
        const isFacPinned = lockedObjectIds[fac.id] === true;
        const iconHtml = `
          <div class="relative w-9 h-9 rounded-xl border-2 ${
            isSelected
              ? 'border-indigo-500 ring-4 ring-indigo-400/50 bg-indigo-100 scale-110'
              : 'border-indigo-700 bg-indigo-50'
          } text-indigo-900 flex flex-col items-center justify-center font-bold shadow-md transition-all ${
            isFacDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400 ring-offset-1' : 'cursor-pointer hover:scale-115'
          }">
            <span class="text-sm">🏛️</span>
            <span class="text-[8px] font-mono -mt-1 font-bold">${fac.code}</span>
            ${isFacPinned && !isObjectsLocked ? '<span class="absolute -top-1.5 -right-1.5 text-[9px]">🔒</span>' : ''}
            ${isFacDraggable ? '<span class="absolute -bottom-1 -right-1 text-[8px]">🖐️</span>' : ''}
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-fac-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const marker = L.marker([fac.coordinates.lat, fac.coordinates.lng], {
          icon: customIcon,
          draggable: isFacDraggable,
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'adminFacility', data: fac });
        });

        marker.on('dragend', (e: any) => {
          const newLatLng = e.target.getLatLng();
          handleUpdateObjectCoordinates('adminFacility', fac.id, {
            lat: Number(newLatLng.lat.toFixed(6)),
            lng: Number(newLatLng.lng.toFixed(6)),
          });
        });

        marker.bindTooltip(
          `<b>${fac.name} (${fac.code})</b><br/>${fac.description}<br/>${
            isFacDraggable
              ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
              : isFacPinned && !isObjectsLocked
              ? '🔒 Положение зафиксировано (защита от сдвига)'
              : 'Клик для инспекции и удаления'
          }`,
          { direction: 'top', offset: [0, -18] }
        );
        facilities.addLayer(marker);
      });
    }

    if (barriers) {
      barrierGates.forEach((bg) => {
        const isSelected = selectedNetworkItem?.type === 'barrierGate' && selectedNetworkItem.data?.id === bg.id;
        const isBgDraggable = isObjectMovable(bg.id);
        const isBgPinned = lockedObjectIds[bg.id] === true;
        const iconHtml = `
          <div class="relative w-8 h-8 rounded-lg border-2 ${
            isSelected
              ? 'border-amber-500 ring-4 ring-amber-400/50 bg-amber-100 scale-110'
              : 'border-slate-700 bg-slate-100'
          } text-slate-900 flex items-center justify-center font-bold text-xs shadow-md transition-all ${
            isBgDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400 ring-offset-1' : 'cursor-pointer hover:scale-115'
          }">
            🚧
            ${isBgPinned && !isObjectsLocked ? '<span class="absolute -top-1.5 -right-1.5 text-[9px]">🔒</span>' : ''}
            ${isBgDraggable ? '<span class="absolute -bottom-1 -right-1 text-[8px]">🖐️</span>' : ''}
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-barrier-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([bg.coordinates.lat, bg.coordinates.lng], {
          icon: customIcon,
          draggable: isBgDraggable,
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'barrierGate', data: bg });
        });

        marker.on('dragend', (e: any) => {
          const newLatLng = e.target.getLatLng();
          handleUpdateObjectCoordinates('barrierGate', bg.id, {
            lat: Number(newLatLng.lat.toFixed(6)),
            lng: Number(newLatLng.lng.toFixed(6)),
          });
        });

        marker.bindTooltip(
          `<b>${bg.name} (${bg.code})</b><br/>Открытие: ${bg.openByPhone}<br/>${
            isBgDraggable
              ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
              : isBgPinned && !isObjectsLocked
              ? '🔒 Положение зафиксировано (защита от сдвига)'
              : 'Клик для инспекции и удаления'
          }`,
          { direction: 'top', offset: [0, -16] }
        );
        barriers.addLayer(marker);
      });
    }

    // 7. INFRASTRUCTURE & MUNICIPAL SITES (Снегоотвалы и ТБО)
    if (seasonal) {
      snowDumps.forEach((sd) => {
        const latLngs = sd.polygon.map((c) => [c.lat, c.lng] as [number, number]);
        const poly = L.polygon(latLngs, {
          color: '#38bdf8',
          weight: 2,
          fillColor: '#bae6fd',
          fillOpacity: 0.35,
        });
        poly.bindTooltip(`<b>${sd.name}</b><br/>Заполнение: ${sd.currentFillPercent}%`, { sticky: true });
        seasonal.addLayer(poly);
      });

      wasteSites.forEach((ws) => {
        const isWsDraggable = isObjectMovable(ws.id);
        const isWsPinned = lockedObjectIds[ws.id] === true;
        const iconHtml = `
          <div class="relative w-7 h-7 rounded-lg border-2 border-emerald-700 bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs shadow-md transition-all ${
            isWsDraggable ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400' : 'cursor-pointer hover:scale-110'
          }">
            🗑️
            ${isWsPinned && !isObjectsLocked ? '<span class="absolute -top-1 -right-1 text-[9px]">🔒</span>' : ''}
            ${isWsDraggable ? '<span class="absolute -bottom-1 -right-1 text-[8px]">🖐️</span>' : ''}
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-waste-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([ws.coordinates.lat, ws.coordinates.lng], {
          icon: customIcon,
          draggable: isWsDraggable,
        });
        marker.bindTooltip(
          `<b>${ws.name}</b><br/>График вывоза: ${ws.pickupSchedule}<br/>${
            isWsDraggable
              ? '🖐️ Push & Pull: зажмите и тяните для перемещения'
              : isWsPinned && !isObjectsLocked
              ? '🔒 Положение зафиксировано (защита от сдвига)'
              : 'Клик для информации'
          }`,
          { direction: 'top', offset: [0, -12] }
        );
        marker.on('dragend', (e: any) => {
          const newLatLng = e.target.getLatLng();
          handleUpdateObjectCoordinates('wasteSite', ws.id, {
            lat: Number(newLatLng.lat.toFixed(6)),
            lng: Number(newLatLng.lng.toFixed(6)),
          });
        });
        seasonal.addLayer(marker);
      });
    }
  }, [
    networkSubLayers,
    boundaryPoints,
    wells,
    valves,
    substations,
    switchboards,
    lightPoles,
    gasRegulator,
    pipelines,
    fireHydrants,
    snowDumps,
    wasteSites,
    fireTurnarounds,
    inspectionPoints,
    plots,
    season,
    wifiHotspots,
    barrierGates,
    adminFacilities,
    isObjectsLocked,
    lockedObjectIds,
    activePlot,
    onUpdatePlot,
    selectedNetworkItem,
    resourceAvailabilityMode,
    resourceUtilityType,
    resourceFilter,
    onSelectPlot,
    onSelectWell,
  ]);

  // Update Highlighted Winter Water Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (highlightedRoute) {
      const waypoints = generateRoutePoints(highlightedRoute.plotCoords, highlightedRoute.wellCoords);
      const latLngs = waypoints.map((c) => [c.lat, c.lng] as [number, number]);

      const polyline = L.polyline(latLngs, {
        color: '#059669',
        weight: 6,
        dashArray: '8, 8',
        opacity: 0.95,
      }).addTo(map);

      polyline.bindTooltip(
        `<b>Проектируемая трасса зимнего водопровода</b><br/>Врезка в колодец: <b>${highlightedRoute.wellCode}</b><br/>Глубина: 2.8 м (ГОСТ, ПНД d32)`,
        { permanent: true, direction: 'center', className: 'route-tooltip' }
      );

      routeLayerRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [60, 60], maxZoom: 18 });
    }
  }, [highlightedRoute]);

  const handleSearchPlot = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(searchPlotQuery.trim(), 10);
    if (!isNaN(num)) {
      const found = plots.find((p) => p.number === num);
      if (found) {
        setActivePlot(found);
        onSelectPlot(found);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([found.coordinates.lat, found.coordinates.lng], 18, { animate: true });
        }
      }
    }
  };

  const handleRotate = (delta: number) => {
    setRotationAngle((prev) => (prev + delta + 360) % 360);
  };

  const handleSetExactAngle = (angle: number) => {
    setRotationAngle(angle);
  };

  // Step 1: Save Custom Manual Boundary Draft
  const handleSaveCustomBoundary = () => {
    if (newBoundaryDraft.length < 3) {
      return;
    }
    const updated = [...newBoundaryDraft];
    setBoundaryPoints(updated);
    if (onSaveBoundaryPoints) {
      onSaveBoundaryPoints(updated);
    }
    setIsBoundaryEditMode(false);
    setNewBoundaryDraft([]);
  };

  const handleCancelCustomBoundary = () => {
    setIsBoundaryEditMode(false);
    setNewBoundaryDraft([]);
  };

  const handleResetToOfficialBoundary = () => {
    setBoundaryPoints(DTSN_PENSIONER_BOUNDARY);
    if (onSaveBoundaryPoints) {
      onSaveBoundaryPoints(DTSN_PENSIONER_BOUNDARY);
    }
    setIsBoundaryEditMode(false);
    setNewBoundaryDraft([]);
  };

  // Save from Modal
  const handleModalSave = (type: EditableObjectType, data: any) => {
    if (editorMode === 'create') {
      if (type === 'pipeline' && onAddPipeline) onAddPipeline(data);
      if (type === 'well' && onAddWell) onAddWell(data);
      if (type === 'valve' && onAddValve) onAddValve(data);
      if (type === 'switchboard' && onAddSwitchboard) onAddSwitchboard(data);
      if (type === 'substation' && onAddSubstation) onAddSubstation(data);
      if (type === 'fireHydrant' && onAddFireHydrant) onAddFireHydrant(data);
      if (type === 'lightPole' && onAddLightPole) onAddLightPole(data);
      if (type === 'wifiHotspot' && onAddWifiHotspot) onAddWifiHotspot(data);
      if (type === 'barrierGate' && onAddBarrierGate) onAddBarrierGate(data);
      if (type === 'adminFacility' && onAddAdminFacility) onAddAdminFacility(data);
    } else {
      if (type === 'pipeline' && onUpdatePipeline) onUpdatePipeline(data);
      if (type === 'well' && onUpdateWell) onUpdateWell(data);
      if (type === 'valve' && onUpdateValve) onUpdateValve(data);
      if (type === 'switchboard' && onUpdateSwitchboard) onUpdateSwitchboard(data);
      if (type === 'substation' && onUpdateSubstation) onUpdateSubstation(data);
      if (type === 'fireHydrant' && onUpdateFireHydrant) onUpdateFireHydrant(data);
      if (type === 'lightPole' && onUpdateLightPole) onUpdateLightPole(data);
      if (type === 'wifiHotspot' && onUpdateWifiHotspot) onUpdateWifiHotspot(data);
      if (type === 'barrierGate' && onUpdateBarrierGate) onUpdateBarrierGate(data);
      if (type === 'adminFacility' && onUpdateAdminFacility) onUpdateAdminFacility(data);
    }

    if (selectedNetworkItem && selectedNetworkItem.data?.id === data.id) {
      setSelectedNetworkItem({ type: type as any, data });
    }

    setDrawnLinePoints([]);
    setEditTool('select');
  };

  // Handle Delete
  const handleDeleteItem = (type: string, id: string) => {
    if (type === 'pipeline' && onDeletePipeline) onDeletePipeline(id);
    if (type === 'well' && onDeleteWell) onDeleteWell(id);
    if (type === 'valve' && onDeleteValve) onDeleteValve(id);
    if (type === 'switchboard' && onDeleteSwitchboard) onDeleteSwitchboard(id);
    if (type === 'substation' && onDeleteSubstation) onDeleteSubstation(id);
    if (type === 'fireHydrant' && onDeleteFireHydrant) onDeleteFireHydrant(id);
    if (type === 'lightPole' && onDeleteLightPole) onDeleteLightPole(id);
    if (type === 'wifiHotspot' && onDeleteWifiHotspot) onDeleteWifiHotspot(id);
    if (type === 'barrierGate' && onDeleteBarrierGate) onDeleteBarrierGate(id);
    if (type === 'adminFacility' && onDeleteAdminFacility) onDeleteAdminFacility(id);

    if (selectedNetworkItem?.data?.id === id) {
      setSelectedNetworkItem(null);
    }
    if (activeWell?.id === id) {
      setActiveWell(null);
    }
  };

  const handleCenterOnObject = (type: string, item: any) => {
    const coords = item.coordinates || (item.path && item.path[0]);
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 18, { animate: true });
    }
    setSelectedNetworkItem({ type: type as any, data: item });
  };

  const handleFinishDrawingLine = () => {
    if (drawnLinePoints.length < 2) {
      return;
    }
    openCreateForTarget(activeEditTarget, undefined, drawnLinePoints);
  };

  const copyCadastralToClipboard = (cadastral: string) => {
    navigator.clipboard.writeText(cadastral);
    setCopyFeedback(cadastral);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  return (
    <div className="relative w-full h-[720px] lg:h-[780px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-lg select-none">
      {/* ROTATING MAP VIEWPORT WRAPPER: Rotates smoothly in place around center without displacing the map */}
      <div
        className="absolute inset-[-25%] w-[150%] h-[150%] flex items-center justify-center transition-transform duration-300 ease-out origin-center pointer-events-auto"
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transformOrigin: '50% 50%',
        }}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* FLOATING TOAST WHEN ELEMENT POSITION IS UPDATED */}
      {dragNotification && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-slate-900/95 text-white text-xs font-semibold rounded-xl shadow-2xl border border-emerald-500 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Позиция сохранена в PostgreSQL: {dragNotification.lat.toFixed(6)}, {dragNotification.lng.toFixed(6)}</span>
        </div>
      )}

      {/* TOP-LEFT PANEL: ACCORDION LAYERS, BOUNDARY SELECTION & NETWORK EDITING */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 max-w-sm sm:max-w-md max-h-[92%] overflow-y-auto pr-1">
        {/* Main Toolbar Strip */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md text-xs">
          {/* STEP 1: Выбрать область карты вручную для ДТСН Пенсионер */}
          <button
            onClick={() => {
              const nextState = !isBoundaryEditMode;
              setIsBoundaryEditMode(nextState);
              if (nextState) {
                setIsEditingMode(false);
                setNewBoundaryDraft([]);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              isBoundaryEditMode
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
            title="Выбрать область карты вручную для определения границ ДТСН Пенсионер"
          >
            <Square className="w-3.5 h-3.5" />
            <span>{isBoundaryEditMode ? 'Завершить выбор' : 'Область ДТСН вручную'}</span>
          </button>

          {/* Network Editing Mode Toggle */}
          <button
            onClick={() => {
              setIsEditingMode(!isEditingMode);
              if (isEditingMode) {
                setDrawnLinePoints([]);
                setEditTool('select');
              } else {
                setIsBoundaryEditMode(false);
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              isEditingMode
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
            title="Режим редактирования проложенных сетей"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Правка сетей</span>
          </button>

          <button
            onClick={() => setIsCatalogModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors border border-slate-200"
            title="Открыть реестр сетей и оборудования"
          >
            <Table className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Реестр</span>
          </button>

          {/* LOCK / DRAG & DROP TOGGLE (Закрепить / Перемещение Push & Pull) */}
          <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setIsObjectsLocked((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all shadow-xs ${
                isObjectsLocked
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md ring-2 ring-amber-300'
              }`}
              title={
                isObjectsLocked
                  ? 'Все элементы зафиксированы (защита от случайного сдвига). Нажмите, чтобы включить режим Push & Pull (перемещение).'
                  : 'Режим Push & Pull активен! Перетаскивайте колодцы, задвижки, шлагбаумы, участки и углы контуров.'
              }
            >
              {isObjectsLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-700" />
                  <span>Закреплено</span>
                </>
              ) : (
                <>
                  <Move className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>Push & Pull</span>
                </>
              )}
            </button>

            {!isObjectsLocked && (
              <button
                type="button"
                onClick={handleLockAllObjects}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                title="Зафиксировать все текущие объекты от случайного сдвига"
              >
                Закрепить все
              </button>
            )}

            {Object.keys(lockedObjectIds).filter((k) => lockedObjectIds[k]).length > 0 && !isObjectsLocked && (
              <button
                type="button"
                onClick={handleUnlockAllObjects}
                className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                title="Снять все персональные закрепления объектов"
              >
                Открепить все ({Object.keys(lockedObjectIds).filter((k) => lockedObjectIds[k]).length})
              </button>
            )}
          </div>
        </div>

        {/* FLOATING BANNER WHEN DRAG & DROP IS ACTIVE */}
        {!isObjectsLocked && (
          <div className="p-2.5 px-3.5 bg-amber-500 text-slate-950 font-medium rounded-xl shadow-xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-slate-950 shrink-0" />
              <span>
                <b>Push & Pull активен:</b> перетаскивайте любые элементы (колодцы, задвижки, гидранты, шлагбаумы, участки и их углы). Нажмите 🔒 в карточке объекта для его фиксации.
              </span>
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleLockAllObjects}
                className="px-2 py-1 bg-white/90 hover:bg-white text-slate-900 font-bold rounded-lg text-[10px] whitespace-nowrap transition-colors"
              >
                🔒 Зафиксировать все
              </button>
              <button
                type="button"
                onClick={() => setIsObjectsLocked(true)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <Lock className="w-3 h-3 text-white" />
                <span>Закрепить карту</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1 CONTROLS: Floating Bar when Boundary Editing is ACTIVE */}
        {isBoundaryEditMode && (
          <div className="p-3 bg-purple-50/98 backdrop-blur-md rounded-2xl border-2 border-purple-500 shadow-xl text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between pb-1 border-b border-purple-200">
              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                Ручной выбор области ДТСН Пенсионер
              </span>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-bold">
                Точек: {newBoundaryDraft.length}
              </span>
            </div>

            <p className="text-[11px] text-purple-900 leading-snug">
              Кликайте по карте для отметки поворотных точек границ общества. Для замыкания контура требуется от 3 точек.
            </p>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={handleSaveCustomBoundary}
                disabled={newBoundaryDraft.length < 3}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                  newBoundaryDraft.length >= 3
                    ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-sm'
                    : 'bg-purple-200 text-purple-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Применить контур</span>
              </button>

              <button
                onClick={handleResetToOfficialBoundary}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-purple-200"
                title="Сбросить на кадастровый массив 54:19:112001 (НСПД)"
              >
                НСПД
              </button>

              <button
                onClick={handleCancelCustomBoundary}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-purple-800 font-semibold rounded-xl border border-purple-200"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 & STEP 2: EXPANDABLE COLLAPSIBLE ACCORDION LAYERS WITH CADASTRE */}
        <div className="bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md text-xs overflow-hidden">
          <div className="p-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 font-bold text-slate-900">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              Раскрывающиеся слои инженерных сетей
            </span>
            <span className="text-[10px] text-slate-400 font-mono">55.0986, 82.9009</span>
          </div>

          <div className="divide-y divide-slate-100">
            {/* 1. ВОДОСНАБЖЕНИЕ: ТРАССА, КОЛОДЕЦ, ЛЕТНИЙ ВЫВОД */}
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'water' ? null : 'water')}
                className={`w-full p-2.5 flex items-center justify-between text-left font-semibold transition-colors ${
                  expandedSection === 'water' ? 'bg-sky-50 text-sky-950' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-sky-600" />
                  <span>Водоснабжение (Трасса, Колодцы, Летний вывод)</span>
                </span>
                {expandedSection === 'water' ? <ChevronUp className="w-4 h-4 text-sky-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'water' && (
                <div className="p-3 bg-sky-50/50 space-y-2 border-t border-sky-100 animate-fadeIn text-[11px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.waterWinterTraces}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, waterWinterTraces: e.target.checked }))}
                        className="rounded text-sky-600 w-3.5 h-3.5"
                      />
                      <span>❄️ Трасса зимнего водопровода</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.waterWells}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, waterWells: e.target.checked }))}
                        className="rounded text-emerald-600 w-3.5 h-3.5"
                      />
                      <span>🚰 Колодцы и узлы врезки (КВ)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.waterSummerTaps}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, waterSummerTaps: e.target.checked }))}
                        className="rounded text-cyan-600 w-3.5 h-3.5"
                      />
                      <span>🚿 Летний вывод (стояки полива)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.waterValves}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, waterValves: e.target.checked }))}
                        className="rounded text-amber-600 w-3.5 h-3.5"
                      />
                      <span>⚙️ Запорная арматура (ЗК)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.waterHydrants}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, waterHydrants: e.target.checked }))}
                        className="rounded text-rose-600 w-3.5 h-3.5"
                      />
                      <span>🚒 Пожарные гидранты (ПГ)</span>
                    </label>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-sky-200 text-[10px]">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        onClick={() => openCreateForTarget('pipe_water_winter')}
                        className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Чертить трассу зимнего водопровода"
                      >
                        <Plus className="w-3 h-3 text-sky-700" />
                        <span>Зимняя трасса</span>
                      </button>
                      <button
                        onClick={() => openCreateForTarget('pipe_water_summer')}
                        className="px-2 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Чертить трассу летнего водопровода"
                      >
                        <Plus className="w-3 h-3 text-cyan-700" />
                        <span>Летняя трасса</span>
                      </button>
                      <button
                        onClick={() => openCreateForTarget('pipe_water_summer_tap')}
                        className="px-2 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Добавить летний водоразборный вывод"
                      >
                        <Plus className="w-3 h-3 text-cyan-700" />
                        <span>Летний вывод</span>
                      </button>
                      <button
                        onClick={() => openCreateForTarget('well')}
                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Добавить водопроводный колодец КВ"
                      >
                        <Plus className="w-3 h-3 text-emerald-700" />
                        <span>Колодец</span>
                      </button>
                      <button
                        onClick={() => openCreateForTarget('valve')}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Добавить задвижку ЗК"
                      >
                        <Plus className="w-3 h-3 text-amber-700" />
                        <span>Задвижка</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setCatalogInitialTab('water');
                        setIsCatalogModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs ml-auto transition-colors"
                      title="Открыть список объектов водопровода для редактирования и удаления"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Правка объектов ({wells.length + valves.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. ЭЛЕКТРОСНАБЖЕНИЕ: ТРАССА, КТПН, СЧЁТЧИКИ, ОСВЕЩЕНИЕ */}
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'electric' ? null : 'electric')}
                className={`w-full p-2.5 flex items-center justify-between text-left font-semibold transition-colors ${
                  expandedSection === 'electric' ? 'bg-amber-50 text-amber-950' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Электроснабжение (Трасса, КТПН, Счётчики, Фонари)</span>
                </span>
                {expandedSection === 'electric' ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'electric' && (
                <div className="p-3 bg-amber-50/50 space-y-2 border-t border-amber-100 animate-fadeIn text-[11px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.electricTraces}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, electricTraces: e.target.checked }))}
                        className="rounded text-amber-600 w-3.5 h-3.5"
                      />
                      <span>⚡ Трассы ВЛ-0.4кВ (провод СИП)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.electricKtpn}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, electricKtpn: e.target.checked }))}
                        className="rounded text-amber-700 w-3.5 h-3.5"
                      />
                      <span>🏢 Подстанции КТПН 10/0.4кВ</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.electricMetersAndVr}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, electricMetersAndVr: e.target.checked }))}
                        className="rounded text-indigo-600 w-3.5 h-3.5"
                      />
                      <span>🎛️ Счётчики и шкафы ВРУ / ШР</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.electricLighting}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, electricLighting: e.target.checked }))}
                        className="rounded text-yellow-600 w-3.5 h-3.5"
                      />
                      <span>💡 Осветительные приборы (ОП)</span>
                    </label>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-amber-200 text-[10px]">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        onClick={() => openCreateForTarget('pipe_electricity')}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Чертить линию электропередач ВЛ-0.4кВ"
                      >
                        <Plus className="w-3 h-3 text-amber-700" />
                        <span>Трасса ВЛ/СИП</span>
                      </button>
                      <button
                        onClick={() => openCreateForTarget('substation')}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Добавить подстанцию КТПН"
                      >
                        <Plus className="w-3 h-3 text-amber-700" />
                        <span>КТПН</span>
                      </button>
                      <button
                        onClick={() => openCreateForTarget('switchboard')}
                        className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Добавить шкаф ВРУ со счётчиком"
                      >
                        <Plus className="w-3 h-3 text-indigo-700" />
                        <span>ВРУ / Счётчик</span>
                      </button>
                      <button
                        onClick={() => openCreateForTarget('lightPole')}
                        className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Добавить фонарь / опору освещения"
                      >
                        <Plus className="w-3 h-3 text-yellow-700" />
                        <span>Фонарь</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setCatalogInitialTab('electricity');
                        setIsCatalogModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs ml-auto transition-colors"
                      title="Открыть реестр электроснабжения для редактирования и удаления"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Правка объектов ({substations.length + switchboards.length + lightPoles.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. ГАЗОСНАБЖЕНИЕ: ТРАССА, УСТАНОВКИ ГРПШ */}
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'gas' ? null : 'gas')}
                className={`w-full p-2.5 flex items-center justify-between text-left font-semibold transition-colors ${
                  expandedSection === 'gas' ? 'bg-yellow-50 text-yellow-950' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-yellow-600" />
                  <span>Газоснабжение (Трасса, Установки ГРПШ)</span>
                </span>
                {expandedSection === 'gas' ? <ChevronUp className="w-4 h-4 text-yellow-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'gas' && (
                <div className="p-3 bg-yellow-50/50 space-y-2 border-t border-yellow-100 animate-fadeIn text-[11px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.gasTraces}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, gasTraces: e.target.checked }))}
                        className="rounded text-yellow-600 w-3.5 h-3.5"
                      />
                      <span>🔥 Газовые магистрали (СД / НД)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.gasGrpsh}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, gasGrpsh: e.target.checked }))}
                        className="rounded text-yellow-700 w-3.5 h-3.5"
                      />
                      <span>🏭 Установка редуцирования ГРПШ</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.gasValves}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, gasValves: e.target.checked }))}
                        className="rounded text-amber-700 w-3.5 h-3.5"
                      />
                      <span>⚙️ Подземные газовые краны под ковер</span>
                    </label>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-yellow-200 text-[10px]">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        onClick={() => openCreateForTarget('pipe_gas')}
                        className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Чертить газопровод"
                      >
                        <Plus className="w-3 h-3 text-yellow-800" />
                        <span>Газопровод</span>
                      </button>
                      <button
                        onClick={() => openCreateForTarget('valve')}
                        className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Добавить газовый кран"
                      >
                        <Plus className="w-3 h-3 text-yellow-800" />
                        <span>Газовый кран</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setCatalogInitialTab('gas');
                        setIsCatalogModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs ml-auto transition-colors"
                      title="Открыть реестр газоснабжения для редактирования и удаления"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Правка объектов газа</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. СЛАБОТОЧНЫЕ СЕТИ */}
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'telecom' ? null : 'telecom')}
                className={`w-full p-2.5 flex items-center justify-between text-left font-semibold transition-colors ${
                  expandedSection === 'telecom' ? 'bg-blue-50 text-blue-950' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <span>Слаботочные сети (ВОЛС, CCTV, Wi-Fi)</span>
                </span>
                {expandedSection === 'telecom' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'telecom' && (
                <div className="p-3 bg-blue-50/50 space-y-2 border-t border-blue-100 animate-fadeIn text-[11px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.telecomFiber}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, telecomFiber: e.target.checked }))}
                        className="rounded text-blue-600 w-3.5 h-3.5"
                      />
                      <span>🌐 Оптоволокно (ВОЛС GPON)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.telecomCctv}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, telecomCctv: e.target.checked }))}
                        className="rounded text-purple-600 w-3.5 h-3.5"
                      />
                      <span>📹 Видеонаблюдение & СКУД</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.telecomWifi}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, telecomWifi: e.target.checked }))}
                        className="rounded text-sky-600 w-3.5 h-3.5"
                      />
                      <span>📶 Зоны покрытия точек Wi-Fi</span>
                    </label>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-blue-200 text-[10px]">
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        onClick={() => openCreateForTarget('pipe_telecom')}
                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Чертить оптоволокно ВОЛС или линию CCTV"
                      >
                        <Plus className="w-3 h-3 text-blue-700" />
                        <span>ВОЛС / CCTV</span>
                      </button>
                      <button
                        onClick={() => openCreateForTarget('wifiHotspot')}
                        className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="Добавить точку доступа Wi-Fi"
                      >
                        <Plus className="w-3 h-3 text-sky-700" />
                        <span>Точка Wi-Fi</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setCatalogInitialTab('telecom');
                        setIsCatalogModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs ml-auto transition-colors"
                      title="Открыть реестр слаботочных сетей для редактирования и удаления"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Правка сетей</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: УПРАВЛЯЕМЫЙ СЛОЙ С КАДАСТРОВЫМИ НОМЕРАМИ И ПЛАНАМИ ГРАНИЦ УЧАСТКОВ */}
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'cadastre' ? null : 'cadastre')}
                className={`w-full p-2.5 flex items-center justify-between text-left font-semibold transition-colors ${
                  expandedSection === 'cadastre' ? 'bg-rose-50 text-rose-950' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Кадастровые номера и границы участков (НСПД)</span>
                </span>
                {expandedSection === 'cadastre' ? <ChevronUp className="w-4 h-4 text-rose-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'cadastre' && (
                <div className="p-3 bg-rose-50/50 space-y-2 border-t border-rose-100 animate-fadeIn text-[11px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.cadastrePolygons}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, cadastrePolygons: e.target.checked }))}
                        className="rounded text-rose-600 w-3.5 h-3.5"
                      />
                      <span>📐 Планы границ участков ({plots.length})</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.cadastreLabels}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, cadastreLabels: e.target.checked }))}
                        className="rounded text-rose-700 w-3.5 h-3.5"
                      />
                      <span>🏷️ Номера участков и кадастр :ХХХ</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.cadastreQuarterBorder}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, cadastreQuarterBorder: e.target.checked }))}
                        className="rounded text-red-600 w-3.5 h-3.5"
                      />
                      <span>🔴 Граница массива 54:19:112001</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={networkSubLayers.focusMaskOutside}
                        onChange={(e) => setNetworkSubLayers((prev) => ({ ...prev, focusMaskOutside: e.target.checked }))}
                        className="rounded text-slate-900 w-3.5 h-3.5"
                      />
                      <span>🌑 Затемнение за пределами ДТСН</span>
                    </label>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-rose-200 text-[10px]">
                    <span className="font-mono text-rose-900 font-semibold">nspd.gov.ru / Росреестр ПКК</span>
                    <a
                      href="https://nspd.gov.ru/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-rose-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Портал НСПД</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE EDITING CONTROLS when isEditingMode is ON */}
        {isEditingMode && (
          <div className="p-3 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-rose-400 shadow-xl text-xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                Послойное редактирование
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Выберите слой и инструмент</span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1 font-medium">Слой для добавления:</label>
              <select
                value={activeEditTarget}
                onChange={(e) => {
                  const target = e.target.value as any;
                  setActiveEditTarget(target);
                  if (target.startsWith('pipe_')) {
                    setEditTool('draw_line');
                  } else {
                    setEditTool('add_point');
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs"
              >
                <optgroup label="Водоснабжение">
                  <option value="pipe_water_winter">💧 Зимний водопровод (глубокий)</option>
                  <option value="pipe_water_summer">🚿 Летний поливочный водопровод</option>
                  <option value="pipe_water_summer_tap">🚰 Летний водоразборный вывод (стояк)</option>
                  <option value="well">🚰 Водопроводный колодец (КВ)</option>
                  <option value="valve">⚙️ Задвижка / Запорная арматура (ЗК)</option>
                  <option value="fireHydrant">🚒 Пожарный гидрант (ПГ)</option>
                </optgroup>
                <optgroup label="Электроснабжение">
                  <option value="pipe_electricity">⚡ Кабель / ВЛ-0.4кВ электросети (СИП)</option>
                  <option value="substation">🏢 Подстанция КТПН 10/0.4кВ</option>
                  <option value="switchboard">🎛️ Электрощитовая ВРУ / ШР</option>
                </optgroup>
                <optgroup label="Газоснабжение">
                  <option value="pipe_gas">🔥 Газопроводная магистраль</option>
                </optgroup>
                <optgroup label="Слаботочные сети">
                  <option value="pipe_telecom">📡 Линия ВОЛС / CCTV / СКУД</option>
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setEditTool(activeEditTarget.startsWith('pipe_') ? 'draw_line' : 'add_point')}
                className={`p-2 rounded-xl border text-center font-bold transition-all ${
                  editTool === 'add_point' || editTool === 'draw_line'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {activeEditTarget.startsWith('pipe_') ? '📏 Кликайте по карте для трассы' : '📍 Кликните на карте для узла'}
              </button>

              <button
                type="button"
                onClick={() => setEditTool('select')}
                className={`p-2 rounded-xl border text-center font-bold transition-all ${
                  editTool === 'select'
                    ? 'bg-sky-50 border-sky-400 text-sky-800 ring-2 ring-sky-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                👆 Инспекция & Правка
              </button>
            </div>
          </div>
        )}

        {/* Search Plot */}
        <form onSubmit={handleSearchPlot} className="flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md">
          <Search className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
          <input
            type="text"
            value={searchPlotQuery}
            onChange={(e) => setSearchPlotQuery(e.target.value)}
            placeholder="Номер участка (напр. 24)"
            className="w-44 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none px-1 font-medium"
          />
          <button
            type="submit"
            className="px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            Найти
          </button>
        </form>
      </div>

      {/* FLOATING TOP-CENTER BAR WHEN DRAWING PIPELINE */}
      {drawnLinePoints.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-2 px-4 bg-slate-900/95 backdrop-blur-md rounded-2xl text-white shadow-2xl border border-rose-500 text-xs">
          <span className="font-bold flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Прокладка трассы: {drawnLinePoints.length} точек
          </span>

          <button
            onClick={handleFinishDrawingLine}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1 transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Оформить трассу</span>
          </button>

          <button
            onClick={() => setDrawnLinePoints((prev) => prev.slice(0, -1))}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Отменить последнюю точку"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDrawnLinePoints([])}
            className="px-2.5 py-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 rounded-xl transition-colors"
          >
            Отмена
          </button>
        </div>
      )}

      {/* TOP RIGHT: COMPASS, ROTATION & RESOURCE LEGEND */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        <div className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md text-xs space-y-2 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRotate(-15)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Повернуть против часовой стрелки (-15°)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Compass Rose */}
            <div
              onClick={() => handleSetExactAngle(0)}
              className="cursor-pointer relative w-10 h-10 rounded-full border border-slate-300 bg-slate-50 flex items-center justify-center shadow-inner hover:scale-105 transition-transform"
              title="Нажмите, чтобы сбросить на Север (0°)"
            >
              <div
                className="w-1 h-7 rounded-full flex flex-col items-center justify-between"
                style={{ transform: `rotate(${-rotationAngle}deg)`, transition: 'transform 0.3s ease-out' }}
              >
                <div className="w-2 h-3 bg-rose-600 rounded-t-full shadow-sm"></div>
                <div className="w-2 h-3 bg-slate-600 rounded-b-full"></div>
              </div>
              <span className="absolute -top-1 text-[8px] font-bold text-rose-600 font-mono">N</span>
            </div>

            <button
              onClick={() => handleRotate(15)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Повернуть по часовой стрелке (+15°)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[10px] font-mono text-slate-500 font-semibold">
            Угол: {rotationAngle}°
          </div>

          {/* Quick Bearing Presets */}
          <div className="flex items-center gap-1 text-[10px]">
            <button
              onClick={() => handleSetExactAngle(0)}
              className={`px-1.5 py-0.5 rounded ${rotationAngle === 0 ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              0° N
            </button>
            <button
              onClick={() => handleSetExactAngle(38)}
              className={`px-1.5 py-0.5 rounded ${rotationAngle === 38 ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Вдоль ул. Центральная"
            >
              38°
            </button>
            <button
              onClick={() => handleSetExactAngle(90)}
              className={`px-1.5 py-0.5 rounded ${rotationAngle === 90 ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              90° E
            </button>
          </div>

          <div className="pt-1.5 border-t border-slate-100 flex gap-1 text-[10px]">
            <button
              onClick={() => setTileProvider('osm')}
              className={`px-1.5 py-0.5 rounded ${tileProvider === 'osm' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              OSM
            </button>
            <button
              onClick={() => setTileProvider('satellite')}
              className={`px-1.5 py-0.5 rounded ${tileProvider === 'satellite' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Спутник
            </button>
          </div>
        </div>
      </div>

      {/* NETWORK LAYER INSPECTOR DRAWER */}
      <NetworkLayerInspector
        selectedItem={selectedNetworkItem}
        isObjectsLocked={isObjectsLocked}
        isItemIndividuallyLocked={selectedNetworkItem?.data?.id ? !!lockedObjectIds[selectedNetworkItem.data.id] : false}
        onToggleLock={() => setIsObjectsLocked((prev) => !prev)}
        onToggleItemLock={(id) => handleToggleObjectLock(id)}
        onClose={() => setSelectedNetworkItem(null)}
        onEdit={(type, data) => openEditForItem(type, data)}
        onDelete={(type, id) => handleDeleteItem(type, id)}
        onToggleValve={onToggleValve}
        onStartWinterConnection={(well) => {
          const fakePlot = plots.find((p) => !p.utilities.winterWater.connected) || plots[0];
          onStartWinterConnection(fakePlot);
        }}
      />

      {/* BOTTOM POPUP CARD FOR SELECTED PLOT */}
      {activePlot && !selectedNetworkItem && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-10 p-4 bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl space-y-3">
          <div className="flex items-start justify-between border-b border-slate-100 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-xs">
                  Участок № {activePlot.number}
                </span>
                <span className="text-xs font-semibold text-slate-700">{activePlot.street}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Собственник: <span className="text-slate-900 font-semibold">{activePlot.ownerName}</span>
              </p>
            </div>
            <button
              onClick={() => setActivePlot(null)}
              className="text-slate-400 hover:text-slate-700 p-1 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Position Lock / Push & Pull Card for Plot */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {lockedObjectIds[activePlot.id] ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-rose-800">Участок зафиксирован персонально</span>
                  </>
                ) : isObjectsLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-700">Закреплен (общий режим карты)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span className="text-emerald-800">Push & Pull активен: можно двигать</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => handleToggleObjectLock(activePlot.id, e)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 shadow-xs ${
                  lockedObjectIds[activePlot.id]
                    ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {lockedObjectIds[activePlot.id] ? (
                  <>
                    <Unlock className="w-3 h-3 text-rose-600" />
                    <span>Открепить</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-slate-600" />
                    <span>Закрепить</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {lockedObjectIds[activePlot.id]
                ? 'Защита от случайного сдвига активна. Участок и его углы зафиксированы.'
                : !isObjectsLocked
                ? 'Тяните номер участка для смещения целиком, или тяните синие маркеры на углах для изменения контура.'
                : 'Для перемещения включите режим Push & Pull на верхней панели.'}
            </p>
          </div>

          {/* Official NSPD Cadastral Info Card */}
          <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-rose-950 font-bold text-[11px]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                ЕГРН / НСПД (nspd.gov.ru)
              </span>
              <button
                onClick={() => copyCadastralToClipboard(activePlot.cadastralNumber)}
                className="flex items-center gap-1 text-[10px] text-rose-700 hover:text-rose-900 font-mono underline"
                title="Скопировать кадастровый номер"
              >
                <Copy className="w-3 h-3" />
                <span>{copyFeedback === activePlot.cadastralNumber ? 'Скопировано!' : 'Копировать'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-slate-800">
              <span className="font-bold">{activePlot.cadastralNumber}</span>
              <span className="text-slate-500">{activePlot.areaSqm} м²</span>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[10px]">
              <a
                href={`https://nspd.gov.ru/`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1 px-2 rounded-lg bg-white border border-rose-200 text-rose-800 font-semibold hover:bg-rose-100 flex items-center justify-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Открыть на nspd.gov.ru</span>
              </a>
              <a
                href={`https://pkk.rosreestr.ru/#/search/${encodeURIComponent(activePlot.cadastralNumber)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1 px-2 rounded-lg bg-white border border-rose-200 text-rose-800 font-semibold hover:bg-rose-100 flex items-center justify-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Росреестр ПКК</span>
              </a>
            </div>
          </div>

          {/* Status badge strip */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Зимний водопровод</span>
              <span
                className={`font-semibold ${
                  activePlot.utilities.winterWater.connected
                    ? 'text-emerald-700'
                    : activePlot.utilities.winterWater.status === 'applied'
                    ? 'text-amber-700'
                    : activePlot.utilities.winterWater.status === 'tu_issued'
                    ? 'text-sky-700'
                    : 'text-rose-700'
                }`}
              >
                {activePlot.utilities.winterWater.connected
                  ? '🟢 Подключен'
                  : activePlot.utilities.winterWater.status === 'applied'
                  ? '🟡 Заявка на рассмотрении'
                  : activePlot.utilities.winterWater.status === 'tu_issued'
                  ? '🔵 ТУ выданы'
                  : '🔴 Не подключен'}
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Электроснабжение</span>
              <span className="font-semibold text-slate-800">
                {activePlot.utilities.electricity.phases} ф., {activePlot.utilities.electricity.allocatedPowerKw} кВт
              </span>
            </div>
          </div>

          {!activePlot.utilities.winterWater.connected ? (
            <button
              onClick={() => onStartWinterConnection(activePlot)}
              className="w-full py-2 px-3 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Droplet className="w-4 h-4 text-sky-200" />
              <span>Оформить ТУ на подключение (Мастер Правления)</span>
            </button>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <div>
                <span className="block font-semibold">Абонент зимнего водопровода</span>
                <span className="text-[11px] text-emerald-700">
                  Счетчик: {activePlot.utilities.winterWater.meterSerial} (Пломба {activePlot.utilities.winterWater.sealNumber})
                </span>
              </div>
              <span className="font-mono font-bold text-xs">{activePlot.utilities.winterWater.meterLastReading} м³</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Popup Card for Selected Well */}
      {activeWell && !activePlot && !selectedNetworkItem && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-10 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200 shadow-xl space-y-2.5">
          <div className="flex items-start justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{activeWell.name}</span>
              </h3>
              <p className="text-xs text-emerald-700 font-mono font-semibold">{activeWell.code}</p>
            </div>
            <button
              onClick={() => setActiveWell(null)}
              className="text-slate-400 hover:text-slate-700 p-1 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Position Lock / Push & Pull Card for Well */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {lockedObjectIds[activeWell.id] ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-rose-800">Колодец зафиксирован</span>
                  </>
                ) : isObjectsLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-700">Закреплен (общий режим карты)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span className="text-emerald-800">Push & Pull активен: можно двигать</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => handleToggleObjectLock(activeWell.id, e)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 shadow-xs ${
                  lockedObjectIds[activeWell.id]
                    ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {lockedObjectIds[activeWell.id] ? (
                  <>
                    <Unlock className="w-3 h-3 text-rose-600" />
                    <span>Открепить</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-slate-600" />
                    <span>Закрепить</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {lockedObjectIds[activeWell.id]
                ? 'Защита от случайного сдвига активна.'
                : !isObjectsLocked
                ? 'Зажмите маркер колодца на карте мышкой или тачем и переместите в нужное место.'
                : 'Для перемещения включите режим Push & Pull на верхней панели карты.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Свободные врезки</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">
                {activeWell.freePorts} из {activeWell.totalPorts} шт.
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Рабочее давление</span>
              <span className="text-sm font-bold text-sky-700 font-mono">
                {activeWell.nominalPressureAtm} атм
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 italic">{activeWell.notes}</p>
        </div>
      )}

      {/* FULL LAYER CATALOG MODAL */}
      <LayerCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        initialTab={catalogInitialTab}
        pipelines={pipelines}
        wells={wells}
        valves={valves}
        switchboards={switchboards}
        substations={substations}
        fireHydrants={fireHydrants}
        barrierGates={barrierGates}
        adminFacilities={adminFacilities}
        onSelectItem={(type, item) => handleCenterOnObject(type, item)}
        onAddNew={(type) => {
          setIsCatalogModalOpen(false);
          openCreateForTarget('well');
        }}
        onEditItem={(type, item) => {
          setIsCatalogModalOpen(false);
          openEditForItem(type, item);
        }}
        onDeleteItem={(type, id) => handleDeleteItem(type, id)}
      />

      {/* NETWORK LAYER EDITOR MODAL */}
      <NetworkLayerEditorModal
        key={isEditorModalOpen ? `${editorMode}-${editorObjectType}-${editorInitialData?.id || 'new'}` : 'closed'}
        isOpen={isEditorModalOpen}
        mode={editorMode}
        objectType={editorObjectType}
        initialData={editorInitialData}
        defaultCoordinates={editorDefaultCoords}
        defaultPath={editorDefaultPath}
        onSave={handleModalSave}
        onDelete={(type, id) => {
          handleDeleteItem(type, id);
          setIsEditorModalOpen(false);
        }}
        onClose={() => {
          setIsEditorModalOpen(false);
          setDrawnLinePoints([]);
          setEditTool('select');
        }}
      />
    </div>
  );
};
