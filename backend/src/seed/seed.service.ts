import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  constructor(private prisma: PrismaService) {}

  async seed() {
    await this.prisma.answer.deleteMany();
    await this.prisma.incident.deleteMany();
    await this.prisma.inspection.deleteMany();
    await this.prisma.inspectorPermission.deleteMany();
    await this.prisma.question.deleteMany();
    await this.prisma.section.deleteMany();
    await this.prisma.inspectionType.deleteMany();

    // Create 10 secure managers for production
    const managersToSeed = [];
    for (let i = 1; i <= 10; i++) {
      managersToSeed.push({
        email: `manager${i}@example.com`,
        password: `M@nager${i}_Secure_2026!`,
        name: `Operations Manager ${i}`
      });
    }

    for (const admin of managersToSeed) {
      const existing = await this.prisma.user.findUnique({ where: { email: admin.email } });
      if (!existing) {
        let hp = await bcrypt.hash(admin.password, 10);
        await this.prisma.user.create({
          data: {
            email: admin.email,
            password: hp,
            role: 'MANAGER',
            name: admin.name,
            mustChangePassword: true
          },
        });
      }
    }
    
    // Default inspector password hash for testing (can be changed later)
    let hashedPassword = await bcrypt.hash('password123', 10);

    const INSPECTION_TEMPLATES = {
      "Confined Space": [
        "Energy isolation", "Hazard identified", "Gas testing", 
        "Ventilation", "Attendant present", "Breathing apparatus", "Rescue plan"
      ],
      "Vehicle": [
        "plate", "incident", "License", "IVMS", "tyres", 
        "Road visibility", "RAS sticker", "Loose objects", "journey"
      ],
      "Working at Height": [
        "height hazard", "fall protection equipment", "fall protection harness", 
        "approved anchors", "fall path", "Secured Tools", 
        "Barrier and Exclusion", "Rescue planned"
      ],
      "Energy Isolation": [
        "Isolation Plan", "Hazard Identification", "Isolation Points", 
        "Isolation Devices", "Locks & Tags", "Zero Energy"
      ],
      "Mechanical Lifting": [
        "Lift Plan", "Hazard Identification Lift", "Worker Qualification", 
        "Stability Assessment", "Equipment Certification", 
        "Communication Plan Lift", "Load Inspection", "Barriers and Exclusion Lift"
      ],
      "Hot Work": [
        "Energy Isolation Hot", "Hazard Identification Hot", 
        "Hazardous Area Hot", "Monitoring", "Ignition Source", "Flammable"
      ],
      "De-Isolation & Re-Energizing": [
        "Energy isolation de-isolation", "Isolation devices de-isolation", 
        "Notifying personnel", "Re-energizing"
      ],
      "Live Electrical": [
        "Work Scope", "Circuit Verification", "PPE Rating", 
        "Restricted Zone", "Electrical Standby", 
        "Communication Plan Electrical", "Insulated Tools", "Emergency Response Electrical"
      ],
      "Working Around Mobile Equipment": [
        "Parking Area", "Safeguards", "Mobile Inspection", 
        "Load Stability", "Impact Prevention", "Unintentional Movement"
      ],
      "Work Near Water": [
        "Hazard Identification Water", "Exclusion Zone Water", 
        "PFDs", "Walking Surface", "Communication Plan Water", "Rescue Plan Water"
      ],
      "Excavation": [
        "Energy Isolation Excavation", "Underground Utilities", 
        "Overhead Obstruction", "Access Barriers", "Soil Stability", 
        "Equipment stability", "Confined Space Excavation", 
        "Rescue Plan Excavation", "Deeper than 4 Feet"
      ]
    };

    const createdTypes = [];
    for (const [typeName, sections] of Object.entries(INSPECTION_TEMPLATES)) {
      const it = await this.prisma.inspectionType.create({
        data: {
          name: typeName,
          description: `Standard safety protocol for ${typeName} operations.`,
          sections: {
            create: sections.map(secName => ({
              name: secName,
              questions: {
                create: [
                  { text: `Has the ${secName} criteria been verified according to protocol?` },
                  { text: `Are all ${secName} controls documented and active?` }
                ]
              }
            }))
          }
        }
      });
      createdTypes.push(it);
    }

    let existingInspector = await this.prisma.user.findUnique({ where: { email: 'inspector@example.com' } });
    if (!existingInspector) {
      existingInspector = await this.prisma.user.create({
        data: {
          email: 'inspector@example.com',
          password: hashedPassword,
          role: 'INSPECTOR',
          qrCode: 'Tgxs9meGG', // Match the user's sample data
          name: 'James Field',
          unit: 'Response Team Alpha'
        },
      });
    }

    const inspectorId = existingInspector.id;
    for (const type of createdTypes) {
      await this.prisma.inspectorPermission.create({
        data: { inspectorId, inspectionTypeId: type.id }
      });
    }

    return { 
      message: 'Templates successfully refreshed with precise section mappings.',
      typesAdded: createdTypes.length
    };
  }
}
