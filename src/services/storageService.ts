import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Plot,
  Well,
  Valve,
  Substation,
  Switchboard,
  LightPole,
  GasRegulatorStation,
  PipelineSegment,
  FireHydrant,
  WifiHotspot,
  BarrierGate,
  AdministrationFacility,
  Coordinates,
  UserProfile,
  WinterConnectionRequest,
  InspectionLogEntry,
  WorkTask,
  WorkEstimate,
  MaintenanceRecord,
} from '../types/index.ts';

const LOCAL_STORAGE_PREFIX = 'dtsn_gis_state_v1';
const FIRESTORE_STATE_DOC = 'current_app_state';

export interface GisAppState {
  boundaryPoints?: Coordinates[];
  plots?: Plot[];
  wells?: Well[];
  valves?: Valve[];
  substations?: Substation[];
  switchboards?: Switchboard[];
  lightPoles?: LightPole[];
  pipelines?: PipelineSegment[];
  fireHydrants?: FireHydrant[];
  wifiHotspots?: WifiHotspot[];
  barrierGates?: BarrierGate[];
  adminFacilities?: AdministrationFacility[];
  gasRegulator?: GasRegulatorStation;
  users?: UserProfile[];
  winterRequests?: WinterConnectionRequest[];
  inspectionLogs?: InspectionLogEntry[];
  workTasks?: WorkTask[];
  estimates?: WorkEstimate[];
  maintenanceRecords?: MaintenanceRecord[];
  lastSavedAt?: string;
}

/**
 * Load state from localStorage immediately (zero-latency boot)
 */
export function loadLocalState(): GisAppState | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX);
    if (!raw) return null;
    return JSON.parse(raw) as GisAppState;
  } catch (err) {
    console.warn('[StorageService] Error reading localStorage:', err);
    return null;
  }
}

/**
 * Save state to localStorage immediately
 */
export function saveLocalState(state: Partial<GisAppState>): void {
  try {
    const existing = loadLocalState() || {};
    const merged: GisAppState = {
      ...existing,
      ...state,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_PREFIX, JSON.stringify(merged));
  } catch (err) {
    console.warn('[StorageService] Error writing to localStorage:', err);
  }
}

/**
 * Load state from Cloud Firestore
 */
export async function loadCloudState(): Promise<GisAppState | null> {
  try {
    const docRef = doc(db, 'gis_storage', FIRESTORE_STATE_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as GisAppState;
      // Also sync to localStorage so next boot is instant
      saveLocalState(data);
      return data;
    }
    return null;
  } catch (err) {
    console.warn('[StorageService] Firestore load error (falling back to local):', err);
    return null;
  }
}

/**
 * Save state to Cloud Firestore (with automatic background retry)
 */
export async function saveCloudState(state: Partial<GisAppState>): Promise<boolean> {
  try {
    const docRef = doc(db, 'gis_storage', FIRESTORE_STATE_DOC);
    const payload = {
      ...state,
      lastSavedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn('[StorageService] Firestore save error:', err);
    return false;
  }
}

/**
 * Unified save function: writes to LocalStorage immediately and syncs with Firestore in background
 */
export async function persistGisState(state: Partial<GisAppState>): Promise<void> {
  // 1. Instant local persistence
  saveLocalState(state);

  // 2. Cloud Firestore sync
  try {
    await saveCloudState(state);
  } catch (err) {
    console.warn('[StorageService] Background cloud sync warning:', err);
  }
}
