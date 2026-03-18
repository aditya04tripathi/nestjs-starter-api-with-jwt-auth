import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { CacheService } from './cache.service';

@Module({
	imports: [
		ConfigModule,
		CacheModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const ttlMs = Number(config.get<string>('CACHE_TTL_MS') ?? 60000);
				const redisUrl = config.get<string>('REDIS_URL');

				if (!redisUrl) {
					return {
						isGlobal: true,
						stores: [new Keyv({ store: new CacheableMemory({ ttl: ttlMs }) })],
					};
				}

				return {
					isGlobal: true,
					stores: [
						new Keyv({ store: new CacheableMemory({ ttl: ttlMs }) }),
						new KeyvRedis(redisUrl),
					],
				};
			},
		}),
	],
	providers: [CacheService],
	exports: [CacheService, CacheModule],
})
export class AppCacheModule {}
