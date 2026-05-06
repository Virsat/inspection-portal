import { Controller, Post, Get, Patch, Body, Req, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('licenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async createLicense(@Body() body: any, @Req() req: any) {
    return this.licensesService.createLicense(body, req.user.email);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  async getAllLicenses() {
    return this.licensesService.getAllLicenses();
  }

  @Public()
  @Post('verify')
  async verifyLicense(@Body() body: { device_id: string; license_key: string }) {
    return this.licensesService.verifyLicense(body.device_id, body.license_key);
  }

  @Patch(':id/renew')
  @Roles(Role.SUPER_ADMIN)
  async renewLicense(@Param('id', ParseIntPipe) id: number, @Body('expirationDate') expirationDate: string) {
    return this.licensesService.renewLicense(id, expirationDate);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN)
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
    return this.licensesService.toggleLicenseStatus(id, isActive);
  }
}
