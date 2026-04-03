import { Drone } from './drone.entity';
import { DroneModel } from '../enums/drone-model.enum';
import { DroneStatus } from '../enums/drone-status.enum';
import { SerialNumber } from '../value-objects/serial-number.vo';

describe('Drone', () => {
  const createDrone = () =>
    Drone.create({
      serialNumber: 'SKY-AB12-CD34',
      model: DroneModel.PHANTOM_4,
    });

  describe('create', () => {
    it('should create with correct defaults', () => {
      const drone = createDrone();

      expect(drone.id).toBeDefined();
      expect(drone.serialNumber.getValue()).toBe('SKY-AB12-CD34');
      expect(drone.model).toBe(DroneModel.PHANTOM_4);
      expect(drone.status).toBe(DroneStatus.AVAILABLE);
      expect(drone.totalFlightHours).toBe(0);
      expect(drone.lastMaintenanceDate).toBeNull();
      expect(drone.nextMaintenanceDueDate).toBeNull();
      expect(drone.createdAt).toBeInstanceOf(Date);
      expect(drone.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw on invalid serial number', () => {
      expect(() =>
        Drone.create({ serialNumber: 'INVALID', model: DroneModel.PHANTOM_4 }),
      ).toThrow('Invalid serial number format');
    });
  });

  describe('reconstitute', () => {
    it('should load all properties', () => {
      const now = new Date();
      const drone = Drone.reconstitute({
        id: 'test-id',
        serialNumber: SerialNumber.create('SKY-AB12-CD34'),
        model: DroneModel.MATRICE_300,
        status: DroneStatus.IN_MISSION,
        totalFlightHours: 42.5,
        lastMaintenanceDate: now,
        nextMaintenanceDueDate: now,
        createdAt: now,
        updatedAt: now,
      });

      expect(drone.id).toBe('test-id');
      expect(drone.status).toBe(DroneStatus.IN_MISSION);
      expect(drone.totalFlightHours).toBe(42.5);
    });
  });

  describe('isAvailable', () => {
    it('should return true when AVAILABLE', () => {
      const drone = createDrone();
      expect(drone.isAvailable()).toBe(true);
    });

    it('should return false when not AVAILABLE', () => {
      const drone = createDrone();
      drone.setInMission();
      expect(drone.isAvailable()).toBe(false);
    });
  });

  describe('addFlightHours', () => {
    it('should add hours to total', () => {
      const drone = createDrone();
      drone.addFlightHours(2.5);
      expect(drone.totalFlightHours).toBe(2.5);

      drone.addFlightHours(3.75);
      expect(drone.totalFlightHours).toBe(6.25);
    });

    it('should throw on zero hours', () => {
      const drone = createDrone();
      expect(() => drone.addFlightHours(0)).toThrow('positive number');
    });

    it('should throw on negative hours', () => {
      const drone = createDrone();
      expect(() => drone.addFlightHours(-1)).toThrow('positive number');
    });

    it('should handle floating point precision', () => {
      const drone = createDrone();
      drone.addFlightHours(0.1);
      drone.addFlightHours(0.2);
      expect(drone.totalFlightHours).toBe(0.3);
    });
  });

  describe('status transitions', () => {
    it('setInMission should transition from AVAILABLE', () => {
      const drone = createDrone();
      drone.setInMission();
      expect(drone.status).toBe(DroneStatus.IN_MISSION);
    });

    it('setInMission should throw from non-AVAILABLE', () => {
      const drone = createDrone();
      drone.setMaintenance();
      expect(() => drone.setInMission()).toThrow('must be AVAILABLE');
    });

    it('setAvailable should work from IN_MISSION', () => {
      const drone = createDrone();
      drone.setInMission();
      drone.setAvailable();
      expect(drone.status).toBe(DroneStatus.AVAILABLE);
    });

    it('setAvailable should work from MAINTENANCE', () => {
      const drone = createDrone();
      drone.setMaintenance();
      drone.setAvailable();
      expect(drone.status).toBe(DroneStatus.AVAILABLE);
    });

    it('setMaintenance should transition status', () => {
      const drone = createDrone();
      drone.setMaintenance();
      expect(drone.status).toBe(DroneStatus.MAINTENANCE);
    });
  });

  describe('retire', () => {
    it('should retire when no scheduled missions', () => {
      const drone = createDrone();
      drone.retire(false);
      expect(drone.status).toBe(DroneStatus.RETIRED);
    });

    it('should throw when has scheduled missions', () => {
      const drone = createDrone();
      expect(() => drone.retire(true)).toThrow('scheduled missions');
    });

    it('should throw when already retired', () => {
      const drone = createDrone();
      drone.retire(false);
      expect(() => drone.retire(false)).toThrow('already retired');
    });
  });

  describe('calculateNextMaintenanceDate', () => {
    it('should set date to lastMaintenanceDate + 90 days', () => {
      const lastMaintenance = new Date('2026-01-01');
      const drone = Drone.reconstitute({
        id: 'test-id',
        serialNumber: SerialNumber.create('SKY-AB12-CD34'),
        model: DroneModel.PHANTOM_4,
        status: DroneStatus.AVAILABLE,
        totalFlightHours: 0,
        lastMaintenanceDate: lastMaintenance,
        nextMaintenanceDueDate: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
      });

      drone.calculateNextMaintenanceDate();

      const expected = new Date('2026-04-01');
      expect(drone.nextMaintenanceDueDate!.toDateString()).toBe(
        expected.toDateString(),
      );
    });

    it('should use createdAt when no maintenance done', () => {
      const createdAt = new Date('2026-01-01');
      const drone = Drone.reconstitute({
        id: 'test-id',
        serialNumber: SerialNumber.create('SKY-AB12-CD34'),
        model: DroneModel.PHANTOM_4,
        status: DroneStatus.AVAILABLE,
        totalFlightHours: 0,
        lastMaintenanceDate: null,
        nextMaintenanceDueDate: null,
        createdAt,
        updatedAt: new Date(),
      });

      drone.calculateNextMaintenanceDate();

      const expected = new Date('2026-04-01');
      expect(drone.nextMaintenanceDueDate!.toDateString()).toBe(
        expected.toDateString(),
      );
    });
  });

  describe('isMaintenanceDue', () => {
    it('should return true when nextMaintenanceDueDate is in the past', () => {
      const drone = Drone.reconstitute({
        id: 'test-id',
        serialNumber: SerialNumber.create('SKY-AB12-CD34'),
        model: DroneModel.PHANTOM_4,
        status: DroneStatus.AVAILABLE,
        totalFlightHours: 10,
        lastMaintenanceDate: new Date('2025-01-01'),
        nextMaintenanceDueDate: new Date('2025-06-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date(),
      });

      expect(drone.isMaintenanceDue()).toBe(true);
    });

    it('should return true when flight hours since last maintenance >= 50', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const drone = Drone.reconstitute({
        id: 'test-id',
        serialNumber: SerialNumber.create('SKY-AB12-CD34'),
        model: DroneModel.PHANTOM_4,
        status: DroneStatus.AVAILABLE,
        totalFlightHours: 80,
        lastMaintenanceDate: new Date(),
        nextMaintenanceDueDate: futureDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(drone.isMaintenanceDue(30)).toBe(true);
    });

    it('should return false when no condition met', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const drone = Drone.reconstitute({
        id: 'test-id',
        serialNumber: SerialNumber.create('SKY-AB12-CD34'),
        model: DroneModel.PHANTOM_4,
        status: DroneStatus.AVAILABLE,
        totalFlightHours: 40,
        lastMaintenanceDate: new Date(),
        nextMaintenanceDueDate: futureDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(drone.isMaintenanceDue(30)).toBe(false);
    });

    it('should use 0 as baseline when no flightHoursAtLastMaintenance provided', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const drone = Drone.reconstitute({
        id: 'test-id',
        serialNumber: SerialNumber.create('SKY-AB12-CD34'),
        model: DroneModel.PHANTOM_4,
        status: DroneStatus.AVAILABLE,
        totalFlightHours: 50,
        lastMaintenanceDate: new Date(),
        nextMaintenanceDueDate: futureDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(drone.isMaintenanceDue()).toBe(true);
    });
  });
});
