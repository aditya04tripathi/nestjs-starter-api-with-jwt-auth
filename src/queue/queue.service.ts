import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

@Injectable()
export class QueueService {
	constructor(@InjectQueue('default') private readonly queue: Queue) {}

	async enqueue<T extends Record<string, unknown>>(
		name: string,
		data: T,
	): Promise<{ jobId: string }> {
		const job = await this.queue.add(name, data, {
			removeOnComplete: 100,
			removeOnFail: 100,
		});
		return { jobId: String(job.id) };
	}
}
