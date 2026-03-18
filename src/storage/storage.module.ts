import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { StorageService } from './storage.service';
import { MINIO_CLIENT } from './storage.constants';

@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: MINIO_CLIENT,
			inject: [ConfigService],
			useFactory: (config: ConfigService): Client | null => {
				const endpoint = config.get<string>('S3_ENDPOINT');
				const accessKey = config.get<string>('S3_ACCESS_KEY');
				const secretKey = config.get<string>('S3_SECRET_KEY');
				const port = Number(config.get<string>('S3_PORT') ?? 9000);
				const useSSL = (config.get<string>('S3_USE_SSL') ?? 'false') === 'true';

				if (!endpoint || !accessKey || !secretKey) return null;

				return new Client({
					endPoint: endpoint,
					port,
					useSSL,
					accessKey,
					secretKey,
				});
			},
		},
		StorageService,
	],
	exports: [StorageService],
})
export class StorageModule {}
