import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { PubSubService } from 'src/realtime/pubsub/pubsub.service';

@Global()
@Module({
	imports: [JwtModule.register({})],
	providers: [PubSubService, RealtimeGateway],
	exports: [PubSubService],
})
export class RealtimeModule {}
