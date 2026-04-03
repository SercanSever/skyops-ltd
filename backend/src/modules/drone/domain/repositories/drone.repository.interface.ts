import { Drone } from '../entities/drone.entity';
import { DroneModel } from '../enums/drone-model.enum';
import { DroneStatus } from '../enums/drone-status.enum';

export interface FindAllDronesOptions {
  page?: number;
  limit?: number;
  status?: DroneStatus;
  model?: DroneModel;
}

export interface IDroneRepository {
  findById(id: string): Promise<Drone | null>;
  findBySerialNumber(serialNumber: string): Promise<Drone | null>;
  findAll(
    options?: FindAllDronesOptions,
  ): Promise<{ data: Drone[]; total: number }>;
  save(drone: Drone): Promise<Drone>;
  delete(id: string): Promise<void>;
  hasScheduledMissions(droneId: string): Promise<boolean>;
}

export const DRONE_REPOSITORY = Symbol('IDroneRepository');
