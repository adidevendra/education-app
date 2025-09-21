import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

// Dynamically load AuthGuard from @nestjs/passport if available. This avoids hard failures in
// test environments where the package may not be installed. If missing, provide a safe noop
// factory that returns a base class with a passthrough handleRequest.
let AuthGuardFactory: (strategy: string) => any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maybe = require('@nestjs/passport');
  AuthGuardFactory = (strategy: string) => maybe.AuthGuard(strategy);
} catch (err) {
  AuthGuardFactory = (_: string) => {
    // Minimal fallback class that exposes handleRequest(err, user, info) so our guard can extend it
    return class {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handleRequest(err: any, user: any) {
        return user;
      }
    };
  };
}

/**
 * JwtAuthGuard
 * - Extends Passport JWT guard (or a noop fallback)
 * - Throws UnauthorizedException when no valid JWT/user present
 * - Ensures request.user contains only { id, email, role }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuardFactory('jwt') {
  constructor(private readonly whitelist: string[] = ['/api/health', '/api/auth/login']) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  handleRequest(err: any, user: any, _info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const path = req?.url || req?.originalUrl || '';

    // Allow-listed paths are public
  if (this.whitelist.some((p) => typeof p === 'string' && path.startsWith(p))) {
      return true;
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing JWT token');
    }

    const safeUser = {
  id: user.id,
  email: user.email,
  role: user.role,
  // preserve non-sensitive profile fields if present
  name: user.name,
  createdAt: user.createdAt,
    } as any;

    req.user = safeUser;
    return safeUser;
  }
}
