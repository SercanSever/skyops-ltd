import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateDroneUseCase } from '../application/use-cases/create-drone.use-case';
import { GetDroneUseCase } from '../application/use-cases/get-drone.use-case';
import { ListDronesUseCase } from '../application/use-cases/list-drones.use-case';
import { UpdateDroneUseCase } from '../application/use-cases/update-drone.use-case';
import { RetireDroneUseCase } from '../application/use-cases/retire-drone.use-case';
import { DeleteDroneUseCase } from '../application/use-cases/delete-drone.use-case';
import { CreateDroneRequestDto } from './dto/create-drone.request.dto';
import { UpdateDroneRequestDto } from './dto/update-drone.request.dto';
import { DroneFilterQueryDto } from './dto/drone-filter-query.dto';
import { DroneResponseDto } from './dto/drone.response.dto';

@Controller('drones')
export class DroneController {
  constructor(
    private readonly createDroneUseCase: CreateDroneUseCase,
    private readonly getDroneUseCase: GetDroneUseCase,
    private readonly listDronesUseCase: ListDronesUseCase,
    private readonly updateDroneUseCase: UpdateDroneUseCase,
    private readonly retireDroneUseCase: RetireDroneUseCase,
    private readonly deleteDroneUseCase: DeleteDroneUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDroneRequestDto) {
    const drone = await this.createDroneUseCase.execute({
      serialNumber: dto.serialNumber,
      model: dto.model,
    });
    return DroneResponseDto.fromDomain(drone);
  }

  @Get()
  async list(@Query() query: DroneFilterQueryDto) {
    const { data, total } = await this.listDronesUseCase.execute({
      page: query.page,
      limit: query.limit,
      status: query.status,
      model: query.model,
    });

    return {
      data: data.map((drone) => DroneResponseDto.fromDomain(drone)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const drone = await this.getDroneUseCase.execute(id);
    return DroneResponseDto.fromDomain(drone);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDroneRequestDto) {
    const drone = await this.updateDroneUseCase.execute(id, {
      model: dto.model,
    });
    return DroneResponseDto.fromDomain(drone);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.deleteDroneUseCase.execute(id);
  }

  @Patch(':id/retire')
  async retire(@Param('id') id: string) {
    const drone = await this.retireDroneUseCase.execute(id);
    return DroneResponseDto.fromDomain(drone);
  }
}
