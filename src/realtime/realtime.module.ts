import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { PubSubService } from 'src/realtime/pubsub/pubsub.service';

@Global()
@Module({
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
			}),
		}),
	],
	providers: [PubSubService, RealtimeGateway],
	exports: [PubSubService],
})
export class RealtimeModule {}
