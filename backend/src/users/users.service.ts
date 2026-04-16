import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createInspector(data: { email: string; password: string; name?: string; designation?: string; unit?: string; permitExpiry?: string; qrCode?: string; canReportIncidents?: boolean }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        designation: data.designation,
        unit: data.unit,
        permitExpiry: data.permitExpiry ? new Date(data.permitExpiry) : null,
        qrCode: data.qrCode,
        canReportIncidents: data.canReportIncidents !== undefined ? data.canReportIncidents : true,
        role: 'INSPECTOR',
      },
      select: { id: true, email: true, name: true, role: true, isActive: true, canReportIncidents: true },
    });
  }

  async assignPermission(inspectorId: number, inspectionTypeId: number) {
    return this.prisma.inspectorPermission.create({
      data: {
        inspectorId,
        inspectionTypeId,
      },
    });
  }

  async getInspectors() {
    return this.prisma.user.findMany({
      where: { role: 'INSPECTOR' },
      select: {
        id: true,
        email: true,
        name: true,
        designation: true,
        unit: true,
        permitExpiry: true,
        qrCode: true,
        isActive: true,
        canReportIncidents: true,
        permissions: {
          include: {
            inspectionType: true
          }
        }
      }
    });
  }

  async updateInspector(id: number, profile: { email?: string; password?: string; name?: string; designation?: string; unit?: string; permitExpiry?: string; qrCode?: string; canReportIncidents?: boolean }) {
    const data: any = {};
    if (profile.email) data.email = profile.email;
    if (profile.password) data.password = await bcrypt.hash(profile.password, 10);
    if (profile.name !== undefined) data.name = profile.name;
    if (profile.designation !== undefined) data.designation = profile.designation;
    if (profile.unit !== undefined) data.unit = profile.unit;
    if (profile.permitExpiry !== undefined) data.permitExpiry = profile.permitExpiry ? new Date(profile.permitExpiry) : null;
    if (profile.qrCode !== undefined) data.qrCode = profile.qrCode;
    if (profile.canReportIncidents !== undefined) data.canReportIncidents = profile.canReportIncidents;

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true, canReportIncidents: true },
    });
  }

  async syncPermissions(inspectorId: number, typeIds: number[]) {
    // Delete existing permissions for this inspector
    await this.prisma.inspectorPermission.deleteMany({
      where: { inspectorId },
    });

    // Create new ones
    return this.prisma.inspectorPermission.createMany({
      data: typeIds.map((typeId) => ({
        inspectorId,
        inspectionTypeId: typeId,
      })),
    });
  }

  async toggleActiveStatus(id: number, status: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: status },
      select: { id: true, isActive: true }
    });
  }

  async deleteInspector(id: number) {
    // 1. Delete permissions first (FK constraint)
    await this.prisma.inspectorPermission.deleteMany({ where: { inspectorId: id } });
    
    // 2. Delete the user
    return this.prisma.user.delete({ where: { id } });
  }

  async getManagers() {
    return this.prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        mustChangePassword: true
      }
    });
  }

  async createManager(data: { email: string; password: string; name: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'MANAGER',
        mustChangePassword: true,
      },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
  }

  async deleteManager(id: number) {
    // Managers don't have permissions like inspectors, but they might have comments
    // For now, let's just delete the user. FK constraints will catch if they have other links.
    return this.prisma.user.delete({ where: { id } });
  }

  async verifyInspectorByQr(qrCode: string) {
    console.log(`[AUTH] Verifying QR Code: "${qrCode}"`);
    
    if (!qrCode || typeof qrCode !== 'string' || qrCode.trim() === '') {
      console.warn(`[AUTH] Rejected: Invalid or missing QR code format`);
      return { isVerified: false };
    }

    const normalizedQr = qrCode.trim();

    const user = await this.prisma.user.findFirst({
      where: { 
        qrCode: normalizedQr, 
        role: 'INSPECTOR', 
        isActive: true 
      },
      include: {
        permissions: {
          include: {
            inspectionType: true,
          },
        },
      },
    });

    console.log(`[AUTH] Database Match: ${user ? 'FOUND (ID: ' + user.id + ')' : 'NOT FOUND'}`);

    if (!user) {
      return { isVerified: false };
    }

    const inspections = user.permissions.map(p => p.inspectionType.name);
    if (user.canReportIncidents) {
      inspections.push("Incident Reporting");
    }

    return {
      isVerified: true,
      name: user.name || 'Unknown Inspector',
      inspections: inspections
    };
  }
}
