import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { USER_REPOSITORY } from 'src/user/repositories/user-repository.port';
import type { UserRepository } from 'src/user/repositories/user-repository.port';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		config: ConfigService,
		@Inject(USER_REPOSITORY)
		private readonly usersRepository: UserRepository,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get('JWT_SECRET')!,
		});
	}

	async validate(payload: { sub: string; email: string; iat: number }) {
		return this.usersRepository.findById(payload.sub);
	}
}
