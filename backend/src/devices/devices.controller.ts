import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Roles('MANAGER')
  @Get()
  async getAllDevices() {
    return this.devicesService.getAllDevices();
  }

  @Roles('MANAGER')
  @Post()
  async registerDevice(@Body() body: { id: string; name: string }) {
    return this.devicesService.registerDevice(body.id, body.name);
  }

  @Roles('MANAGER')
  @Delete(':id')
  async deleteDevice(@Param('id') id: string) {
    return this.devicesService.deleteDevice(id);
  }
}
