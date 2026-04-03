import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { MissionStatus } from '../../domain/enums/mission-status.enum';

export class TransitionMissionRequestDto {
  @IsEnum(MissionStatus, {
    message: `Status must be one of: ${Object.values(MissionStatus).join(', ')}`,
  })
  status!: MissionStatus;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  flightHours?: number;

  @IsOptional()
  @IsString()
  abortReason?: string;
}
