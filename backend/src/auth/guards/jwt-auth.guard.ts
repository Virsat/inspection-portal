import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { DevicesService } from '../../devices/devices.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private devicesService: DevicesService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const deviceId = request.headers['device_id'];

    // Specific logic for external inspection and incident submissions
    console.log(`[JwtAuthGuard] Incoming request to: ${request.url}`);
    
    if (request.url.includes('/inspections/external') || request.url.includes('/incidents/external')) {
      console.log(`[JwtAuthGuard] External route matched. Checking device_id: ${deviceId}`);
      if (deviceId && this.devicesService.isValidDevice(deviceId)) {
        console.log(`[JwtAuthGuard] Device ID is valid. Allowing access.`);
        return true;
      }
      console.log(`[JwtAuthGuard] Device ID invalid or missing. Rejecting.`);
      throw new UnauthorizedException('UnAuthorized Access Detected');
    }

    if (isPublic) {
      return true;
    }

    // Normal JWT check
    return super.canActivate(context) as Promise<boolean>;
  }
}
