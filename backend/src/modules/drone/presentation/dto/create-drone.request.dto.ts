import { IsEnum, IsString, Matches } from 'class-validator';
import { DroneModel } from '../../domain/enums/drone-model.enum';

export class CreateDroneRequestDto {
  @IsString()
  @Matches(/^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/, {
    message: 'Serial number must match format SKY-XXXX-XXXX (X = A-Z, 0-9)',
  })
  serialNumber!: string;

  @IsEnum(DroneModel, {
    message: `Model must be one of: ${Object.values(DroneModel).join(', ')}`,
  })
  model!: DroneModel;
}
