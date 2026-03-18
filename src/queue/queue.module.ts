import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { DefaultQueueProcessor } from './queue.processor';

function parseRedisUrl(redisUrl: string): {
	host: string;
	port: number;
	username?: string;
	password?: string;
} {
	const url = new URL(redisUrl);
	return {
		host: url.hostname,
		port: url.port ? Number(url.port) : 6379,
		username: url.username || undefined,
		password: url.password || undefined,
	};
}

@Module({
	imports: [
		ConfigModule,
		BullModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const redisUrl = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
				return {
					connection: parseRedisUrl(redisUrl),
					prefix: config.get<string>('BULLMQ_PREFIX') ?? undefined,
				};
			},
		}),
		BullModule.registerQueue({
			name: 'default',
		}),
	],
	providers: [QueueService, DefaultQueueProcessor],
	exports: [QueueService],
})
export class QueueModule {}
