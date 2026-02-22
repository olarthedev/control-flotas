import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from './app.service';
import { User } from './users/user.entity';
import { Vehicle } from './vehicles/vehicle.entity';
import { Trip } from './trips/trip.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('metrics')
  async getMetrics() {
    const [users, vehicles, trips] = await Promise.all([
      this.userRepo.count(),
      this.vehicleRepo.count(),
      this.tripRepo.count(),
    ]);
    return { users, vehicles, trips };
  }
}
