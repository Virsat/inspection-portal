import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class LicensesService {
  constructor(private prisma: PrismaService) {}

  async createLicense(data: { customerName: string; deviceName: string; deviceId: string; expirationDate: string }, createdByEmail: string) {
    // Basic validation
    if (!data.customerName || !data.deviceName || !data.deviceId || !data.expirationDate) {
      throw new BadRequestException('All fields are required');
    }

    const existing = await this.prisma.license.findUnique({
      where: { deviceId: data.deviceId }
    });

    if (existing) {
      throw new BadRequestException('A license for this device ID already exists');
    }

    const key = crypto.randomBytes(6).toString('hex').toUpperCase(); // 12 chars
    const expDate = new Date(data.expirationDate);

    return this.prisma.license.create({
      data: {
        key,
        customerName: data.customerName,
        deviceName: data.deviceName,
        deviceId: data.deviceId,
        expirationDate: expDate,
        createdBy: createdByEmail
      }
    });
  }

  async getAllLicenses() {
    return this.prisma.license.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async verifyLicense(deviceId: string, licenseKey: string) {
    if (!deviceId || !licenseKey) {
      throw new BadRequestException('Device ID and License Key are required');
    }

    const license = await this.prisma.license.findUnique({
      where: { deviceId }
    });

    if (!license) {
      throw new UnauthorizedException('License verification failed: Device not found');
    }

    if (license.key !== licenseKey) {
      await this.prisma.license.update({
        where: { id: license.id },
        data: { totalFailedLogin: { increment: 1 } }
      });
      throw new UnauthorizedException('License verification failed: Invalid key');
    }

    if (!license.isActive) {
      throw new UnauthorizedException('License verification failed: License is deactivated');
    }

    if (new Date() > license.expirationDate) {
      await this.prisma.license.update({
        where: { id: license.id },
        data: { totalFailedLogin: { increment: 1 } }
      });
      throw new UnauthorizedException('License verification failed: License expired');
    }

    // Valid
    await this.prisma.license.update({
      where: { id: license.id },
      data: {
        lastLogin: new Date(),
        totalLogin: { increment: 1 }
      }
    });

    return {
      success: true,
      message: 'License verified successfully',
      device: {
        name: license.deviceName,
        customer: license.customerName,
        expires: license.expirationDate
      }
    };
  }

  async renewLicense(id: number, expirationDate: string) {
    if (!expirationDate) {
      throw new BadRequestException('New expiration date is required');
    }

    const expDate = new Date(expirationDate);
    if (isNaN(expDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.prisma.license.update({
      where: { id },
      data: { expirationDate: expDate }
    });
  }

  async toggleLicenseStatus(id: number, isActive: boolean) {
    return this.prisma.license.update({
      where: { id },
      data: { isActive }
    });
  }
}
