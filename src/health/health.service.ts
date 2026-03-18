import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
	constructor(private readonly dataSource: DataSource) {}

	getLivenessStatus() {
		return {
			status: 'ok',
			service: 'live',
			timestamp: new Date().toISOString(),
		};
	}

	async getReadinessStatus() {
		let database = 'down';
		try {
			await this.dataSource.query('SELECT 1');
			database = 'up';
		} catch {
			database = 'down';
		}
		return {
			status: database === 'up' ? 'ok' : 'degraded',
			service: 'ready',
			database,
			timestamp: new Date().toISOString(),
		};
	}

	async getHealthStatus() {
		const [live, ready] = await Promise.all([this.getLivenessStatus(), this.getReadinessStatus()]);
		return {
			status: ready.status === 'ok' ? 'ok' : 'degraded',
			live,
			ready,
			timestamp: new Date().toISOString(),
		};
	}
}
