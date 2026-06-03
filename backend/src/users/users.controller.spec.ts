import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ChangeUserPasswordUseCase } from './application/change-user-password.use-case';

const mockUsersService: Partial<UsersService> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findDrivers: jest.fn(),
  findDriverSummaries: jest.fn(),
  findAdmins: jest.fn(),
  findActive: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  assignDriverVehicle: jest.fn(),
  getDriverVehicleAssignmentHistory: jest.fn(),
  deactivate: jest.fn(),
  activate: jest.fn(),
};

const mockChangePasswordUseCase: Partial<ChangeUserPasswordUseCase> = {
  execute: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: ChangeUserPasswordUseCase, useValue: mockChangePasswordUseCase },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to UsersService.findAll', async () => {
    const users = [{ id: 1, fullName: 'Test' }];
    (mockUsersService.findAll as jest.Mock).mockResolvedValue(users);

    const result = await controller.findAll();

    expect(result).toEqual(users);
    expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne converts string id to number', async () => {
    const user = { id: 5, fullName: 'Driver' };
    (mockUsersService.findById as jest.Mock).mockResolvedValue(user);

    const result = await controller.findOne('5');

    expect(result).toEqual(user);
    expect(mockUsersService.findById).toHaveBeenCalledWith(5);
  });

  it('remove converts string id to number', async () => {
    (mockUsersService.remove as jest.Mock).mockResolvedValue({ affected: 1 });

    await controller.remove('3');

    expect(mockUsersService.remove).toHaveBeenCalledWith(3);
  });
});
