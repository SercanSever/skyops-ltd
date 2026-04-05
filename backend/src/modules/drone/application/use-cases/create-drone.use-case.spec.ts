import { CreateDroneUseCase } from './create-drone.use-case';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { IDroneRepository } from '../../domain/repositories/drone.repository.interface';
import { DroneModel } from '../../domain/enums/drone-model.enum';
import { Drone } from '../../domain/entities/drone.entity';

describe('CreateDroneUseCase', () => {
  let useCase: CreateDroneUseCase;
  let mockRepository: jest.Mocked<IDroneRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findBySerialNumber: jest.fn(),
      findAll: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      hasScheduledMissions: jest.fn(),
    };
    useCase = new CreateDroneUseCase(mockRepository);
  });

  it('should create drone with valid data', async () => {
    mockRepository.findBySerialNumber.mockResolvedValue(null);
    mockRepository.save.mockImplementation((drone) => Promise.resolve(drone));

    const result = await useCase.execute({
      serialNumber: 'SKY-AB12-CD34',
      model: DroneModel.PHANTOM_4,
    });

    expect(result).toBeDefined();
    expect(result.serialNumber.getValue()).toBe('SKY-AB12-CD34');
    expect(result.model).toBe(DroneModel.PHANTOM_4);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepository.findBySerialNumber).toHaveBeenCalledWith(
      'SKY-AB12-CD34',
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw 409 on duplicate serial number', async () => {
    const existingDrone = Drone.create({
      serialNumber: 'SKY-AB12-CD34',
      model: DroneModel.PHANTOM_4,
    });
    mockRepository.findBySerialNumber.mockResolvedValue(existingDrone);

    await expect(
      useCase.execute({
        serialNumber: 'SKY-AB12-CD34',
        model: DroneModel.MATRICE_300,
      }),
    ).rejects.toThrow(BusinessRuleViolationException);

    await expect(
      useCase.execute({
        serialNumber: 'SKY-AB12-CD34',
        model: DroneModel.MATRICE_300,
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('should throw on invalid serial number format', async () => {
    mockRepository.findBySerialNumber.mockResolvedValue(null);

    await expect(
      useCase.execute({
        serialNumber: 'INVALID',
        model: DroneModel.PHANTOM_4,
      }),
    ).rejects.toThrow('Invalid serial number format');
  });
});
