import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
	AuthSigninDto,
	AuthSignupDto,
	ChangePasswordDto,
	ForgotPasswordDto,
	ResetPasswordDto,
} from 'src/auth/dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from 'src/types';
import { PubSubService } from 'src/realtime/pubsub/pubsub.service';
import { randomUUID } from 'node:crypto';
import { UserRepository, USER_REPOSITORY } from 'src/user/repositories/user-repository.port';

@Injectable()
export class AuthService {
	constructor(
		private config: ConfigService,
		private jwt: JwtService,
		private readonly pubSubService: PubSubService,
		@Inject(USER_REPOSITORY)
		private readonly usersRepository: UserRepository,
	) {}

	async signin(dto: AuthSigninDto) {
		const { email, password } = dto;

		const user = await this.usersRepository.findByEmailWithSecrets(email);

		if (!user) {
			throw new HttpException(
				`The user with ${dto.email} was not found. Please sign up.`,
				HttpStatus.NOT_FOUND,
			);
		}

		if (!user.hashedPassword) {
			throw new HttpException(
				'The password entered seems to be invalid. Please try again.',
				HttpStatus.UNAUTHORIZED,
			);
		}
		const passwordMatches = await argon.verify(user.hashedPassword, password);
		if (!passwordMatches) {
			throw new HttpException(
				'The password entered seems to be invalid. Please try again.',
				HttpStatus.UNAUTHORIZED,
			);
		}

		return this.issueAndPersistTokens(user.id, user.email);
	}

	async signup(dto: AuthSignupDto) {
		const hashedPassword = await argon.hash(dto.password);

		try {
			const user = await this.usersRepository.createUser({
				email: dto.email,
				hashedPassword,
				name: dto.name,
			});
			this.pubSubService.publish('user.created', {
				id: user.id,
				email: user.email,
				name: user.name,
			});
			return this.issueAndPersistTokens(user.id, user.email);
		} catch (error: unknown) {
			const code =
				typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
			if (code === '23505') {
				throw new HttpException(
					`The user with ${dto.email} already exists. Please sign in.`,
					HttpStatus.CONFLICT,
				);
			}
			throw error;
		}
	}

	async signToken(
		userId: string,
		email: string,
	): Promise<{ access_token: string; refresh_token: string }> {
		const payload = {
			sub: userId,
			email,
		};
		const accessSecret = this.config.get<string>('JWT_SECRET');
		if (!accessSecret) {
			throw new HttpException('JWT secret is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') ?? accessSecret;
		const accessExpiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '1h';
		const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

		return {
			access_token: await this.jwt.signAsync(payload, {
				secret: accessSecret,
				expiresIn: accessExpiresIn,
			}),
			refresh_token: await this.jwt.signAsync(payload, {
				secret: refreshSecret,
				expiresIn: refreshExpiresIn,
			}),
		};
	}

	async getMe(user: AuthenticatedUser) {
		const userId = user.id;

		const userData = await this.usersRepository.findById(userId);

		if (!userData) {
			throw new HttpException('The user was not found. Please sign up.', HttpStatus.NOT_FOUND);
		}

		return userData;
	}

	async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
		const { currentPassword, newPassword } = changePasswordDto;

		const user = await this.usersRepository.findByIdWithSecrets(userId);

		if (!user) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}

		if (!user.hashedPassword) {
			throw new HttpException('Current password is incorrect', HttpStatus.UNAUTHORIZED);
		}
		const passwordMatches = await argon.verify(user.hashedPassword, currentPassword);

		if (!passwordMatches) {
			throw new HttpException('Current password is incorrect', HttpStatus.UNAUTHORIZED);
		}

		const hashedNewPassword = await argon.hash(newPassword);

		await this.usersRepository.updateById(userId, {
			hashedPassword: hashedNewPassword,
			refreshTokenHash: null,
		});
		this.pubSubService.publish('user.password_changed', { userId });

		return { message: 'Password changed successfully' };
	}

	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const { email } = forgotPasswordDto;

		const user = await this.usersRepository.findByEmail(email);

		if (!user) {
			return { message: 'If the email exists, a password reset link has been sent' };
		}
		const rawToken = randomUUID();
		const passwordResetTokenHash = await argon.hash(rawToken);
		const passwordResetTtlConfig = this.config.get<string>('PASSWORD_RESET_TOKEN_TTL_MINUTES');
		let passwordResetWindowMinutes = Number(passwordResetTtlConfig);
		if (!Number.isFinite(passwordResetWindowMinutes) || passwordResetWindowMinutes <= 0) {
			passwordResetWindowMinutes = 15;
		}

		const passwordResetTokenExpiresAt = new Date(
			Date.now() + passwordResetWindowMinutes * 60 * 1000,
		);
		await this.usersRepository.updateById(user.id, {
			passwordResetTokenHash,
			passwordResetTokenExpiresAt,
		});
		this.pubSubService.publish('user.password_reset_requested', {
			userId: user.id,
			email: user.email,
			token: rawToken,
			expiresAt: passwordResetTokenExpiresAt.toISOString(),
		});

		return { message: 'If the email exists, a password reset link has been sent' };
	}

	async refreshToken(refreshToken: string) {
		const accessSecret = this.config.get<string>('JWT_SECRET');
		if (!accessSecret) {
			throw new HttpException('JWT secret is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') ?? accessSecret;
		let payload: { sub: string; email: string };
		try {
			payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(refreshToken, {
				secret: refreshSecret,
			});
		} catch {
			throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
		}
		const user = await this.usersRepository.findByIdWithSecrets(payload.sub);
		if (!user?.refreshTokenHash) {
			throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
		}
		const isValid = await argon.verify(user.refreshTokenHash, refreshToken);
		if (!isValid) {
			throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
		}
		return this.issueAndPersistTokens(user.id, user.email);
	}

	async logout(userId: string) {
		await this.usersRepository.updateById(userId, { refreshTokenHash: null });
		return { message: 'Logged out successfully' };
	}

	async resetPassword(dto: ResetPasswordDto) {
		const user = await this.usersRepository.findByEmailWithSecrets(dto.email);
		if (!user?.passwordResetTokenHash || !user.passwordResetTokenExpiresAt) {
			throw new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST);
		}
		if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
			throw new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST);
		}
		const isValid = await argon.verify(user.passwordResetTokenHash, dto.token);
		if (!isValid) {
			throw new HttpException('Invalid or expired reset token', HttpStatus.BAD_REQUEST);
		}
		const hashedPassword = await argon.hash(dto.newPassword);
		await this.usersRepository.updateById(user.id, {
			hashedPassword,
			passwordResetTokenHash: null,
			passwordResetTokenExpiresAt: null,
			refreshTokenHash: null,
		});
		this.pubSubService.publish('user.password_reset_completed', {
			userId: user.id,
			email: user.email,
		});
		return { message: 'Password reset successful' };
	}

	private async issueAndPersistTokens(userId: string, email: string) {
		const tokens = await this.signToken(userId, email);
		const refreshTokenHash = await argon.hash(tokens.refresh_token);
		await this.usersRepository.updateById(userId, { refreshTokenHash });
		return tokens;
	}
}
