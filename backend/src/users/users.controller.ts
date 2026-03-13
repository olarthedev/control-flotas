import { Controller, Post, Body, Get, Param, Patch, Delete, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserPasswordUseCase } from './application/change-user-password.use-case';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly changeUserPasswordUseCase: ChangeUserPasswordUseCase,
    ) { }

    /**
     * POST /users
     * Create a new user with the provided data.
     */
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    /**
     * GET /users
     * Return a list of all users in the system.
     */
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    /** GET /users/drivers */
    @Get('drivers')
    findDrivers() {
        return this.usersService.findDrivers();
    }

    /** GET /users/drivers/summary */
    @Get('drivers/summary')
    findDriverSummaries() {
        return this.usersService.findDriverSummaries();
    }

    /** GET /users/admins */
    @Get('admins')
    findAdmins() {
        return this.usersService.findAdmins();
    }

    /** GET /users/active */
    @Get('active')
    findActive() {
        return this.usersService.findActive();
    }

    /**
     * GET /users/:id
     * Get a single user by its numeric ID.
     */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(+id);
    }

    /**
     * PATCH /users/:id
     * Update the user with partial data.
     */
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(+id, updateUserDto);
    }

    /**
     * PATCH /users/:id/change-password
     * Change the password for a user. Requires current password for verification.
     */
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

    /** DELETE /users/:id */
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }

    /** PATCH /users/:id/deactivate */
    @Patch(':id/deactivate')
    deactivate(@Param('id') id: string) {
        return this.usersService.deactivate(+id);
    }

    /** PATCH /users/:id/activate */
    @Patch(':id/activate')
    activate(@Param('id') id: string) {
        return this.usersService.activate(+id);
    }
}
