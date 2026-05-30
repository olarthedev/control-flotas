import { Controller, Post, Body, Get, Param, Patch, Delete, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserPasswordUseCase } from './application/change-user-password.use-case';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AssignDriverVehicleDto } from './dto/assign-driver-vehicle.dto';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly changeUserPasswordUseCase: ChangeUserPasswordUseCase,
    ) { }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get('drivers')
    findDrivers() {
        return this.usersService.findDrivers();
    }

    @Get('drivers/summary')
    findDriverSummaries() {
        return this.usersService.findDriverSummaries();
    }

    @Get('admins')
    findAdmins() {
        return this.usersService.findAdmins();
    }

    @Get('active')
    findActive() {
        return this.usersService.findActive();
    }

    @Get(':id/vehicle-assignment-history')
    getVehicleAssignmentHistory(@Param('id') id: string) {
        return this.usersService.getDriverVehicleAssignmentHistory(+id);
    }

    @Patch(':id/assign-vehicle')
    assignVehicle(
        @Param('id') id: string,
        @Body() assignDriverVehicleDto: AssignDriverVehicleDto,
    ) {
        return this.usersService.assignDriverVehicle(+id, assignDriverVehicleDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Patch(':id/change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Change user password' })
    @ApiResponse({ status: 204, description: 'Password changed successfully' })
    @ApiResponse({ status: 401, description: 'Current password is incorrect' })
    @ApiResponse({ status: 404, description: 'User not found' })
    changePassword(
        @Param('id') id: string,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.changeUserPasswordUseCase.execute(+id, changePasswordDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }

    @Patch(':id/deactivate')
    deactivate(@Param('id') id: string) {
        return this.usersService.deactivate(+id);
    }

    @Patch(':id/activate')
    activate(@Param('id') id: string) {
        return this.usersService.activate(+id);
    }
}
