import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/utils/decorator';
import { HealthService } from 'src/health/health.service';

@Controller('health')
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@Public()
	@Get()
	getHealth() {
		return this.healthService.getHealthStatus();
	}

	@Public()
	@Get('live')
	getLiveness() {
		return this.healthService.getLivenessStatus();
	}

	@Public()
	@Get('ready')
	getReadiness() {
		return this.healthService.getReadinessStatus();
	}
}
