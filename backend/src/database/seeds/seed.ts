import dataSource from '../data-source';
import { DroneOrmEntity } from '../../modules/drone/infrastructure/persistence/drone.orm-entity';
import { MissionOrmEntity } from '../../modules/mission/infrastructure/persistence/mission.orm-entity';
import { MaintenanceLogOrmEntity } from '../../modules/maintenance/infrastructure/persistence/maintenance-log.orm-entity';
import { DroneStatus } from '../../modules/drone/domain/enums/drone-status.enum';
import { DroneModel } from '../../modules/drone/domain/enums/drone-model.enum';
import { MissionStatus } from '../../modules/mission/domain/enums/mission-status.enum';
import { MissionType } from '../../modules/mission/domain/enums/mission-type.enum';
import { MaintenanceType } from '../../modules/maintenance/domain/enums/maintenance-type.enum';

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function hoursFromDate(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

const MISSION_TYPES = [
  MissionType.WIND_TURBINE_INSPECTION,
  MissionType.SOLAR_PANEL_SURVEY,
  MissionType.POWER_LINE_PATROL,
];
const MAINTENANCE_TYPES = [
  MaintenanceType.ROUTINE_CHECK,
  MaintenanceType.BATTERY_REPLACEMENT,
  MaintenanceType.MOTOR_REPAIR,
  MaintenanceType.FIRMWARE_UPDATE,
  MaintenanceType.FULL_OVERHAUL,
];
const PILOTS = [
  'John Doe',
  'Jane Smith',
  'Alex Johnson',
  'Maria Garcia',
  'David Lee',
  'Sarah Wilson',
];
const SITES = [
  'Wind Farm Alpha - North Sector',
  'Solar Panel Array B12',
  'Power Grid Line 7-East',
  'Offshore Wind Farm Delta',
  'Solar Farm Gamma',
  'Transmission Line Corridor 5',
  'Wind Farm Beta - South Ridge',
  'Rooftop Solar Installation C4',
];
const TECHNICIANS = [
  'Tech Smith',
  'Engineer Davis',
  'Senior Tech Brown',
  'Specialist Miller',
  'Lead Tech Wilson',
];

async function seed() {
  await dataSource.initialize();
  console.log('Database connected.');

  const droneRepo = dataSource.getRepository(DroneOrmEntity);
  const missionRepo = dataSource.getRepository(MissionOrmEntity);
  const maintenanceRepo = dataSource.getRepository(MaintenanceLogOrmEntity);

  // Truncate (idempotent) — order matters due to FK constraints
  await maintenanceRepo.query('DELETE FROM maintenance_logs');
  await missionRepo.query('DELETE FROM missions');
  await droneRepo.query('DELETE FROM drones');
  console.log('Tables truncated.');

  // --- DRONES (25) ---
  const drones: DroneOrmEntity[] = [];
  const droneData = [
    // 12 AVAILABLE
    {
      sn: 'SKY-AL01-PH01',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.AVAILABLE,
      hours: 12.5,
      lastMaint: daysAgo(30),
      nextMaint: daysFromNow(60),
    },
    {
      sn: 'SKY-AL02-PH02',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.AVAILABLE,
      hours: 45.0,
      lastMaint: daysAgo(60),
      nextMaint: daysFromNow(30),
    },
    {
      sn: 'SKY-AL03-MT01',
      model: DroneModel.MATRICE_300,
      status: DroneStatus.AVAILABLE,
      hours: 8.25,
      lastMaint: daysAgo(10),
      nextMaint: daysFromNow(80),
    },
    {
      sn: 'SKY-AL04-MT02',
      model: DroneModel.MATRICE_300,
      status: DroneStatus.AVAILABLE,
      hours: 22.0,
      lastMaint: daysAgo(45),
      nextMaint: daysFromNow(45),
    },
    {
      sn: 'SKY-AL05-MV01',
      model: DroneModel.MAVIC_3_ENTERPRISE,
      status: DroneStatus.AVAILABLE,
      hours: 0,
      lastMaint: null,
      nextMaint: null,
    },
    {
      sn: 'SKY-AL06-MV02',
      model: DroneModel.MAVIC_3_ENTERPRISE,
      status: DroneStatus.AVAILABLE,
      hours: 35.75,
      lastMaint: daysAgo(20),
      nextMaint: daysFromNow(70),
    },
    {
      sn: 'SKY-AL07-PH03',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.AVAILABLE,
      hours: 98.5,
      lastMaint: daysAgo(5),
      nextMaint: daysFromNow(85),
    },
    {
      sn: 'SKY-AL08-MT03',
      model: DroneModel.MATRICE_300,
      status: DroneStatus.AVAILABLE,
      hours: 150.25,
      lastMaint: daysAgo(15),
      nextMaint: daysFromNow(75),
    },
    {
      sn: 'SKY-AL09-MV03',
      model: DroneModel.MAVIC_3_ENTERPRISE,
      status: DroneStatus.AVAILABLE,
      hours: 5.0,
      lastMaint: null,
      nextMaint: null,
    },
    {
      sn: 'SKY-AL10-PH04',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.AVAILABLE,
      hours: 67.0,
      lastMaint: daysAgo(40),
      nextMaint: daysFromNow(50),
    },
    {
      sn: 'SKY-AL11-MT04',
      model: DroneModel.MATRICE_300,
      status: DroneStatus.AVAILABLE,
      hours: 30.0,
      lastMaint: daysAgo(25),
      nextMaint: daysFromNow(65),
    },
    {
      sn: 'SKY-AL12-MV04',
      model: DroneModel.MAVIC_3_ENTERPRISE,
      status: DroneStatus.AVAILABLE,
      hours: 82.0,
      lastMaint: daysAgo(8),
      nextMaint: daysFromNow(82),
    },
    // 5 IN_MISSION
    {
      sn: 'SKY-IM01-PH05',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.IN_MISSION,
      hours: 55.0,
      lastMaint: daysAgo(50),
      nextMaint: daysFromNow(40),
    },
    {
      sn: 'SKY-IM02-MT05',
      model: DroneModel.MATRICE_300,
      status: DroneStatus.IN_MISSION,
      hours: 120.0,
      lastMaint: daysAgo(20),
      nextMaint: daysFromNow(70),
    },
    {
      sn: 'SKY-IM03-MV05',
      model: DroneModel.MAVIC_3_ENTERPRISE,
      status: DroneStatus.IN_MISSION,
      hours: 40.0,
      lastMaint: daysAgo(35),
      nextMaint: daysFromNow(55),
    },
    {
      sn: 'SKY-IM04-PH06',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.IN_MISSION,
      hours: 75.5,
      lastMaint: daysAgo(12),
      nextMaint: daysFromNow(78),
    },
    {
      sn: 'SKY-IM05-MT06',
      model: DroneModel.MATRICE_300,
      status: DroneStatus.IN_MISSION,
      hours: 200.0,
      lastMaint: daysAgo(3),
      nextMaint: daysFromNow(87),
    },
    // 4 MAINTENANCE
    {
      sn: 'SKY-MN01-PH07',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.MAINTENANCE,
      hours: 49.5,
      lastMaint: daysAgo(88),
      nextMaint: daysAgo(0),
    },
    {
      sn: 'SKY-MN02-MT07',
      model: DroneModel.MATRICE_300,
      status: DroneStatus.MAINTENANCE,
      hours: 100.0,
      lastMaint: daysAgo(92),
      nextMaint: daysAgo(2),
    },
    {
      sn: 'SKY-MN03-MV06',
      model: DroneModel.MAVIC_3_ENTERPRISE,
      status: DroneStatus.MAINTENANCE,
      hours: 250.0,
      lastMaint: daysAgo(10),
      nextMaint: daysFromNow(80),
    },
    {
      sn: 'SKY-MN04-PH08',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.MAINTENANCE,
      hours: 15.0,
      lastMaint: daysAgo(95),
      nextMaint: daysAgo(5),
    },
    // 4 RETIRED
    {
      sn: 'SKY-RT01-PH09',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.RETIRED,
      hours: 500.0,
      lastMaint: daysAgo(180),
      nextMaint: null,
    },
    {
      sn: 'SKY-RT02-MT08',
      model: DroneModel.MATRICE_300,
      status: DroneStatus.RETIRED,
      hours: 350.0,
      lastMaint: daysAgo(200),
      nextMaint: null,
    },
    {
      sn: 'SKY-RT03-MV07',
      model: DroneModel.MAVIC_3_ENTERPRISE,
      status: DroneStatus.RETIRED,
      hours: 420.0,
      lastMaint: daysAgo(150),
      nextMaint: null,
    },
    {
      sn: 'SKY-RT04-PH10',
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.RETIRED,
      hours: 280.0,
      lastMaint: daysAgo(220),
      nextMaint: null,
    },
  ];

  for (const d of droneData) {
    const drone = droneRepo.create({
      serialNumber: d.sn,
      model: d.model,
      status: d.status,
      totalFlightHours: d.hours.toString(),
      lastMaintenanceDate: d.lastMaint,
      nextMaintenanceDueDate: d.nextMaint,
    });
    drones.push(await droneRepo.save(drone));
  }
  console.log(`Seeded ${drones.length} drones.`);

  // --- MISSIONS (55) ---
  const missions: MissionOrmEntity[] = [];

  // 20 COMPLETED missions (past)
  for (let i = 0; i < 20; i++) {
    const droneIdx = i % drones.length;
    const start = daysAgo(60 - i * 2);
    const m = missionRepo.create({
      name: `Completed Mission ${i + 1}`,
      type: MISSION_TYPES[i % MISSION_TYPES.length],
      droneId: drones[droneIdx].id,
      pilotName: PILOTS[i % PILOTS.length],
      siteLocation: SITES[i % SITES.length],
      status: MissionStatus.COMPLETED,
      plannedStartTime: start,
      plannedEndTime: hoursFromDate(start, 4),
      actualStartTime: hoursFromDate(start, 0.5),
      actualEndTime: hoursFromDate(start, 3.5),
      flightHours: (1 + Math.random() * 4).toFixed(2),
    });
    missions.push(await missionRepo.save(m));
  }

  // 5 ABORTED missions (past)
  for (let i = 0; i < 5; i++) {
    const droneIdx = (i + 5) % drones.length;
    const start = daysAgo(30 - i * 3);
    const m = missionRepo.create({
      name: `Aborted Mission ${i + 1}`,
      type: MISSION_TYPES[i % MISSION_TYPES.length],
      droneId: drones[droneIdx].id,
      pilotName: PILOTS[(i + 2) % PILOTS.length],
      siteLocation: SITES[(i + 3) % SITES.length],
      status: MissionStatus.ABORTED,
      plannedStartTime: start,
      plannedEndTime: hoursFromDate(start, 3),
      actualStartTime: i < 3 ? hoursFromDate(start, 0.25) : null,
      actualEndTime: hoursFromDate(start, 1),
      abortReason: [
        'Weather conditions',
        'Equipment malfunction',
        'Airspace restriction',
        'Client cancellation',
        'Battery warning',
      ][i],
    });
    missions.push(await missionRepo.save(m));
  }

  // 5 IN_PROGRESS missions (for IN_MISSION drones)
  const inMissionDrones = drones.filter(
    (d) => d.status === DroneStatus.IN_MISSION,
  );
  for (let i = 0; i < inMissionDrones.length; i++) {
    const start = daysAgo(0);
    const m = missionRepo.create({
      name: `Active Mission ${i + 1}`,
      type: MISSION_TYPES[i % MISSION_TYPES.length],
      droneId: inMissionDrones[i].id,
      pilotName: PILOTS[i % PILOTS.length],
      siteLocation: SITES[i % SITES.length],
      status: MissionStatus.IN_PROGRESS,
      plannedStartTime: start,
      plannedEndTime: hoursFromDate(start, 6),
      actualStartTime: hoursFromDate(start, 0.25),
    });
    missions.push(await missionRepo.save(m));
  }

  // 15 PLANNED missions (future)
  const availableDrones = drones.filter(
    (d) => d.status === DroneStatus.AVAILABLE,
  );
  for (let i = 0; i < 15; i++) {
    const droneIdx = i % availableDrones.length;
    const start = daysFromNow(1 + i * 2);
    const m = missionRepo.create({
      name: `Planned Mission ${i + 1}`,
      type: MISSION_TYPES[i % MISSION_TYPES.length],
      droneId: availableDrones[droneIdx].id,
      pilotName: PILOTS[i % PILOTS.length],
      siteLocation: SITES[i % SITES.length],
      status: MissionStatus.PLANNED,
      plannedStartTime: start,
      plannedEndTime: hoursFromDate(start, 3 + (i % 4)),
    });
    missions.push(await missionRepo.save(m));
  }

  // 5 PRE_FLIGHT_CHECK missions (today/tomorrow)
  for (let i = 0; i < 5; i++) {
    const droneIdx = (i + 5) % availableDrones.length;
    const start = daysFromNow(i === 0 ? 0.5 : i);
    const m = missionRepo.create({
      name: `Pre-Flight Mission ${i + 1}`,
      type: MISSION_TYPES[i % MISSION_TYPES.length],
      droneId: availableDrones[droneIdx].id,
      pilotName: PILOTS[(i + 3) % PILOTS.length],
      siteLocation: SITES[(i + 2) % SITES.length],
      status: MissionStatus.PRE_FLIGHT_CHECK,
      plannedStartTime: start,
      plannedEndTime: hoursFromDate(start, 4),
    });
    missions.push(await missionRepo.save(m));
  }

  // 5 additional COMPLETED for variety
  for (let i = 0; i < 5; i++) {
    const droneIdx = (i + 10) % drones.length;
    const start = daysAgo(90 + i * 5);
    const m = missionRepo.create({
      name: `Historical Mission ${i + 1}`,
      type: MISSION_TYPES[i % MISSION_TYPES.length],
      droneId: drones[droneIdx].id,
      pilotName: PILOTS[(i + 4) % PILOTS.length],
      siteLocation: SITES[(i + 5) % SITES.length],
      status: MissionStatus.COMPLETED,
      plannedStartTime: start,
      plannedEndTime: hoursFromDate(start, 5),
      actualStartTime: hoursFromDate(start, 0.5),
      actualEndTime: hoursFromDate(start, 4.5),
      flightHours: (2 + Math.random() * 3).toFixed(2),
    });
    missions.push(await missionRepo.save(m));
  }

  console.log(`Seeded ${missions.length} missions.`);

  // --- MAINTENANCE LOGS (35) ---
  const logs: MaintenanceLogOrmEntity[] = [];
  const nonRetiredDrones = drones.filter(
    (d) => d.status !== DroneStatus.RETIRED,
  );

  for (let i = 0; i < 35; i++) {
    const droneIdx = i % nonRetiredDrones.length;
    const drone = nonRetiredDrones[droneIdx];
    const performed = daysAgo(10 + i * 5);
    const hoursAtMaint = Math.max(
      0,
      parseFloat(drone.totalFlightHours) - i * 2,
    );

    const log = maintenanceRepo.create({
      droneId: drone.id,
      type: MAINTENANCE_TYPES[i % MAINTENANCE_TYPES.length],
      technicianName: TECHNICIANS[i % TECHNICIANS.length],
      notes:
        i % 3 === 0
          ? null
          : `Maintenance note for log ${i + 1}. All checks passed.`,
      datePerformed: performed,
      flightHoursAtMaintenance: Math.max(0, hoursAtMaint).toFixed(2),
    });
    logs.push(await maintenanceRepo.save(log));
  }

  console.log(`Seeded ${logs.length} maintenance logs.`);

  console.log('\nSeed completed successfully!');
  console.log(`  Drones: ${drones.length}`);
  console.log(`  Missions: ${missions.length}`);
  console.log(`  Maintenance Logs: ${logs.length}`);

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
