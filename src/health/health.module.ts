import { Module } from '@nestjs/common';
import { HealthController } from 'src/health/health.controller';
import { HealthService } from 'src/health/health.service';

@Module({
	controllers: [HealthController],
	providers: [HealthService],
})
export class HealthModule {}
