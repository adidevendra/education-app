import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionTuple } from './permission.decorator';

export function hasPermission(user: { roles?: string[] }, action: string, resource: string) {
  const roles = user.roles || [];
  if (roles.includes('owner') || roles.includes('admin')) return true;
  if (roles.includes('instructor')) {
    return ['course', 'lesson', 'quiz'].includes(resource) && action !== 'delete';
  }
  if (roles.includes('student')) {
    return action === 'read';
  }
  return false;
}

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const perms = this.reflector.getAllAndOverride<PermissionTuple[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!perms || perms.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const user = req.user || {};
    return perms.every((p) => hasPermission(user, p.action, p.resource));
  }
}
