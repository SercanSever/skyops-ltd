import { TransitionMissionUseCase } from './transition-mission.use-case';
import { IDroneRepository } from '../../../drone/domain/repositories/drone.repository.interface';
import { IMissionRepository } from '../../domain/repositories/mission.repository.interface';
import { Drone } from '../../../drone/domain/entities/drone.entity';
import { Mission } from '../../domain/entities/mission.entity';
import { DroneModel } from '../../../drone/domain/enums/drone-model.enum';
import { DroneStatus } from '../../../drone/domain/enums/drone-status.enum';
import { MissionStatus } from '../../domain/enums/mission-status.enum';
import { MissionType } from '../../domain/enums/mission-type.enum';
import { SerialNumber } from '../../../drone/domain/value-objects/serial-number.vo';

describe('TransitionMissionUseCase', () => {
  let useCase: TransitionMissionUseCase;
  let mockMissionRepo: jest.Mocked<IMissionRepository>;
  let mockDroneRepo: jest.Mocked<IDroneRepository>;

  const createDrone = (status: DroneStatus = DroneStatus.AVAILABLE) =>
    Drone.reconstitute({
      id: 'drone-123',
      serialNumber: SerialNumber.create('SKY-AB12-CD34'),
      model: DroneModel.PHANTOM_4,
      status,
      totalFlightHours: 10,
      lastMaintenanceDate: new Date(),
      nextMaintenanceDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const createMission = (status: MissionStatus = MissionStatus.PLANNED) =>
    Mission.reconstitute({
      id: 'mission-123',
      name: 'Test Mission',
      type: MissionType.WIND_TURBINE_INSPECTION,
      droneId: 'drone-123',
      pilotName: 'John',
      siteLocation: 'Site A',
      status,
      plannedStartTime: new Date('2027-01-01T10:00:00Z'),
      plannedEndTime: new Date('2027-01-01T14:00:00Z'),
      actualStartTime: status === MissionStatus.IN_PROGRESS ? new Date() : null,
      actualEndTime: null,
      flightHours: null,
      abortReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    mockMissionRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      findOverlapping: jest.fn(),
      findByDroneAndStatuses: jest.fn(),
    };
    mockDroneRepo = {
      findById: jest.fn(),
      findBySerialNumber: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      hasScheduledMissions: jest.fn(),
    };
    useCase = new TransitionMissionUseCase(mockMissionRepo, mockDroneRepo);
    mockMissionRepo.save.mockImplementation((m) => Promise.resolve(m));
    mockDroneRepo.save.mockImplementation((d) => Promise.resolve(d));
  });

  it('should throw 404 when mission not found', async () => {
    mockMissionRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', {
        status: MissionStatus.PRE_FLIGHT_CHECK,
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('PLANNED → PRE_FLIGHT_CHECK: no drone side effect', async () => {
    mockMissionRepo.findById.mockResolvedValue(createMission());
    mockDroneRepo.findById.mockResolvedValue(createDrone());

    const result = await useCase.execute('mission-123', {
      status: MissionStatus.PRE_FLIGHT_CHECK,
    });

    expect(result.status).toBe(MissionStatus.PRE_FLIGHT_CHECK);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDroneRepo.save).not.toHaveBeenCalled();
  });

  it('PRE_FLIGHT_CHECK → IN_PROGRESS: drone becomes IN_MISSION', async () => {
    mockMissionRepo.findById.mockResolvedValue(
      createMission(MissionStatus.PRE_FLIGHT_CHECK),
    );
    const drone = createDrone();
    mockDroneRepo.findById.mockResolvedValue(drone);

    const result = await useCase.execute('mission-123', {
      status: MissionStatus.IN_PROGRESS,
    });

    expect(result.status).toBe(MissionStatus.IN_PROGRESS);
    expect(result.actualStartTime).toBeInstanceOf(Date);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDroneRepo.save).toHaveBeenCalled();
  });

  it('IN_PROGRESS → COMPLETED: updates drone flight hours and maintenance', async () => {
    mockMissionRepo.findById.mockResolvedValue(
      createMission(MissionStatus.IN_PROGRESS),
    );
    const drone = createDrone(DroneStatus.IN_MISSION);
    mockDroneRepo.findById.mockResolvedValue(drone);

    const result = await useCase.execute('mission-123', {
      status: MissionStatus.COMPLETED,
      flightHours: 2.5,
    });

    expect(result.status).toBe(MissionStatus.COMPLETED);
    expect(result.flightHours).toBe(2.5);
    expect(result.actualEndTime).toBeInstanceOf(Date);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDroneRepo.save).toHaveBeenCalled();
  });

  it('IN_PROGRESS → ABORTED: drone becomes AVAILABLE', async () => {
    mockMissionRepo.findById.mockResolvedValue(
      createMission(MissionStatus.IN_PROGRESS),
    );
    const drone = createDrone(DroneStatus.IN_MISSION);
    mockDroneRepo.findById.mockResolvedValue(drone);

    const result = await useCase.execute('mission-123', {
      status: MissionStatus.ABORTED,
      abortReason: 'Weather',
    });

    expect(result.status).toBe(MissionStatus.ABORTED);
    expect(result.abortReason).toBe('Weather');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDroneRepo.save).toHaveBeenCalled();
  });

  it('PLANNED → ABORTED: no drone side effect', async () => {
    mockMissionRepo.findById.mockResolvedValue(createMission());
    const drone = createDrone();
    mockDroneRepo.findById.mockResolvedValue(drone);

    const result = await useCase.execute('mission-123', {
      status: MissionStatus.ABORTED,
    });

    expect(result.status).toBe(MissionStatus.ABORTED);
    // drone is AVAILABLE, not IN_MISSION, so no save
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDroneRepo.save).not.toHaveBeenCalled();
  });

  it('should throw 422 on invalid transition', async () => {
    mockMissionRepo.findById.mockResolvedValue(createMission());
    mockDroneRepo.findById.mockResolvedValue(createDrone());

    await expect(
      useCase.execute('mission-123', { status: MissionStatus.COMPLETED }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});
