import { CreateMaintenanceLogUseCase } from './create-maintenance-log.use-case';
import { IMaintenanceLogRepository } from '../../domain/repositories/maintenance-log.repository.interface';
import { IDroneRepository } from '../../../drone/domain/repositories/drone.repository.interface';
import { Drone } from '../../../drone/domain/entities/drone.entity';
import { DroneModel } from '../../../drone/domain/enums/drone-model.enum';
import { DroneStatus } from '../../../drone/domain/enums/drone-status.enum';
import { MaintenanceType } from '../../domain/enums/maintenance-type.enum';
import { SerialNumber } from '../../../drone/domain/value-objects/serial-number.vo';

describe('CreateMaintenanceLogUseCase', () => {
  let useCase: CreateMaintenanceLogUseCase;
  let mockMaintenanceRepo: jest.Mocked<IMaintenanceLogRepository>;
  let mockDroneRepo: jest.Mocked<IDroneRepository>;

  const createDrone = (
    status: DroneStatus = DroneStatus.AVAILABLE,
    totalFlightHours = 25,
  ) =>
    Drone.reconstitute({
      id: 'drone-123',
      serialNumber: SerialNumber.create('SKY-AB12-CD34'),
      model: DroneModel.PHANTOM_4,
      status,
      totalFlightHours,
      lastMaintenanceDate: null,
      nextMaintenanceDueDate: null,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    mockMaintenanceRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
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
    useCase = new CreateMaintenanceLogUseCase(
      mockMaintenanceRepo,
      mockDroneRepo,
    );
    mockMaintenanceRepo.save.mockImplementation((log) => Promise.resolve(log));
    mockDroneRepo.save.mockImplementation((d) => Promise.resolve(d));
  });

  it('should create maintenance log and update drone status', async () => {
    const drone = createDrone();
    mockDroneRepo.findById.mockResolvedValue(drone);

    const result = await useCase.execute({
      droneId: 'drone-123',
      type: MaintenanceType.ROUTINE_CHECK,
      technicianName: 'Tech Smith',
      notes: 'Routine inspection',
      datePerformed: new Date('2026-04-01'),
      flightHoursAtMaintenance: 25,
    });

    expect(result).toBeDefined();
    expect(result.type).toBe(MaintenanceType.ROUTINE_CHECK);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDroneRepo.save).toHaveBeenCalled();
  });

  it('should throw 404 when drone not found', async () => {
    mockDroneRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        droneId: 'non-existent',
        type: MaintenanceType.BATTERY_REPLACEMENT,
        technicianName: 'Tech',
        notes: null,
        datePerformed: new Date(),
        flightHoursAtMaintenance: 10,
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw 422 when drone is IN_MISSION', async () => {
    mockDroneRepo.findById.mockResolvedValue(
      createDrone(DroneStatus.IN_MISSION),
    );

    await expect(
      useCase.execute({
        droneId: 'drone-123',
        type: MaintenanceType.MOTOR_REPAIR,
        technicianName: 'Tech',
        notes: null,
        datePerformed: new Date(),
        flightHoursAtMaintenance: 25,
      }),
    ).rejects.toThrow('currently on a mission');
  });

  it('should throw 422 when flightHoursAtMaintenance is inconsistent', async () => {
    mockDroneRepo.findById.mockResolvedValue(
      createDrone(DroneStatus.AVAILABLE, 25),
    );

    await expect(
      useCase.execute({
        droneId: 'drone-123',
        type: MaintenanceType.FIRMWARE_UPDATE,
        technicianName: 'Tech',
        notes: null,
        datePerformed: new Date(),
        flightHoursAtMaintenance: 50, // drone has 25 hours, diff > 1
      }),
    ).rejects.toThrow('inconsistent');
  });

  it('should allow ±1 hour tolerance', async () => {
    mockDroneRepo.findById.mockResolvedValue(
      createDrone(DroneStatus.AVAILABLE, 25),
    );

    const result = await useCase.execute({
      droneId: 'drone-123',
      type: MaintenanceType.ROUTINE_CHECK,
      technicianName: 'Tech',
      notes: null,
      datePerformed: new Date('2026-04-01'),
      flightHoursAtMaintenance: 25.8, // within ±1 tolerance
    });

    expect(result).toBeDefined();
  });
});
