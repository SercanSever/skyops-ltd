import { Controller, Get } from '@nestjs/common';
import { FleetHealthService } from './fleet-health.service';

@Controller('fleet-health')
export class FleetHealthController {
  constructor(private readonly fleetHealthService: FleetHealthService) {}

  @Get()
  async getReport() {
    return this.fleetHealthService.getReport();
  }
}
