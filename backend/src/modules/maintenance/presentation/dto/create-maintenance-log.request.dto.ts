import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MaintenanceType } from '../../domain/enums/maintenance-type.enum';

export class CreateMaintenanceLogRequestDto {
  @IsUUID()
  droneId!: string;

  @IsEnum(MaintenanceType, {
    message: `Type must be one of: ${Object.values(MaintenanceType).join(', ')}`,
  })
  type!: MaintenanceType;

  @IsString()
  @IsNotEmpty()
  technicianName!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  datePerformed!: string;

  @IsNumber()
  @Min(0)
  flightHoursAtMaintenance!: number;
}
