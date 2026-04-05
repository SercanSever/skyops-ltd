import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
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

  @ValidateIf(
    (obj: TransitionMissionRequestDto) => obj.status === MissionStatus.ABORTED,
  )
  @IsString()
  @IsNotEmpty({ message: 'Abort reason is required when aborting a mission' })
  abortReason?: string;
}
