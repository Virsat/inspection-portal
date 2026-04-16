import { Controller, Post, Patch, Get, Delete, Body, UseGuards, Param, ParseIntPipe, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

import { DevicesService } from '../devices/devices.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private devicesService: DevicesService
  ) { }

  @Roles('MANAGER')
  @Post('inspector')
  async createInspector(@Body() body: any) {
    return this.usersService.createInspector(body);
  }

  @Roles('MANAGER')
  @Post('permissions')
  async assignPermission(@Body() body: any) {
    return this.usersService.assignPermission(body.inspectorId, body.inspectionTypeId);
  }

  @Roles('MANAGER')
  @Get('inspectors')
  async getInspectors() {
    return this.usersService.getInspectors();
  }

  @Roles('MANAGER')
  @Patch('inspector/:id')
  async updateInspector(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.usersService.updateInspector(id, body);
  }

  @Roles('MANAGER')
  @Patch('inspector/:id/status')
  async toggleActiveStatus(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.usersService.toggleActiveStatus(id, isActive);
  }

  @Roles('MANAGER')
  @Delete('inspector/:id')
  async deleteInspector(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteInspector(id);
  }

  @Roles('MANAGER')
  @Post('permissions/sync')
  async syncPermissions(@Body() body: any) {
    return this.usersService.syncPermissions(body.inspectorId, body.typeIds);
  }

  @Roles('MANAGER')
  @Get('managers')
  async getManagers() {
    return this.usersService.getManagers();
  }

  @Roles('MANAGER')
  @Post('manager')
  async createManager(@Body() body: any) {
    return this.usersService.createManager(body);
  }

  @Roles('MANAGER')
  @Delete('manager/:id')
  async deleteManager(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteManager(id);
  }

  @Public()
  @Post('verify-qr')
  async verifyByQr(
    @Body() body: any, 
    @Headers('device_id') deviceId: string,
    @Query('qrCode') queryCode?: string
  ) {
    if (!deviceId || !this.devicesService.isValidDevice(deviceId)) {
      throw new UnauthorizedException('Valid device_id header required');
    }

    // 1. Try body property
    let qrCode = body?.qrCode;

    // 2. Try raw string body (NestJS sometimes parses raw text as string)
    if (!qrCode && typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        qrCode = parsed.qrCode || parsed;
      } catch (e) {
        qrCode = body;
      }
    }

    // 3. Try query parameter fallback
    if (!qrCode && queryCode) {
      qrCode = queryCode;
    }

    return this.usersService.verifyInspectorByQr(qrCode);
  }
}
