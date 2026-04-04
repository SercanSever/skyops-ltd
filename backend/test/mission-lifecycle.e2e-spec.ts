import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { DataSource } from 'typeorm';

interface DroneResponse {
  id: string;
  serialNumber: string;
  model: string;
  status: string;
  totalFlightHours: number;
  nextMaintenanceDueDate: string | null;
}

interface MissionResponse {
  id: string;
  name: string;
  status: string;
  droneId: string;
  flightHours: number | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
}

describe('Mission Lifecycle (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let droneId: string;
  let missionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    if (missionId) {
      await dataSource.query('DELETE FROM missions WHERE id = $1', [missionId]);
    }
    if (droneId) {
      await dataSource.query('DELETE FROM drones WHERE id = $1', [droneId]);
    }
    await app.close();
  });

  it('should complete full mission lifecycle', async () => {
    // 1. Create drone → AVAILABLE
    const droneRes = await request(app.getHttpServer())
      .post('/api/drones')
      .send({ serialNumber: 'SKY-E2E1-TE5T', model: 'PHANTOM_4' })
      .expect(201);

    const drone = droneRes.body as DroneResponse;
    droneId = drone.id;
    expect(drone.status).toBe('AVAILABLE');
    expect(drone.totalFlightHours).toBe(0);

    // 2. Plan mission → PLANNED
    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 30);
    const futureEnd = new Date(futureStart.getTime() + 4 * 60 * 60 * 1000);

    const missionRes = await request(app.getHttpServer())
      .post('/api/missions')
      .send({
        name: 'E2E Lifecycle Test Mission',
        type: 'WIND_TURBINE_INSPECTION',
        droneId,
        pilotName: 'E2E Pilot',
        siteLocation: 'E2E Test Site',
        plannedStartTime: futureStart.toISOString(),
        plannedEndTime: futureEnd.toISOString(),
      })
      .expect(201);

    const mission = missionRes.body as MissionResponse;
    missionId = mission.id;
    expect(mission.status).toBe('PLANNED');
    expect(mission.droneId).toBe(droneId);

    // 3. Transition → PRE_FLIGHT_CHECK
    const preFlightRes = await request(app.getHttpServer())
      .patch(`/api/missions/${missionId}/transition`)
      .send({ status: 'PRE_FLIGHT_CHECK' })
      .expect(200);

    expect((preFlightRes.body as MissionResponse).status).toBe(
      'PRE_FLIGHT_CHECK',
    );

    // Verify drone still AVAILABLE at PRE_FLIGHT_CHECK
    const droneAtPreFlight = await request(app.getHttpServer())
      .get(`/api/drones/${droneId}`)
      .expect(200);
    expect((droneAtPreFlight.body as DroneResponse).status).toBe('AVAILABLE');

    // 4. Transition → IN_PROGRESS (drone → IN_MISSION)
    const inProgressRes = await request(app.getHttpServer())
      .patch(`/api/missions/${missionId}/transition`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    const inProgress = inProgressRes.body as MissionResponse;
    expect(inProgress.status).toBe('IN_PROGRESS');
    expect(inProgress.actualStartTime).toBeDefined();

    // Verify drone is IN_MISSION
    const droneInMission = await request(app.getHttpServer())
      .get(`/api/drones/${droneId}`)
      .expect(200);
    expect((droneInMission.body as DroneResponse).status).toBe('IN_MISSION');

    // 5. Transition → COMPLETED (flightHours: 2.5)
    const completedRes = await request(app.getHttpServer())
      .patch(`/api/missions/${missionId}/transition`)
      .send({ status: 'COMPLETED', flightHours: 2.5 })
      .expect(200);

    const completed = completedRes.body as MissionResponse;
    expect(completed.status).toBe('COMPLETED');
    expect(completed.flightHours).toBe(2.5);
    expect(completed.actualEndTime).toBeDefined();

    // 6. Verify drone: AVAILABLE, totalFlightHours = 2.5, nextMaintenanceDueDate set
    const droneAfterRes = await request(app.getHttpServer())
      .get(`/api/drones/${droneId}`)
      .expect(200);

    const droneAfter = droneAfterRes.body as DroneResponse;
    expect(droneAfter.status).toBe('AVAILABLE');
    expect(droneAfter.totalFlightHours).toBe(2.5);
    expect(droneAfter.nextMaintenanceDueDate).toBeDefined();
    expect(droneAfter.nextMaintenanceDueDate).not.toBeNull();
  });
});
