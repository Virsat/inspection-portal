import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request, ParseIntPipe, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Roles('INSPECTOR', 'MANAGER')
  @Post()
  async createIncident(@Body() body: any, @Request() req: any) {
    return this.incidentsService.createIncident(req.user.id, body);
  }

  @Post('external')
  async createExternalIncident(@Body() body: any) {
    return this.incidentsService.processExternalIncident(body);
  }

  @Roles('INSPECTOR', 'MANAGER')
  @Get()
  async getAllIncidents(@Query() query: any, @Request() req: any) {
    if (req.user.role === 'INSPECTOR') {
      query.inspectorId = req.user.id;
    }
    return this.incidentsService.getAllIncidents(query);
  }

  @Roles('INSPECTOR', 'MANAGER')
  @Get('stats')
  async getIncidentStats(@Request() req: any) {
    // If inspector, stats could be restricted, but dashboard stats are mainly for managers.
    // However, allowing it is fine for now as it's a general count.
    return this.incidentsService.getIncidentStats();
  }

  @Roles('INSPECTOR', 'MANAGER')
  @Get(':id')
  async getIncidentById(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const incident = await this.incidentsService.getIncidentById(id);
    if (!incident) throw new NotFoundException();
    
    if (req.user.role === 'INSPECTOR' && incident.inspectorId !== req.user.id) {
      throw new ForbiddenException("Access denied");
    }
    return incident;
  }

  @Roles('MANAGER')
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: any
  ) {
    return this.incidentsService.updateStatus(id, status);
  }

  @Roles('INSPECTOR', 'MANAGER')
  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @Request() req: any
  ) {
    if (!content || !content.trim()) {
      throw new Error('Comment content is required');
    }
    return this.incidentsService.addComment(id, req.user.id, content);
  }
}
