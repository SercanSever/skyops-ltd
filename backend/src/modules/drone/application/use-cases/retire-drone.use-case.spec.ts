import { RetireDroneUseCase } from './retire-drone.use-case';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { IDroneRepository } from '../../domain/repositories/drone.repository.interface';
import { Drone } from '../../domain/entities/drone.entity';
import { DroneModel } from '../../domain/enums/drone-model.enum';
import { DroneStatus } from '../../domain/enums/drone-status.enum';
import { SerialNumber } from '../../domain/value-objects/serial-number.vo';

describe('RetireDroneUseCase', () => {
  let useCase: RetireDroneUseCase;
  let mockRepository: jest.Mocked<IDroneRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findBySerialNumber: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      hasScheduledMissions: jest.fn(),
    };
    useCase = new RetireDroneUseCase(mockRepository);
  });

  const createAvailableDrone = () =>
    Drone.reconstitute({
      id: 'drone-123',
      serialNumber: SerialNumber.create('SKY-AB12-CD34'),
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.AVAILABLE,
      totalFlightHours: 100,
      lastMaintenanceDate: null,
      nextMaintenanceDueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  it('should retire drone with no scheduled missions', async () => {
    const drone = createAvailableDrone();
    mockRepository.findById.mockResolvedValue(drone);
    mockRepository.hasScheduledMissions.mockResolvedValue(false);
    mockRepository.save.mockImplementation((d) => Promise.resolve(d));

    const result = await useCase.execute('drone-123');

    expect(result.status).toBe(DroneStatus.RETIRED);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw when drone has scheduled missions', async () => {
    const drone = createAvailableDrone();
    mockRepository.findById.mockResolvedValue(drone);
    mockRepository.hasScheduledMissions.mockResolvedValue(true);

    await expect(useCase.execute('drone-123')).rejects.toThrow(
      BusinessRuleViolationException,
    );
    await expect(useCase.execute('drone-123')).rejects.toThrow(
      'scheduled missions',
    );
  });

  it('should throw when drone not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(
      BusinessRuleViolationException,
    );
    await expect(useCase.execute('non-existent')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw when drone is already retired', async () => {
    const retiredDrone = Drone.reconstitute({
      id: 'drone-123',
      serialNumber: SerialNumber.create('SKY-AB12-CD34'),
      model: DroneModel.PHANTOM_4,
      status: DroneStatus.RETIRED,
      totalFlightHours: 100,
      lastMaintenanceDate: null,
      nextMaintenanceDueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockRepository.findById.mockResolvedValue(retiredDrone);
    mockRepository.hasScheduledMissions.mockResolvedValue(false);

    await expect(useCase.execute('drone-123')).rejects.toThrow(
      'already retired',
    );
  });
});
