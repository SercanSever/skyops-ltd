import { randomUUID } from 'crypto';
import { MaintenanceType } from '../enums/maintenance-type.enum';

interface MaintenanceLogProps {
  id: string;
  droneId: string;
  type: MaintenanceType;
  technicianName: string;
  notes: string | null;
  datePerformed: Date;
  flightHoursAtMaintenance: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateMaintenanceLogProps {
  droneId: string;
  type: MaintenanceType;
  technicianName: string;
  notes: string | null;
  datePerformed: Date;
  flightHoursAtMaintenance: number;
}

export class MaintenanceLog {
  private readonly props: MaintenanceLogProps;

  private constructor(props: MaintenanceLogProps) {
    this.props = props;
  }

  static create(props: CreateMaintenanceLogProps): MaintenanceLog {
    if (props.flightHoursAtMaintenance < 0) {
      throw new Error(
        'Flight hours at maintenance must be a non-negative number',
      );
    }

    if (props.datePerformed.getTime() > Date.now()) {
      throw new Error('Date performed cannot be in the future');
    }

    const now = new Date();
    return new MaintenanceLog({
      id: randomUUID(),
      droneId: props.droneId,
      type: props.type,
      technicianName: props.technicianName,
      notes: props.notes,
      datePerformed: props.datePerformed,
      flightHoursAtMaintenance: props.flightHoursAtMaintenance,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: MaintenanceLogProps): MaintenanceLog {
    return new MaintenanceLog(props);
  }

  get id(): string {
    return this.props.id;
  }

  get droneId(): string {
    return this.props.droneId;
  }

  get type(): MaintenanceType {
    return this.props.type;
  }

  get technicianName(): string {
    return this.props.technicianName;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get datePerformed(): Date {
    return this.props.datePerformed;
  }

  get flightHoursAtMaintenance(): number {
    return this.props.flightHoursAtMaintenance;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
