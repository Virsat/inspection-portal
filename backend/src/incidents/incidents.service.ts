import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncidentStatus } from '@prisma/client';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) { }

  async createIncident(inspectorId: number, data: any) {
    return this.prisma.incident.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        location: data.location,
        inspectorId: inspectorId,
        imageUrls: data.imageUrls || [],
        status: 'OPEN',
      },
    });
  }

  async processExternalIncident(payload: any) {
    console.log('Incoming external incident payload:', JSON.stringify(payload, null, 2));

    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Invalid or missing payload body');
    }

    const {
      employee_id,
      category,
      location,
      severity,
      analysis,
      media,
      timestamp,
      incident_id
    } = payload;

    // 1. Validate required fields
    if (!employee_id) {
      throw new BadRequestException('Field "employee_id" is required and missing in payload');
    }
    if (!incident_id) {
      throw new BadRequestException('Field "incident_id" is required and missing in payload');
    }

    // Ensure employee_id is string for consistent lookup
    const empIdStr = String(employee_id);

    // 1. Find Inspector by qrCode
    const inspector = await this.prisma.user.findFirst({
      where: { qrCode: empIdStr, role: 'INSPECTOR' }
    });

    if (!inspector) {
      throw new NotFoundException(`Inspector with employee_id "${empIdStr}" not found in registered users`);
    }

    // 2. Format description for visibility in UI
    const formattedDescription = `External report from ${inspector.name}. Analysis: ${analysis?.immediate_cause || 'N/A'}. Severity Overall: ${severity?.overall || 'N/A'}`;

    // 3. Create or Update (Idempotency check)
    const externalIdStr = String(incident_id);
    const existing = await this.prisma.incident.findFirst({
      where: { externalId: externalIdStr }
    });

    const commonData = {
      title: `${category || 'Incident'} at ${location || 'Unknown Location'}`,
      description: formattedDescription,
      type: category || 'UNCATEGORIZED',
      location: location || 'N/A',
      severity: severity || null,
      analysis: analysis || null,
      imageUrls: media || []
    };

    if (existing) {
      return this.prisma.incident.update({
        where: { id: existing.id },
        data: {
          ...commonData,
          updatedAt: new Date()
        }
      });
    } else {
      return this.prisma.incident.create({
        data: {
          ...commonData,
          externalId: externalIdStr,
          inspectorId: inspector.id,
          createdAt: timestamp ? new Date(Number(timestamp)) : new Date(),
          status: 'OPEN'
        }
      });
    }
  }

  async getAllIncidents(filters: any) {
    const where: any = {};
    if (filters.inspectorId) where.inspectorId = Number(filters.inspectorId);
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = new Date(filters.fromDate);
      if (filters.toDate) {
        const to = new Date(filters.toDate);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    return this.prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        inspector: { select: { id: true, email: true } },
      },
    });
  }

  async updateStatus(id: number, status: IncidentStatus) {
    return this.prisma.incident.update({
      where: { id },
      data: { status },
    });
  }

  async getIncidentStats() {
    const [total, open, resolved, inspectorsCount] = await Promise.all([
      this.prisma.incident.count(),
      this.prisma.incident.count({ where: { status: 'OPEN' } }),
      this.prisma.incident.count({ where: { status: 'RESOLVED' } }),
      this.prisma.user.count({ where: { role: 'INSPECTOR' } }),
    ]);

    return { total, open, resolved, inspectorsCount };
  }

  async getIncidentById(id: number) {
    return this.prisma.incident.findUnique({
      where: { id },
      include: {
        inspector: { select: { id: true, email: true, name: true } },
        comments: {
          include: {
            user: { select: { id: true, email: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });
  }

  async addComment(incidentId: number, userId: number, content: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.incidentComment.create({
      data: {
        content,
        incidentId,
        userId
      },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } }
      }
    });
  }
}
