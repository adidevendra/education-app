import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { RolesGuard } from './roles.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtService, RolesGuard, AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtService, AuthService],
})
export class AuthModule {}
