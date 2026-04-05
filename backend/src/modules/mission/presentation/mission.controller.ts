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
import { CreateMissionUseCase } from '../application/use-cases/create-mission.use-case';
import { GetMissionUseCase } from '../application/use-cases/get-mission.use-case';
import { ListMissionsUseCase } from '../application/use-cases/list-missions.use-case';
import { TransitionMissionUseCase } from '../application/use-cases/transition-mission.use-case';
import { CreateMissionRequestDto } from './dto/create-mission.request.dto';
import { TransitionMissionRequestDto } from './dto/transition-mission.request.dto';
import { MissionFilterQueryDto } from './dto/mission-filter-query.dto';
import { MissionResponseDto } from './dto/mission.response.dto';

@Controller('missions')
export class MissionController {
  constructor(
    private readonly createMissionUseCase: CreateMissionUseCase,
    private readonly getMissionUseCase: GetMissionUseCase,
    private readonly listMissionsUseCase: ListMissionsUseCase,
    private readonly transitionMissionUseCase: TransitionMissionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMissionRequestDto) {
    const mission = await this.createMissionUseCase.execute({
      name: dto.name,
      type: dto.type,
      droneId: dto.droneId,
      pilotName: dto.pilotName,
      siteLocation: dto.siteLocation,
      plannedStartTime: new Date(dto.plannedStartTime),
      plannedEndTime: new Date(dto.plannedEndTime),
    });
    return MissionResponseDto.fromDomain(mission);
  }

  @Get()
  async list(@Query() query: MissionFilterQueryDto) {
    const { data, total } = await this.listMissionsUseCase.execute({
      page: query.page,
      limit: query.limit,
      status: query.status,
      droneId: query.droneId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      data: data.map((mission) => MissionResponseDto.fromDomain(mission)),
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
    const mission = await this.getMissionUseCase.execute(id);
    return MissionResponseDto.fromDomain(mission);
  }

  @Patch(':id/transition')
  async transition(
    @Param('id') id: string,
    @Body() dto: TransitionMissionRequestDto,
  ) {
    const mission = await this.transitionMissionUseCase.execute(id, {
      status: dto.status,
      flightHours: dto.flightHours,
      abortReason: dto.abortReason,
    });
    return MissionResponseDto.fromDomain(mission);
  }
}
