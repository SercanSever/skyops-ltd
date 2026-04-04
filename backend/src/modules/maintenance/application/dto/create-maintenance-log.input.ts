import { MaintenanceType } from '../../domain/enums/maintenance-type.enum';

export interface CreateMaintenanceLogInput {
  droneId: string;
  type: MaintenanceType;
  technicianName: string;
  notes: string | null;
  datePerformed: Date;
  flightHoursAtMaintenance: number;
}
