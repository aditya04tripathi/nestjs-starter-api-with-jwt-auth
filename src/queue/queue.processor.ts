import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

@Processor('default')
export class DefaultQueueProcessor extends WorkerHost {
	process(job: Job<Record<string, unknown>, unknown, string>): Promise<unknown> {
		switch (job.name) {
			default:
				return Promise.resolve({ ok: true, name: job.name });
		}
	}
}
