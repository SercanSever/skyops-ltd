import { randomUUID } from 'crypto';
import { DroneModel } from '../enums/drone-model.enum';
import { DroneStatus } from '../enums/drone-status.enum';
import { SerialNumber } from '../value-objects/serial-number.vo';

interface DroneProps {
  id: string;
  serialNumber: SerialNumber;
  model: DroneModel;
  status: DroneStatus;
  totalFlightHours: number;
  lastMaintenanceDate: Date | null;
  nextMaintenanceDueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateDroneProps {
  serialNumber: string;
  model: DroneModel;
}

export class Drone {
  private readonly props: DroneProps;

  private constructor(props: DroneProps) {
    this.props = props;
  }

  static create(props: CreateDroneProps): Drone {
    const now = new Date();
    return new Drone({
      id: randomUUID(),
      serialNumber: SerialNumber.create(props.serialNumber),
      model: props.model,
      status: DroneStatus.AVAILABLE,
      totalFlightHours: 0,
      lastMaintenanceDate: null,
      nextMaintenanceDueDate: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: DroneProps): Drone {
    return new Drone(props);
  }

  get id(): string {
    return this.props.id;
  }

  get serialNumber(): SerialNumber {
    return this.props.serialNumber;
  }

  get model(): DroneModel {
    return this.props.model;
  }

  get status(): DroneStatus {
    return this.props.status;
  }

  get totalFlightHours(): number {
    return this.props.totalFlightHours;
  }

  get lastMaintenanceDate(): Date | null {
    return this.props.lastMaintenanceDate;
  }

  get nextMaintenanceDueDate(): Date | null {
    return this.props.nextMaintenanceDueDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isAvailable(): boolean {
    return this.props.status === DroneStatus.AVAILABLE;
  }

  canBeRetired(hasScheduledMissions: boolean): boolean {
    return this.props.status !== DroneStatus.RETIRED && !hasScheduledMissions;
  }

  addFlightHours(hours: number): void {
    if (hours <= 0) {
      throw new Error('Flight hours must be a positive number');
    }
    this.props.totalFlightHours =
      Math.round((this.props.totalFlightHours + hours) * 100) / 100;
    this.props.updatedAt = new Date();
  }

  calculateNextMaintenanceDate(): void {
    const baseDate = this.props.lastMaintenanceDate ?? this.props.createdAt;
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + 90);
    this.props.nextMaintenanceDueDate = nextDate;
    this.props.updatedAt = new Date();
  }

  isMaintenanceDue(flightHoursAtLastMaintenance?: number): boolean {
    const now = new Date();

    if (
      this.props.nextMaintenanceDueDate !== null &&
      this.props.nextMaintenanceDueDate.getTime() <= now.getTime()
    ) {
      return true;
    }

    const baseline = flightHoursAtLastMaintenance ?? 0;
    if (this.props.totalFlightHours - baseline >= 50) {
      return true;
    }

    return false;
  }

  setInMission(): void {
    if (this.props.status !== DroneStatus.AVAILABLE) {
      throw new Error(
        `Drone must be AVAILABLE to start a mission. Current status: ${this.props.status}`,
      );
    }
    this.props.status = DroneStatus.IN_MISSION;
    this.props.updatedAt = new Date();
  }

  setAvailable(): void {
    this.props.status = DroneStatus.AVAILABLE;
    this.props.updatedAt = new Date();
  }

  setMaintenance(): void {
    this.props.status = DroneStatus.MAINTENANCE;
    this.props.updatedAt = new Date();
  }

  updateLastMaintenanceDate(date: Date): void {
    this.props.lastMaintenanceDate = date;
    this.props.updatedAt = new Date();
  }

  updateModel(model: DroneModel): void {
    this.props.model = model;
    this.props.updatedAt = new Date();
  }

  retire(hasScheduledMissions: boolean): void {
    if (this.props.status === DroneStatus.RETIRED) {
      throw new Error('Drone is already retired');
    }
    if (hasScheduledMissions) {
      throw new Error('Cannot retire drone with scheduled missions');
    }
    this.props.status = DroneStatus.RETIRED;
    this.props.updatedAt = new Date();
  }
}
