/**
 * LocalStorage Persistence Utility for DTSN "Pensioner"
 * Ensures all dragged coordinates, created networks, updated plots, photos,
 * user profiles, work tasks, and registers persist seamlessly across reloads.
 */

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (err) {
    console.warn(`Failed to read from localStorage key "${key}":`, err);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save to localStorage key "${key}":`, err);
  }
}

export function clearAllDtsnStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const keysToRemove = [
      'dtsn_boundary',
      'dtsn_plots',
      'dtsn_pipelines',
      'dtsn_wells',
      'dtsn_valves',
      'dtsn_switchboards',
      'dtsn_substations',
      'dtsn_fire_hydrants',
      'dtsn_light_poles',
      'dtsn_wifi_hotspots',
      'dtsn_barrier_gates',
      'dtsn_admin_facilities',
      'dtsn_gas_regulator',
      'dtsn_work_tasks',
      'dtsn_estimates',
      'dtsn_maintenance_records',
      'dtsn_winter_requests',
      'dtsn_inspection_logs',
      'dtsn_users',
      'dtsn_current_user_id',
      'dtsn_active_season',
      'dtsn_water_metering_nodes',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('Failed to clear DTSN storage:', err);
  }
}
