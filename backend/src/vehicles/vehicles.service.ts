import { Injectable } from '@nestjs/common';

@Injectable()
export class VehiclesService {
  findAll() {
    return [
      { id: 1, plate: 'ABC123', type: 'Camión' },
      { id: 2, plate: 'XYZ789', type: 'Furgón' },
    ];
  }
}
