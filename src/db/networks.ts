import { db } from './index.ts';
import {
  territoryContours,
  pipelinesTable,
  wellsTable,
  valvesTable,
  switchboardsTable,
  substationsTable,
  fireHydrantsTable,
  lightPolesTable,
  wifiHotspotsTable,
  plotsTable,
  barrierGatesTable,
  adminFacilitiesTable,
  gasRegulatorsTable,
} from './schema.ts';
import { eq } from 'drizzle-orm';
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
import {
  DTSN_PENSIONER_BOUNDARY,
  INITIAL_PIPELINES,
  INITIAL_WELLS,
  INITIAL_VALVES,
  INITIAL_SWITCHBOARDS,
  INITIAL_SUBSTATIONS,
  INITIAL_FIRE_HYDRANTS,
  INITIAL_LIGHT_POLES,
  INITIAL_WIFI_HOTSPOTS,
  INITIAL_PLOTS,
  INITIAL_BARRIER_GATES,
  INITIAL_ADMIN_FACILITIES,
  INITIAL_GAS_REGULATOR,
} from '../data/mockData.ts';

// 1. TERRITORY CONTOUR
export async function getTerritoryContour(): Promise<Coordinates[] | null> {
  try {
    const rows = await db
      .select()
      .from(territoryContours)
      .where(eq(territoryContours.id, 'dtsn_boundary'))
      .limit(1);

    if (rows.length > 0 && Array.isArray(rows[0].polygon)) {
      return rows[0].polygon as Coordinates[];
    }
    return null;
  } catch (error) {
    console.error('Failed to get territory contour:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function saveTerritoryContour(polygon: Coordinates[]): Promise<Coordinates[]> {
  try {
    await db
      .insert(territoryContours)
      .values({
        id: 'dtsn_boundary',
        name: 'Границы территории ДТСН «Пенсионер»',
        polygon: polygon,
        isOfficial: false,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: territoryContours.id,
        set: {
          polygon: polygon,
          updatedAt: new Date(),
        },
      });

    return polygon;
  } catch (error) {
    console.error('Failed to save territory contour:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// 2. SEED INITIAL DATA IF EMPTY
export async function seedIfEmpty() {
  try {
    // Check if pipelines table is empty
    const existingPipes = await db.select({ id: pipelinesTable.id }).from(pipelinesTable).limit(1);
    if (existingPipes.length === 0) {
      console.log('Seeding initial engineering network data into PostgreSQL...');

      // Seed Boundary Contour
      await db
        .insert(territoryContours)
        .values({
          id: 'dtsn_boundary',
          name: 'Границы территории ДТСН «Пенсионер»',
          polygon: DTSN_PENSIONER_BOUNDARY,
          isOfficial: true,
          updatedAt: new Date(),
        })
        .onConflictDoNothing();

      // Seed Pipelines
      for (const p of INITIAL_PIPELINES) {
        await db
          .insert(pipelinesTable)
          .values({
            id: p.id,
            code: p.code,
            networkType: p.networkType,
            subType: p.subType || null,
            path: p.path,
            diameterMm: p.diameterMm,
            material: p.material,
            depthMeters: p.depthMeters,
            pressureNominal: p.pressureNominal || null,
            installYear: p.installYear,
            condition: p.condition,
            locationDetails: p.locationDetails || null,
            deviceSchematic: p.deviceSchematic || null,
            maintenanceTasks: p.maintenanceTasks || [],
            description: p.description || null,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Wells
      for (const w of INITIAL_WELLS) {
        await db
          .insert(wellsTable)
          .values({
            id: w.id,
            code: w.code,
            name: w.name,
            type: w.type,
            coordinates: w.coordinates,
            locationDetails: w.locationDetails || null,
            depthMeters: w.depthMeters,
            diameterMm: w.diameterMm,
            material: w.material,
            totalPorts: w.totalPorts,
            usedPorts: w.usedPorts,
            freePorts: w.freePorts,
            mainPipeDiameterMm: w.mainPipeDiameterMm,
            nominalPressureAtm: w.nominalPressureAtm,
            hasHeatingCable: w.hasHeatingCable ?? false,
            hasInsulatedLid: w.hasInsulatedLid ?? false,
            condition: w.condition,
            deviceSchematic: w.deviceSchematic || null,
            meterModel: w.meterModel || null,
            meterSerial: w.meterSerial || null,
            sealNumber: w.sealNumber || null,
            lastMeterVerification: w.lastMeterVerification || null,
            maintenanceTasks: w.maintenanceTasks || [],
            lastInspectionDate: w.lastInspectionDate || null,
            notes: w.notes || null,
            valves: w.valves || [],
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Valves
      for (const v of INITIAL_VALVES) {
        await db
          .insert(valvesTable)
          .values({
            id: v.id,
            code: v.code,
            networkType: v.networkType,
            coordinates: v.coordinates,
            locationDetails: v.locationDetails || null,
            type: v.type,
            diameterMm: v.diameterMm,
            state: v.state,
            pressureAtm: v.pressureAtm || null,
            depthMeters: v.depthMeters,
            installedYear: v.installedYear,
            condition: v.condition || 'normal',
            deviceSchematic: v.deviceSchematic || null,
            maintenanceTasks: v.maintenanceTasks || [],
            description: v.description || null,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Switchboards
      for (const sb of INITIAL_SWITCHBOARDS) {
        await db
          .insert(switchboardsTable)
          .values({
            id: sb.id,
            code: sb.code,
            name: sb.name,
            coordinates: sb.coordinates,
            locationDetails: sb.locationDetails || null,
            substationCode: sb.substationCode,
            mainBreakerAmps: sb.mainBreakerAmps,
            feederCount: sb.feederCount,
            meterModel: sb.meterModel,
            meterSerial: sb.meterSerial,
            condition: sb.condition,
            installationYear: sb.installationYear,
            deviceSchematic: sb.deviceSchematic,
            maintenanceTasks: sb.maintenanceTasks || [],
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Substations
      for (const sub of INITIAL_SUBSTATIONS) {
        await db
          .insert(substationsTable)
          .values({
            id: sub.id,
            code: sub.code,
            name: sub.name,
            coordinates: sub.coordinates,
            locationDetails: sub.locationDetails || null,
            powerKva: sub.powerKva,
            voltageKv: sub.voltageKv,
            currentLoadPercent: sub.currentLoadPercent,
            currentPhaseA: sub.currentPhaseA,
            currentPhaseB: sub.currentPhaseB,
            currentPhaseC: sub.currentPhaseC,
            voltagePhaseA: sub.voltagePhaseA,
            voltagePhaseB: sub.voltagePhaseB,
            voltagePhaseC: sub.voltagePhaseC,
            feederCount: sub.feederCount,
            status: sub.status,
            groundingResistanceOhm: sub.groundingResistanceOhm,
            deviceSchematic: sub.deviceSchematic || null,
            maintenanceTasks: sub.maintenanceTasks || [],
            lastServiceDate: sub.lastServiceDate,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Fire Hydrants
      for (const fh of INITIAL_FIRE_HYDRANTS) {
        await db
          .insert(fireHydrantsTable)
          .values({
            id: fh.id,
            code: fh.code,
            coordinates: fh.coordinates,
            type: fh.type,
            diameterMm: fh.diameterMm,
            staticPressureAtm: fh.staticPressureAtm,
            flowRateLps: fh.flowRateLps,
            winterInsulationDone: fh.winterInsulationDone ?? false,
            accessibilityCondition: fh.accessibilityCondition || 'free',
            status: fh.status || 'operational',
            lastTestDate: fh.lastTestDate || null,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Light Poles
      for (const lp of INITIAL_LIGHT_POLES) {
        await db
          .insert(lightPolesTable)
          .values({
            id: lp.id,
            code: lp.code,
            coordinates: lp.coordinates,
            phase: lp.phase,
            lampType: lp.lampType,
            isDutyLight: lp.isDutyLight ?? false,
            status: lp.status,
            hasPhotoSensor: lp.hasPhotoSensor ?? false,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Wifi Hotspots
      for (const hs of INITIAL_WIFI_HOTSPOTS) {
        await db
          .insert(wifiHotspotsTable)
          .values({
            id: hs.id,
            code: hs.code,
            name: hs.name,
            coordinates: hs.coordinates,
            ssid: hs.ssid,
            rangeMeters: hs.rangeMeters,
            frequency: hs.frequency,
            status: hs.status,
            ipAddress: hs.ipAddress,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Plots
      for (const plot of INITIAL_PLOTS) {
        await db
          .insert(plotsTable)
          .values({
            id: plot.id,
            number: plot.number,
            street: plot.street,
            ownerName: plot.ownerName,
            phone: plot.phone || null,
            cadastralNumber: plot.cadastralNumber,
            areaSqm: plot.areaSqm,
            residencyType: plot.residencyType,
            winterClearingPriority: plot.winterClearingPriority,
            coordinates: plot.coordinates,
            polygon: plot.polygon,
            utilities: plot.utilities,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Barrier Gates (Шлагбаумы)
      for (const bg of INITIAL_BARRIER_GATES) {
        await db
          .insert(barrierGatesTable)
          .values({
            id: bg.id,
            code: bg.code,
            name: bg.name,
            coordinates: bg.coordinates,
            type: bg.type,
            openByPhone: bg.openByPhone,
            status: bg.status,
            winterHeatedDrive: bg.winterHeatedDrive ?? true,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Administration Facilities (Здание Правления, КПП)
      for (const fac of INITIAL_ADMIN_FACILITIES) {
        await db
          .insert(adminFacilitiesTable)
          .values({
            id: fac.id,
            code: fac.code,
            name: fac.name,
            type: fac.type,
            coordinates: fac.coordinates,
            description: fac.description,
            workingHours: fac.workingHours,
            hasCctv: fac.hasCctv ?? true,
            hasBackupGenerator: fac.hasBackupGenerator ?? true,
            updatedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Seed Gas Regulator (ГРПШ)
      await db
        .insert(gasRegulatorsTable)
        .values({
          id: INITIAL_GAS_REGULATOR.id,
          code: INITIAL_GAS_REGULATOR.code,
          name: INITIAL_GAS_REGULATOR.name,
          coordinates: INITIAL_GAS_REGULATOR.coordinates,
          inletPressureMpa: INITIAL_GAS_REGULATOR.inletPressureMpa,
          outletPressureKpa: INITIAL_GAS_REGULATOR.outletPressureKpa,
          regulatorModel: INITIAL_GAS_REGULATOR.regulatorModel,
          hasTelemetry: INITIAL_GAS_REGULATOR.hasTelemetry ?? true,
          status: INITIAL_GAS_REGULATOR.status,
          lastCheckDate: INITIAL_GAS_REGULATOR.lastCheckDate,
          filterDifferentialPressureKpa: INITIAL_GAS_REGULATOR.filterDifferentialPressureKpa,
          updatedAt: new Date(),
        })
        .onConflictDoNothing();

      console.log('Successfully seeded engineering networks into PostgreSQL!');
    }
  } catch (error) {
    console.error('Error during database seed:', error);
    // Do not crash the app on seed error
  }
}

// 3. FETCH COMPLETE NETWORK DATA FROM POSTGRESQL
export async function getAllNetworkData() {
  try {
    const [
      contour,
      pipelines,
      wells,
      valves,
      switchboards,
      substations,
      fireHydrants,
      lightPoles,
      wifiHotspots,
      plots,
      barrierGates,
      adminFacilities,
      gasRegulators,
    ] = await Promise.all([
      getTerritoryContour(),
      db.select().from(pipelinesTable),
      db.select().from(wellsTable),
      db.select().from(valvesTable),
      db.select().from(switchboardsTable),
      db.select().from(substationsTable),
      db.select().from(fireHydrantsTable),
      db.select().from(lightPolesTable),
      db.select().from(wifiHotspotsTable),
      db.select().from(plotsTable),
      db.select().from(barrierGatesTable),
      db.select().from(adminFacilitiesTable),
      db.select().from(gasRegulatorsTable),
    ]);

    const activeGasRegulator = gasRegulators.length > 0
      ? ({
          ...gasRegulators[0],
          coordinates: gasRegulators[0].coordinates as Coordinates,
        } as GasRegulatorStation)
      : INITIAL_GAS_REGULATOR;

    return {
      boundary: contour || DTSN_PENSIONER_BOUNDARY,
      pipelines: pipelines.map((p) => ({
        ...p,
        path: p.path as Coordinates[],
        maintenanceTasks: (p.maintenanceTasks as string[]) || [],
      })) as PipelineSegment[],
      wells: wells.map((w) => ({
        ...w,
        coordinates: w.coordinates as Coordinates,
        maintenanceTasks: (w.maintenanceTasks as string[]) || [],
        valves: (w.valves as any[]) || [],
      })) as Well[],
      valves: valves.map((v) => ({
        ...v,
        coordinates: v.coordinates as Coordinates,
        maintenanceTasks: (v.maintenanceTasks as string[]) || [],
      })) as Valve[],
      switchboards: switchboards.map((sb) => ({
        ...sb,
        coordinates: sb.coordinates as Coordinates,
        maintenanceTasks: (sb.maintenanceTasks as string[]) || [],
      })) as Switchboard[],
      substations: substations.map((sub) => ({
        ...sub,
        coordinates: sub.coordinates as Coordinates,
        maintenanceTasks: (sub.maintenanceTasks as string[]) || [],
      })) as Substation[],
      fireHydrants: fireHydrants.map((fh) => ({
        ...fh,
        coordinates: fh.coordinates as Coordinates,
        type: fh.type as 'underground' | 'standpipe',
        accessibilityCondition: fh.accessibilityCondition as 'free' | 'snow_covered' | 'blocked',
        status: fh.status as 'operational' | 'requires_repair',
      })) as FireHydrant[],
      lightPoles: lightPoles.map((lp) => ({
        ...lp,
        coordinates: lp.coordinates as Coordinates,
      })) as LightPole[],
      wifiHotspots: wifiHotspots.map((hs) => ({
        ...hs,
        coordinates: hs.coordinates as Coordinates,
      })) as WifiHotspot[],
      plots: plots.map((pl) => ({
        ...pl,
        coordinates: pl.coordinates as Coordinates,
        polygon: pl.polygon as Coordinates[],
        utilities: pl.utilities as any,
      })) as Plot[],
      barrierGates: barrierGates.length > 0
        ? (barrierGates.map((bg) => ({
            ...bg,
            coordinates: bg.coordinates as Coordinates,
            type: bg.type as 'automatic_gsm' | 'rfid_barrier',
            status: bg.status as 'operational' | 'manual_mode' | 'fault',
          })) as BarrierGate[])
        : INITIAL_BARRIER_GATES,
      adminFacilities: adminFacilities.length > 0
        ? (adminFacilities.map((fac) => ({
            ...fac,
            coordinates: fac.coordinates as Coordinates,
            type: fac.type as 'board_office' | 'security_post' | 'utility_shed',
          })) as AdministrationFacility[])
        : INITIAL_ADMIN_FACILITIES,
      gasRegulator: activeGasRegulator,
    };
  } catch (error) {
    console.error('Failed to get all network data from PostgreSQL:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// 4. INDIVIDUAL OBJECT CRUD

// Pipelines
export async function upsertPipeline(p: PipelineSegment) {
  try {
    await db
      .insert(pipelinesTable)
      .values({
        id: p.id,
        code: p.code,
        networkType: p.networkType,
        subType: p.subType || null,
        path: p.path,
        diameterMm: p.diameterMm,
        material: p.material,
        depthMeters: p.depthMeters,
        pressureNominal: p.pressureNominal || null,
        installYear: p.installYear,
        condition: p.condition,
        locationDetails: p.locationDetails || null,
        deviceSchematic: p.deviceSchematic || null,
        maintenanceTasks: p.maintenanceTasks || [],
        description: p.description || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: pipelinesTable.id,
        set: {
          code: p.code,
          networkType: p.networkType,
          subType: p.subType || null,
          path: p.path,
          diameterMm: p.diameterMm,
          material: p.material,
          depthMeters: p.depthMeters,
          pressureNominal: p.pressureNominal || null,
          installYear: p.installYear,
          condition: p.condition,
          locationDetails: p.locationDetails || null,
          deviceSchematic: p.deviceSchematic || null,
          maintenanceTasks: p.maintenanceTasks || [],
          description: p.description || null,
          updatedAt: new Date(),
        },
      });
    return p;
  } catch (error) {
    console.error('Failed to upsert pipeline:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deletePipeline(id: string) {
  try {
    await db.delete(pipelinesTable).where(eq(pipelinesTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete pipeline:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Wells
export async function upsertWell(w: Well) {
  try {
    await db
      .insert(wellsTable)
      .values({
        id: w.id,
        code: w.code,
        name: w.name,
        type: w.type,
        coordinates: w.coordinates,
        locationDetails: w.locationDetails || null,
        depthMeters: w.depthMeters,
        diameterMm: w.diameterMm,
        material: w.material,
        totalPorts: w.totalPorts,
        usedPorts: w.usedPorts,
        freePorts: w.freePorts,
        mainPipeDiameterMm: w.mainPipeDiameterMm,
        nominalPressureAtm: w.nominalPressureAtm,
        hasHeatingCable: w.hasHeatingCable ?? false,
        hasInsulatedLid: w.hasInsulatedLid ?? false,
        condition: w.condition,
        deviceSchematic: w.deviceSchematic || null,
        meterModel: w.meterModel || null,
        meterSerial: w.meterSerial || null,
        sealNumber: w.sealNumber || null,
        lastMeterVerification: w.lastMeterVerification || null,
        maintenanceTasks: w.maintenanceTasks || [],
        lastInspectionDate: w.lastInspectionDate || null,
        notes: w.notes || null,
        valves: w.valves || [],
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: wellsTable.id,
        set: {
          code: w.code,
          name: w.name,
          type: w.type,
          coordinates: w.coordinates,
          locationDetails: w.locationDetails || null,
          depthMeters: w.depthMeters,
          diameterMm: w.diameterMm,
          material: w.material,
          totalPorts: w.totalPorts,
          usedPorts: w.usedPorts,
          freePorts: w.freePorts,
          mainPipeDiameterMm: w.mainPipeDiameterMm,
          nominalPressureAtm: w.nominalPressureAtm,
          hasHeatingCable: w.hasHeatingCable ?? false,
          hasInsulatedLid: w.hasInsulatedLid ?? false,
          condition: w.condition,
          deviceSchematic: w.deviceSchematic || null,
          meterModel: w.meterModel || null,
          meterSerial: w.meterSerial || null,
          sealNumber: w.sealNumber || null,
          lastMeterVerification: w.lastMeterVerification || null,
          maintenanceTasks: w.maintenanceTasks || [],
          lastInspectionDate: w.lastInspectionDate || null,
          notes: w.notes || null,
          valves: w.valves || [],
          updatedAt: new Date(),
        },
      });
    return w;
  } catch (error) {
    console.error('Failed to upsert well:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteWell(id: string) {
  try {
    await db.delete(wellsTable).where(eq(wellsTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete well:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Valves
export async function upsertValve(v: Valve) {
  try {
    await db
      .insert(valvesTable)
      .values({
        id: v.id,
        code: v.code,
        networkType: v.networkType,
        coordinates: v.coordinates,
        locationDetails: v.locationDetails || null,
        type: v.type,
        diameterMm: v.diameterMm,
        state: v.state,
        pressureAtm: v.pressureAtm || null,
        depthMeters: v.depthMeters,
        installedYear: v.installedYear,
        condition: v.condition || 'normal',
        deviceSchematic: v.deviceSchematic || null,
        maintenanceTasks: v.maintenanceTasks || [],
        description: v.description || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: valvesTable.id,
        set: {
          code: v.code,
          networkType: v.networkType,
          coordinates: v.coordinates,
          locationDetails: v.locationDetails || null,
          type: v.type,
          diameterMm: v.diameterMm,
          state: v.state,
          pressureAtm: v.pressureAtm || null,
          depthMeters: v.depthMeters,
          installedYear: v.installedYear,
          condition: v.condition || 'normal',
          deviceSchematic: v.deviceSchematic || null,
          maintenanceTasks: v.maintenanceTasks || [],
          description: v.description || null,
          updatedAt: new Date(),
        },
      });
    return v;
  } catch (error) {
    console.error('Failed to upsert valve:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteValve(id: string) {
  try {
    await db.delete(valvesTable).where(eq(valvesTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete valve:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Switchboards
export async function upsertSwitchboard(sb: Switchboard) {
  try {
    await db
      .insert(switchboardsTable)
      .values({
        id: sb.id,
        code: sb.code,
        name: sb.name,
        coordinates: sb.coordinates,
        locationDetails: sb.locationDetails || null,
        substationCode: sb.substationCode,
        mainBreakerAmps: sb.mainBreakerAmps,
        feederCount: sb.feederCount,
        meterModel: sb.meterModel,
        meterSerial: sb.meterSerial,
        condition: sb.condition,
        installationYear: sb.installationYear,
        deviceSchematic: sb.deviceSchematic,
        maintenanceTasks: sb.maintenanceTasks || [],
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: switchboardsTable.id,
        set: {
          code: sb.code,
          name: sb.name,
          coordinates: sb.coordinates,
          locationDetails: sb.locationDetails || null,
          substationCode: sb.substationCode,
          mainBreakerAmps: sb.mainBreakerAmps,
          feederCount: sb.feederCount,
          meterModel: sb.meterModel,
          meterSerial: sb.meterSerial,
          condition: sb.condition,
          installationYear: sb.installationYear,
          deviceSchematic: sb.deviceSchematic,
          maintenanceTasks: sb.maintenanceTasks || [],
          updatedAt: new Date(),
        },
      });
    return sb;
  } catch (error) {
    console.error('Failed to upsert switchboard:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteSwitchboard(id: string) {
  try {
    await db.delete(switchboardsTable).where(eq(switchboardsTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete switchboard:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Substations
export async function upsertSubstation(sub: Substation) {
  try {
    await db
      .insert(substationsTable)
      .values({
        id: sub.id,
        code: sub.code,
        name: sub.name,
        coordinates: sub.coordinates,
        locationDetails: sub.locationDetails || null,
        powerKva: sub.powerKva,
        voltageKv: sub.voltageKv,
        currentLoadPercent: sub.currentLoadPercent,
        currentPhaseA: sub.currentPhaseA,
        currentPhaseB: sub.currentPhaseB,
        currentPhaseC: sub.currentPhaseC,
        voltagePhaseA: sub.voltagePhaseA,
        voltagePhaseB: sub.voltagePhaseB,
        voltagePhaseC: sub.voltagePhaseC,
        feederCount: sub.feederCount,
        status: sub.status,
        groundingResistanceOhm: sub.groundingResistanceOhm,
        deviceSchematic: sub.deviceSchematic || null,
        maintenanceTasks: sub.maintenanceTasks || [],
        lastServiceDate: sub.lastServiceDate,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: substationsTable.id,
        set: {
          code: sub.code,
          name: sub.name,
          coordinates: sub.coordinates,
          locationDetails: sub.locationDetails || null,
          powerKva: sub.powerKva,
          voltageKv: sub.voltageKv,
          currentLoadPercent: sub.currentLoadPercent,
          currentPhaseA: sub.currentPhaseA,
          currentPhaseB: sub.currentPhaseB,
          currentPhaseC: sub.currentPhaseC,
          voltagePhaseA: sub.voltagePhaseA,
          voltagePhaseB: sub.voltagePhaseB,
          voltagePhaseC: sub.voltagePhaseC,
          feederCount: sub.feederCount,
          status: sub.status,
          groundingResistanceOhm: sub.groundingResistanceOhm,
          deviceSchematic: sub.deviceSchematic || null,
          maintenanceTasks: sub.maintenanceTasks || [],
          lastServiceDate: sub.lastServiceDate,
          updatedAt: new Date(),
        },
      });
    return sub;
  } catch (error) {
    console.error('Failed to upsert substation:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteSubstation(id: string) {
  try {
    await db.delete(substationsTable).where(eq(substationsTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete substation:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Fire Hydrants
export async function upsertFireHydrant(fh: FireHydrant) {
  try {
    await db
      .insert(fireHydrantsTable)
      .values({
        id: fh.id,
        code: fh.code,
        coordinates: fh.coordinates,
        type: fh.type,
        diameterMm: fh.diameterMm,
        staticPressureAtm: fh.staticPressureAtm,
        flowRateLps: fh.flowRateLps,
        winterInsulationDone: fh.winterInsulationDone ?? false,
        accessibilityCondition: fh.accessibilityCondition || 'free',
        status: fh.status || 'operational',
        lastTestDate: fh.lastTestDate || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: fireHydrantsTable.id,
        set: {
          code: fh.code,
          coordinates: fh.coordinates,
          type: fh.type,
          diameterMm: fh.diameterMm,
          staticPressureAtm: fh.staticPressureAtm,
          flowRateLps: fh.flowRateLps,
          winterInsulationDone: fh.winterInsulationDone ?? false,
          accessibilityCondition: fh.accessibilityCondition || 'free',
          status: fh.status || 'operational',
          lastTestDate: fh.lastTestDate || null,
          updatedAt: new Date(),
        },
      });
    return fh;
  } catch (error) {
    console.error('Failed to upsert fire hydrant:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteFireHydrant(id: string) {
  try {
    await db.delete(fireHydrantsTable).where(eq(fireHydrantsTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete fire hydrant:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Light Poles
export async function upsertLightPole(lp: LightPole) {
  try {
    await db
      .insert(lightPolesTable)
      .values({
        id: lp.id,
        code: lp.code,
        coordinates: lp.coordinates,
        phase: lp.phase,
        lampType: lp.lampType,
        isDutyLight: lp.isDutyLight ?? false,
        status: lp.status,
        hasPhotoSensor: lp.hasPhotoSensor ?? false,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: lightPolesTable.id,
        set: {
          code: lp.code,
          coordinates: lp.coordinates,
          phase: lp.phase,
          lampType: lp.lampType,
          isDutyLight: lp.isDutyLight ?? false,
          status: lp.status,
          hasPhotoSensor: lp.hasPhotoSensor ?? false,
          updatedAt: new Date(),
        },
      });
    return lp;
  } catch (error) {
    console.error('Failed to upsert light pole:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteLightPole(id: string) {
  try {
    await db.delete(lightPolesTable).where(eq(lightPolesTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete light pole:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Wifi Hotspots
export async function upsertWifiHotspot(hs: WifiHotspot) {
  try {
    await db
      .insert(wifiHotspotsTable)
      .values({
        id: hs.id,
        code: hs.code,
        name: hs.name,
        coordinates: hs.coordinates,
        ssid: hs.ssid,
        rangeMeters: hs.rangeMeters,
        frequency: hs.frequency,
        status: hs.status,
        ipAddress: hs.ipAddress,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: wifiHotspotsTable.id,
        set: {
          code: hs.code,
          name: hs.name,
          coordinates: hs.coordinates,
          ssid: hs.ssid,
          rangeMeters: hs.rangeMeters,
          frequency: hs.frequency,
          status: hs.status,
          ipAddress: hs.ipAddress,
          updatedAt: new Date(),
        },
      });
    return hs;
  } catch (error) {
    console.error('Failed to upsert wifi hotspot:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteWifiHotspot(id: string) {
  try {
    await db.delete(wifiHotspotsTable).where(eq(wifiHotspotsTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete wifi hotspot:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Plots (Участки)
export async function upsertPlot(plot: Plot) {
  try {
    await db
      .insert(plotsTable)
      .values({
        id: plot.id,
        number: plot.number,
        street: plot.street,
        ownerName: plot.ownerName,
        phone: plot.phone || null,
        cadastralNumber: plot.cadastralNumber,
        areaSqm: plot.areaSqm,
        residencyType: plot.residencyType,
        winterClearingPriority: plot.winterClearingPriority,
        coordinates: plot.coordinates,
        polygon: plot.polygon,
        utilities: plot.utilities,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: plotsTable.id,
        set: {
          number: plot.number,
          street: plot.street,
          ownerName: plot.ownerName,
          phone: plot.phone || null,
          cadastralNumber: plot.cadastralNumber,
          areaSqm: plot.areaSqm,
          residencyType: plot.residencyType,
          winterClearingPriority: plot.winterClearingPriority,
          coordinates: plot.coordinates,
          polygon: plot.polygon,
          utilities: plot.utilities,
          updatedAt: new Date(),
        },
      });
    return plot;
  } catch (error) {
    console.error('Failed to upsert plot:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Barrier Gates (Шлагбаумы)
export async function upsertBarrierGate(bg: BarrierGate) {
  try {
    await db
      .insert(barrierGatesTable)
      .values({
        id: bg.id,
        code: bg.code,
        name: bg.name,
        coordinates: bg.coordinates,
        type: bg.type,
        openByPhone: bg.openByPhone,
        status: bg.status,
        winterHeatedDrive: bg.winterHeatedDrive ?? true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: barrierGatesTable.id,
        set: {
          code: bg.code,
          name: bg.name,
          coordinates: bg.coordinates,
          type: bg.type,
          openByPhone: bg.openByPhone,
          status: bg.status,
          winterHeatedDrive: bg.winterHeatedDrive ?? true,
          updatedAt: new Date(),
        },
      });
    return bg;
  } catch (error) {
    console.error('Failed to upsert barrier gate:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteBarrierGate(id: string) {
  try {
    await db.delete(barrierGatesTable).where(eq(barrierGatesTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete barrier gate:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Administration Facilities (Здание Правления, КПП)
export async function upsertAdminFacility(fac: AdministrationFacility) {
  try {
    await db
      .insert(adminFacilitiesTable)
      .values({
        id: fac.id,
        code: fac.code,
        name: fac.name,
        type: fac.type,
        coordinates: fac.coordinates,
        description: fac.description,
        workingHours: fac.workingHours,
        hasCctv: fac.hasCctv ?? true,
        hasBackupGenerator: fac.hasBackupGenerator ?? true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: adminFacilitiesTable.id,
        set: {
          code: fac.code,
          name: fac.name,
          type: fac.type,
          coordinates: fac.coordinates,
          description: fac.description,
          workingHours: fac.workingHours,
          hasCctv: fac.hasCctv ?? true,
          hasBackupGenerator: fac.hasBackupGenerator ?? true,
          updatedAt: new Date(),
        },
      });
    return fac;
  } catch (error) {
    console.error('Failed to upsert admin facility:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteAdminFacility(id: string) {
  try {
    await db.delete(adminFacilitiesTable).where(eq(adminFacilitiesTable.id, id));
    return { success: true, id };
  } catch (error) {
    console.error('Failed to delete admin facility:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Gas Regulator (ГРПШ)
export async function upsertGasRegulator(gr: GasRegulatorStation) {
  try {
    await db
      .insert(gasRegulatorsTable)
      .values({
        id: gr.id,
        code: gr.code,
        name: gr.name,
        coordinates: gr.coordinates,
        inletPressureMpa: gr.inletPressureMpa,
        outletPressureKpa: gr.outletPressureKpa,
        regulatorModel: gr.regulatorModel,
        hasTelemetry: gr.hasTelemetry ?? true,
        status: gr.status,
        lastCheckDate: gr.lastCheckDate,
        filterDifferentialPressureKpa: gr.filterDifferentialPressureKpa,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: gasRegulatorsTable.id,
        set: {
          code: gr.code,
          name: gr.name,
          coordinates: gr.coordinates,
          inletPressureMpa: gr.inletPressureMpa,
          outletPressureKpa: gr.outletPressureKpa,
          regulatorModel: gr.regulatorModel,
          hasTelemetry: gr.hasTelemetry ?? true,
          status: gr.status,
          lastCheckDate: gr.lastCheckDate,
          filterDifferentialPressureKpa: gr.filterDifferentialPressureKpa,
          updatedAt: new Date(),
        },
      });
    return gr;
  } catch (error) {
    console.error('Failed to upsert gas regulator:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

// Универсальное обновление координат для Drag & Drop перемещения любого объекта
export async function updateObjectCoordinates(type: string, id: string, coordinates: Coordinates) {
  try {
    switch (type) {
      case 'barrierGate':
        await db.update(barrierGatesTable).set({ coordinates, updatedAt: new Date() }).where(eq(barrierGatesTable.id, id));
        break;
      case 'adminFacility':
        await db.update(adminFacilitiesTable).set({ coordinates, updatedAt: new Date() }).where(eq(adminFacilitiesTable.id, id));
        break;
      case 'well':
        await db.update(wellsTable).set({ coordinates, updatedAt: new Date() }).where(eq(wellsTable.id, id));
        break;
      case 'valve':
        await db.update(valvesTable).set({ coordinates, updatedAt: new Date() }).where(eq(valvesTable.id, id));
        break;
      case 'switchboard':
        await db.update(switchboardsTable).set({ coordinates, updatedAt: new Date() }).where(eq(switchboardsTable.id, id));
        break;
      case 'substation':
        await db.update(substationsTable).set({ coordinates, updatedAt: new Date() }).where(eq(substationsTable.id, id));
        break;
      case 'fireHydrant':
        await db.update(fireHydrantsTable).set({ coordinates, updatedAt: new Date() }).where(eq(fireHydrantsTable.id, id));
        break;
      case 'lightPole':
        await db.update(lightPolesTable).set({ coordinates, updatedAt: new Date() }).where(eq(lightPolesTable.id, id));
        break;
      case 'wifiHotspot':
        await db.update(wifiHotspotsTable).set({ coordinates, updatedAt: new Date() }).where(eq(wifiHotspotsTable.id, id));
        break;
      case 'gasRegulator':
        await db.update(gasRegulatorsTable).set({ coordinates, updatedAt: new Date() }).where(eq(gasRegulatorsTable.id, id));
        break;
      case 'plot':
        await db.update(plotsTable).set({ coordinates, updatedAt: new Date() }).where(eq(plotsTable.id, id));
        break;
      default:
        console.warn(`Unknown object type for coordinate update: ${type}`);
    }
    return { success: true, type, id, coordinates };
  } catch (error) {
    console.error(`Failed to update coordinates for ${type} ${id}:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
