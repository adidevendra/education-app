import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UsersModule } from './users/users.module';
import { pinoOptions } from './common/pino.options';
import { RedisModule } from './redis/redis.module';
import { SearchModule } from './search/search.module';
import { QueueModule } from './queue/queue.module';
import { OutboxPoller } from './search/outbox.poller';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RbacGuard } from './auth/rbac.guard';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { CatalogModule } from './catalog/catalog.module';
import { PaymentsModule } from './payments/payments.module';
import { CertsModule } from './certs/certs.module';
import { ProfileModule } from './profile/profile.module';
import { AccountsModule } from './accounts/accounts.module';
import { MediaModule } from './media/media.module';
import { HealthModule } from './health/health.module';
import { TenancyMiddleware } from './tenancy/tenancy.middleware';
import { TtsWorker } from './workers/tts.worker';
import { IndexWorker } from './workers/index.worker';
import { RagController } from './rag/rag.controller';
import { RagService } from './rag/rag.service';
import { LtiController } from './lti/lti.controller';
import { LtiService } from './lti/lti.service';

const importsList = [
  ConfigModule.forRoot({ isGlobal: true }),
  LoggerModule.forRoot(pinoOptions),
  // only include Redis in non in-memory mode
  ...(process.env.USE_IN_MEMORY_DB === '1' ? [] : [RedisModule]),
  QueueModule,
  SearchModule,
  NotificationsModule,
  AuditModule,
  AuthModule,
  // health endpoint
  HealthModule,
  // feature modules
  UsersModule,
  CatalogModule,
  PaymentsModule,
  CertsModule,
  CoursesModule,
  LessonsModule,
  ProfileModule,
  AccountsModule,
  MediaModule,
];

@Module({
  imports: importsList,
  controllers: [RagController, LtiController],
  providers: [
    {
      provide: APP_GUARD,
  useFactory: () => new JwtAuthGuard(['/api/health', '/api/auth/login', '/api/catalog', '/api/v1/media']),
    },
    {
      provide: APP_GUARD,
      useClass: RbacGuard,
    },
  OutboxPoller,
  TtsWorker,
  IndexWorker,
  RagService,
  LtiService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenancyMiddleware).forRoutes('*');
  }
}
