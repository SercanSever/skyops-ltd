import { IsEnum, IsOptional } from 'class-validator';
import { DroneModel } from '../../domain/enums/drone-model.enum';

export class UpdateDroneRequestDto {
  @IsOptional()
  @IsEnum(DroneModel, {
    message: `Model must be one of: ${Object.values(DroneModel).join(', ')}`,
  })
  model?: DroneModel;
}
