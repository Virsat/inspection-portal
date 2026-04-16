import { Module, Global } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';

@Global()
@Module({
  providers: [DevicesService],
  controllers: [DevicesController],
  exports: [DevicesService],
})
export class DevicesModule {}
