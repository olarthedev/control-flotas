import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { UserVehicleHistory } from './user-vehicle-history.entity';
import { Consignment } from '../consignments/consignment.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
    getMany: jest.fn().mockResolvedValue([]),
    getRawMany: jest.fn().mockResolvedValue([]),
    execute: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  }),
  query: jest.fn().mockResolvedValue([]),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: ReturnType<typeof mockRepo>;
  let vehicleRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    userRepo = mockRepo();
    vehicleRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Vehicle), useValue: vehicleRepo },
        { provide: getRepositoryToken(UserVehicleHistory), useValue: mockRepo() },
        { provide: getRepositoryToken(Consignment), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns array from repository', async () => {
    const users = [{ id: 1, fullName: 'Carlos' }];
    userRepo.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(result).toEqual(users);
    expect(userRepo.find).toHaveBeenCalledWith({ relations: ['assignedVehicle'] });
  });

  it('findById returns user by id', async () => {
    const user = { id: 2, fullName: 'Edwin' };
    userRepo.findOne.mockResolvedValue(user);

    const result = await service.findById(2);

    expect(result).toEqual(user);
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { id: 2 },
      relations: ['assignedVehicle'],
    });
  });

  it('remove throws NotFoundException when user does not exist', async () => {
    userRepo.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });

  it('remove resolves when user exists', async () => {
    userRepo.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove(1);

    expect(result.affected).toBe(1);
  });
});
