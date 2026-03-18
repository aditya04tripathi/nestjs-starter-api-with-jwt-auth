import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/utils/strategy/jwt.strategy';
import { AuthController } from 'src/auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { RealtimeModule } from 'src/realtime/realtime.module';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({}),
		TypeOrmModule.forFeature([UserEntity]),
		RealtimeModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
