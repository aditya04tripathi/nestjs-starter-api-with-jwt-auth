import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
	@Cron(CronExpression.EVERY_10_MINUTES, {
		name: 'health_tick',
	})
	handleHealthTick(): void {}
}
