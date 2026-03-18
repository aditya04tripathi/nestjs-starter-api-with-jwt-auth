import { Inject, Injectable } from '@nestjs/common';
import type { Client } from 'minio';
import { MINIO_CLIENT } from './storage.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
	constructor(
		@Inject(MINIO_CLIENT) private readonly minio: Client | null,
		private readonly config: ConfigService,
	) {}

	async putObject(params: {
		key: string;
		contentType: string;
		body: Buffer;
		bucket?: string;
	}): Promise<{ bucket: string; key: string }> {
		const bucket = params.bucket ?? this.config.get<string>('S3_BUCKET') ?? 'template-bucket';
		if (!this.minio) {
			throw new Error('Storage is not configured. Set S3_ENDPOINT/S3_ACCESS_KEY/S3_SECRET_KEY.');
		}

		await this.minio.putObject(bucket, params.key, params.body);
		return { bucket, key: params.key };
	}
}
