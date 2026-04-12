import { CreateMissionUseCase } from './create-mission.use-case';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { IDroneRepository } from '../../../drone/domain/repositories/drone.repository.interface';
import { IMissionRepository } from '../../domain/repositories/mission.repository.interface';
import { Drone } from '../../../drone/domain/entities/drone.entity';
import { Mission } from '../../domain/entities/mission.entity';
import { DroneModel } from '../../../drone/domain/enums/drone-model.enum';
import { DroneStatus } from '../../../drone/domain/enums/drone-status.enum';
import { MissionType } from '../../domain/enums/mission-type.enum';
import { SerialNumber } from '../../../drone/domain/value-objects/serial-number.vo';

describe('CreateMissionUseCase', () => {
  let useCase: CreateMissionUseCase;
  let mockMissionRepo: jest.Mocked<IMissionRepository>;
  let mockDroneRepo: jest.Mocked<IDroneRepository>;

  const futureDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  };

  const futureEndDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(d.getHours() + 4);
    return d;
  };

  const createAvailableDrone = () =>
    Drone.reconstitute({
      id: 'drone-123',
      serialNumber: SerialNumber.create('SKY-AB12-CD34'),
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.AVAILABLE,
      totalFlightHours: 0,
      lastMaintenanceDate: null,
      nextMaintenanceDueDate: null,
      version: 1,
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
      findByIds: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      hasScheduledMissions: jest.fn(),
    };
    useCase = new CreateMissionUseCase(mockMissionRepo, mockDroneRepo);
  });

  it('should create mission with valid data', async () => {
    mockDroneRepo.findById.mockResolvedValue(createAvailableDrone());
    mockDroneRepo.save.mockImplementation((d) => Promise.resolve(d));
    mockMissionRepo.findOverlapping.mockResolvedValue(null);
    mockMissionRepo.save.mockImplementation((m) => Promise.resolve(m));

    const result = await useCase.execute({
      name: 'Test Mission',
      type: MissionType.WIND_TURBINE_INSPECTION,
      droneId: 'drone-123',
      pilotName: 'John',
      siteLocation: 'Site A',
      plannedStartTime: futureDate(),
      plannedEndTime: futureEndDate(),
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('Test Mission');
    expect(result.droneId).toBe('drone-123');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDroneRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw 404 when drone not found', async () => {
    mockDroneRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        name: 'Test',
        type: MissionType.SOLAR_PANEL_SURVEY,
        droneId: 'non-existent',
        pilotName: 'John',
        siteLocation: 'Site',
        plannedStartTime: futureDate(),
        plannedEndTime: futureEndDate(),
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw 422 when drone not available', async () => {
    const drone = createAvailableDrone();
    drone.setInMission();
    mockDroneRepo.findById.mockResolvedValue(drone);

    await expect(
      useCase.execute({
        name: 'Test',
        type: MissionType.SOLAR_PANEL_SURVEY,
        droneId: 'drone-123',
        pilotName: 'John',
        siteLocation: 'Site',
        plannedStartTime: futureDate(),
        plannedEndTime: futureEndDate(),
      }),
    ).rejects.toThrow('not available');
  });

  it('should throw 422 when scheduling in the past', async () => {
    mockDroneRepo.findById.mockResolvedValue(createAvailableDrone());

    const pastDate = new Date('2020-01-01');
    const pastEndDate = new Date('2020-01-02');

    await expect(
      useCase.execute({
        name: 'Test',
        type: MissionType.POWER_LINE_PATROL,
        droneId: 'drone-123',
        pilotName: 'John',
        siteLocation: 'Site',
        plannedStartTime: pastDate,
        plannedEndTime: pastEndDate,
      }),
    ).rejects.toThrow('future');
  });

  it('should throw 409 when overlapping mission exists', async () => {
    mockDroneRepo.findById.mockResolvedValue(createAvailableDrone());

    const existingMission = Mission.create({
      name: 'Existing',
      type: MissionType.WIND_TURBINE_INSPECTION,
      droneId: 'drone-123',
      pilotName: 'Pilot',
      siteLocation: 'Site',
      plannedStartTime: futureDate(),
      plannedEndTime: futureEndDate(),
    });
    mockMissionRepo.findOverlapping.mockResolvedValue(existingMission);

    await expect(
      useCase.execute({
        name: 'Test',
        type: MissionType.SOLAR_PANEL_SURVEY,
        droneId: 'drone-123',
        pilotName: 'John',
        siteLocation: 'Site',
        plannedStartTime: futureDate(),
        plannedEndTime: futureEndDate(),
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('should throw 409 when concurrent creation causes version conflict', async () => {
    mockDroneRepo.findById.mockResolvedValue(createAvailableDrone());
    mockMissionRepo.findOverlapping.mockResolvedValue(null);
    mockDroneRepo.save.mockRejectedValue(
      new BusinessRuleViolationException(
        'Drone was modified by another request. Please refresh and try again.',
        409,
        { entityId: 'drone-123', expectedVersion: 1 },
      ),
    );

    await expect(
      useCase.execute({
        name: 'Test',
        type: MissionType.SOLAR_PANEL_SURVEY,
        droneId: 'drone-123',
        pilotName: 'John',
        siteLocation: 'Site',
        plannedStartTime: futureDate(),
        plannedEndTime: futureEndDate(),
      }),
    ).rejects.toMatchObject({ statusCode: 409 });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockMissionRepo.save).not.toHaveBeenCalled();
  });
});
