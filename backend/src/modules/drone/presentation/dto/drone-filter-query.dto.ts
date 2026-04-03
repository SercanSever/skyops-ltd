import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { DroneModel } from '../../domain/enums/drone-model.enum';
import { DroneStatus } from '../../domain/enums/drone-status.enum';

export class DroneFilterQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(DroneStatus)
  status?: DroneStatus;

  @IsOptional()
  @IsEnum(DroneModel)
  model?: DroneModel;
}
