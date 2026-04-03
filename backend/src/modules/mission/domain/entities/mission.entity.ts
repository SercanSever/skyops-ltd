import { randomUUID } from 'crypto';
import { MissionStatus } from '../enums/mission-status.enum';
import { MissionType } from '../enums/mission-type.enum';

interface MissionProps {
  id: string;
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  status: MissionStatus;
  plannedStartTime: Date;
  plannedEndTime: Date;
  actualStartTime: Date | null;
  actualEndTime: Date | null;
  flightHours: number | null;
  abortReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateMissionProps {
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  plannedStartTime: Date;
  plannedEndTime: Date;
}

export class Mission {
  private static readonly VALID_TRANSITIONS: Map<
    MissionStatus,
    MissionStatus[]
  > = new Map([
    [
      MissionStatus.PLANNED,
      [MissionStatus.PRE_FLIGHT_CHECK, MissionStatus.ABORTED],
    ],
    [
      MissionStatus.PRE_FLIGHT_CHECK,
      [MissionStatus.IN_PROGRESS, MissionStatus.ABORTED],
    ],
    [
      MissionStatus.IN_PROGRESS,
      [MissionStatus.COMPLETED, MissionStatus.ABORTED],
    ],
    [MissionStatus.COMPLETED, []],
    [MissionStatus.ABORTED, []],
  ]);

  private readonly props: MissionProps;

  private constructor(props: MissionProps) {
    this.props = props;
  }

  static create(props: CreateMissionProps): Mission {
    if (props.plannedEndTime.getTime() <= props.plannedStartTime.getTime()) {
      throw new Error('Planned end time must be after planned start time');
    }

    const now = new Date();
    return new Mission({
      id: randomUUID(),
      name: props.name,
      type: props.type,
      droneId: props.droneId,
      pilotName: props.pilotName,
      siteLocation: props.siteLocation,
      status: MissionStatus.PLANNED,
      plannedStartTime: props.plannedStartTime,
      plannedEndTime: props.plannedEndTime,
      actualStartTime: null,
      actualEndTime: null,
      flightHours: null,
      abortReason: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: MissionProps): Mission {
    return new Mission(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): MissionType {
    return this.props.type;
  }

  get droneId(): string {
    return this.props.droneId;
  }

  get pilotName(): string {
    return this.props.pilotName;
  }

  get siteLocation(): string {
    return this.props.siteLocation;
  }

  get status(): MissionStatus {
    return this.props.status;
  }

  get plannedStartTime(): Date {
    return this.props.plannedStartTime;
  }

  get plannedEndTime(): Date {
    return this.props.plannedEndTime;
  }

  get actualStartTime(): Date | null {
    return this.props.actualStartTime;
  }

  get actualEndTime(): Date | null {
    return this.props.actualEndTime;
  }

  get flightHours(): number | null {
    return this.props.flightHours;
  }

  get abortReason(): string | null {
    return this.props.abortReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  canTransitionTo(newStatus: MissionStatus): boolean {
    const allowed = Mission.VALID_TRANSITIONS.get(this.props.status);
    return allowed !== undefined && allowed.includes(newStatus);
  }

  transitionTo(
    newStatus: MissionStatus,
    data?: { flightHours?: number; abortReason?: string },
  ): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Invalid state transition: ${this.props.status} → ${newStatus}`,
      );
    }

    const now = new Date();

    switch (newStatus) {
      case MissionStatus.PRE_FLIGHT_CHECK:
        break;

      case MissionStatus.IN_PROGRESS:
        this.props.actualStartTime = now;
        break;

      case MissionStatus.COMPLETED:
        if (data?.flightHours === undefined || data.flightHours <= 0) {
          throw new Error(
            'Flight hours must be a positive number when completing a mission',
          );
        }
        this.props.flightHours = data.flightHours;
        this.props.actualEndTime = now;
        break;

      case MissionStatus.ABORTED:
        this.props.abortReason = data?.abortReason ?? null;
        this.props.actualEndTime = now;
        break;
    }

    this.props.status = newStatus;
    this.props.updatedAt = now;
  }
}
