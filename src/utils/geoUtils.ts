import { Coordinates, Well, Plot } from '../types/index.ts';

/**
 * Calculates Haversine distance between two coordinates in meters
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the nearest well to a plot that has at least one free port
 */
export function findNearestWellWithFreePorts(
  plotCoords: Coordinates,
  wells: Well[]
): {
  well: Well | null;
  directDistanceMeters: number;
  estimatedRouteLengthMeters: number;
  allEligibleWells: { well: Well; distanceMeters: number }[];
} {
  const waterWinterWells = wells.filter(
    (w) => w.type === 'water_winter' && w.freePorts > 0
  );

  if (waterWinterWells.length === 0) {
    return {
      well: null,
      directDistanceMeters: 0,
      estimatedRouteLengthMeters: 0,
      allEligibleWells: [],
    };
  }

  const eligibleWithDist = waterWinterWells.map((w) => {
    const dist = calculateDistanceMeters(plotCoords, w.coordinates);
    return { well: w, distanceMeters: dist };
  });

  eligibleWithDist.sort((a, b) => a.distanceMeters - b.distanceMeters);

  const nearest = eligibleWithDist[0];
  // Route along road verge / boundaries is approximately 1.15 - 1.25x direct distance
  const estimatedRoute = Math.round(nearest.distanceMeters * 1.18);

  return {
    well: nearest.well,
    directDistanceMeters: nearest.distanceMeters,
    estimatedRouteLengthMeters: estimatedRoute,
    allEligibleWells: eligibleWithDist,
  };
}

/**
 * Calculates earthworks and material requirements for trench laying in Novosibirsk region
 */
export function calculateTrenchParameters(
  routeLengthMeters: number,
  depthMeters = 2.8,
  widthMeters = 0.6
) {
  const trenchVolumeCbm = Math.round(routeLengthMeters * depthMeters * widthMeters * 10) / 10;
  const sandBeddingCbm = Math.round(routeLengthMeters * widthMeters * 0.15 * 10) / 10; // 15 cm sand cushion
  const backfillCbm = Math.round((trenchVolumeCbm - sandBeddingCbm) * 10) / 10;
  const heatingCableLengthMeters = Math.round(routeLengthMeters * 1.08); // +8% for entries & turns
  const warningTapeLengthMeters = routeLengthMeters;

  // Cost estimates based on Novosibirsk 2026 rates
  const earthworksMechanizedCost = Math.round(trenchVolumeCbm * 850); // mini-excavator
  const pipeCost = Math.round(routeLengthMeters * 320); // HDPE 32mm SDR11
  const cableCost = Math.round(heatingCableLengthMeters * 480); // 17W/m self-regulating
  const insulationCost = Math.round(routeLengthMeters * 210); // Energoflex 13mm
  const fittingAndValveCost = 14500; // Brass valves, saddle clamp, fittings, check valve
  const sandCost = Math.round(sandBeddingCbm * 1400);

  const totalEstimatedCost =
    earthworksMechanizedCost +
    pipeCost +
    cableCost +
    insulationCost +
    fittingAndValveCost +
    sandCost;

  return {
    trenchVolumeCbm,
    sandBeddingCbm,
    backfillCbm,
    heatingCableLengthMeters,
    warningTapeLengthMeters,
    costBreakdown: {
      earthworksMechanizedCost,
      pipeCost,
      cableCost,
      insulationCost,
      fittingAndValveCost,
      sandCost,
      totalEstimatedCost,
    },
  };
}

/**
 * Generate synthetic waypoint line between plot and well for map visualization
 */
export function generateRoutePoints(from: Coordinates, to: Coordinates): Coordinates[] {
  // L-shaped or orthogonal path along road boundary
  const midLat = from.lat;
  const midLng = to.lng;
  return [
    { lat: from.lat, lng: from.lng },
    { lat: midLat, lng: midLng },
    { lat: to.lat, lng: to.lng },
  ];
}

/**
 * Calculates geographic polygon area in square meters using Shoelace formula on local projection
 */
export function calculatePolygonAreaSqm(points: Coordinates[]): number {
  if (!points || points.length < 3) return 0;
  const R = 6371000;
  const lat0 = (points[0].lat * Math.PI) / 180;
  const cosLat0 = Math.cos(lat0);

  const cartesian = points.map((p) => ({
    x: ((p.lng * Math.PI) / 180) * R * cosLat0,
    y: ((p.lat * Math.PI) / 180) * R,
  }));

  let sum = 0;
  const n = cartesian.length;
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    sum += cartesian[i].x * cartesian[next].y - cartesian[next].x * cartesian[i].y;
  }
  return Math.round(Math.abs(sum) / 2);
}

/**
 * Calculates polygon perimeter in meters
 */
export function calculatePolygonPerimeterMeters(points: Coordinates[]): number {
  if (!points || points.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const next = (i + 1) % points.length;
    perimeter += calculateDistanceMeters(points[i], points[next]);
  }
  return Math.round(perimeter * 10) / 10;
}

/**
 * Calculates polygon centroid
 */
export function calculatePolygonCentroid(points: Coordinates[]): Coordinates {
  if (!points || points.length === 0) return { lat: 0, lng: 0 };
  let latSum = 0;
  let lngSum = 0;
  points.forEach((p) => {
    latSum += p.lat;
    lngSum += p.lng;
  });
  return {
    lat: Number((latSum / points.length).toFixed(6)),
    lng: Number((lngSum / points.length).toFixed(6)),
  };
}

/**
 * Finds the edge index i in polygon [0..n-1] closest to the given point
 * so a new vertex can be inserted at i + 1
 */
export function findClosestEdgeIndex(point: Coordinates, polygon: Coordinates[]): number {
  if (polygon.length < 2) return 0;
  let minDistance = Infinity;
  let bestIndex = 0;

  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    const a = polygon[i];
    const b = polygon[next];

    // Distance from point to segment AB
    const mid = {
      lat: (a.lat + b.lat) / 2,
      lng: (a.lng + b.lng) / 2,
    };
    const dist = calculateDistanceMeters(point, mid);
    if (dist < minDistance) {
      minDistance = dist;
      bestIndex = i;
    }
  }

  return bestIndex;
}

/**
 * Ensures a polygon coordinate ring does not have a duplicated closing vertex
 * so that vertices 0..N-1 are unique for Leaflet polygons and interactive point dragging.
 */
export function cleanPolygonRing(points: Coordinates[]): Coordinates[] {
  if (!points || points.length < 3) return points || [];
  const result = [...points];
  const first = result[0];
  const last = result[result.length - 1];
  if (Math.abs(first.lat - last.lat) < 0.000001 && Math.abs(first.lng - last.lng) < 0.000001) {
    result.pop();
  }
  return result;
}
