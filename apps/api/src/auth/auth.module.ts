import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { RolesGuard } from './roles.guard';
import { AuthController } from './auth.controller';
import { AuthV1Controller } from './auth.v1.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SessionStrategy } from './session.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtService, RolesGuard, AuthService, JwtStrategy, SessionStrategy],
  controllers: [AuthController, AuthV1Controller],
  exports: [JwtService, AuthService],
})
export class AuthModule {}
