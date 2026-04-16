import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    const request = context.switchToHttp().getRequest();
    console.log(`[RolesGuard] Checking roles for ${request.method} ${request.url}. Required:`, requiredRoles);

    // Emergency Bypass for external routes to ensure device-only logic doesn't get blocked
    if (request.url.includes('/external')) {
       console.log(`[RolesGuard] External route bypass. Allowing.`);
       return true;
    }

    if (!requiredRoles) {
      console.log(`[RolesGuard] No roles required. Allowing.`);
      return true;
    }
    
    const { user } = request;
    console.log(`[RolesGuard] User context:`, user ? user.role : 'None');

    const result = requiredRoles.some((role) => user?.role === role);
    console.log(`[RolesGuard] Evaluation result:`, result);
    return result;
  }
}
