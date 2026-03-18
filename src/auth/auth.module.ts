import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/utils/strategy/jwt.strategy';
import { AuthController } from 'src/auth/auth.controller';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({}),
		UserModule,
		RealtimeModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
