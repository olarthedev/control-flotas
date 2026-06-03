import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './vehicle.entity';
import { Trip } from '../trips/trip.entity';
import { Expense } from '../expenses/expense.entity';
import { MaintenanceRecord } from '../maintenance/maintenance-record.entity';
import { Consignment } from '../consignments/consignment.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  query: jest.fn().mockResolvedValue([]),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  }),
});

describe('VehiclesService', () => {
  let service: VehiclesService;
  let vehicleRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    vehicleRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        { provide: getRepositoryToken(Vehicle), useValue: vehicleRepo },
        { provide: getRepositoryToken(Trip), useValue: mockRepo() },
        { provide: getRepositoryToken(Expense), useValue: mockRepo() },
        { provide: getRepositoryToken(MaintenanceRecord), useValue: mockRepo() },
        { provide: getRepositoryToken(Consignment), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns vehicles with relations', async () => {
    const vehicles = [{ id: 1, licensePlate: 'WHU-977' }];
    vehicleRepo.find.mockResolvedValue(vehicles);

    const result = await service.findAll();

    expect(result).toEqual(vehicles);
  });

  it('findById returns vehicle by id', async () => {
    const vehicle = { id: 1, licensePlate: 'WHU-977' };
    vehicleRepo.findOne.mockResolvedValue(vehicle);

    const result = await service.findById(1);

    expect(result).toEqual(vehicle);
  });

  it('update throws NotFoundException when vehicle not found', async () => {
    vehicleRepo.findOne.mockResolvedValue(null);

    await expect(service.update(99, { brand: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('remove throws NotFoundException when vehicle not found', async () => {
    vehicleRepo.findOne.mockResolvedValue(null);

    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });

  it('getVehicleListSummaries returns mapped summaries', async () => {
    vehicleRepo.query.mockResolvedValue([
      {
        id: '1',
        licensePlate: 'WHU-977',
        brand: 'Chevrolet',
        model: 'NPR',
        type: 'Furgon',
        soatExpiryDate: null,
        technicalReviewExpiryDate: null,
        totalExpense: '320000',
        lastMaintenanceDate: null,
      },
    ]);

    const result = await service.getVehicleListSummaries();

    expect(result).toHaveLength(1);
    expect(result[0].licensePlate).toBe('WHU-977');
    expect(result[0].totalExpense).toBe(320000);
  });
});
