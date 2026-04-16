import { Controller, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seedDatabase(@Headers('x-admin-key') adminKey: string) {
    if (adminKey !== 'super-secret-admin-seed-key!') {
      throw new UnauthorizedException('Invalid admin key. Seed disabled in production.');
    }
    return this.seedService.seed();
  }
}
