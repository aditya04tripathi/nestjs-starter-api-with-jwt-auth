import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from 'src/health/health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@Get()
	@ApiOperation({ summary: 'Get aggregate service health status' })
	@ApiOkResponse({
		description: 'Composite health status',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					properties: {
						status: { type: 'string', example: 'ok' },
						live: { type: 'object' },
						ready: { type: 'object' },
						timestamp: { type: 'string', format: 'date-time' },
					},
				},
			},
		},
	})
	getHealth() {
		return this.healthService.getHealthStatus();
	}

	@Get('live')
	@ApiOperation({ summary: 'Liveness probe' })
	@ApiOkResponse({
		description: 'Process liveness status',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					properties: {
						status: { type: 'string', example: 'ok' },
						service: { type: 'string', example: 'live' },
						timestamp: { type: 'string', format: 'date-time' },
					},
				},
			},
		},
	})
	getLiveness() {
		return this.healthService.getLivenessStatus();
	}

	@Get('ready')
	@ApiOperation({ summary: 'Readiness probe including database check' })
	@ApiOkResponse({
		description: 'Readiness status',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'object',
					properties: {
						status: { type: 'string', example: 'ok' },
						service: { type: 'string', example: 'ready' },
						database: { type: 'string', example: 'up' },
						timestamp: { type: 'string', format: 'date-time' },
					},
				},
			},
		},
	})
	getReadiness() {
		return this.healthService.getReadinessStatus();
	}
}
