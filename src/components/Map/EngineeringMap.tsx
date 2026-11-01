import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from '../../lib/leaflet-with-rotate';
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
  AssetPhoto,
  CctvCamera,
  WaterMeteringNode,
} from '../../types';
import {
  calculateDistanceMeters,
  findNearestWellWithFreePorts,
  generateRoutePoints,
  calculatePolygonAreaSqm,
  calculatePolygonPerimeterMeters,
  calculatePolygonCentroid,
  findClosestEdgeIndex,
  cleanPolygonRing,
} from '../../utils/geoUtils';
import { DTSN_PENSIONER_BOUNDARY, INITIAL_PLOTS } from '../../data/mockData';
import { NetworkLayerInspector } from './NetworkLayerInspector';
import { NetworkLayerEditorModal, EditableObjectType } from './NetworkLayerEditorModal';
import { LayerCatalogModal } from './LayerCatalogModal';
import { PlotEditorModal } from '../Plots/PlotsDirectory';
import {
  Layers,
  Droplet,
  Zap,
  Flame,
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
  Move,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Camera,
  Menu,
  X,
} from 'lucide-react';

interface EngineeringMapProps {
  cctvCameras?: CctvCamera[];
  onAddCctvCamera?: (cam: CctvCamera) => void;
  onUpdateCctvCamera?: (cam: CctvCamera) => void;
  onDeleteCctvCamera?: (id: string) => void;
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
  highlightedRoute: { plotCoords: Coordinates; wellCoords: Coordinates; wellCode: string } | null;
  canEditNetworks?: boolean;
  onSelectPlot: (plot: Plot) => void;
  onSelectWell: (well: Well) => void;
  onStartWinterConnection: (plot: Plot) => void;
  onSeasonChange: (newSeason: SeasonMode) => void;
  onAddPipeline?: (pipeline: PipelineSegment) => void;
  onUpdatePipeline?: (pipeline: PipelineSegment) => void;
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
  onToggleValve?: (valveId: string) => void;
  boundaryPoints?: Coordinates[];
  onSaveBoundaryPoints?: (points: Coordinates[]) => void;
  onUpdatePlot?: (plot: Plot) => void;
  onUpdateCoordinates?: (type: string, id: string, coordinates: Coordinates) => void;
  onAddLightPole?: (lp: LightPole) => void;
  onUpdateLightPole?: (lp: LightPole) => void;
  onDeleteLightPole?: (id: string) => void;
  onAddWifiHotspot?: (wh: WifiHotspot) => void;
  onUpdateWifiHotspot?: (wh: WifiHotspot) => void;
  onDeleteWifiHotspot?: (id: string) => void;
  onUpdatePhotos?: (type: string, id: string, photos: AssetPhoto[]) => void;
  onAddWasteSite?: (ws: WasteCollectionSite) => void;
  onUpdateWasteSite?: (ws: WasteCollectionSite) => void;
  onDeleteWasteSite?: (id: string) => void;
  onAddSnowDump?: (sd: SnowDump) => void;
  onUpdateSnowDump?: (sd: SnowDump) => void;
  onDeleteSnowDump?: (id: string) => void;
  onAddFireTurnaround?: (ft: FireTurnaround) => void;
  onUpdateFireTurnaround?: (ft: FireTurnaround) => void;
  onDeleteFireTurnaround?: (id: string) => void;
  onAddInspectionPoint?: (ip: InspectionCheckPoint) => void;
  onUpdateInspectionPoint?: (ip: InspectionCheckPoint) => void;
  onDeleteInspectionPoint?: (id: string) => void;
  onUpdateGasRegulator?: (gr: GasRegulatorStation) => void;
  onAddBarrierGate?: (bg: BarrierGate) => void;
  onUpdateBarrierGate?: (bg: BarrierGate) => void;
  onDeleteBarrierGate?: (id: string) => void;
  onAddAdminFacility?: (af: AdministrationFacility) => void;
  onUpdateAdminFacility?: (af: AdministrationFacility) => void;
  onDeleteAdminFacility?: (id: string) => void;
  waterMeteringNodes?: WaterMeteringNode[];
  onAddWaterMeteringNode?: (node: WaterMeteringNode) => void;
  onUpdateWaterMeteringNode?: (node: WaterMeteringNode) => void;
  onDeleteWaterMeteringNode?: (id: string) => void;
  onAddPlot?: (plot: Plot) => void;
  onDeletePlot?: (id: string) => void;
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
  boundaryPoints = DTSN_PENSIONER_BOUNDARY,
  onSaveBoundaryPoints,
  onUpdatePlot,
  onUpdateCoordinates,
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
  onToggleValve,
  onUpdatePhotos,
  onAddLightPole,
  onUpdateLightPole,
  onDeleteLightPole,
  onAddWifiHotspot,
  onUpdateWifiHotspot,
  onDeleteWifiHotspot,
  onAddWasteSite,
  onUpdateWasteSite,
  onDeleteWasteSite,
  onAddSnowDump,
  onUpdateSnowDump,
  onDeleteSnowDump,
  onAddFireTurnaround,
  onUpdateFireTurnaround,
  onDeleteFireTurnaround,
  onAddInspectionPoint,
  onUpdateInspectionPoint,
  onDeleteInspectionPoint,
  onUpdateGasRegulator,
  onAddBarrierGate,
  onUpdateBarrierGate,
  onDeleteBarrierGate,
  onAddAdminFacility,
  onUpdateAdminFacility,
  onDeleteAdminFacility,
  cctvCameras = [],
  onAddCctvCamera,
  onUpdateCctvCamera,
  onDeleteCctvCamera,
  waterMeteringNodes = [],
  onAddWaterMeteringNode,
  onUpdateWaterMeteringNode,
  onDeleteWaterMeteringNode,
  onAddPlot,
  onDeletePlot,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const drawLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonEditLayerRef = useRef<L.LayerGroup | null>(null);
  const pipelineEditLayerRef = useRef<L.LayerGroup | null>(null);

  const [activePlot, setActivePlot] = useState<Plot | null>(null);
  const [activeWell, setActiveWell] = useState<Well | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<{ message: string; code: string } | null>(null);

  // Plot Creation & Data Editing State
  const [isAddingPlotOnMap, setIsAddingPlotOnMap] = useState<boolean>(false);
  const [editingPlotData, setEditingPlotData] = useState<Plot | null>(null);

  // Inspector & Editor Modals State
  const [selectedNetworkItem, setSelectedNetworkItem] = useState<{
    type: any;
    data: any;
  } | null>(null);

  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorObjectType, setEditorObjectType] = useState<EditableObjectType>('well');
  const [editorInitialData, setEditorInitialData] = useState<any>(null);
  const [editorDefaultCoords, setEditorDefaultCoords] = useState<Coordinates | undefined>(undefined);
  const [editorDefaultPath, setEditorDefaultPath] = useState<Coordinates[] | undefined>(undefined);

  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // SIDE MENU & ACCIDENTAL DRAG PROTECTION (LOCK/UNLOCK)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [isMapLocked, setIsMapLocked] = useState<boolean>(() => {
    return localStorage.getItem('dtsn_map_locked') !== 'false';
  });
  const [pipelineSnapNotice, setPipelineSnapNotice] = useState<string | null>(null);
  const [alignPlotsSuccess, setAlignPlotsSuccess] = useState<string | null>(null);

  const toggleMapLock = () => {
    setIsMapLocked((prev) => {
      const next = !prev;
      localStorage.setItem('dtsn_map_locked', String(next));
      return next;
    });
  };

  // Layer Editing Mode State
  const [isEditingMode, setIsEditingMode] = useState<boolean>(false);
  const [activeEditTarget, setActiveEditTarget] = useState<
    | 'well'
    | 'valve'
    | 'switchboard'
    | 'substation'
    | 'fireHydrant'
    | 'pipe_water_winter'
    | 'pipe_water_summer'
    | 'pipe_electricity'
    | 'pipe_gas'
    | 'pipe_stormwater'
  >('well');
  const [editTool, setEditTool] = useState<'select' | 'add_point' | 'draw_line'>('select');
  const [drawnLinePoints, setDrawnLinePoints] = useState<Coordinates[]>([]);

  // RESOURCE AVAILABILITY TOGGLE & CONTROLS
  const [resourceAvailabilityMode, setResourceAvailabilityMode] = useState<boolean>(false);
  const [resourceUtilityType, setResourceUtilityType] = useState<'winter_water' | 'electricity' | 'gas'>('winter_water');
  const [resourceFilter, setResourceFilter] = useState<'all' | 'connected' | 'applied' | 'tu_issued' | 'none'>('all');

  // NSPD CADASTRE & BOUNDARY FOCUS TOGGLES
  const [focusBoundaryMask, setFocusBoundaryMask] = useState<boolean>(true); // Masks out anything outside DTSN Pensioner
  const [showCadastralLabels, setShowCadastralLabels] = useState<boolean>(true); // Permanent cadastral & plot badges
  const [showNspdOverlay, setShowNspdOverlay] = useState<boolean>(true); // Red boundary line & quarter label
  const [isLayersCollapsed, setIsLayersCollapsed] = useState<boolean>(false); // Collapsible engineering layers panel
  const [isCompassCollapsed, setIsCompassCollapsed] = useState<boolean>(true); // Collapsible map rotation/compass panel

  // Snapping targets for pipelines (wells, valves, substations, switchboards, light poles, hydrants, GRP)
  const snapTargets = useMemo(() => {
    const list: { name: string; type: string; coords: Coordinates }[] = [];
    (wells || []).forEach((w) => {
      if (w?.coordinates && typeof w.coordinates.lat === 'number') {
        list.push({ name: w.code || 'Колодец', type: 'Колодец', coords: w.coordinates });
      }
    });
    (valves || []).forEach((v) => {
      if (v?.coordinates && typeof v.coordinates.lat === 'number') {
        list.push({ name: v.code || 'Задвижка', type: 'Задвижка', coords: v.coordinates });
      }
    });
    (substations || []).forEach((s) => {
      if (s?.coordinates && typeof s.coordinates.lat === 'number') {
        list.push({ name: s.code || 'КТПН', type: 'КТПН', coords: s.coordinates });
      }
    });
    (switchboards || []).forEach((sb) => {
      if (sb?.coordinates && typeof sb.coordinates.lat === 'number') {
        list.push({ name: sb.code || 'ВРУ', type: 'ВРУ', coords: sb.coordinates });
      }
    });
    (lightPoles || []).forEach((lp) => {
      if (lp?.coordinates && typeof lp.coordinates.lat === 'number') {
        list.push({ name: lp.code || 'Опора ЛЭП', type: 'Опора ЛЭП', coords: lp.coordinates });
      }
    });
    (fireHydrants || []).forEach((fh) => {
      if (fh?.coordinates && typeof fh.coordinates.lat === 'number') {
        list.push({ name: fh.code || 'ПГ', type: 'Пожарный гидрант', coords: fh.coordinates });
      }
    });
    if (gasRegulator && gasRegulator.coordinates && typeof gasRegulator.coordinates.lat === 'number') {
      list.push({ name: gasRegulator.code || 'ГРПШ', type: 'ГРПШ', coords: gasRegulator.coordinates });
    }
    (waterMeteringNodes || []).forEach((n) => {
      if (n?.coordinates && typeof n.coordinates.lat === 'number') {
        list.push({ name: n.code || 'УУВ', type: 'Узел учёта воды', coords: n.coordinates });
      }
    });
    return list;
  }, [wells, valves, substations, switchboards, lightPoles, fireHydrants, gasRegulator, waterMeteringNodes]);

  // Align / Bind all plots inside the DTSN Cadastral Boundary (item 1)
  const handleAlignPlotsToCadastre = () => {
    const alignedPlots = INITIAL_PLOTS.map((canonical) => {
      const existing = plots.find((p) => p.number === canonical.number);
      if (existing) {
        return {
          ...existing,
          coordinates: canonical.coordinates,
          polygon: canonical.polygon,
        };
      }
      return canonical;
    });

    alignedPlots.forEach((ap) => {
      if (onUpdatePlot) onUpdatePlot(ap);
    });
    localStorage.setItem('dtsn_plots', JSON.stringify(alignedPlots));

    setAlignPlotsSuccess('Все 24 участка успешно привязаны к фактическим кадастровым границам ДТСН!');
    setTimeout(() => setAlignPlotsSuccess(null), 4000);
  };

  // Clean boundary points ring ensuring no duplicate closing vertex
  const currentBoundary = useMemo(() => {
    const raw = boundaryPoints && boundaryPoints.length > 2 ? boundaryPoints : DTSN_PENSIONER_BOUNDARY;
    return cleanPolygonRing(raw);
  }, [boundaryPoints]);

  // FIELD / AREA BOUNDARY PUSH & PULL GEOMETRY EDITOR STATE
  const [editingPolygonTarget, setEditingPolygonTarget] = useState<
    | { type: 'plot'; id: string; number: number; plot: Plot }
    | { type: 'boundary'; label: string }
    | null
  >(null);
  const [workingPolygonPoints, setWorkingPolygonPoints] = useState<Coordinates[]>([]);
  const [originalPolygonPoints, setOriginalPolygonPoints] = useState<Coordinates[]>([]);
  const [isAddVertexClickMode, setIsAddVertexClickMode] = useState<boolean>(false);
  const [geometryHistory, setGeometryHistory] = useState<Coordinates[][]>([]);
  const [isSaveSuccess, setIsSaveSuccess] = useState<boolean>(false);

  // Refs for map events to avoid stale closures
  const isEditingModeRef = useRef(isEditingMode);
  isEditingModeRef.current = isEditingMode;
  const editToolRef = useRef(editTool);
  editToolRef.current = editTool;
  const activeEditTargetRef = useRef(activeEditTarget);
  activeEditTargetRef.current = activeEditTarget;
  const isAddVertexClickModeRef = useRef(isAddVertexClickMode);
  isAddVertexClickModeRef.current = isAddVertexClickMode;
  const editingPolygonTargetRef = useRef(editingPolygonTarget);
  editingPolygonTargetRef.current = editingPolygonTarget;
  const workingPolygonPointsRef = useRef(workingPolygonPoints);
  workingPolygonPointsRef.current = workingPolygonPoints;

  // Rotation State (in degrees)
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isRotatingWithMouse, setIsRotatingWithMouse] = useState<boolean>(false);
  const mouseRotateStateRef = useRef<{
    isRotating: boolean;
    startX: number;
    startY: number;
    startBearing: number;
  }>({
    isRotating: false,
    startX: 0,
    startY: 0,
    startBearing: 0,
  });

  // Layer Visibility Filters
  const [visibleLayers, setVisibleLayers] = useState({
    water: true,
    electric: true,
    gas: true,
    plots: true,
    seasonal: true,
    patrolRoute: false,
    drainage: true,
    wifi: true,
    barriers: true,
    facilities: true,
  });

  const [tileProvider, setTileProvider] = useState<'osm' | 'topo' | 'satellite'>('osm');

  // Synchronize programmatic rotationAngle with Leaflet Map instance
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof (map as any).setBearing !== 'function') return;
    const currentBearing = (map as any).getBearing ? (map as any).getBearing() : 0;
    const diff = Math.abs(currentBearing - rotationAngle);
    if (diff > 0.5 && diff < 359.5) {
      (map as any).setBearing(rotationAngle, { animate: true, duration: 0.25 });
    }
  }, [rotationAngle]);

  // Trackpad and wheel rotation support (Shift + Wheel / Trackpad two-finger swipe or gestures)
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Rotate on Shift + wheel or Alt + wheel
      if (e.shiftKey || e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        const map = mapInstanceRef.current;
        if (!map || typeof (map as any).setBearing !== 'function') return;

        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const step = (delta > 0 ? 1 : -1) * 3;
        const currentBearing = (map as any).getBearing ? (map as any).getBearing() : rotationAngle;
        const nextBearing = ((currentBearing + step) % 360 + 360) % 360;
        (map as any).setBearing(nextBearing);
        setRotationAngle(Math.round(nextBearing));
      }
    };

    // Safari & macOS trackpad two-finger twist gesture
    let gestureStartAngle = 0;
    const handleGestureStart = (e: any) => {
      e.preventDefault();
      const map = mapInstanceRef.current;
      gestureStartAngle = map && (map as any).getBearing ? (map as any).getBearing() : rotationAngle;
    };

    const handleGestureChange = (e: any) => {
      e.preventDefault();
      const map = mapInstanceRef.current;
      if (!map || typeof (map as any).setBearing !== 'function') return;
      const nextBearing = ((gestureStartAngle - e.rotation) % 360 + 360) % 360;
      (map as any).setBearing(nextBearing);
      setRotationAngle(Math.round(nextBearing));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('gesturestart', handleGestureStart as any);
    container.addEventListener('gesturechange', handleGestureChange as any);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('gesturestart', handleGestureStart as any);
      container.removeEventListener('gesturechange', handleGestureChange as any);
    };
  }, [rotationAngle]);

  // Mouse drag rotation handler (Right-Click Drag or Shift/Alt + Left-Click Drag)
  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const isRightButton = e.button === 2;
    const isModifierLeft = e.button === 0 && (e.shiftKey || e.altKey) && editTool !== 'draw_line' && editTool !== 'add_point';

    if (isRightButton || isModifierLeft) {
      e.preventDefault();
      e.stopPropagation();

      const map = mapInstanceRef.current;
      const currentBearing = map && typeof (map as any).getBearing === 'function' ? (map as any).getBearing() : rotationAngle;

      mouseRotateStateRef.current = {
        isRotating: true,
        startX: e.clientX,
        startY: e.clientY,
        startBearing: currentBearing,
      };
      setIsRotatingWithMouse(true);

      // Disable standard Leaflet pan dragging while rotating
      if (map) {
        map.dragging.disable();
      }

      const onMouseMove = (moveEvt: MouseEvent) => {
        if (!mouseRotateStateRef.current.isRotating) return;
        moveEvt.preventDefault();

        const deltaX = moveEvt.clientX - mouseRotateStateRef.current.startX;
        const newBearing = ((mouseRotateStateRef.current.startBearing + deltaX * 0.45) % 360 + 360) % 360;

        const currentMap = mapInstanceRef.current;
        if (currentMap && typeof (currentMap as any).setBearing === 'function') {
          (currentMap as any).setBearing(newBearing);
        }
        setRotationAngle(Math.round(newBearing));
      };

      const onMouseUp = () => {
        mouseRotateStateRef.current.isRotating = false;
        setIsRotatingWithMouse(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        const currentMap = mapInstanceRef.current;
        if (currentMap) {
          currentMap.dragging.enable();
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  // Compass Rose interactive dial drag
  const handleCompassMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget.getBoundingClientRect();
    const centerX = target.left + target.width / 2;
    const centerY = target.top + target.height / 2;

    const updateFromMouse = (clientX: number, clientY: number) => {
      const rad = Math.atan2(clientY - centerY, clientX - centerX);
      let deg = rad * (180 / Math.PI) + 90;
      deg = ((deg % 360) + 360) % 360;
      handleSetExactAngle(Math.round(deg));
    };

    updateFromMouse(e.clientX, e.clientY);

    const onMouseMove = (moveEvt: MouseEvent) => {
      moveEvt.preventDefault();
      updateFromMouse(moveEvt.clientX, moveEvt.clientY);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

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
      const netType =
        target === 'pipe_water_winter'
          ? 'water_winter'
          : target === 'pipe_water_summer'
          ? 'water_summer'
          : target === 'pipe_electricity'
          ? 'electricity'
          : target === 'pipe_gas'
          ? 'gas'
          : 'stormwater';

      initData = {
        networkType: netType,
        subType: target === 'pipe_water_winter' ? 'winter' : target === 'pipe_water_summer' ? 'summer' : undefined,
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

  // Open Multi-Step Element Creation Wizard (Сеть -> Элемент сети -> Наполнение -> Фото)
  const openCreateWizard = (coords?: Coordinates) => {
    setEditorMode('create');
    setEditorObjectType('well');
    setEditorInitialData(null);
    let centerCoords = coords;
    if (!centerCoords && mapInstanceRef.current) {
      const c = mapInstanceRef.current.getCenter();
      centerCoords = {
        lat: Number(c.lat.toFixed(6)),
        lng: Number(c.lng.toFixed(6)),
      };
    }
    setEditorDefaultCoords(centerCoords || { lat: 55.098612, lng: 82.900919 });
    setEditorDefaultPath(undefined);
    setIsEditorModalOpen(true);
  };

  // One-click Copy/Clone functionality preserving equipment filling
  const handleCopyItem = (type: string, item: any) => {
    if (!item) return;
    const newId = `${type}-${Date.now()}`;
    const baseCode = item.code || item.name || 'Элемент';
    const newCode = `${baseCode}-КОПИЯ`;
    const newName = item.name ? `${item.name} (Копия)` : `Копия ${baseCode}`;

    let clonedCoordinates: Coordinates | undefined = undefined;
    if (item.coordinates) {
      clonedCoordinates = {
        lat: Number((item.coordinates.lat + 0.00015).toFixed(6)),
        lng: Number((item.coordinates.lng + 0.00015).toFixed(6)),
      };
    }

    let clonedPath: Coordinates[] | undefined = undefined;
    if (item.path && Array.isArray(item.path)) {
      clonedPath = item.path.map((pt: Coordinates) => ({
        lat: Number((pt.lat + 0.00015).toFixed(6)),
        lng: Number((pt.lng + 0.00015).toFixed(6)),
      }));
    }

    const clonedData = {
      ...item,
      id: newId,
      code: newCode,
      name: newName,
      ...(clonedCoordinates ? { coordinates: clonedCoordinates } : {}),
      ...(clonedPath ? { path: clonedPath } : {}),
    };

    if (type === 'pipeline' && onAddPipeline) onAddPipeline(clonedData);
    else if (type === 'well' && onAddWell) onAddWell(clonedData);
    else if (type === 'valve' && onAddValve) onAddValve(clonedData);
    else if (type === 'switchboard' && onAddSwitchboard) onAddSwitchboard(clonedData);
    else if (type === 'substation' && onAddSubstation) onAddSubstation(clonedData);
    else if (type === 'fireHydrant' && onAddFireHydrant) onAddFireHydrant(clonedData);
    else if (type === 'lightPole' && onAddLightPole) onAddLightPole(clonedData);
    else if (type === 'wifiHotspot' && onAddWifiHotspot) onAddWifiHotspot(clonedData);
    else if (type === 'barrierGate' && onAddBarrierGate) onAddBarrierGate(clonedData);
    else if (type === 'adminFacility' && onAddAdminFacility) onAddAdminFacility(clonedData);
    else if (type === 'wasteSite' && onAddWasteSite) onAddWasteSite(clonedData);
    else if (type === 'snowDump' && onAddSnowDump) onAddSnowDump(clonedData);
    else if (type === 'fireTurnaround' && onAddFireTurnaround) onAddFireTurnaround(clonedData);
    else if (type === 'inspectionPoint' && onAddInspectionPoint) onAddInspectionPoint(clonedData);
    else if (type === 'waterMeteringNode' && onAddWaterMeteringNode) onAddWaterMeteringNode(clonedData);

    setSelectedNetworkItem({ type: type as any, data: clonedData });
    if (clonedCoordinates && mapInstanceRef.current) {
      mapInstanceRef.current.setView([clonedCoordinates.lat, clonedCoordinates.lng], 18, { animate: true });
    }

    setCopyToast({
      message: `Элемент скопирован со всем наполнением оборудования! Перетащите его мышью в нужную точку.`,
      code: newCode,
    });
    setTimeout(() => setCopyToast(null), 5000);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [55.098612, 82.900919];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 16,
      minZoom: 14,
      maxZoom: 19,
      zoomControl: false,
      rotate: true,
      bearing: rotationAngle,
      touchRotate: true,
      shiftKeyRotate: true,
      rotateControl: false,
    });

    // Synchronize rotationAngle when user rotates via trackpad gestures or controls
    map.on('rotate', () => {
      const b = (map as any).getBearing ? (map as any).getBearing() : 0;
      const normalized = Math.round(((b % 360) + 360) % 360);
      setRotationAngle(normalized);
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Clean Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | НСПД nspd.gov.ru | ДТСН Пенсионер GIS',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Create Layer Groups
    layerGroupsRef.current = {
      boundaryMask: L.layerGroup().addTo(map),
      boundaryLines: L.layerGroup().addTo(map),
      water: L.layerGroup().addTo(map),
      electric: L.layerGroup().addTo(map),
      gas: L.layerGroup().addTo(map),
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
    polygonEditLayerRef.current = L.layerGroup().addTo(map);
    pipelineEditLayerRef.current = L.layerGroup().addTo(map);

    // Map Click Listener for Interactive Editing
    map.on('click', (e: L.LeafletMouseEvent) => {
      // 1. If Add Vertex click mode is active for selected polygon/field
      if (isAddVertexClickModeRef.current && editingPolygonTargetRef.current) {
        const clicked: Coordinates = {
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6)),
        };
        const currentPts = workingPolygonPointsRef.current;
        if (currentPts && currentPts.length >= 2) {
          const edgeIdx = findClosestEdgeIndex(clicked, currentPts);
          const insertIdx = edgeIdx + 1;
          const updated = [
            ...currentPts.slice(0, insertIdx),
            clicked,
            ...currentPts.slice(insertIdx),
          ];
          setGeometryHistory((prev) => [...prev, currentPts]);
          setWorkingPolygonPoints(updated);
        }
        return;
      }

      // 2. Network layer editing tools
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
    if (polygonEditLayerRef.current && !map.hasLayer(polygonEditLayerRef.current)) {
      polygonEditLayerRef.current.addTo(map);
    }
  }, [tileProvider]);

  // Dynamic Drawing Layer for Tracing Line
  useEffect(() => {
    if (!drawLayerRef.current) return;
    drawLayerRef.current.clearLayers();

    if (drawnLinePoints.length > 0) {
      const latLngs = drawnLinePoints.map((p) => [p.lat, p.lng] as [number, number]);

      // Polyline preview
      const polyline = L.polyline(latLngs, {
        color: '#f43f5e',
        weight: 5,
        dashArray: '6, 6',
        opacity: 0.95,
      });
      drawLayerRef.current.addLayer(polyline);

      // Vertex markers
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

  // Geometry editing helper handlers
  const handleDeleteVertex = (index: number) => {
    if (workingPolygonPoints.length <= 3) {
      alert('Полигон не может содержать менее 3 точек!');
      return;
    }
    setGeometryHistory((prev) => [...prev, workingPolygonPointsRef.current]);
    setWorkingPolygonPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInsertVertex = (index: number, coord: Coordinates) => {
    setGeometryHistory((prev) => [...prev, workingPolygonPointsRef.current]);
    setWorkingPolygonPoints((prev) => [
      ...prev.slice(0, index),
      coord,
      ...prev.slice(index),
    ]);
  };

  const handleStartEditingPlot = (plot: Plot) => {
    setEditingPolygonTarget({
      type: 'plot',
      id: plot.id,
      number: plot.number,
      plot,
    });
    setWorkingPolygonPoints([...plot.polygon]);
    setOriginalPolygonPoints([...plot.polygon]);
    setGeometryHistory([]);
    setIsAddVertexClickMode(false);
    setActivePlot(plot);

    if (mapInstanceRef.current && plot.polygon.length > 0) {
      const bounds = L.latLngBounds(plot.polygon.map((c) => [c.lat, c.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 18 });
    }
  };

  const handleStartEditingBoundary = () => {
    const pts = currentBoundary;
    setEditingPolygonTarget({
      type: 'boundary',
      label: 'Граница ДТСН «Пенсионер»',
    });
    setWorkingPolygonPoints([...pts]);
    setOriginalPolygonPoints([...pts]);
    setGeometryHistory([]);
    setIsAddVertexClickMode(false);

    if (mapInstanceRef.current && pts.length > 0) {
      const bounds = L.latLngBounds(pts.map((c) => [c.lat, c.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleSaveGeometry = () => {
    if (!editingPolygonTarget || workingPolygonPoints.length < 3) return;

    if (editingPolygonTarget.type === 'plot') {
      const targetPlot = editingPolygonTarget.plot;
      const newArea = calculatePolygonAreaSqm(workingPolygonPoints);
      const newCentroid = calculatePolygonCentroid(workingPolygonPoints);

      const updatedPlot: Plot = {
        ...targetPlot,
        polygon: workingPolygonPoints,
        areaSqm: newArea,
        coordinates: newCentroid,
      };

      if (onUpdatePlot) {
        onUpdatePlot(updatedPlot);
      }
      setActivePlot(updatedPlot);
      setEditingPolygonTarget({
        type: 'plot',
        id: updatedPlot.id,
        number: updatedPlot.number,
        plot: updatedPlot,
      });
    } else if (editingPolygonTarget.type === 'boundary') {
      if (onSaveBoundaryPoints) {
        onSaveBoundaryPoints(workingPolygonPoints);
      }
    }

    setOriginalPolygonPoints(workingPolygonPoints);
    setGeometryHistory([]);
    setIsSaveSuccess(true);
    setTimeout(() => setIsSaveSuccess(false), 2500);
  };

  const handleCancelGeometry = () => {
    setEditingPolygonTarget(null);
    setIsAddVertexClickMode(false);
    setWorkingPolygonPoints([]);
    setGeometryHistory([]);
  };

  const handleUndoGeometry = () => {
    if (geometryHistory.length === 0) return;
    const previous = geometryHistory[geometryHistory.length - 1];
    setWorkingPolygonPoints(previous);
    setGeometryHistory((prev) => prev.slice(0, -1));
  };

  // Render Editable Polygon with Draggable Push & Pull Vertices and Ghost Midpoint Handles
  useEffect(() => {
    const editGroup = polygonEditLayerRef.current;
    if (!editGroup) return;
    editGroup.clearLayers();

    if (!editingPolygonTarget || workingPolygonPoints.length < 3) return;

    const isBoundary = editingPolygonTarget.type === 'boundary';
    const latLngs = workingPolygonPoints.map((p) => [p.lat, p.lng] as [number, number]);

    // 1. Polygon preview with active dashed boundary & translucent fill
    const polygon = L.polygon(latLngs, {
      color: isBoundary ? '#e11d48' : '#2563eb',
      weight: isBoundary ? 4 : 3.5,
      dashArray: '6, 6',
      fillColor: isBoundary ? '#f43f5e' : '#3b82f6',
      fillOpacity: isBoundary ? 0.16 : 0.38,
      interactive: false,
    });
    editGroup.addLayer(polygon);

    const ghostMarkers: L.Marker[] = [];

    // 2. Midpoint Ghost Handles (+) for creating new vertices along edges
    for (let i = 0; i < workingPolygonPoints.length; i++) {
      const nextIdx = (i + 1) % workingPolygonPoints.length;
      const p1 = workingPolygonPoints[i];
      const p2 = workingPolygonPoints[nextIdx];

      const midLat = Number(((p1.lat + p2.lat) / 2).toFixed(6));
      const midLng = Number(((p1.lng + p2.lng) / 2).toFixed(6));

      const ghostHtml = `
        <div class="w-6 h-6 rounded-full ${isBoundary ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-bold text-sm flex items-center justify-center border-2 border-white shadow-lg cursor-grab active:cursor-grabbing hover:scale-130 transition-transform select-none" style="pointer-events: auto; touch-action: none;" title="Создать точку: нажмите или потяните">
          +
        </div>
      `;

      const ghostIcon = L.divIcon({
        html: ghostHtml,
        className: 'custom-midpoint-handle',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const ghostMarker = L.marker([midLat, midLng], {
        icon: ghostIcon,
        draggable: true,
        zIndexOffset: 1500,
      });

      // Clicking "+" adds a vertex at the midpoint
      ghostMarker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        handleInsertVertex(nextIdx, { lat: midLat, lng: midLng });
      });

      // Dragging "+" smoothly pulls out a new vertex immediately
      ghostMarker.on('dragstart', (e: any) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.dragging.disable();
        }
        const current = workingPolygonPointsRef.current;
        setGeometryHistory((prev) => [...prev, current]);

        const startPos = e.target.getLatLng();
        const newPt = {
          lat: Number(startPos.lat.toFixed(6)),
          lng: Number(startPos.lng.toFixed(6)),
        };
        const next = [
          ...current.slice(0, nextIdx),
          newPt,
          ...current.slice(nextIdx),
        ];
        workingPolygonPointsRef.current = next;
        polygon.setLatLngs(next.map((p) => [p.lat, p.lng] as [number, number]));
      });

      ghostMarker.on('drag', (e: any) => {
        const newPos = e.target.getLatLng();
        workingPolygonPointsRef.current[nextIdx] = {
          lat: Number(newPos.lat.toFixed(6)),
          lng: Number(newPos.lng.toFixed(6)),
        };
        polygon.setLatLngs(workingPolygonPointsRef.current.map((p) => [p.lat, p.lng] as [number, number]));
      });

      ghostMarker.on('dragend', () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.dragging.enable();
        }
        setWorkingPolygonPoints([...workingPolygonPointsRef.current]);
      });

      ghostMarker.bindTooltip(
        `<b>Создать новую точку</b><br/>Потяните или нажмите, чтобы добавить вершину на этом ребре`,
        { direction: 'top', offset: [0, -12] }
      );

      editGroup.addLayer(ghostMarker);
      ghostMarkers.push(ghostMarker);
    }

    // 3. Draggable Vertex Handles (Push & Pull corner points)
    workingPolygonPoints.forEach((pt, idx) => {
      const vertexHtml = `
        <div class="relative group cursor-grab active:cursor-grabbing select-none" style="pointer-events: auto; touch-action: none;">
          <div class="w-7 h-7 rounded-full ${isBoundary ? 'bg-rose-600 ring-2 ring-rose-300' : 'bg-blue-600 ring-2 ring-blue-300'} text-white font-mono text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-2xl hover:scale-125 transition-transform">
            ${idx + 1}
          </div>
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none shadow-md z-30">
            Точка ${idx + 1}
          </div>
        </div>
      `;

      const vertexIcon = L.divIcon({
        html: vertexHtml,
        className: 'custom-vertex-handle',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const vertexMarker = L.marker([pt.lat, pt.lng], {
        icon: vertexIcon,
        draggable: true,
        zIndexOffset: 3000,
      });

      // Drag start: record history and disable map dragging
      vertexMarker.on('dragstart', () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.dragging.disable();
        }
        setGeometryHistory((prev) => [...prev, workingPolygonPointsRef.current]);
      });

      // Live dragging update (Push & Pull) without destroying markers mid-drag
      vertexMarker.on('drag', (e: any) => {
        const newPos = e.target.getLatLng();
        const lat = Number(newPos.lat.toFixed(6));
        const lng = Number(newPos.lng.toFixed(6));
        workingPolygonPointsRef.current[idx] = { lat, lng };

        // Deform polygon in real-time
        polygon.setLatLngs(workingPolygonPointsRef.current.map((p) => [p.lat, p.lng] as [number, number]));

        // Keep adjacent midpoint ghost handles in sync
        const total = workingPolygonPointsRef.current.length;
        const prevMidIdx = (idx - 1 + total) % total;
        const pPrev = workingPolygonPointsRef.current[prevMidIdx];
        const pNext = workingPolygonPointsRef.current[(idx + 1) % total];

        if (ghostMarkers[prevMidIdx]) {
          ghostMarkers[prevMidIdx].setLatLng([(pPrev.lat + lat) / 2, (pPrev.lng + lng) / 2]);
        }
        if (ghostMarkers[idx]) {
          ghostMarkers[idx].setLatLng([(lat + pNext.lat) / 2, (lng + pNext.lng) / 2]);
        }
      });

      // Drag end: re-enable map dragging and commit to React state
      vertexMarker.on('dragend', () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.dragging.enable();
        }
        setWorkingPolygonPoints([...workingPolygonPointsRef.current]);
      });

      // Right-click to delete vertex
      vertexMarker.on('contextmenu', (e: any) => {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        handleDeleteVertex(idx);
      });

      vertexMarker.bindTooltip(
        `<b>Вершина ${idx + 1} (${isBoundary ? 'Граница ДТСН' : 'Участок'})</b><br/>Тяните (push & pull) для перемещения<br/><span class="text-rose-600 font-bold">ПКМ — удалить точку</span>`,
        { direction: 'top', offset: [0, -16] }
      );

      editGroup.addLayer(vertexMarker);
    });
  }, [editingPolygonTarget, workingPolygonPoints]);

  // ----------------------------------------------------
  // INTERACTIVE PIPELINE PATH VERTEX EDITING & AUTO-SNAPPING (Item 8)
  // ----------------------------------------------------
  useEffect(() => {
    const editGroup = pipelineEditLayerRef.current;
    if (!editGroup) return;
    editGroup.clearLayers();

    if (!selectedNetworkItem || selectedNetworkItem.type !== 'pipeline' || isMapLocked) {
      return;
    }

    const currentPipe: PipelineSegment = selectedNetworkItem.data;
    if (!currentPipe || !currentPipe.path || currentPipe.path.length < 2) return;

    const netColor =
      currentPipe.networkType === 'water_winter' || currentPipe.networkType === 'water_summer'
        ? '#0284c7'
        : currentPipe.networkType === 'gas'
        ? '#ca8a04'
        : '#d97706';

    // 1. Highlight polyline with pulsing dashed style
    const linePoly = L.polyline(
      currentPipe.path.map((c) => [c.lat, c.lng] as [number, number]),
      {
        color: netColor,
        weight: 5,
        opacity: 0.95,
        dashArray: '6, 6',
      }
    );
    editGroup.addLayer(linePoly);

    // 2. Draggable Vertex Handles for each point in pipeline path
    currentPipe.path.forEach((pt, idx) => {
      const vertexHtml = `
        <div class="relative group cursor-grab active:cursor-grabbing select-none" style="pointer-events: auto;">
          <div class="w-6 h-6 rounded-full text-white font-mono text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xl hover:scale-130 transition-transform" style="background-color: ${netColor}">
            ${idx + 1}
          </div>
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none shadow-md z-30 font-bold">
            Точка ${idx + 1}
          </div>
        </div>
      `;

      const vertexIcon = L.divIcon({
        html: vertexHtml,
        className: 'custom-pipe-vertex',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const vertexMarker = L.marker([pt.lat, pt.lng], {
        icon: vertexIcon,
        draggable: true,
        zIndexOffset: 3500,
      });

      vertexMarker.on('dragstart', () => {
        mapInstanceRef.current?.dragging.disable();
      });

      vertexMarker.on('drag', (e: any) => {
        const rawPos = e.target.getLatLng();
        let finalLat = Number(rawPos.lat.toFixed(6));
        let finalLng = Number(rawPos.lng.toFixed(6));

        // Auto-snapping to nearby engineering elements (< 15 meters)
        let snappedTo: string | null = null;
        for (const target of snapTargets) {
          const dist = calculateDistanceMeters({ lat: finalLat, lng: finalLng }, target.coords);
          if (dist <= 15) {
            finalLat = target.coords.lat;
            finalLng = target.coords.lng;
            snappedTo = `${target.type} ${target.name} (${dist.toFixed(1)}м)`;
            break;
          }
        }

        if (snappedTo) {
          setPipelineSnapNotice(`🎯 Примагничено к: ${snappedTo}`);
        } else {
          setPipelineSnapNotice(null);
        }

        const newPath = [...currentPipe.path];
        newPath[idx] = { lat: finalLat, lng: finalLng };
        linePoly.setLatLngs(newPath.map((c) => [c.lat, c.lng] as [number, number]));
      });

      vertexMarker.on('dragend', (e: any) => {
        mapInstanceRef.current?.dragging.enable();
        const rawPos = e.target.getLatLng();
        let finalLat = Number(rawPos.lat.toFixed(6));
        let finalLng = Number(rawPos.lng.toFixed(6));

        // Final snap check
        for (const target of snapTargets) {
          const dist = calculateDistanceMeters({ lat: finalLat, lng: finalLng }, target.coords);
          if (dist <= 15) {
            finalLat = target.coords.lat;
            finalLng = target.coords.lng;
            break;
          }
        }

        const updatedPath = [...currentPipe.path];
        updatedPath[idx] = { lat: finalLat, lng: finalLng };
        const updatedPipe: PipelineSegment = { ...currentPipe, path: updatedPath };

        if (onUpdatePipeline) {
          onUpdatePipeline(updatedPipe);
        }
        setSelectedNetworkItem({ type: 'pipeline', data: updatedPipe });
        setTimeout(() => setPipelineSnapNotice(null), 2500);
      });

      // Right-click to remove vertex (if length > 2)
      vertexMarker.on('contextmenu', (e: any) => {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        if (currentPipe.path.length <= 2) return;
        const updatedPath = currentPipe.path.filter((_, i) => i !== idx);
        const updatedPipe: PipelineSegment = { ...currentPipe, path: updatedPath };
        if (onUpdatePipeline) onUpdatePipeline(updatedPipe);
        setSelectedNetworkItem({ type: 'pipeline', data: updatedPipe });
      });

      vertexMarker.bindTooltip(
        `<b>Вершина ${idx + 1} трассы ${currentPipe.code}</b><br/>Тяните для изменения траектории.<br/>Автоматически привязывается к колодцам, столбам и задвижкам (&lt; 15м).<br/><span class="text-rose-600 font-bold">ПКМ — удалить точку</span>`,
        { direction: 'top', offset: [0, -14] }
      );

      editGroup.addLayer(vertexMarker);
    });

    // 3. Midpoint '+' Handles to insert vertices
    for (let i = 0; i < currentPipe.path.length - 1; i++) {
      const p1 = currentPipe.path[i];
      const p2 = currentPipe.path[i + 1];
      const midLat = Number(((p1.lat + p2.lat) / 2).toFixed(6));
      const midLng = Number(((p1.lng + p2.lng) / 2).toFixed(6));

      const midHtml = `
        <div class="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform" title="Добавить вершину в трассу">
          +
        </div>
      `;

      const midIcon = L.divIcon({
        html: midHtml,
        className: 'custom-pipe-midpoint',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const midMarker = L.marker([midLat, midLng], { icon: midIcon, zIndexOffset: 2000 });
      midMarker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        const newPath = [
          ...currentPipe.path.slice(0, i + 1),
          { lat: midLat, lng: midLng },
          ...currentPipe.path.slice(i + 1),
        ];
        const updatedPipe: PipelineSegment = { ...currentPipe, path: newPath };
        if (onUpdatePipeline) onUpdatePipeline(updatedPipe);
        setSelectedNetworkItem({ type: 'pipeline', data: updatedPipe });
      });

      editGroup.addLayer(midMarker);
    }
  }, [selectedNetworkItem, isMapLocked, snapTargets, onUpdatePipeline]);

  // Render Vector Layers, Boundary Masks, Cadastral Labels & Resource Availability
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const {
      boundaryMask,
      boundaryLines,
      water,
      electric,
      gas,
      plots: plotGroup,
      plotLabels,
      seasonal,
      patrolRoute,
      drainage,
      wifi,
      barriers,
      facilities,
    } = layerGroupsRef.current;

    // Clear previous elements
    boundaryMask?.clearLayers();
    boundaryLines?.clearLayers();
    water?.clearLayers();
    electric?.clearLayers();
    gas?.clearLayers();
    plotGroup?.clearLayers();
    plotLabels?.clearLayers();
    seasonal?.clearLayers();
    patrolRoute?.clearLayers();
    drainage?.clearLayers();
    wifi?.clearLayers();
    barriers?.clearLayers();
    facilities?.clearLayers();

    // 0. BOUNDARY MASK: "Убрать всё лишнее оставив только участки в границах ДТСН Пенсионер"
    if (focusBoundaryMask && boundaryMask && editingPolygonTarget?.type !== 'boundary') {
      const worldOuterRing: [number, number][] = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
      ];
      const dtsnHole: [number, number][] = currentBoundary.map((c) => [c.lat, c.lng]);

      // Inverted polygon masks everything outside DTSN Pensioner
      const maskPolygon = L.polygon([worldOuterRing, dtsnHole], {
        color: 'transparent',
        fillColor: '#0f172a',
        fillOpacity: 0.35,
        interactive: false,
      });
      boundaryMask.addLayer(maskPolygon);
    }

    // 0.1 OFFICIAL NSPD CADASTRAL BOUNDARY
    if (showNspdOverlay && boundaryLines) {
      if (editingPolygonTarget?.type !== 'boundary') {
        const borderLatLngs = currentBoundary.map((c) => [c.lat, c.lng] as [number, number]);
        const boundaryPolygon = L.polygon(borderLatLngs, {
          color: '#dc2626',
          weight: 3.5,
          dashArray: '8, 6',
          opacity: 0.95,
          fillColor: '#ef4444',
          fillOpacity: 0.04,
        });

        boundaryPolygon.bindTooltip(
          `<b>Официальная граница ДТСН «Пенсионер»</b><br/>Кадастровый квартал: <b>54:19:112001</b> (НСПД)<br/>Площадь: <b>${(
            calculatePolygonAreaSqm(currentBoundary) / 10000
          ).toFixed(2)} га</b> (${calculatePolygonAreaSqm(currentBoundary)} м²)<br/><span class="text-rose-600 font-bold">👆 Кликните для редактирования границ</span>`,
          { sticky: true }
        );

        boundaryPolygon.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          handleStartEditingBoundary();
        });

        boundaryLines.addLayer(boundaryPolygon);
      }
    }

    // 1. WATER LAYER
    if (visibleLayers.water && water) {
      // Pipelines
      pipelines
        .filter((p) => p.networkType === 'water_winter' || p.networkType === 'water_summer')
        .forEach((pipe) => {
          const isMain500 = pipe.diameterMm === 500 || pipe.subType === 'main_500' || pipe.code?.includes('500') || pipe.code === 'МВ-500';
          const isWinter = pipe.subType === 'winter';
          const latLngs = pipe.path.map((c) => [c.lat, c.lng] as [number, number]);

          if (isMain500) {
            // High-visibility dual-stroke rendering for Ø500 Trunk Backbone
            const glowLine = L.polyline(latLngs, {
              color: '#06b6d4',
              weight: 10,
              opacity: 0.45,
              lineCap: 'round',
              lineJoin: 'round',
            });
            const coreLine = L.polyline(latLngs, {
              color: '#1d4ed8',
              weight: 6,
              opacity: 0.98,
            });

            const main500Tooltip = `
              <div class="p-1 space-y-1">
                <div class="flex items-center gap-1.5 font-bold text-sky-900 border-b border-sky-100 pb-1">
                  <span class="px-1.5 py-0.5 rounded bg-sky-950 text-cyan-300 font-mono text-[10px]">Ду 500</span>
                  <span>★ ОСНОВНАЯ МАГИСТРАЛЬ ВОДОПРОВОДА 500</span>
                </div>
                <div class="text-xs text-slate-700">
                  Обозначение: <b>${pipe.code}</b> (${pipe.description || 'Магистральный водовод'})<br/>
                  Материал: <b>${pipe.material}</b><br/>
                  Рабочее давление: <b>${pipe.pressureNominal || '1.0 МПа (10 атм)'}</b><br/>
                  Глубина заложения: <b>${pipe.depthMeters} м</b> (круглогодичный зимний ввод)
                </div>
                <div class="text-[10px] text-cyan-700 font-semibold pt-0.5">
                  👆 Кликните для открытия паспорта магистрали и редактирования
                </div>
              </div>
            `;

            glowLine.bindTooltip(main500Tooltip, { sticky: true });
            coreLine.bindTooltip(main500Tooltip, { sticky: true });

            glowLine.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'pipeline', data: pipe });
            });
            coreLine.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'pipeline', data: pipe });
            });

            water.addLayer(glowLine);
            water.addLayer(coreLine);
          } else {
            const line = L.polyline(latLngs, {
              color: isWinter ? '#0284c7' : '#0ea5e9',
              weight: isWinter ? 5 : 3.5,
              dashArray: isWinter ? undefined : '6, 6',
              opacity: 0.9,
            });

            line.bindTooltip(
              `<b>${pipe.code}</b><br/>${pipe.material}<br/>Ду ${pipe.diameterMm} мм, Глубина: ${pipe.depthMeters} м<br/>Давление: ${pipe.pressureNominal || '4.0 атм'}<br/><i>Клик для инспекции</i>`,
              { sticky: true }
            );

            line.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setSelectedNetworkItem({ type: 'pipeline', data: pipe });
            });

            water.addLayer(line);
          }
        });

      // Wells
      (wells || []).forEach((well) => {
        if (!well?.coordinates || typeof well.coordinates.lat !== 'number' || typeof well.coordinates.lng !== 'number') return;
        const hasFree = well.freePorts > 0;
        const iconHtml = `
          <div class="relative group cursor-grab active:cursor-grabbing">
            <div class="w-8 h-8 rounded-full border-2 ${
              hasFree ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-rose-600 bg-rose-50 text-rose-800'
            } flex items-center justify-center shadow-md transition-transform hover:scale-125">
              <span class="text-xs font-bold font-mono">${(well.code || '').replace(' (Головной)', '').replace(' (Дренажный)', '')}</span>
            </div>
            <div class="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              hasFree ? 'bg-emerald-600 text-white shadow' : 'bg-rose-600 text-white shadow'
            }">
              ${well.freePorts}
            </div>
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
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('well', well.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'well', data: well });
          setActiveWell(well);
          onSelectWell(well);
        });

        marker.bindTooltip(
          `<b>${well.name} (${well.code})</b><br/>Свободных врезок: <b>${well.freePorts} из ${well.totalPorts}</b><br/>Глубина: ${well.depthMeters} м, Давление: ${well.nominalPressureAtm} атм<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -16] }
        );

        water.addLayer(marker);
      });

      // Valves
      (valves || [])
        .filter((v) => v.networkType === 'water_winter' || v.networkType === 'water_summer')
        .forEach((valve) => {
          if (!valve?.coordinates || typeof valve.coordinates.lat !== 'number' || typeof valve.coordinates.lng !== 'number') return;
          const isOpen = valve.state === 'open';
          const iconHtml = `
            <div class="w-6 h-6 rounded-md border ${
              isOpen ? 'border-sky-600 bg-sky-100 text-sky-900' : 'border-amber-600 bg-amber-100 text-amber-900'
            } flex items-center justify-center text-[10px] font-bold shadow-sm hover:scale-125 transition-transform cursor-grab active:cursor-grabbing">
              ЗК
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
            draggable: canEditNetworks !== false && !isMapLocked,
          });

          marker.on('dragstart', () => {
            mapInstanceRef.current?.dragging.disable();
          });

          marker.on('dragend', (e: any) => {
            mapInstanceRef.current?.dragging.enable();
            const { lat, lng } = e.target.getLatLng();
            if (onUpdateCoordinates) {
              onUpdateCoordinates('valve', valve.id, {
                lat: Number(lat.toFixed(6)),
                lng: Number(lng.toFixed(6)),
              });
            }
          });

          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'valve', data: valve });
          });

          marker.bindTooltip(
            `<b>Задвижка ${valve.code}</b><br/>Тип: ${valve.type}<br/>Ду ${valve.diameterMm} мм, Состояние: <b>${isOpen ? 'ОТКРЫТА' : 'ЗАКРЫТА'}</b><br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
            { direction: 'top', offset: [0, -12] }
          );
          water.addLayer(marker);
        });

      // Fire Hydrants (ПГ)
      (fireHydrants || []).forEach((fh) => {
        if (!fh?.coordinates || typeof fh.coordinates.lat !== 'number' || typeof fh.coordinates.lng !== 'number') return;
        const iconHtml = `
          <div class="w-7 h-7 rounded-full border-2 border-red-600 bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shadow-md hover:scale-125 transition-transform cursor-grab active:cursor-grabbing">
            ПГ
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
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('fireHydrant', fh.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'fireHydrant', data: fh });
        });

        marker.bindTooltip(
          `<b>Пожарный гидрант ${fh.code}</b><br/>Давление: ${fh.staticPressureAtm} атм, Расход: ${fh.flowRateLps} л/с<br/>Утепление на зиму: ${
            fh.winterInsulationDone ? '✅ Выполнено' : '❌ Требуется ревизия'
          }<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -14] }
        );
        water.addLayer(marker);
      });

      // Water Metering Nodes (Узлы учёта воды - УУВ)
      (waterMeteringNodes || []).forEach((node) => {
        if (!node?.coordinates || typeof node.coordinates.lat !== 'number' || typeof node.coordinates.lng !== 'number') return;
        const isCommercial500 = node.pipeDiameterMm === 500 || node.meterType === 'commercial';
        const iconHtml = `
          <div class="relative group cursor-grab active:cursor-grabbing select-none" style="pointer-events: auto;">
            <div class="w-8 h-8 rounded-lg border-2 ${
              isCommercial500
                ? 'border-cyan-400 bg-sky-950 text-cyan-300 ring-2 ring-cyan-400/50 shadow-cyan-900/40'
                : 'border-blue-600 bg-blue-50 text-blue-900'
            } flex flex-col items-center justify-center shadow-lg hover:scale-125 transition-transform">
              <span class="text-[9px] font-black font-mono leading-none tracking-tighter">УУВ</span>
              <span class="text-[8px] font-bold font-mono opacity-80 leading-none mt-0.5">d${node.pipeDiameterMm || 110}</span>
            </div>
            ${
              node.hasTelemetry
                ? `<div class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] font-bold shadow animate-pulse" title="Телеметрия онлайн">📡</div>`
                : ''
            }
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-water-meter-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([node.coordinates.lat, node.coordinates.lng], {
          icon: customIcon,
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          const updatedCoords = {
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
          };
          if (onUpdateCoordinates) {
            onUpdateCoordinates('waterMeteringNode', node.id, updatedCoords);
          }
          if (onUpdateWaterMeteringNode) {
            onUpdateWaterMeteringNode({ ...node, coordinates: updatedCoords });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'waterMeteringNode', data: node });
        });

        marker.bindTooltip(
          `<b>${node.name} (${node.code})</b><br/>` +
          `Назначение: <b>${node.meterType === 'commercial' ? 'Головной коммерческий узел (на вводе Ду 500)' : 'Технический зональный учёт'}</b><br/>` +
          `Прибор: <b>${node.meterModel}</b> · Ду <b>${node.pipeDiameterMm} мм</b><br/>` +
          `Текущий расход: <b>${node.currentFlowM3h ?? 0} м³/ч</b> · Накоплено: <b>${(node.totalConsumptionM3 ?? 0).toLocaleString()} м³</b><br/>` +
          `Пломба: <b>${node.sealNumber}</b> · Поверка до: <b>${node.nextVerificationDate}</b><br/>` +
          `<span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -16] }
        );

        water.addLayer(marker);
      });
    }

    // 2. ELECTRICITY LAYER
    if (visibleLayers.electric && electric) {
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

      // КТПН
      (substations || []).forEach((sub) => {
        if (!sub?.coordinates || typeof sub.coordinates.lat !== 'number' || typeof sub.coordinates.lng !== 'number') return;
        const isWarning = sub.status === 'warning';
        const iconHtml = `
          <div class="w-10 h-10 rounded-lg border-2 ${
            isWarning ? 'border-amber-500 bg-amber-50 text-amber-800 animate-pulse' : 'border-amber-600 bg-amber-100 text-amber-900'
          } flex flex-col items-center justify-center text-[10px] font-bold shadow-md hover:scale-115 transition-transform cursor-grab active:cursor-grabbing">
            <span class="text-xs">⚡</span>
            <span class="font-mono text-[9px] -mt-1 font-bold">${sub.code}</span>
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
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('substation', sub.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'substation', data: sub });
        });

        marker.bindTooltip(
          `<b>${sub.name}</b><br/>Мощность: ${sub.powerKva} кВА, Напряжение: ${sub.voltageKv}<br/>Загрузка: <b>${sub.currentLoadPercent}%</b><br/>Сопротивление заземления: ${sub.groundingResistanceOhm} Ом<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -20] }
        );
        electric.addLayer(marker);
      });

      // Switchboards
      (switchboards || []).forEach((sb) => {
        if (!sb?.coordinates || typeof sb.coordinates.lat !== 'number' || typeof sb.coordinates.lng !== 'number') return;
        const iconHtml = `
          <div class="w-7 h-7 rounded-lg border-2 border-indigo-600 bg-indigo-50 text-indigo-900 flex items-center justify-center font-bold text-[9px] shadow-md hover:scale-125 transition-transform cursor-grab active:cursor-grabbing">
            ВРУ
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
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('switchboard', sb.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'switchboard', data: sb });
        });

        marker.bindTooltip(
          `<b>${sb.name} (${sb.code})</b><br/>${sb.substationCode} · Ввод ${sb.mainBreakerAmps}А<br/>Счетчик: ${sb.meterModel} (№ ${sb.meterSerial})<br/>Фидеров: ${sb.feederCount}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -14] }
        );
        electric.addLayer(marker);
      });

      // Light poles
      (lightPoles || []).forEach((pole) => {
        if (!pole?.coordinates || typeof pole.coordinates.lat !== 'number' || typeof pole.coordinates.lng !== 'number') return;
        const isWorking = pole.status === 'working';
        const iconHtml = `
          <div class="w-4 h-4 rounded-full border cursor-grab active:cursor-grabbing ${
            isWorking ? 'border-amber-400 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]' : 'border-slate-400 bg-slate-200'
          }"></div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-lightpole-icon',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const marker = L.marker([pole.coordinates.lat, pole.coordinates.lng], {
          icon: customIcon,
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('lightPole', pole.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'lightPole', data: pole });
        });

        marker.bindTooltip(
          `<b>Уличный фонарь ${pole.code}</b><br/>Светильник: ${pole.lampType}<br/>Фаза: ${pole.phase}, Дежурный режим: ${pole.isDutyLight ? 'Включен' : 'Откл'}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -8] }
        );
        electric.addLayer(marker);
      });
    }

    // 3. GAS LAYER
    if (visibleLayers.gas && gas) {
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

      // ГРПШ (Газорегуляторный пункт шкафной)
      if (gasRegulator && gasRegulator.coordinates && typeof gasRegulator.coordinates.lat === 'number' && typeof gasRegulator.coordinates.lng === 'number') {
        const grpIconHtml = `
          <div class="w-9 h-9 rounded-lg border-2 border-yellow-600 bg-yellow-100 text-yellow-900 flex flex-col items-center justify-center font-bold text-[10px] shadow-md hover:scale-115 transition-transform cursor-grab active:cursor-grabbing">
            <span class="text-xs">🔥</span>
            <span class="text-[8px] font-mono -mt-1 font-bold">ГРПШ</span>
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
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        grpMarker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        grpMarker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('gasRegulator', gasRegulator.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        grpMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'gasRegulator', data: gasRegulator });
        });

        grpMarker.bindTooltip(
          `<b>${gasRegulator.name || 'ГРПШ'} (${gasRegulator.code || 'ГРПШ-1'})</b><br/>Входное давление: ${gasRegulator.inletPressureMpa || 0.6} МПа<br/>Выходное давление: ${gasRegulator.outletPressureKpa || 3.0} кПа<br/>Телеметрия: ${gasRegulator.hasTelemetry ? 'В норме' : 'Откл'}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -18] }
        );
        gas.addLayer(grpMarker);
      }
    }

    // 4. FACILITIES (Правление, КПП, Склад)
    if (visibleLayers.facilities && facilities) {
      (adminFacilities || []).forEach((fac) => {
        if (!fac?.coordinates || typeof fac.coordinates.lat !== 'number' || typeof fac.coordinates.lng !== 'number') return;
        const iconHtml = `
          <div class="w-9 h-9 rounded-xl border-2 border-indigo-700 bg-indigo-50 text-indigo-900 flex flex-col items-center justify-center font-bold shadow-md hover:scale-115 transition-transform cursor-grab active:cursor-grabbing">
            <span class="text-sm">🏛️</span>
            <span class="text-[8px] font-mono -mt-1 font-bold">${fac.code}</span>
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
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('adminFacility', fac.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'adminFacility', data: fac });
        });

        marker.bindTooltip(
          `<b>${fac.name}</b><br/>${fac.description}<br/>Режим: ${fac.workingHours}<br/>Видеонаблюдение: ${fac.hasCctv ? '✅ 8 камер' : '❌'}<br/>Резервный генератор: ${fac.hasBackupGenerator ? '✅ 15 кВт' : '❌'}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -18] }
        );
        facilities.addLayer(marker);
      });
    }

    // 5. WI-FI HOTSPOTS & CCTV SURVEILLANCE CAMERAS
    if (visibleLayers.wifi && wifi) {
      (wifiHotspots || []).forEach((hs) => {
        if (!hs?.coordinates || typeof hs.coordinates.lat !== 'number' || typeof hs.coordinates.lng !== 'number') return;
        const circle = L.circle([hs.coordinates.lat, hs.coordinates.lng], {
          radius: hs.rangeMeters,
          color: '#3b82f6',
          weight: 1,
          fillColor: '#60a5fa',
          fillOpacity: 0.12,
          dashArray: '3, 6',
        });
        wifi.addLayer(circle);

        const iconHtml = `
          <div class="w-6 h-6 rounded-full border border-blue-600 bg-blue-100 text-blue-800 flex items-center justify-center text-xs shadow-sm hover:scale-125 transition-transform cursor-grab active:cursor-grabbing">
            📶
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
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('wifiHotspot', hs.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'wifiHotspot', data: hs });
        });

        marker.bindTooltip(
          `<b>${hs.name}</b><br/>SSID: <b>${hs.ssid}</b><br/>Радиус покрытия: ${hs.rangeMeters} м<br/>Статус: ${hs.status === 'online' ? '🟢 В сети' : '🔴 Оффлайн'}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -12] }
        );
        wifi.addLayer(marker);
      });

      // CCTV Cameras (Камеры видеонаблюдения ДТСН и опоры ЛЭП)
      (cctvCameras || []).forEach((cam) => {
        if (!cam?.coordinates || typeof cam.coordinates.lat !== 'number' || typeof cam.coordinates.lng !== 'number') return;
        const isOnline = cam.status === 'online';
        const camIconHtml = `
          <div class="relative group cursor-grab active:cursor-grabbing">
            <div class="w-8 h-8 rounded-lg border-2 ${
              isOnline ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-rose-600 bg-rose-50 text-rose-800'
            } flex flex-col items-center justify-center font-bold text-xs shadow-md hover:scale-120 transition-transform">
              <span class="text-xs">📹</span>
              <span class="text-[7px] font-mono -mt-0.5 font-bold truncate max-w-[28px]">${cam.code}</span>
            </div>
            ${
              cam.poleCode
                ? `<div class="absolute -top-1.5 -right-2 px-1 py-0.2 rounded bg-amber-500 text-white text-[8px] font-mono font-bold shadow-xs">
                    ${cam.poleCode}
                   </div>`
                : ''
            }
          </div>
        `;
        const camIcon = L.divIcon({
          html: camIconHtml,
          className: 'custom-cctv-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([cam.coordinates.lat, cam.coordinates.lng], {
          icon: camIcon,
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('cctvCamera', cam.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'cctvCamera', data: cam });
        });

        marker.bindTooltip(
          `<b>${cam.name} (${cam.code})</b><br/>Разрешение: ${cam.resolution}, Направление: ${cam.viewDirection} (${cam.rotationAngle}°)<br/>Опора ЛЭП: <b>${cam.poleCode || 'Отдельная опора'}</b><br/>Архив: ${cam.cloudArchiveDays} дн. · Статус: ${isOnline ? '🟢 В сети' : '🔴 Оффлайн'}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -16] }
        );
        wifi.addLayer(marker);
      });
    }

    // 6. BARRIERS (Шлагбаумы)
    if (visibleLayers.barriers && barriers) {
      (barrierGates || []).forEach((bg) => {
        if (!bg?.coordinates || typeof bg.coordinates.lat !== 'number' || typeof bg.coordinates.lng !== 'number') return;
        const iconHtml = `
          <div class="w-8 h-8 rounded-lg border-2 border-slate-700 bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs shadow-md hover:scale-115 transition-transform cursor-grab active:cursor-grabbing">
            🚧
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
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('barrierGate', bg.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'barrierGate', data: bg });
        });

        marker.bindTooltip(
          `<b>${bg.name} (${bg.code})</b><br/>Тип: Автоматический с GSM-модулем<br/>Открытие по звонку: <b>${bg.openByPhone}</b><br/>Зимний обогрев привода: ${bg.winterHeatedDrive ? '✅ Включен (+5°C)' : '❌ Откл'}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -16] }
        );
        barriers.addLayer(marker);
      });
    }

    // 7. SEASONAL OBJECTS (Снегоотвалы, Мусорные баки ТБО, Пожарные развороты, Точки осмотра)
    if (visibleLayers.seasonal && seasonal) {
      // Снегоотвалы (полигон + перетаскиваемый пин)
      (snowDumps || []).forEach((sd) => {
        if (!sd) return;
        const latLngs = (sd.polygon || [])
          .filter((c) => c && typeof c.lat === 'number' && typeof c.lng === 'number')
          .map((c) => [c.lat, c.lng] as [number, number]);
        if (latLngs.length > 0) {
          const poly = L.polygon(latLngs, {
            color: '#38bdf8',
            weight: 2,
            fillColor: '#bae6fd',
            fillOpacity: 0.35,
          });
          poly.bindTooltip(
            `<b>${sd.name} (${sd.code})</b><br/>Вместимость: ${sd.capacityCubicMeters} м³<br/>Заполнение: <b>${sd.currentFillPercent}%</b>`,
            { sticky: true }
          );
          poly.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'snowDump', data: sd });
          });
          seasonal.addLayer(poly);
        }

        // Перетаскиваемый маркер снегоотвала
        if (sd.coordinates && typeof sd.coordinates.lat === 'number' && typeof sd.coordinates.lng === 'number') {
          const sdIconHtml = `
            <div class="w-8 h-8 rounded-lg border-2 border-sky-600 bg-sky-100 text-sky-950 flex flex-col items-center justify-center font-bold text-[9px] shadow-md hover:scale-120 transition-transform cursor-grab active:cursor-grabbing">
              <span class="text-xs">❄️</span>
              <span class="text-[8px] font-mono -mt-1 font-bold">${sd.code}</span>
            </div>
          `;
          const sdIcon = L.divIcon({
            html: sdIconHtml,
            className: 'custom-snowdump-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          const sdMarker = L.marker([sd.coordinates.lat, sd.coordinates.lng], {
            icon: sdIcon,
            draggable: canEditNetworks !== false && !isMapLocked,
          });

          sdMarker.on('dragstart', () => {
            mapInstanceRef.current?.dragging.disable();
          });

          sdMarker.on('dragend', (e: any) => {
            mapInstanceRef.current?.dragging.enable();
            const { lat, lng } = e.target.getLatLng();
            if (onUpdateCoordinates) {
              onUpdateCoordinates('snowDump', sd.id, {
                lat: Number(lat.toFixed(6)),
                lng: Number(lng.toFixed(6)),
              });
            }
          });

          sdMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'snowDump', data: sd });
          });

          sdMarker.bindTooltip(
            `<b>${sd.name} (${sd.code})</b><br/>Вместимость: ${sd.capacityCubicMeters} м³<br/>Заполнение: <b>${sd.currentFillPercent}%</b><br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
            { direction: 'top', offset: [0, -16] }
          );
          seasonal.addLayer(sdMarker);
        }
      });

      // Мусорные площадки / баки ТБО
      (wasteSites || []).forEach((ws) => {
        if (!ws?.coordinates || typeof ws.coordinates.lat !== 'number' || typeof ws.coordinates.lng !== 'number') return;
        const iconHtml = `
          <div class="w-8 h-8 rounded-md border-2 border-slate-700 bg-amber-50 text-slate-900 flex flex-col items-center justify-center font-bold text-xs shadow-md hover:scale-120 transition-transform cursor-grab active:cursor-grabbing">
            <span class="text-xs">🗑️</span>
            <span class="text-[8px] font-mono -mt-1 font-bold">${ws.code}</span>
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-waste-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([ws.coordinates.lat, ws.coordinates.lng], {
          icon: customIcon,
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('wasteSite', ws.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'wasteSite', data: ws });
        });

        marker.bindTooltip(
          `<b>${ws.name} (${ws.code})</b><br/>Контейнеров: ${ws.containersCount} шт. (${ws.containerVolumeCbm} м³)<br/>График вывоза: ${ws.pickupSchedule}<br/>Зимой: ${ws.isWinterActive ? '✅ Действует' : '❌ Закрыта'}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -16] }
        );
        seasonal.addLayer(marker);
      });

      // Пожарные разворотные площадки
      (fireTurnarounds || []).forEach((ft) => {
        if (!ft?.coordinates || typeof ft.coordinates.lat !== 'number' || typeof ft.coordinates.lng !== 'number') return;
        const ftIconHtml = `
          <div class="w-8 h-8 rounded-full border-2 border-red-600 bg-red-50 text-red-700 flex flex-col items-center justify-center font-bold text-xs shadow-md hover:scale-120 transition-transform cursor-grab active:cursor-grabbing">
            <span class="text-xs">🚒</span>
            <span class="text-[7px] font-mono -mt-1 font-bold">${ft.code}</span>
          </div>
        `;
        const ftIcon = L.divIcon({
          html: ftIconHtml,
          className: 'custom-ft-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([ft.coordinates.lat, ft.coordinates.lng], {
          icon: ftIcon,
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('fireTurnaround', ft.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'fireTurnaround', data: ft });
        });

        marker.bindTooltip(
          `<b>Пожарный разворот ${ft.code}</b><br/>Радиус: ${ft.radiusMeters} м (${ft.surfaceType})<br/>Состояние: ${ft.winterCleared ? '✅ Расчищен от снега' : '⚠️ Требуется расчистка'}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -16] }
        );
        seasonal.addLayer(marker);
      });

      // Точки регулярного обхода и осмотра (Inspection Points)
      (inspectionPoints || []).forEach((ip) => {
        if (!ip?.coordinates || typeof ip.coordinates.lat !== 'number' || typeof ip.coordinates.lng !== 'number') return;
        const ipIconHtml = `
          <div class="w-7 h-7 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-md hover:scale-120 transition-transform cursor-grab active:cursor-grabbing">
            📋
          </div>
        `;
        const ipIcon = L.divIcon({
          html: ipIconHtml,
          className: 'custom-ip-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([ip.coordinates.lat, ip.coordinates.lng], {
          icon: ipIcon,
          draggable: canEditNetworks !== false && !isMapLocked,
        });

        marker.on('dragstart', () => {
          mapInstanceRef.current?.dragging.disable();
        });

        marker.on('dragend', (e: any) => {
          mapInstanceRef.current?.dragging.enable();
          const { lat, lng } = e.target.getLatLng();
          if (onUpdateCoordinates) {
            onUpdateCoordinates('inspectionPoint', ip.id, {
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
            });
          }
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedNetworkItem({ type: 'inspectionPoint', data: ip });
        });

        marker.bindTooltip(
          `<b>Точка осмотра №${ip.order}: ${ip.name}</b><br/>Категория: ${ip.category}<br/>Объект: <b>${ip.targetAssetCode}</b><br/>Периодичность: ${ip.frequency}<br/><span class="text-amber-600 font-semibold text-[10px]">✥ Перетащите (Drag & Drop) для смены координат</span>`,
          { direction: 'top', offset: [0, -14] }
        );
        seasonal.addLayer(marker);
      });
    }

    // 8. PLOTS LAYER WITH NSPD CADASTRAL BOUNDARIES & RESOURCE AVAILABILITY VISUALIZATION
    if (visibleLayers.plots && plotGroup) {
      // Filter plots if resourceFilter is applied
      const displayedPlots = (plots || []).filter((plot) => {
        if (!plot) return false;
        if (!resourceAvailabilityMode || resourceFilter === 'all') return true;

        if (resourceUtilityType === 'winter_water') {
          if (resourceFilter === 'connected') return Boolean(plot.utilities?.winterWater?.connected);
          if (resourceFilter === 'applied') return plot.utilities?.winterWater?.status === 'applied';
          if (resourceFilter === 'tu_issued') return plot.utilities?.winterWater?.status === 'tu_issued';
          if (resourceFilter === 'none') return !plot.utilities?.winterWater?.connected && plot.utilities?.winterWater?.status === 'none';
        }
        return true;
      });

      displayedPlots.forEach((plot) => {
        if (!plot || !plot.coordinates || typeof plot.coordinates.lat !== 'number' || typeof plot.coordinates.lng !== 'number' || !Array.isArray(plot.polygon) || plot.polygon.length < 3) {
          return;
        }

        // Hide plot in standard layer while its geometry is actively being edited with push & pull handles
        if (editingPolygonTarget?.type === 'plot' && editingPolygonTarget.id === plot.id) {
          return;
        }

        const isWinterConnected = Boolean(plot.utilities?.winterWater?.connected);
        const isTuIssued = plot.utilities?.winterWater?.status === 'tu_issued';
        const isApplied = plot.utilities?.winterWater?.status === 'applied';
        const isPermanentResident = plot.residencyType === 'permanent';

        const latLngs = plot.polygon
          .filter((c) => c && typeof c.lat === 'number' && typeof c.lng === 'number')
          .map((c) => [c.lat, c.lng] as [number, number]);

        if (latLngs.length < 3) return;

        // Determine Polygon Style based on Resource Availability vs Standard GIS Mode
        let fillColor = '#f8fafc';
        let strokeColor = '#94a3b8';
        let fillOpacity = 0.5;
        let strokeWidth = 1.5;
        let dashArray: string | undefined = undefined;

        if (resourceAvailabilityMode) {
          if (resourceUtilityType === 'winter_water') {
            if (isWinterConnected) {
              // Active connection (Emerald green)
              fillColor = '#10b981';
              strokeColor = '#047857';
              fillOpacity = 0.65;
              strokeWidth = 2;
            } else if (isApplied) {
              // Pending application (Vivid amber)
              fillColor = '#f59e0b';
              strokeColor = '#b45309';
              fillOpacity = 0.7;
              strokeWidth = 2.5;
              dashArray = '5, 5';
            } else if (isTuIssued) {
              // TU Issued, awaiting construction (Sky blue)
              fillColor = '#0284c7';
              strokeColor = '#0369a1';
              fillOpacity = 0.7;
              strokeWidth = 2.5;
            } else {
              // Inactive / No connection (Rose / Red highlighting potential need)
              fillColor = '#f43f5e';
              strokeColor = '#be123c';
              fillOpacity = 0.45;
              strokeWidth = 1.5;
            }
          } else if (resourceUtilityType === 'electricity') {
            if (plot.utilities?.electricity?.phases === 3) {
              fillColor = '#10b981';
              strokeColor = '#047857';
              fillOpacity = 0.6;
              strokeWidth = 2;
            } else {
              fillColor = '#f59e0b';
              strokeColor = '#b45309';
              fillOpacity = 0.6;
              strokeWidth = 2;
            }
          } else if (resourceUtilityType === 'gas') {
            if (plot.utilities?.gas?.connected) {
              fillColor = '#10b981';
              strokeColor = '#047857';
              fillOpacity = 0.6;
            } else if (plot.utilities?.gas?.status === 'planned') {
              fillColor = '#f59e0b';
              strokeColor = '#b45309';
              fillOpacity = 0.6;
            } else {
              fillColor = '#94a3b8';
              strokeColor = '#64748b';
              fillOpacity = 0.4;
            }
          }
        } else {
          // Standard GIS Mode
          fillColor = isPermanentResident
            ? '#dbeafe'
            : isWinterConnected
            ? '#e0f2fe'
            : isApplied
            ? '#fef3c7'
            : '#f8fafc';
          strokeColor = isPermanentResident ? '#2563eb' : isWinterConnected ? '#0284c7' : '#94a3b8';
          fillOpacity = isPermanentResident ? 0.6 : 0.48;
          strokeWidth = isPermanentResident ? 2.5 : 1.5;
        }

        const poly = L.polygon(latLngs, {
          color: strokeColor,
          weight: strokeWidth,
          fillColor,
          fillOpacity,
          dashArray,
        });

        poly.on('click', () => {
          setActivePlot(plot);
          onSelectPlot(plot);
        });

        // Rich NSPD & Utilities Tooltip
        const cadTail = (plot.cadastralNumber || '').split(':').pop() || '';
        poly.bindTooltip(
          `<b>Участок № ${plot.number}</b> · <span class="font-mono text-slate-500">:${cadTail}</span><br/>` +
            `Кадастровый номер (НСПД): <b>${plot.cadastralNumber || 'Не указан'}</b><br/>` +
            `Собственник: <b>${plot.ownerName || 'Собственник'}</b> (${plot.areaSqm || 1000} м²)<br/>` +
            `Режим: <b>${isPermanentResident ? '🏠 Постоянное' : '🏡 Периодический'}</b><br/>` +
            `<hr class="my-1 border-slate-200"/>` +
            `💧 Зимний водопровод: <b>${
              isWinterConnected
                ? '🟢 Подключен'
                : isApplied
                ? '🟡 Заявка на рассмотрении'
                : isTuIssued
                ? '🔵 ТУ выданы'
                : '🔴 Не подключен'
            }</b><br/>` +
            `⚡ Электроэнергия: <b>${plot.utilities?.electricity?.phases ?? 1} ф., ${plot.utilities?.electricity?.allocatedPowerKw ?? 15} кВт</b><br/>` +
            `🔥 Газ: <b>${plot.utilities?.gas?.connected ? '🟢 Подключен' : '⚪ Не подключен'}</b>`,
          { sticky: true }
        );

        plotGroup.addLayer(poly);

        // PERMANENT NSPD CADASTRAL & PLOT BADGE (Readable without hover)
        if (showCadastralLabels && plotLabels) {
          let badgeHtml = '';
          if (resourceAvailabilityMode) {
            const badgeBg = isWinterConnected
              ? 'bg-emerald-600'
              : isApplied
              ? 'bg-amber-600'
              : isTuIssued
              ? 'bg-sky-600'
              : 'bg-rose-600';
            const badgeIcon = isWinterConnected
              ? '💧 Подкл.'
              : isApplied
              ? '⏳ Заявка'
              : isTuIssued
              ? '📋 ТУ'
              : '❌ Нет';

            badgeHtml = `<span class="px-1 py-0.2 rounded font-bold text-[8px] text-white shadow-xs ${badgeBg} whitespace-nowrap mt-0.5">${badgeIcon}</span>`;
          }

          const canDragPlot = Boolean(canEditNetworks !== false && !isMapLocked);
          const labelHtml = `
            <div class="flex flex-col items-center justify-center select-none text-center ${
              canDragPlot ? 'cursor-grab active:cursor-grabbing hover:scale-110 transition-transform' : 'pointer-events-none'
            }">
              <span class="px-1.5 py-0.5 rounded font-bold font-mono text-[11px] bg-slate-900/90 text-white shadow-sm leading-none whitespace-nowrap flex items-center gap-0.5">
                ${canDragPlot ? '<span class="text-[9px] text-amber-300">✥</span>' : ''}№ ${plot.number}
              </span>
              <span class="text-[9px] font-mono font-semibold px-1 rounded bg-white/95 text-slate-700 shadow-xs mt-0.5 whitespace-nowrap border border-slate-300">
                :${cadTail}
              </span>
              ${badgeHtml}
            </div>
          `;

          const labelIcon = L.divIcon({
            html: labelHtml,
            className: 'custom-plot-label',
            iconSize: [46, 36],
            iconAnchor: [23, 18],
          });

          const labelMarker = L.marker([plot.coordinates.lat, plot.coordinates.lng], {
            icon: labelIcon,
            interactive: true,
            draggable: canDragPlot,
          });

          let dragStartPlotCoord: Coordinates = { ...plot.coordinates };
          const origPolygonPts: Coordinates[] =
            plot.polygon && plot.polygon.length > 0
              ? plot.polygon
              : [
                  { lat: plot.coordinates.lat - 0.00018, lng: plot.coordinates.lng - 0.00028 },
                  { lat: plot.coordinates.lat + 0.00018, lng: plot.coordinates.lng - 0.00028 },
                  { lat: plot.coordinates.lat + 0.00018, lng: plot.coordinates.lng + 0.00028 },
                  { lat: plot.coordinates.lat - 0.00018, lng: plot.coordinates.lng + 0.00028 },
                ];

          labelMarker.on('dragstart', () => {
            mapInstanceRef.current?.dragging.disable();
            dragStartPlotCoord = { lat: plot.coordinates.lat, lng: plot.coordinates.lng };
          });

          labelMarker.on('drag', (e: any) => {
            const currentPos = e.target.getLatLng();
            const deltaLat = currentPos.lat - dragStartPlotCoord.lat;
            const deltaLng = currentPos.lng - dragStartPlotCoord.lng;

            const shiftedLatLngs: [number, number][] = origPolygonPts.map((pt) => [
              pt.lat + deltaLat,
              pt.lng + deltaLng,
            ]);
            poly.setLatLngs(shiftedLatLngs);
          });

          labelMarker.on('dragend', (e: any) => {
            mapInstanceRef.current?.dragging.enable();
            const finalPos = e.target.getLatLng();
            const deltaLat = finalPos.lat - dragStartPlotCoord.lat;
            const deltaLng = finalPos.lng - dragStartPlotCoord.lng;

            const newPlotCoords: Coordinates = {
              lat: Number((dragStartPlotCoord.lat + deltaLat).toFixed(6)),
              lng: Number((dragStartPlotCoord.lng + deltaLng).toFixed(6)),
            };

            const newPolygonPts: Coordinates[] = origPolygonPts.map((pt) => ({
              lat: Number((pt.lat + deltaLat).toFixed(6)),
              lng: Number((pt.lng + deltaLng).toFixed(6)),
            }));

            const updatedPlot: Plot = {
              ...plot,
              coordinates: newPlotCoords,
              polygon: newPolygonPts,
            };

            if (onUpdateCoordinates) {
              onUpdateCoordinates('plot', plot.id, newPlotCoords);
            }
            if (onUpdatePlot) {
              onUpdatePlot(updatedPlot);
            }
            setActivePlot(updatedPlot);
          });

          labelMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setActivePlot(plot);
            onSelectPlot(plot);
          });

          labelMarker.bindTooltip(
            `<b>Участок № ${plot.number}</b> · ${plot.ownerName || 'Собственник'}<br/>` +
              `<span class="text-amber-600 font-semibold text-[10px]">✥ Зажмите и тащите (Drag & Drop) для перемещения участка с границами</span>`,
            { direction: 'top', offset: [0, -18] }
          );

          plotLabels.addLayer(labelMarker);
        }
      });
    }

    // 9. DRAINAGE / STORMWATER
    if (visibleLayers.drainage && drainage) {
      pipelines
        .filter((p) => p.networkType === 'stormwater')
        .forEach((ditch) => {
          const latLngs = ditch.path.map((c) => [c.lat, c.lng] as [number, number]);
          const line = L.polyline(latLngs, {
            color: '#0891b2',
            weight: 4,
            dashArray: '4, 4',
            opacity: 0.85,
          });
          line.bindTooltip(`<b>${ditch.code}</b><br/>${ditch.material}<br/>Сброс в протоку реки Обь`, { sticky: true });
          line.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedNetworkItem({ type: 'pipeline', data: ditch });
          });
          drainage.addLayer(line);
        });
    }
  }, [
    visibleLayers,
    season,
    selectedPlotId,
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
    wifiHotspots,
    barrierGates,
    adminFacilities,
    cctvCameras,
    isMapLocked,
    focusBoundaryMask,
    showCadastralLabels,
    showNspdOverlay,
    resourceAvailabilityMode,
    resourceUtilityType,
    resourceFilter,
    editingPolygonTarget,
    boundaryPoints,
    onSelectPlot,
    onSelectWell,
    onUpdateCoordinates,
    canEditNetworks,
    waterMeteringNodes,
    onUpdateWaterMeteringNode,
    onUpdatePlot,
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

  const handleRotate = (delta: number) => {
    const next = ((rotationAngle + delta) % 360 + 360) % 360;
    setRotationAngle(next);
    const map = mapInstanceRef.current;
    if (map && typeof (map as any).setBearing === 'function') {
      (map as any).setBearing(next, { animate: true, duration: 0.25 });
    }
  };

  const handleSetExactAngle = (angle: number) => {
    const normalized = ((angle % 360) + 360) % 360;
    setRotationAngle(normalized);
    const map = mapInstanceRef.current;
    if (map && typeof (map as any).setBearing === 'function') {
      (map as any).setBearing(normalized, { animate: true, duration: 0.3 });
    }
  };

  // Save from Modal
  const handleModalSave = (type: EditableObjectType, data: any) => {
    if (editorMode === 'create') {
      if (type === 'pipeline' && onAddPipeline) onAddPipeline(data);
      else if (type === 'well' && onAddWell) onAddWell(data);
      else if (type === 'valve' && onAddValve) onAddValve(data);
      else if (type === 'switchboard' && onAddSwitchboard) onAddSwitchboard(data);
      else if (type === 'substation' && onAddSubstation) onAddSubstation(data);
      else if (type === 'fireHydrant' && onAddFireHydrant) onAddFireHydrant(data);
      else if (type === 'lightPole' && onAddLightPole) onAddLightPole(data);
      else if (type === 'wifiHotspot' && onAddWifiHotspot) onAddWifiHotspot(data);
      else if (type === 'barrierGate' && onAddBarrierGate) onAddBarrierGate(data);
      else if (type === 'adminFacility' && onAddAdminFacility) onAddAdminFacility(data);
      else if (type === 'wasteSite' && onAddWasteSite) onAddWasteSite(data);
      else if (type === 'snowDump' && onAddSnowDump) onAddSnowDump(data);
      else if (type === 'fireTurnaround' && onAddFireTurnaround) onAddFireTurnaround(data);
      else if (type === 'inspectionPoint' && onAddInspectionPoint) onAddInspectionPoint(data);
      else if (type === 'waterMeteringNode' && onAddWaterMeteringNode) onAddWaterMeteringNode(data);
    } else {
      if (type === 'pipeline' && onUpdatePipeline) onUpdatePipeline(data);
      else if (type === 'well' && onUpdateWell) onUpdateWell(data);
      else if (type === 'valve' && onUpdateValve) onUpdateValve(data);
      else if (type === 'switchboard' && onUpdateSwitchboard) onUpdateSwitchboard(data);
      else if (type === 'substation' && onUpdateSubstation) onUpdateSubstation(data);
      else if (type === 'fireHydrant' && onUpdateFireHydrant) onUpdateFireHydrant(data);
      else if (type === 'lightPole' && onUpdateLightPole) onUpdateLightPole(data);
      else if (type === 'wifiHotspot' && onUpdateWifiHotspot) onUpdateWifiHotspot(data);
      else if (type === 'barrierGate' && onUpdateBarrierGate) onUpdateBarrierGate(data);
      else if (type === 'adminFacility' && onUpdateAdminFacility) onUpdateAdminFacility(data);
      else if (type === 'wasteSite' && onUpdateWasteSite) onUpdateWasteSite(data);
      else if (type === 'snowDump' && onUpdateSnowDump) onUpdateSnowDump(data);
      else if (type === 'fireTurnaround' && onUpdateFireTurnaround) onUpdateFireTurnaround(data);
      else if (type === 'inspectionPoint' && onUpdateInspectionPoint) onUpdateInspectionPoint(data);
      else if (type === 'gasRegulator' && onUpdateGasRegulator) onUpdateGasRegulator(data);
      else if (type === 'waterMeteringNode' && onUpdateWaterMeteringNode) onUpdateWaterMeteringNode(data);
    }

    setDrawnLinePoints([]);
    setEditTool('select');
  };

  // Handle Delete
  const handleDeleteItem = (type: string, id: string) => {
    if (type === 'pipeline' && onDeletePipeline) onDeletePipeline(id);
    else if (type === 'well' && onDeleteWell) onDeleteWell(id);
    else if (type === 'valve' && onDeleteValve) onDeleteValve(id);
    else if (type === 'switchboard' && onDeleteSwitchboard) onDeleteSwitchboard(id);
    else if (type === 'substation' && onDeleteSubstation) onDeleteSubstation(id);
    else if (type === 'fireHydrant' && onDeleteFireHydrant) onDeleteFireHydrant(id);
    else if (type === 'lightPole' && onDeleteLightPole) onDeleteLightPole(id);
    else if (type === 'wifiHotspot' && onDeleteWifiHotspot) onDeleteWifiHotspot(id);
    else if (type === 'barrierGate' && onDeleteBarrierGate) onDeleteBarrierGate(id);
    else if (type === 'adminFacility' && onDeleteAdminFacility) onDeleteAdminFacility(id);
    else if (type === 'wasteSite' && onDeleteWasteSite) onDeleteWasteSite(id);
    else if (type === 'snowDump' && onDeleteSnowDump) onDeleteSnowDump(id);
    else if (type === 'fireTurnaround' && onDeleteFireTurnaround) onDeleteFireTurnaround(id);
    else if (type === 'inspectionPoint' && onDeleteInspectionPoint) onDeleteInspectionPoint(id);
    else if (type === 'waterMeteringNode' && onDeleteWaterMeteringNode) onDeleteWaterMeteringNode(id);
    else if (type === 'plot' && onDeletePlot) onDeletePlot(id);

    if (selectedNetworkItem?.data?.id === id) {
      setSelectedNetworkItem(null);
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
      alert('Для прокладки трассы поставьте на карте минимум 2 точки!');
      return;
    }
    openCreateForTarget(activeEditTarget, undefined, drawnLinePoints);
  };

  const copyCadastralToClipboard = (cadastral: string) => {
    navigator.clipboard.writeText(cadastral);
    setCopyFeedback(cadastral);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Resource Availability Statistics
  const connectedWinterWaterCount = plots.filter((p) => p.utilities.winterWater.connected).length;
  const appliedWinterWaterCount = plots.filter((p) => p.utilities.winterWater.status === 'applied').length;
  const tuIssuedWinterWaterCount = plots.filter((p) => p.utilities.winterWater.status === 'tu_issued').length;
  const unconnectedWinterWaterCount = plots.filter((p) => !p.utilities.winterWater.connected && p.utilities.winterWater.status === 'none').length;
  const totalFreePortsInWells = wells
    .filter((w) => w.type === 'water_winter')
    .reduce((sum, w) => sum + w.freePorts, 0);

  // Active plot nearest well calculation
  const activePlotNearestWell = activePlot ? findNearestWellWithFreePorts(activePlot.coordinates, wells) : null;

  return (
    <div className="relative w-full h-[680px] lg:h-[750px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-lg">
      {/* Map Container with Mouse and Trackpad Rotation */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMapMouseDown}
        onContextMenu={(e) => {
          // Prevent browser context menu on right click to enable smooth right-click rotation
          e.preventDefault();
        }}
        className={`w-full h-full z-0 ${isRotatingWithMouse ? 'cursor-grabbing select-none' : ''}`}
      />

      {/* Rotating HUD Badge overlay during mouse rotation */}
      {isRotatingWithMouse && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none select-none flex items-center gap-3 px-5 py-2.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700 animate-fadeIn">
          <Compass className="w-6 h-6 text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
          <div className="flex flex-col">
            <span className="font-mono font-bold text-base leading-none">Поворот: {rotationAngle}°</span>
            <span className="text-[10px] text-slate-300 mt-0.5">Вращение карты (ПКМ / Shift+Drag)</span>
          </div>
        </div>
      )}

      {/* TOP-LEFT FLOATING BAR: PRIMARY TOOLS & DRAWER TRIGGER */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 max-w-sm sm:max-w-2xl">
        {/* Main Action Bar */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md text-xs">
          {/* Side Drawer Toggle (Слои & Кадастр НСПД) */}
          <button
            onClick={() => setIsSideMenuOpen(!isSideMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shadow-xs ${
              isSideMenuOpen
                ? 'bg-sky-700 text-white ring-2 ring-sky-300'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
            }`}
            title="Открыть боковое меню инженерных слоёв, Кадастра НСПД и карты доступности ресурсов"
          >
            <Menu className="w-4 h-4 text-sky-600" />
            <span>🗂️ Слои & Кадастр</span>
          </button>

          {/* Map & Elements Displacement Lock Toggle (Item 7) */}
          <button
            onClick={() => setIsMapLocked(!isMapLocked)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-xs ${
              isMapLocked
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-amber-500 text-white hover:bg-amber-600 animate-pulse'
            }`}
            title={
              isMapLocked
                ? 'Карта и элементы закреплены от случайных сдвигов. Нажмите для включения режима перемещения'
                : 'Режим свободного перемещения (Drag & Drop) включен! Нажмите для закрепления элементов'
            }
          >
            {isMapLocked ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5 text-white" />}
            <span>{isMapLocked ? '🔒 Закреплено' : '🔓 Drag&Drop'}</span>
          </button>

          {/* Add Network Element Button */}
          <button
            onClick={() => openCreateWizard()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all active:scale-98"
            title="Добавить элемент сети (колодец, задвижка, КТПН, узел учёта, фонарь, шлагбаум и т.д.)"
          >
            <Plus className="w-4 h-4 text-emerald-100" />
            <span className="hidden sm:inline">+ Элемент</span>
          </button>

          {/* Add Plot Button */}
          {canEditNetworks && (
            <button
              onClick={() => setIsAddingPlotOnMap(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all active:scale-98"
              title="Добавить новый земельный участок с привязкой кадастрового номера и границ"
            >
              <Home className="w-4 h-4 text-blue-100" />
              <span className="hidden sm:inline">+ Участок</span>
            </button>
          )}

          {/* Network Tracing Mode Toggle */}
          <button
            onClick={() => {
              setIsEditingMode(!isEditingMode);
              if (isEditingMode) {
                setDrawnLinePoints([]);
                setEditTool('select');
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              isEditingMode
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
            title="Режим прокладки и трассировки сетей"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Трассировка</span>
          </button>
        </div>

        {/* NOTIFICATION TOAST: PIPELINE AUTO-SNAPPING */}
        {pipelineSnapNotice && (
          <div className="p-2 px-3 bg-emerald-900/95 backdrop-blur-md text-white rounded-xl shadow-lg border border-emerald-400 text-xs flex items-center justify-between gap-2 animate-fadeIn">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {pipelineSnapNotice}
            </span>
            <button
              onClick={() => setPipelineSnapNotice(null)}
              className="p-0.5 hover:bg-emerald-800 rounded text-emerald-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* NOTIFICATION TOAST: ALIGN PLOTS SUCCESS */}
        {alignPlotsSuccess && (
          <div className="p-2 px-3 bg-indigo-900/95 backdrop-blur-md text-white rounded-xl shadow-lg border border-indigo-400 text-xs flex items-center justify-between gap-2 animate-fadeIn">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              {alignPlotsSuccess}
            </span>
            <button
              onClick={() => setAlignPlotsSuccess(null)}
              className="p-0.5 hover:bg-indigo-800 rounded text-indigo-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ACTIVE EDITING CONTROLS when isEditingMode is ON */}
        {isEditingMode && (
          <div className="p-3 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-rose-400 shadow-xl text-xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                Послойное редактирование и прокладка
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Трассы с привязкой (Snap)</span>
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
                <optgroup label="Трубопроводы и кабельные трассы (Линии)">
                  <option value="pipe_water_winter">💧 Зимний водопровод (глубокий)</option>
                  <option value="pipe_water_summer">🚿 Летний поливочный водопровод</option>
                  <option value="pipe_electricity">⚡ Кабель / ВЛ-0.4кВ электросети</option>
                  <option value="pipe_gas">🔥 Газопроводная магистраль</option>
                  <option value="pipe_stormwater">🌧️ Ливневая канава / лоток</option>
                </optgroup>
                <optgroup label="Точечные узлы и оборудование (Координаты)">
                  <option value="well">🚰 Водопроводный колодец (КВ)</option>
                  <option value="valve">⚙️ Задвижка / Запорная арматура (ЗК)</option>
                  <option value="switchboard">🎛️ Электрощитовая ВРУ / ШР</option>
                  <option value="substation">🏢 Подстанция КТПН 10/0.4кВ</option>
                  <option value="fireHydrant">🚒 Пожарный гидрант ПГ</option>
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
                {activeEditTarget.startsWith('pipe_') ? '📏 Кликайте для трассы' : '📍 Кликните для узла'}
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
      </div>

      {/* SLIDE-OUT SIDE DRAWER: ИНЖЕНЕРНЫЕ СЛОИ, КАДАСТР НСПД И ДОСТУПНОСТЬ РЕСУРСОВ */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 flex pointer-events-auto">
          {/* Backdrop */}
          <div
            onClick={() => setIsSideMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-out Menu Panel */}
          <div className="relative w-84 sm:w-96 bg-white/98 backdrop-blur-md shadow-2xl h-full flex flex-col z-10 border-r border-slate-200 overflow-y-auto animate-fadeIn select-none">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Слои & Кадастр НСПД</h3>
                  <p className="text-[11px] text-slate-500 font-mono">ДТСН «Пенсионер» · 54:19:112001</p>
                </div>
              </div>
              <button
                onClick={() => setIsSideMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                title="Закрыть меню"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* SECTION 1: ENGINEERING LAYERS */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-600" />
                    Инженерные слои
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-mono font-bold">
                    {Object.values(visibleLayers).filter(Boolean).length} акт.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => setVisibleLayers((prev) => ({ ...prev, water: !prev.water }))}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      visibleLayers.water
                        ? 'bg-sky-50 text-sky-900 border border-sky-200 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Водопровод (Зима/Лето) & КВ</span>
                    </span>
                    <span className="text-[11px]">{visibleLayers.water ? '✅' : '⚪'}</span>
                  </button>

                  <button
                    onClick={() => setVisibleLayers((prev) => ({ ...prev, electric: !prev.electric }))}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      visibleLayers.electric
                        ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Электросети (КТПН, ВРУ, Фонари)</span>
                    </span>
                    <span className="text-[11px]">{visibleLayers.electric ? '✅' : '⚪'}</span>
                  </button>

                  <button
                    onClick={() => setVisibleLayers((prev) => ({ ...prev, gas: !prev.gas }))}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      visibleLayers.gas
                        ? 'bg-yellow-50 text-yellow-900 border border-yellow-200 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-yellow-600 shrink-0" />
                      <span>Газоснабжение & ГРПШ</span>
                    </span>
                    <span className="text-[11px]">{visibleLayers.gas ? '✅' : '⚪'}</span>
                  </button>

                  <button
                    onClick={() => setVisibleLayers((prev) => ({ ...prev, wifi: !prev.wifi }))}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      visibleLayers.wifi
                        ? 'bg-blue-50 text-blue-900 border border-blue-200 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span>Wi-Fi & Видеонаблюдение CCTV</span>
                        <p className="text-[10px] text-blue-600 font-normal">Точки доступа, камеры и опоры ЛЭП</p>
                      </div>
                    </span>
                    <span className="text-[11px]">{visibleLayers.wifi ? '✅' : '⚪'}</span>
                  </button>

                  <button
                    onClick={() => setVisibleLayers((prev) => ({ ...prev, barriers: !prev.barriers }))}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      visibleLayers.barriers
                        ? 'bg-slate-100 text-slate-900 border border-slate-300 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-slate-700 shrink-0" />
                      <span>Шлагбаумы GSM & КПП</span>
                    </span>
                    <span className="text-[11px]">{visibleLayers.barriers ? '✅' : '⚪'}</span>
                  </button>

                  <button
                    onClick={() => setVisibleLayers((prev) => ({ ...prev, facilities: !prev.facilities }))}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      visibleLayers.facilities
                        ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Здание Правления & Склад</span>
                    </span>
                    <span className="text-[11px]">{visibleLayers.facilities ? '✅' : '⚪'}</span>
                  </button>

                  <button
                    onClick={() => setVisibleLayers((prev) => ({ ...prev, seasonal: !prev.seasonal }))}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      visibleLayers.seasonal
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Snowflake className="w-4 h-4 text-sky-500 shrink-0" />
                      <div>
                        <span>Снегоотвалы & МЧС</span>
                        <p className="text-[10px] text-emerald-700 font-normal">Баки ТБО, пожарные развороты, обходы</p>
                      </div>
                    </span>
                    <span className="text-[11px]">{visibleLayers.seasonal ? '✅' : '⚪'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION 2: NSPD CADASTRE & PLOT BOUNDARY ALIGNMENT */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                    Кадастр НСПД (nspd.gov.ru)
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400">Квартал 54:19:112001</span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Automatic Plot Alignment Tool (Item 1) */}
                  <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-1.5">
                    <div className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                      <span>📐 Привязка участков к кадастру</span>
                    </div>
                    <p className="text-[11px] text-indigo-800 leading-snug">
                      Автоматически синхронизирует и центрирует все участки внутри фактических границ выделенной территории ДТСН.
                    </p>
                    <button
                      onClick={handleAlignPlotsToCadastre}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-center transition-colors shadow-xs"
                    >
                      Привязать участки к карте территории
                    </button>
                  </div>

                  <button
                    onClick={() => setFocusBoundaryMask(!focusBoundaryMask)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      focusBoundaryMask
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {focusBoundaryMask ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                      <span>Фокус границ ДТСН (Маска)</span>
                    </span>
                    <span className="text-[10px] font-mono">{focusBoundaryMask ? 'ВКЛ' : 'ВЫКЛ'}</span>
                  </button>

                  <button
                    onClick={() => setShowCadastralLabels(!showCadastralLabels)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      showCadastralLabels
                        ? 'bg-rose-50 text-rose-900 border border-rose-200 font-bold'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🏷️</span>
                      <span>Номера участков & Кадастровые №</span>
                    </span>
                    <span className="text-[10px] font-mono">{showCadastralLabels ? 'ВКЛ' : 'ВЫКЛ'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSideMenuOpen(false);
                      handleStartEditingBoundary();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-semibold transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Move className="w-4 h-4 text-rose-600" />
                      <span>Правка границы ДТСН (Push & Pull)</span>
                    </span>
                    <span className="text-xs">✏️</span>
                  </button>
                </div>
              </div>

              {/* SECTION 3: RESOURCE AVAILABILITY */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Доступность ресурсов (Правление)
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    {totalFreePortsInWells} врезок в КВ
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setResourceAvailabilityMode(!resourceAvailabilityMode)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl font-bold transition-all text-xs ${
                      resourceAvailabilityMode
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>Подсветка подключений участков</span>
                    <span>{resourceAvailabilityMode ? 'ВКЛЮЧЕНА' : 'ОТКЛ'}</span>
                  </button>

                  {resourceAvailabilityMode && (
                    <div className="space-y-2 pt-1 animate-fadeIn text-xs">
                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                        <button
                          onClick={() => setResourceUtilityType('winter_water')}
                          className={`flex-1 py-1 rounded-lg font-semibold transition-all text-center ${
                            resourceUtilityType === 'winter_water' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          💧 Вода
                        </button>
                        <button
                          onClick={() => setResourceUtilityType('electricity')}
                          className={`flex-1 py-1 rounded-lg font-semibold transition-all text-center ${
                            resourceUtilityType === 'electricity' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          ⚡ Э/Э
                        </button>
                        <button
                          onClick={() => setResourceUtilityType('gas')}
                          className={`flex-1 py-1 rounded-lg font-semibold transition-all text-center ${
                            resourceUtilityType === 'gas' ? 'bg-white text-yellow-800 shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          🔥 Газ
                        </button>
                      </div>

                      {resourceUtilityType === 'winter_water' && (
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <button
                            onClick={() => setResourceFilter(resourceFilter === 'connected' ? 'all' : 'connected')}
                            className={`p-1.5 rounded-lg border text-left transition-all ${
                              resourceFilter === 'connected'
                                ? 'bg-emerald-100 border-emerald-500 font-bold'
                                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <span>🟢 Подключено</span>
                              <b>{connectedWinterWaterCount}</b>
                            </span>
                          </button>
                          <button
                            onClick={() => setResourceFilter(resourceFilter === 'applied' ? 'all' : 'applied')}
                            className={`p-1.5 rounded-lg border text-left transition-all ${
                              resourceFilter === 'applied'
                                ? 'bg-amber-100 border-amber-500 font-bold'
                                : 'bg-amber-50/70 border-amber-200 text-amber-950'
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <span>🟡 В очереди</span>
                              <b>{appliedWinterWaterCount}</b>
                            </span>
                          </button>
                          <button
                            onClick={() => setResourceFilter(resourceFilter === 'tu_issued' ? 'all' : 'tu_issued')}
                            className={`p-1.5 rounded-lg border text-left transition-all ${
                              resourceFilter === 'tu_issued'
                                ? 'bg-sky-100 border-sky-500 font-bold'
                                : 'bg-sky-50/70 border-sky-200 text-sky-950'
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <span>🔵 ТУ выданы</span>
                              <b>{tuIssuedWinterWaterCount}</b>
                            </span>
                          </button>
                          <button
                            onClick={() => setResourceFilter(resourceFilter === 'none' ? 'all' : 'none')}
                            className={`p-1.5 rounded-lg border text-left transition-all ${
                              resourceFilter === 'none'
                                ? 'bg-rose-100 border-rose-500 font-bold'
                                : 'bg-rose-50/70 border-rose-200 text-rose-950'
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <span>🔴 Без воды</span>
                              <b>{unconnectedWinterWaterCount}</b>
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: TILE PROVIDER */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Подложка карты</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setTileProvider('osm')}
                    className={`py-2 rounded-xl font-bold transition-all border ${
                      tileProvider === 'osm'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    🗺️ OpenStreetMap
                  </button>
                  <button
                    onClick={() => setTileProvider('satellite')}
                    className={`py-2 rounded-xl font-bold transition-all border ${
                      tileProvider === 'satellite'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    🛰️ Спутник
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* FLOATING TOP-CENTER BAR FOR GEOMETRY EDITING (PUSH & PULL OF POINTS) */}
      {editingPolygonTarget && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 max-w-xl w-[94%] sm:w-auto animate-fadeIn select-none">
          <div className="p-2.5 sm:p-3 bg-slate-900/98 backdrop-blur-md text-white rounded-2xl shadow-2xl border-2 border-blue-500 text-xs flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
              <div className="flex flex-col">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-blue-400" />
                  {editingPolygonTarget.type === 'plot'
                    ? `Контур участка № ${editingPolygonTarget.number}`
                    : editingPolygonTarget.label}
                </span>
                <span className="text-[10px] text-blue-300 font-mono">
                  {workingPolygonPoints.length} вершин · {calculatePolygonAreaSqm(workingPolygonPoints)} м² · периметр {calculatePolygonPerimeterMeters(workingPolygonPoints)} м
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Add Point click toggle */}
              <button
                type="button"
                onClick={() => setIsAddVertexClickMode(!isAddVertexClickMode)}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all text-xs ${
                  isAddVertexClickMode
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
                }`}
                title="Режим добавления вершин кликом по карте"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px]">{isAddVertexClickMode ? 'Кликните по карте' : 'Добавить точку'}</span>
              </button>

              {/* Undo Step */}
              <button
                type="button"
                onClick={handleUndoGeometry}
                disabled={geometryHistory.length === 0}
                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl transition-colors"
                title="Отменить последний шаг"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              {/* Save Geometry */}
              <button
                type="button"
                onClick={handleSaveGeometry}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1 transition-colors shadow-sm"
              >
                {isSaveSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" /> : <Check className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{isSaveSuccess ? 'Сохранено!' : 'Сохранить'}</span>
              </button>

              {/* Cancel / Finish */}
              <button
                type="button"
                onClick={handleCancelGeometry}
                className="px-2.5 py-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 rounded-xl transition-colors text-[11px]"
              >
                Завершить
              </button>
            </div>
          </div>

          {/* Quick interactive hint bar */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-slate-300 border border-slate-700 shadow-md flex items-center gap-2">
            <span>💡 <b>Тяните синие точки</b> (push & pull)</span>
            <span>•</span>
            <span><b>Тяните зеленые [+]</b> для создания новых вершин</span>
            <span>•</span>
            <span className="text-rose-300"><b>ПКМ</b> по точке — удалить</span>
          </div>
        </div>
      )}

      {/* TOP RIGHT: COMPASS, ROTATION & RESOURCE LEGEND */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        {isCompassCollapsed ? (
          <button
            onClick={() => setIsCompassCollapsed(false)}
            className="flex items-center gap-1.5 p-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            title="Развернуть ориентацию и поворот карты"
          >
            <Compass className="w-4 h-4 text-rose-500" />
            <span className="font-mono text-[11px]">{rotationAngle}°</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        ) : (
          <div className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md text-xs space-y-2 flex flex-col items-center animate-fadeIn">
            <div className="flex items-center justify-between w-full pb-1 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <Compass className="w-3 h-3 text-rose-500" />
                Ориентация
              </span>
              <button
                onClick={() => setIsCompassCollapsed(true)}
                className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ml-2"
                title="Скрыть панель поворота"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRotate(-15)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="Повернуть против часовой стрелки (-15°)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Interactive Compass Rose (Click to reset to North, or drag to rotate) */}
              <div
                onMouseDown={handleCompassMouseDown}
                onClick={(e) => {
                  if (rotationAngle !== 0) handleSetExactAngle(0);
                }}
                className="cursor-pointer relative w-11 h-11 rounded-full border-2 border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center shadow-inner hover:scale-105 active:scale-95 transition-all select-none"
                title="Клик: сбросить на Север (0°). Перетаскивание: повернуть карту"
              >
                <div
                  className="w-1.5 h-8 rounded-full flex flex-col items-center justify-between pointer-events-none"
                  style={{ transform: `rotate(${-rotationAngle}deg)`, transition: isRotatingWithMouse ? 'none' : 'transform 0.25s ease-out' }}
                >
                  <div className="w-2.5 h-3.5 bg-rose-600 rounded-t-full shadow-sm"></div>
                  <div className="w-2.5 h-3.5 bg-slate-600 rounded-b-full shadow-xs"></div>
                </div>
                <span className="absolute -top-1 text-[8px] font-bold text-rose-600 font-mono pointer-events-none">N</span>
                <span className="absolute -bottom-1 text-[8px] font-bold text-slate-500 font-mono pointer-events-none">S</span>
              </div>

              <button
                onClick={() => handleRotate(15)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="Повернуть по часовой стрелке (+15°)"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono font-semibold text-slate-600">
              <span>Азимут:</span>
              <span className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{rotationAngle}°</span>
            </div>

            {/* Quick Bearing Presets */}
            <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] w-full pt-0.5">
              <button
                onClick={() => handleSetExactAngle(0)}
                className={`px-1.5 py-0.5 rounded transition-all ${rotationAngle === 0 ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                title="Север (0°)"
              >
                0° N
              </button>
              <button
                onClick={() => handleSetExactAngle(38)}
                className={`px-1.5 py-0.5 rounded transition-all ${rotationAngle === 38 ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                title="Ориентация вдоль ул. Центральная (38°)"
              >
                38°
              </button>
              <button
                onClick={() => handleSetExactAngle(90)}
                className={`px-1.5 py-0.5 rounded transition-all ${rotationAngle === 90 ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                title="Восток (90°)"
              >
                90° E
              </button>
              <button
                onClick={() => handleSetExactAngle(180)}
                className={`px-1.5 py-0.5 rounded transition-all ${rotationAngle === 180 ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                title="Юг (180°)"
              >
                180°
              </button>
              <button
                onClick={() => handleSetExactAngle(270)}
                className={`px-1.5 py-0.5 rounded transition-all ${rotationAngle === 270 ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                title="Запад (270°)"
              >
                270°
              </button>
            </div>

            {/* Quick interaction helper pill */}
            <div className="pt-1 border-t border-slate-100 w-full text-center">
              <span
                className="text-[9px] text-slate-500 font-medium block leading-tight hover:text-slate-700 cursor-help"
                title="Способы поворота карты:&#10;• Правая кнопка мыши (ПКМ) + перетаскивание влево/вправо&#10;• Shift + колесо мыши или тачпад&#10;• Жест поворота двумя пальцами на трекпаде&#10;• Вращение стрелки компаса мышью"
              >
                🖱️ ПКМ / Shift+Колесо / Тачпад
              </span>
            </div>
          </div>
        )}
      </div>

      {/* NETWORK LAYER INSPECTOR DRAWER */}
      <NetworkLayerInspector
        selectedItem={selectedNetworkItem}
        onClose={() => setSelectedNetworkItem(null)}
        onEdit={(type, data) => openEditForItem(type, data)}
        onCopy={(type, data) => handleCopyItem(type, data)}
        onDelete={(type, id) => handleDeleteItem(type, id)}
        onToggleValve={onToggleValve}
        onStartWinterConnection={(well) => {
          const fakePlot = plots.find((p) => !p.utilities.winterWater.connected) || plots[0];
          onStartWinterConnection(fakePlot);
        }}
        onUpdatePhotos={(type, id, newPhotos) => {
          if (onUpdatePhotos) {
            onUpdatePhotos(type, id, newPhotos);
          }
          setSelectedNetworkItem((prev) =>
            prev && prev.data?.id === id ? { ...prev, data: { ...prev.data, photos: newPhotos } } : prev
          );
        }}
      />

      {/* BOTTOM POPUP CARD FOR SELECTED PLOT (WITH NSPD & RESOURCE AVAILABILITY ACTIONS) */}
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

          {/* Action buttons for plot: Geometry deformation and Data editing */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleStartEditingPlot(activePlot)}
              className="py-2 px-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
              title="Перемещать вершины и изменять форму контура участка"
            >
              <Move className="w-3.5 h-3.5 text-blue-200" />
              <span>Вершины (Push&Pull)</span>
            </button>

            <button
              type="button"
              onClick={() => setEditingPlotData(activePlot)}
              className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
              title="Редактировать кадастровые данные, собственника, площадь и коммуникации"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-100" />
              <span>Редактировать</span>
            </button>
          </div>

          {/* Drag & Drop Hint */}
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <b>Совет:</b> Зажмите и перетаскивайте метку <b>№ {activePlot.number}</b> по карте, чтобы переместить весь участок целиком.
            </span>
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

          {/* Resource Availability Quick Action for Board Members */}
          {!activePlot.utilities.winterWater.connected ? (
            <div className="space-y-1.5 pt-1">
              {activePlotNearestWell?.well && (
                <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-900 flex items-center justify-between">
                  <span>Ближайший колодец: <b>{activePlotNearestWell.well.code}</b> ({activePlotNearestWell.directDistanceMeters} м)</span>
                  <span className="font-bold text-emerald-700">{activePlotNearestWell.well.freePorts} свободных врезок</span>
                </div>
              )}

              <button
                onClick={() => onStartWinterConnection(activePlot)}
                className="w-full py-2 px-3 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Droplet className="w-4 h-4 text-sky-200" />
                <span>Оформить ТУ на подключение (Мастер Правления)</span>
              </button>
            </div>
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
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Глубина колодца</span>
              <span className="font-mono text-slate-800">
                {activeWell.depthMeters} м (d={activeWell.diameterMm}мм)
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Электроподогрев</span>
              <span className="text-slate-800">
                {activeWell.hasHeatingCable ? '✅ Кабель 17 Вт/м' : '❌ Без подогрева'}
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
        pipelines={pipelines}
        wells={wells}
        valves={valves}
        switchboards={switchboards}
        substations={substations}
        fireHydrants={fireHydrants}
        barrierGates={barrierGates}
        adminFacilities={adminFacilities}
        onSelectItem={(type, item) => handleCenterOnObject(type, item)}
        onAddNew={() => {
          setIsCatalogModalOpen(false);
          openCreateWizard();
        }}
        onEditItem={(type, item) => {
          setIsCatalogModalOpen(false);
          openEditForItem(type, item);
        }}
        onCopyItem={(type, item) => {
          setIsCatalogModalOpen(false);
          handleCopyItem(type, item);
        }}
        onDeleteItem={(type, id) => handleDeleteItem(type, id)}
      />

      {/* NETWORK LAYER EDITOR MODAL */}
      <NetworkLayerEditorModal
        isOpen={isEditorModalOpen}
        mode={editorMode}
        objectType={editorObjectType}
        initialData={editorInitialData}
        defaultCoordinates={editorDefaultCoords}
        defaultPath={editorDefaultPath}
        onSave={handleModalSave}
        onClose={() => {
          setIsEditorModalOpen(false);
          setDrawnLinePoints([]);
          setEditTool('select');
        }}
      />

      {/* PLOT EDITOR MODAL (Добавление нового участка или редактирование данных существующего) */}
      {(isAddingPlotOnMap || editingPlotData) && (
        <PlotEditorModal
          mode={isAddingPlotOnMap ? 'create' : 'edit'}
          plot={editingPlotData}
          existingPlots={plots}
          onClose={() => {
            setIsAddingPlotOnMap(false);
            setEditingPlotData(null);
          }}
          onSave={(savedPlot) => {
            if (isAddingPlotOnMap) {
              if (onAddPlot) {
                onAddPlot(savedPlot);
              }
              setActivePlot(savedPlot);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([savedPlot.coordinates.lat, savedPlot.coordinates.lng], 18, {
                  animate: true,
                });
              }
            } else {
              if (onUpdatePlot) {
                onUpdatePlot(savedPlot);
              }
              setActivePlot(savedPlot);
            }
            setIsAddingPlotOnMap(false);
            setEditingPlotData(null);
          }}
        />
      )}

      {/* COPY / CLONE NOTIFICATION TOAST */}
      {copyToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] px-3 animate-fadeIn">
          <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl border border-sky-400 flex items-start gap-3 backdrop-blur-md">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              ✓
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-emerald-300">Клон создан: {copyToast.code}</p>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">{copyToast.message}</p>
            </div>
            <button
              onClick={() => setCopyToast(null)}
              className="text-slate-400 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
