import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './users/users.module';
import { pinoOptions } from './common/pino.options';
import { RedisModule } from './redis/redis.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProfileModule } from './profile/profile.module';
import { AccountsModule } from './accounts/accounts.module';
import { HealthModule } from './health/health.module';

const importsList = [
  ConfigModule.forRoot({ isGlobal: true }),
  LoggerModule.forRoot(pinoOptions),
  // only include Redis in non in-memory mode
  ...(process.env.USE_IN_MEMORY_DB === '1' ? [] : [RedisModule]),
  SearchModule,
  NotificationsModule,
  AuditModule,
  AuthModule,
  // health endpoint
  HealthModule,
  // feature modules
  UsersModule,
  CoursesModule,
  LessonsModule,
  ProfileModule,
  AccountsModule,
];

@Module({
  imports: importsList,
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: () => new JwtAuthGuard(['/api/health', '/api/auth/login']),
    },
  ],
})
export class AppModule {}
