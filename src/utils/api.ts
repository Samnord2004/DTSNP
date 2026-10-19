import {
  PipelineSegment,
  Well,
  Valve,
  Switchboard,
  Substation,
  FireHydrant,
  LightPole,
  WifiHotspot,
  Plot,
  Coordinates,
  BarrierGate,
  AdministrationFacility,
  GasRegulatorStation,
} from '../types/index.ts';

export interface NetworkDataResponse {
  boundary: Coordinates[];
  pipelines: PipelineSegment[];
  wells: Well[];
  valves: Valve[];
  switchboards: Switchboard[];
  substations: Substation[];
  fireHydrants: FireHydrant[];
  lightPoles: LightPole[];
  wifiHotspots: WifiHotspot[];
  plots: Plot[];
  barrierGates: BarrierGate[];
  adminFacilities: AdministrationFacility[];
  gasRegulator: GasRegulatorStation;
}

export async function fetchNetworkData(): Promise<NetworkDataResponse | null> {
  try {
    const res = await fetch('/api/networks');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Could not load data from PostgreSQL backend:', error);
    return null;
  }
}

export async function apiSaveBoundary(polygon: Coordinates[]): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/boundary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polygon }),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save boundary to PostgreSQL:', e);
    return false;
  }
}

export async function apiSavePipeline(pipeline: PipelineSegment): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/pipelines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save pipeline to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeletePipeline(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/pipelines/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete pipeline from PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveWell(well: Well): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/wells', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(well),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save well to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeleteWell(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/wells/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete well from PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveValve(valve: Valve): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/valves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(valve),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save valve to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeleteValve(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/valves/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete valve from PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveSwitchboard(sb: Switchboard): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/switchboards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sb),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save switchboard to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeleteSwitchboard(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/switchboards/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete switchboard from PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveSubstation(sub: Substation): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/substations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save substation to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeleteSubstation(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/substations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete substation from PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveFireHydrant(fh: FireHydrant): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/fire-hydrants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fh),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save fire hydrant to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeleteFireHydrant(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/fire-hydrants/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete fire hydrant from PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveLightPole(lp: LightPole): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/light-poles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lp),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save light pole to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeleteLightPole(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/light-poles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete light pole from PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveWifiHotspot(hs: WifiHotspot): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/wifi-hotspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hs),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save wifi hotspot to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeleteWifiHotspot(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/wifi-hotspots/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete wifi hotspot from PostgreSQL:', e);
    return false;
  }
}

export async function apiSavePlot(plot: Plot): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/plots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plot),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save plot to PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveBarrierGate(bg: BarrierGate): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/barrier-gates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bg),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save barrier gate to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeleteBarrierGate(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/barrier-gates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete barrier gate from PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveAdminFacility(fac: AdministrationFacility): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/admin-facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fac),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save admin facility to PostgreSQL:', e);
    return false;
  }
}

export async function apiDeleteAdminFacility(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/networks/admin-facilities/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete admin facility from PostgreSQL:', e);
    return false;
  }
}

export async function apiSaveGasRegulator(gr: GasRegulatorStation): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/gas-regulator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gr),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save gas regulator to PostgreSQL:', e);
    return false;
  }
}

export async function apiUpdateCoordinates(type: string, id: string, coordinates: Coordinates): Promise<boolean> {
  try {
    const res = await fetch('/api/networks/coordinates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, coordinates }),
    });
    return res.ok;
  } catch (e) {
    console.error(`Failed to update coordinates for ${type} ${id} in PostgreSQL:`, e);
    return false;
  }
}
