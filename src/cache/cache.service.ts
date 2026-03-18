import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
	constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

	async get<T>(key: string): Promise<T | null> {
		return (await this.cache.get<T>(key)) ?? null;
	}

	async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
		if (ttlMs === undefined) {
			await this.cache.set(key, value);
			return;
		}
		await this.cache.set(key, value, ttlMs);
	}

	async del(key: string): Promise<void> {
		await this.cache.del(key);
	}
}
