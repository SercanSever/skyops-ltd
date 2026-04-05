import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateMaintenanceLogUseCase } from '../application/use-cases/create-maintenance-log.use-case';
import { GetMaintenanceLogUseCase } from '../application/use-cases/get-maintenance-log.use-case';
import { ListMaintenanceLogsUseCase } from '../application/use-cases/list-maintenance-logs.use-case';
import { CompleteMaintenanceUseCase } from '../application/use-cases/complete-maintenance.use-case';
import { CreateMaintenanceLogRequestDto } from './dto/create-maintenance-log.request.dto';
import { MaintenanceLogFilterQueryDto } from './dto/maintenance-log-filter-query.dto';
import { MaintenanceLogResponseDto } from './dto/maintenance-log.response.dto';

@Controller('maintenance-logs')
export class MaintenanceController {
  constructor(
    private readonly createMaintenanceLogUseCase: CreateMaintenanceLogUseCase,
    private readonly getMaintenanceLogUseCase: GetMaintenanceLogUseCase,
    private readonly listMaintenanceLogsUseCase: ListMaintenanceLogsUseCase,
    private readonly completeMaintenanceUseCase: CompleteMaintenanceUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMaintenanceLogRequestDto) {
    const log = await this.createMaintenanceLogUseCase.execute({
      droneId: dto.droneId,
      type: dto.type,
      technicianName: dto.technicianName,
      notes: dto.notes ?? null,
      datePerformed: new Date(dto.datePerformed),
      flightHoursAtMaintenance: dto.flightHoursAtMaintenance,
    });
    return MaintenanceLogResponseDto.fromDomain(log);
  }

  @Get()
  async list(@Query() query: MaintenanceLogFilterQueryDto) {
    const { data, total } = await this.listMaintenanceLogsUseCase.execute({
      page: query.page,
      limit: query.limit,
      droneId: query.droneId,
      type: query.type,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      data: data.map((log) => MaintenanceLogResponseDto.fromDomain(log)),
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
    const log = await this.getMaintenanceLogUseCase.execute(id);
    return MaintenanceLogResponseDto.fromDomain(log);
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    const log = await this.completeMaintenanceUseCase.execute(id);
    return MaintenanceLogResponseDto.fromDomain(log);
  }
}
