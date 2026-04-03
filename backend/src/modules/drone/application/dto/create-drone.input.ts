import { DroneModel } from '../../domain/enums/drone-model.enum';

export interface CreateDroneInput {
  serialNumber: string;
  model: DroneModel;
}
