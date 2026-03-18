import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		config: ConfigService,
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get('JWT_SECRET')!,
		});
	}

	async validate(payload: { sub: string; email: string; iat: number }) {
		return this.usersRepository.findOne({
			where: {
				id: payload.sub,
			},
		});
	}
}
