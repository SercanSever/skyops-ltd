import { Mission } from './mission.entity';
import { MissionStatus } from '../enums/mission-status.enum';
import { MissionType } from '../enums/mission-type.enum';

describe('Mission', () => {
  const createMission = () =>
    Mission.create({
      name: 'Test Mission',
      type: MissionType.WIND_TURBINE_INSPECTION,
      droneId: 'drone-123',
      pilotName: 'John Doe',
      siteLocation: 'Wind Farm Alpha',
      plannedStartTime: new Date('2027-01-01T10:00:00Z'),
      plannedEndTime: new Date('2027-01-01T14:00:00Z'),
    });

  describe('create', () => {
    it('should create with PLANNED status and null actual fields', () => {
      const mission = createMission();

      expect(mission.id).toBeDefined();
      expect(mission.name).toBe('Test Mission');
      expect(mission.type).toBe(MissionType.WIND_TURBINE_INSPECTION);
      expect(mission.droneId).toBe('drone-123');
      expect(mission.pilotName).toBe('John Doe');
      expect(mission.siteLocation).toBe('Wind Farm Alpha');
      expect(mission.status).toBe(MissionStatus.PLANNED);
      expect(mission.actualStartTime).toBeNull();
      expect(mission.actualEndTime).toBeNull();
      expect(mission.flightHours).toBeNull();
      expect(mission.abortReason).toBeNull();
    });

    it('should throw if plannedEndTime <= plannedStartTime', () => {
      const sameTime = new Date('2027-01-01T10:00:00Z');
      expect(() =>
        Mission.create({
          name: 'Test',
          type: MissionType.SOLAR_PANEL_SURVEY,
          droneId: 'drone-123',
          pilotName: 'Jane',
          siteLocation: 'Site',
          plannedStartTime: sameTime,
          plannedEndTime: sameTime,
        }),
      ).toThrow('Planned end time must be after planned start time');
    });

    it('should throw if plannedEndTime is before plannedStartTime', () => {
      expect(() =>
        Mission.create({
          name: 'Test',
          type: MissionType.SOLAR_PANEL_SURVEY,
          droneId: 'drone-123',
          pilotName: 'Jane',
          siteLocation: 'Site',
          plannedStartTime: new Date('2027-01-02T10:00:00Z'),
          plannedEndTime: new Date('2027-01-01T10:00:00Z'),
        }),
      ).toThrow('Planned end time must be after planned start time');
    });
  });

  describe('reconstitute', () => {
    it('should load all properties', () => {
      const now = new Date();
      const mission = Mission.reconstitute({
        id: 'mission-id',
        name: 'Loaded Mission',
        type: MissionType.POWER_LINE_PATROL,
        droneId: 'drone-456',
        pilotName: 'Pilot',
        siteLocation: 'Site',
        status: MissionStatus.IN_PROGRESS,
        plannedStartTime: now,
        plannedEndTime: now,
        actualStartTime: now,
        actualEndTime: null,
        flightHours: null,
        abortReason: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(mission.id).toBe('mission-id');
      expect(mission.status).toBe(MissionStatus.IN_PROGRESS);
      expect(mission.actualStartTime).toBe(now);
    });
  });

  describe('canTransitionTo', () => {
    it.each([
      [MissionStatus.PLANNED, MissionStatus.PRE_FLIGHT_CHECK, true],
      [MissionStatus.PLANNED, MissionStatus.ABORTED, true],
      [MissionStatus.PLANNED, MissionStatus.IN_PROGRESS, false],
      [MissionStatus.PLANNED, MissionStatus.COMPLETED, false],
      [MissionStatus.PRE_FLIGHT_CHECK, MissionStatus.IN_PROGRESS, true],
      [MissionStatus.PRE_FLIGHT_CHECK, MissionStatus.ABORTED, true],
      [MissionStatus.PRE_FLIGHT_CHECK, MissionStatus.PLANNED, false],
      [MissionStatus.IN_PROGRESS, MissionStatus.COMPLETED, true],
      [MissionStatus.IN_PROGRESS, MissionStatus.ABORTED, true],
      [MissionStatus.IN_PROGRESS, MissionStatus.PLANNED, false],
      [MissionStatus.COMPLETED, MissionStatus.PLANNED, false],
      [MissionStatus.COMPLETED, MissionStatus.ABORTED, false],
      [MissionStatus.ABORTED, MissionStatus.PLANNED, false],
      [MissionStatus.ABORTED, MissionStatus.IN_PROGRESS, false],
    ])('%s → %s should be %s', (from, to, expected) => {
      const now = new Date();
      const mission = Mission.reconstitute({
        id: 'id',
        name: 'Test',
        type: MissionType.WIND_TURBINE_INSPECTION,
        droneId: 'drone',
        pilotName: 'Pilot',
        siteLocation: 'Site',
        status: from,
        plannedStartTime: now,
        plannedEndTime: new Date(now.getTime() + 3600000),
        actualStartTime: null,
        actualEndTime: null,
        flightHours: null,
        abortReason: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(mission.canTransitionTo(to)).toBe(expected);
    });
  });

  describe('transitionTo', () => {
    it('PLANNED → PRE_FLIGHT_CHECK', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.PRE_FLIGHT_CHECK);
      expect(mission.status).toBe(MissionStatus.PRE_FLIGHT_CHECK);
    });

    it('PRE_FLIGHT_CHECK → IN_PROGRESS should set actualStartTime', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.PRE_FLIGHT_CHECK);
      mission.transitionTo(MissionStatus.IN_PROGRESS);

      expect(mission.status).toBe(MissionStatus.IN_PROGRESS);
      expect(mission.actualStartTime).toBeInstanceOf(Date);
    });

    it('IN_PROGRESS → COMPLETED should require flightHours', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.PRE_FLIGHT_CHECK);
      mission.transitionTo(MissionStatus.IN_PROGRESS);

      expect(() => mission.transitionTo(MissionStatus.COMPLETED)).toThrow(
        'Flight hours must be a positive number',
      );
    });

    it('IN_PROGRESS → COMPLETED should set flightHours and actualEndTime', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.PRE_FLIGHT_CHECK);
      mission.transitionTo(MissionStatus.IN_PROGRESS);
      mission.transitionTo(MissionStatus.COMPLETED, { flightHours: 2.5 });

      expect(mission.status).toBe(MissionStatus.COMPLETED);
      expect(mission.flightHours).toBe(2.5);
      expect(mission.actualEndTime).toBeInstanceOf(Date);
    });

    it('COMPLETED with zero flightHours should throw', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.PRE_FLIGHT_CHECK);
      mission.transitionTo(MissionStatus.IN_PROGRESS);

      expect(() =>
        mission.transitionTo(MissionStatus.COMPLETED, { flightHours: 0 }),
      ).toThrow('Flight hours must be a positive number');
    });

    it('COMPLETED with negative flightHours should throw', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.PRE_FLIGHT_CHECK);
      mission.transitionTo(MissionStatus.IN_PROGRESS);

      expect(() =>
        mission.transitionTo(MissionStatus.COMPLETED, { flightHours: -1 }),
      ).toThrow('Flight hours must be a positive number');
    });

    it('Any → ABORTED should set actualEndTime', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.ABORTED);

      expect(mission.status).toBe(MissionStatus.ABORTED);
      expect(mission.actualEndTime).toBeInstanceOf(Date);
    });

    it('ABORTED without reason should succeed', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.ABORTED);

      expect(mission.abortReason).toBeNull();
    });

    it('ABORTED with reason should store it', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.ABORTED, {
        abortReason: 'Weather conditions',
      });

      expect(mission.abortReason).toBe('Weather conditions');
    });

    it('should throw on invalid transition', () => {
      const mission = createMission();
      expect(() => mission.transitionTo(MissionStatus.COMPLETED)).toThrow(
        'Invalid state transition: PLANNED → COMPLETED',
      );
    });

    it('COMPLETED is terminal - no further transitions', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.PRE_FLIGHT_CHECK);
      mission.transitionTo(MissionStatus.IN_PROGRESS);
      mission.transitionTo(MissionStatus.COMPLETED, { flightHours: 1 });

      expect(() => mission.transitionTo(MissionStatus.ABORTED)).toThrow(
        'Invalid state transition',
      );
    });

    it('ABORTED is terminal - no further transitions', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.ABORTED);

      expect(() => mission.transitionTo(MissionStatus.PLANNED)).toThrow(
        'Invalid state transition',
      );
    });

    it('IN_PROGRESS → ABORTED should set actualEndTime', () => {
      const mission = createMission();
      mission.transitionTo(MissionStatus.PRE_FLIGHT_CHECK);
      mission.transitionTo(MissionStatus.IN_PROGRESS);
      mission.transitionTo(MissionStatus.ABORTED, {
        abortReason: 'Emergency landing',
      });

      expect(mission.status).toBe(MissionStatus.ABORTED);
      expect(mission.actualEndTime).toBeInstanceOf(Date);
      expect(mission.abortReason).toBe('Emergency landing');
    });
  });
});
