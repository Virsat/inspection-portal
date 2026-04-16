import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, ParseIntPipe, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InspectionsController {
  constructor(private inspectionsService: InspectionsService) {}

  @Roles('MANAGER', 'INSPECTOR')
  @Post()
  async createInspection(@Body() body: any, @Request() req: any) {
    // Both can create, but an inspector implies it's for them.
    const inspectorId = req.user.role === 'INSPECTOR' ? req.user.id : body.inspectorId;
    return this.inspectionsService.createInspection(inspectorId, body.inspectionTypeId);
  }

  @Post('external')
  async createExternalInspection(@Body() body: any) {
    return this.inspectionsService.processExternalInspection(body);
  }

  @Roles('INSPECTOR')
  @Post(':id/answers')
  async submitAnswers(
    @Param('id', ParseIntPipe) id: number,
    @Body('answers') answers: any[],
    @Request() req: any
  ) {
    return this.inspectionsService.submitAnswers(id, req.user.id, answers);
  }

  @Roles('INSPECTOR')
  @Get('my')
  async getMyInspections(@Request() req: any) {
    return this.inspectionsService.getMyInspections(req.user.id);
  }

  @Roles('MANAGER')
  @Get()
  async getAllInspections(@Query() query: any) {
    return this.inspectionsService.getAllInspections(query);
  }

  @Get('types')
  async getInspectionTypes() {
    return this.inspectionsService.getInspectionTypes();
  }

  @Roles('INSPECTOR')
  @Get('types/allowed')
  async getAllowedTypes(@Request() req: any) {
    return this.inspectionsService.getAllowedTypes(req.user.id);
  }

  @Get(':id/results')
  async getInspectionResults(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const results = await this.inspectionsService.getInspectionResults(id);
    if (!results) throw new NotFoundException();
    
    if (req.user.role === 'INSPECTOR' && results.inspection.inspector.id !== req.user.id) {
       throw new ForbiddenException("Access denied");
    }
    return results;
  }

  @Roles('MANAGER')
  @Get('analytics')
  async getDashboardAnalytics() {
    return this.inspectionsService.getDashboardAnalytics();
  }
}
