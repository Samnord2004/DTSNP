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
