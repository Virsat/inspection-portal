import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InspectionsService {
  constructor(private prisma: PrismaService) { }

  async createInspection(inspectorId: number, inspectionTypeId: number) {
    const permission = await this.prisma.inspectorPermission.findUnique({
      where: {
        inspectorId_inspectionTypeId: {
          inspectorId,
          inspectionTypeId,
        },
      },
    });

    if (!permission) {
      throw new ForbiddenException('Inspector does not have permission for this inspection type');
    }

    return this.prisma.inspection.create({
      data: {
        inspectorId,
        inspectionTypeId,
        status: 'IN_PROGRESS',
      },
    });
  }

  async submitAnswers(inspectionId: number, inspectorId: number, answers: any[]) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    if (inspection.inspectorId !== inspectorId) {
      throw new ForbiddenException('You can only submit answers for your own inspections');
    }

    const typeQuestions = await this.prisma.question.findMany({
      where: {
        section: {
          inspectionTypeId: inspection.inspectionTypeId,
        },
      },
      select: { id: true },
    });

    const validQuestionIds = typeQuestions.map((q) => q.id);

    // Validate if answers belong to the right template
    for (const ans of answers) {
      if (!validQuestionIds.includes(ans.questionId)) {
        throw new BadRequestException(`Question ID ${ans.questionId} does not belong to this inspection type`);
      }
    }

    const createdAnswers = await this.prisma.$transaction(
      answers.map((ans) =>
        this.prisma.answer.create({
          data: {
            inspectionId,
            questionId: ans.questionId,
            answer: ans.answer,
            imageUrl: ans.imageUrl || null,
          },
        })
      )
    );

    return createdAnswers;
  }

  async getMyInspections(inspectorId: number) {
    return this.prisma.inspection.findMany({
      where: { inspectorId },
      include: {
        inspectionType: true,
      },
    });
  }

  async getAllInspections(filters: any) {
    const where: any = {};
    if (filters.inspectorId) {
      where.inspectorId = Number(filters.inspectorId);
    }
    if (filters.inspectionTypeId) {
      where.inspectionTypeId = Number(filters.inspectionTypeId);
    }
    if (filters.status) {
      where.status = filters.status;
    }

    // Date range filtering
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) {
        where.createdAt.gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        // To include the entire 'to' day, we set it to the end of that day
        const to = new Date(filters.toDate);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    return this.prisma.inspection.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        inspector: { select: { id: true, email: true } },
        inspectionType: true,
      },
    });
  }

  async getInspectionTypes() {
    return this.prisma.inspectionType.findMany();
  }

  async getAllowedTypes(inspectorId: number) {
    const perms = await this.prisma.inspectorPermission.findMany({
      where: { inspectorId },
      include: { inspectionType: true },
    });
    return perms.map((p) => p.inspectionType);
  }

  async getInspectionResults(inspectionId: number) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: {
        inspector: { select: { id: true, email: true } },
        inspectionType: {
          include: {
            sections: {
              include: {
                questions: {
                  include: {
                    answers: {
                      where: { inspectionId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    // Transform into required format
    const transformed = {
      inspection: {
        id: inspection.id,
        status: inspection.status,
        createdAt: inspection.createdAt,
        updatedAt: inspection.updatedAt,
        inspector: inspection.inspector,
        inspectionType: {
          id: inspection.inspectionType.id,
          name: inspection.inspectionType.name,
        },
        sections: inspection.inspectionType.sections
          .map((section) => ({
            id: section.id,
            name: section.name,
            questions: section.questions
              .filter(question => question.answers.length > 0)
              .sort((a, b) => a.id - b.id)
              .map((question) => ({
                id: question.id,
                text: question.text,
                isRequired: question.isRequired,
                answer: question.answers[0],
              })),
          }))
          .filter(section => section.questions.length > 0), // Only show sections that have answered questions
      },
    };

    return transformed;
  }

  async processExternalInspection(payload: any) {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Invalid or missing payload body');
    }
    const { answers } = payload;
    if (!answers || answers.length === 0) {
      throw new BadRequestException('No answers provided in payload');
    }

    const processed = [];
    const failed = [];

    // 1. Group answers by cleaned inspection name
    const groups = new Map<string, any[]>();
    for (const ans of answers) {
      const rawName = ans.inspection || 'Unknown';
      const cleaned = rawName.replace(/ Inspection$/i, '').trim();
      if (!groups.has(cleaned)) groups.set(cleaned, []);
      groups.get(cleaned).push(ans);
    }

    // 2. Process each group independently for "Partial Success"
    for (const [templateName, groupAnswers] of groups.entries()) {
      try {
        const firstAns = groupAnswers[0];
        const employeeId = firstAns.employee_id;
        const rawInspectionName = firstAns.inspection;

        // FIND INSPECTOR
        const inspector = await this.prisma.user.findFirst({
          where: { qrCode: employeeId, role: 'INSPECTOR' }
        });
        if (!inspector) throw new Error(`Inspector with employee_id ${employeeId} not found`);

        // FIND TYPE
        const inspectionType = await this.prisma.inspectionType.findUnique({
          where: { name: templateName },
          include: { sections: true }
        });
        if (!inspectionType) throw new Error(`Template '${templateName}' not found in dictionary`);

        // PERMISSION
        const permission = await this.prisma.inspectorPermission.findUnique({
          where: {
            inspectorId_inspectionTypeId: {
              inspectorId: inspector.id,
              inspectionTypeId: inspectionType.id
            }
          }
        });
        if (!permission) throw new Error(`Inspector ${employeeId} not authorized for ${rawInspectionName}`);

        // SECTION CHECK
        const validSectionNames = new Set(inspectionType.sections.map(s => s.name));
        for (const ans of groupAnswers) {
          if (!validSectionNames.has(ans.section)) {
            throw new Error(`Section '${ans.section}' not authorized for template '${templateName}'`);
          }
        }

        // ATOMIC DB SYNC PER GROUP
        const result = await this.prisma.$transaction(async (tx) => {
          let inspection = await tx.inspection.findFirst({
            where: {
              inspectorId: inspector.id,
              inspectionTypeId: inspectionType.id,
              status: 'IN_PROGRESS'
            }
          });

          if (!inspection) {
            inspection = await tx.inspection.create({
              data: {
                inspectorId: inspector.id,
                inspectionTypeId: inspectionType.id,
                status: 'IN_PROGRESS',
                createdAt: new Date(firstAns.timestamp)
              }
            });
          }

          for (const ans of groupAnswers) {
            const section = await tx.section.findFirstOrThrow({
              where: { name: ans.section, inspectionTypeId: inspectionType.id }
            });

            let question = await tx.question.findFirst({
              where: { text: ans.question, sectionId: section.id }
            });

            if (!question) {
              question = await tx.question.create({
                data: { text: ans.question, sectionId: section.id, isRequired: true }
              });
            }

            // OVERRIDE LOGIC: Check if an answer for this question already exists in this inspection
            const existingAnswer = await tx.answer.findFirst({
              where: {
                inspectionId: inspection.id,
                questionId: question.id
              }
            });

            if (existingAnswer) {
              await tx.answer.update({
                where: { id: existingAnswer.id },
                data: {
                  answer: ans.answer,
                  timestamp: new Date(ans.timestamp),
                  imageUrl: (ans.image_url || ans.imagePath || "").trim() || "No Image"
                }
              });
            } else {
              await tx.answer.create({
                data: {
                  inspectionId: inspection.id,
                  questionId: question.id,
                  answer: ans.answer,
                  timestamp: new Date(ans.timestamp),
                  imageUrl: (ans.image_url || ans.imagePath || "").trim() || "No Image"
                }
              });
            }
          }

          // COMPLETION CHECK
          const currentAnswers = await tx.answer.findMany({
            where: { inspectionId: inspection.id },
            include: { question: { select: { sectionId: true } } }
          });

          const answeredSectionIds = new Set(currentAnswers.map(a => a.question.sectionId));
          const isAllSectionsComplete = inspectionType.sections.every(s => answeredSectionIds.has(s.id));

          if (isAllSectionsComplete) {
            await tx.inspection.update({
              where: { id: inspection.id },
              data: { status: 'COMPLETED' }
            });
          }

          return {
            template: templateName,
            status: isAllSectionsComplete ? 'COMPLETED' : 'IN_PROGRESS',
            inspectionId: inspection.id,
            sectionsCompleted: answeredSectionIds.size,
            totalSections: inspectionType.sections.length
          };
        });

        processed.push(result);
      } catch (err: any) {
        failed.push({
          template: templateName,
          reason: err.message
        });
      }
    }

    return {
      success: processed.length > 0,
      processed,
      failed,
      summary: `${processed.length} templates saved, ${failed.length} failed`
    };
  }

  async getDashboardAnalytics() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 1. Completion per type (last 6 months)
    const completions = await this.prisma.inspection.groupBy({
      by: ['inspectionTypeId', 'status'],
      where: {
        createdAt: { gte: sixMonthsAgo }
      },
      _count: { id: true }
    });

    // 2. Inspections per inspector
    const perInspector = await this.prisma.inspection.groupBy({
      by: ['inspectorId'],
      _count: { id: true }
    });

    const inspectors = await this.prisma.user.findMany({
      where: { id: { in: perInspector.map(pi => pi.inspectorId) } },
      select: { id: true, email: true, name: true }
    });

    // 3. Inspections by unit
    const inspectionsWithUnits = await this.prisma.inspection.findMany({
      include: {
        inspector: { select: { unit: true } }
      }
    });

    const unitCounts: Record<string, number> = {};
    inspectionsWithUnits.forEach(i => {
      const unit = i.inspector.unit || 'Unknown';
      unitCounts[unit] = (unitCounts[unit] || 0) + 1;
    });

    const types = await this.prisma.inspectionType.findMany({ select: { id: true, name: true } });

    return {
      monthlyTrends: completions.map(c => ({
        type: types.find(t => t.id === c.inspectionTypeId)?.name || 'Unknown',
        status: c.status,
        count: c._count.id
      })),
      inspectorStats: perInspector.map(pi => ({
        inspector: inspectors.find(i => i.id === pi.inspectorId)?.name || inspectors.find(i => i.id === pi.inspectorId)?.email || 'Unknown',
        count: pi._count.id
      })),
      unitStats: Object.entries(unitCounts).map(([unit, count]) => ({ unit, count }))
    };
  }
}
