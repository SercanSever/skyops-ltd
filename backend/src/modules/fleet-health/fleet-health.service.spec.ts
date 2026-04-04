import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FleetHealthService } from './fleet-health.service';
import { DroneOrmEntity } from '../drone/infrastructure/persistence/drone.orm-entity';
import { MissionOrmEntity } from '../mission/infrastructure/persistence/mission.orm-entity';

describe('FleetHealthService', () => {
  let service: FleetHealthService;

  const mockDroneQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getMany: jest.fn(),
  };

  const mockMissionQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
  };

  const mockDroneRepo = {
    count: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockDroneQueryBuilder),
  };

  const mockMissionRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockMissionQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FleetHealthService,
        {
          provide: getRepositoryToken(DroneOrmEntity),
          useValue: mockDroneRepo,
        },
        {
          provide: getRepositoryToken(MissionOrmEntity),
          useValue: mockMissionRepo,
        },
      ],
    }).compile();

    service = module.get<FleetHealthService>(FleetHealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return fleet health report', async () => {
    mockDroneRepo.count.mockResolvedValue(10);

    mockDroneQueryBuilder.getRawMany.mockResolvedValue([
      { status: 'AVAILABLE', count: '6' },
      { status: 'IN_MISSION', count: '2' },
      { status: 'MAINTENANCE', count: '1' },
      { status: 'RETIRED', count: '1' },
    ]);

    mockDroneQueryBuilder.getMany.mockResolvedValue([
      {
        id: 'drone-1',
        serialNumber: 'SKY-AB12-CD34',
        model: 'PHANTOM_4',
        nextMaintenanceDueDate: new Date('2026-01-01'),
      },
    ]);

    mockDroneQueryBuilder.getRawOne.mockResolvedValue({ avg: '42.50' });

    mockMissionQueryBuilder.getCount.mockResolvedValue(3);

    const report = await service.getReport();

    expect(report.totalDrones).toBe(10);
    expect(report.dronesByStatus.AVAILABLE).toBe(6);
    expect(report.dronesByStatus.IN_MISSION).toBe(2);
    expect(report.dronesByStatus.MAINTENANCE).toBe(1);
    expect(report.dronesByStatus.RETIRED).toBe(1);
    expect(report.overdueMaintenanceDrones).toHaveLength(1);
    expect(report.overdueMaintenanceDrones[0].serialNumber).toBe(
      'SKY-AB12-CD34',
    );
    expect(report.missionsNext24Hours).toBe(3);
    expect(report.averageFlightHours).toBe(42.5);
  });

  it('should return 0 averageFlightHours when no drones', async () => {
    mockDroneRepo.count.mockResolvedValue(0);
    mockDroneQueryBuilder.getRawMany.mockResolvedValue([]);
    mockDroneQueryBuilder.getMany.mockResolvedValue([]);
    mockDroneQueryBuilder.getRawOne.mockResolvedValue({ avg: null });
    mockMissionQueryBuilder.getCount.mockResolvedValue(0);

    const report = await service.getReport();

    expect(report.totalDrones).toBe(0);
    expect(report.averageFlightHours).toBe(0);
    expect(report.overdueMaintenanceDrones).toHaveLength(0);
    expect(report.missionsNext24Hours).toBe(0);
  });
});
