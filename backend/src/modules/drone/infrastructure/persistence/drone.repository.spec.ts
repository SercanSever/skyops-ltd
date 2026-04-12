import { Repository, OptimisticLockVersionMismatchError } from 'typeorm';
import { DroneRepository } from './drone.repository';
import { DroneOrmEntity } from './drone.orm-entity';
import { Drone } from '../../domain/entities/drone.entity';
import { DroneModel } from '../../domain/enums/drone-model.enum';
import { DroneStatus } from '../../domain/enums/drone-status.enum';
import { SerialNumber } from '../../domain/value-objects/serial-number.vo';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';

describe('DroneRepository', () => {
  let repository: DroneRepository;
  let mockTypeOrmRepo: jest.Mocked<Repository<DroneOrmEntity>>;

  const createDrone = () =>
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
    mockTypeOrmRepo = {
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<DroneOrmEntity>>;
    repository = new DroneRepository(mockTypeOrmRepo);
  });

  describe('save', () => {
    it('should save and return domain entity', async () => {
      const drone = createDrone();
      mockTypeOrmRepo.save.mockResolvedValue({
        id: 'drone-123',
        serialNumber: 'SKY-AB12-CD34',
        model: DroneModel.PHANTOM_4,
        status: DroneStatus.AVAILABLE,
        totalFlightHours: '0',
        lastMaintenanceDate: null,
        nextMaintenanceDueDate: null,
        version: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as DroneOrmEntity);

      const result = await repository.save(drone);

      expect(result).toBeInstanceOf(Drone);
      expect(result.id).toBe('drone-123');
      expect(result.version).toBe(2);
    });

    it('should throw 409 on optimistic lock version mismatch', async () => {
      const drone = createDrone();
      mockTypeOrmRepo.save.mockRejectedValue(
        new OptimisticLockVersionMismatchError('DroneOrmEntity', 1, 2),
      );

      await expect(repository.save(drone)).rejects.toThrow(
        BusinessRuleViolationException,
      );
      await expect(repository.save(drone)).rejects.toMatchObject({
        statusCode: 409,
        message:
          'Drone was modified by another request. Please refresh and try again.',
      });
    });

    it('should rethrow non-version-mismatch errors', async () => {
      const drone = createDrone();
      const dbError = new Error('Connection lost');
      mockTypeOrmRepo.save.mockRejectedValue(dbError);

      await expect(repository.save(drone)).rejects.toThrow('Connection lost');
    });
  });
});
