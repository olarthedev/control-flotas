import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

const mockVehiclesService: Partial<VehiclesService> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByLicensePlate: jest.fn(),
  getVehicleListSummaries: jest.fn(),
  findVehiclesWithExpiringDocuments: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('VehiclesController', () => {
  let controller: VehiclesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [{ provide: VehiclesService, useValue: mockVehiclesService }],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to VehiclesService.findAll', async () => {
    const vehicles = [{ id: 1, licensePlate: 'WHU-977' }];
    (mockVehiclesService.findAll as jest.Mock).mockResolvedValue(vehicles);

    const result = await controller.findAll();

    expect(result).toEqual(vehicles);
    expect(mockVehiclesService.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne converts string id to number', async () => {
    const vehicle = { id: 2, licensePlate: 'WOT-804' };
    (mockVehiclesService.findById as jest.Mock).mockResolvedValue(vehicle);

    const result = await controller.findOne('2');

    expect(result).toEqual(vehicle);
    expect(mockVehiclesService.findById).toHaveBeenCalledWith(2);
  });

  it('remove converts string id to number', async () => {
    (mockVehiclesService.remove as jest.Mock).mockResolvedValue({ affected: 1 });

    await controller.remove('1');

    expect(mockVehiclesService.remove).toHaveBeenCalledWith(1);
  });
});
