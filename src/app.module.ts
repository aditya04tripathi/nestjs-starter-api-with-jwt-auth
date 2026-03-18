import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/user/user.module';
import { JwtGuard, RolesGuard } from 'src/utils/guards';
import { GlobalExceptionFilter } from 'src/utils/filters';
import { ResponseTransformInterceptor } from 'src/utils/interceptors';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { HealthModule } from 'src/health/health.module';
import { RequestIdMiddleware } from 'src/common/middleware/request-id.middleware';
import { RequestLoggerMiddleware } from 'src/common/middleware/request-logger.middleware';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'postgres',
				url: config.get<string>('DATABASE_URL'),
				autoLoadEntities: true,
				synchronize: false,
			}),
		}),
		ThrottlerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => [
				{
					ttl: Number(config.get('THROTTLE_TTL_MS') ?? 60000),
					limit: Number(config.get('THROTTLE_LIMIT') ?? 100),
				},
			],
		}),
		JwtModule.register({}),
		AuthModule,
		CommonModule,
		UserModule,
		RealtimeModule,
		HealthModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_GUARD,
			useClass: JwtGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseTransformInterceptor,
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer
			.apply(RequestIdMiddleware, RequestLoggerMiddleware)
			.forRoutes({ path: '*', method: RequestMethod.ALL });
	}
}
