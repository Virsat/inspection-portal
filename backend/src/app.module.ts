import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InspectionsModule } from './inspections/inspections.module';
import { IncidentsModule } from './incidents/incidents.module';
import { SeedModule } from './seed/seed.module';
import { DevicesModule } from './devices/devices.module';
import { LicensesModule } from './licenses/licenses.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule, AuthModule, UsersModule, InspectionsModule, IncidentsModule, SeedModule, DevicesModule, LicensesModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
