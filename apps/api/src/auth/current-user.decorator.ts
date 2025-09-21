import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface SessionUser {
  id: string;
  email: string;
  orgId?: string | null;
  roles?: string[];
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser | null => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as SessionUser | undefined;
    if (!user) return null;
    // attach derived orgId from middleware when missing
    if (!user.orgId && req.orgId) user.orgId = req.orgId;
    return user;
  }
);
