import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { MissionType } from '../../domain/enums/mission-type.enum';

export class CreateMissionRequestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(MissionType, {
    message: `Type must be one of: ${Object.values(MissionType).join(', ')}`,
  })
  type!: MissionType;

  @IsUUID()
  droneId!: string;

  @IsString()
  @IsNotEmpty()
  pilotName!: string;

  @IsString()
  @IsNotEmpty()
  siteLocation!: string;

  @IsDateString()
  plannedStartTime!: string;

  @IsDateString()
  plannedEndTime!: string;
}
