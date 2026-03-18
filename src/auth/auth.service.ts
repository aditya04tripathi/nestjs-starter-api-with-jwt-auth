import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthSigninDto, AuthSignupDto, ChangePasswordDto, ForgotPasswordDto } from 'src/auth/dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from 'src/types';
import { PubSubService } from 'src/realtime/pubsub/pubsub.service';

@Injectable()
export class AuthService {
	constructor(
		private config: ConfigService,
		private jwt: JwtService,
		private readonly pubSubService: PubSubService,
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
	) {}

	async signin(dto: AuthSigninDto) {
		const { email, password } = dto;

		const user = await this.usersRepository
			.createQueryBuilder('user')
			.addSelect('user.hashedPassword')
			.where('user.email = :email', { email })
			.getOne();

		if (!user) {
			throw new HttpException(
				`The user with ${dto.email} was not found. Please sign up.`,
				HttpStatus.NOT_FOUND,
			);
		}

		const passwordMatches = await argon.verify(user.hashedPassword!, password);
		if (!passwordMatches) {
			throw new HttpException(
				'The password entered seems to be invalid. Please try again.',
				HttpStatus.UNAUTHORIZED,
			);
		}

		const token = await this.signToken(user.id, user.email);

		return token;
	}

	async signup(dto: AuthSignupDto) {
		const hashedPassword = await argon.hash(dto.password);

		try {
			const user = this.usersRepository.create({
				email: dto.email,
				hashedPassword,
				name: dto.name,
			});
			await this.usersRepository.save(user);
			this.pubSubService.publish('user.created', {
				id: user.id,
				email: user.email,
				name: user.name,
			});
		} catch (error: unknown) {
			const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
			if (code === '23505') {
				throw new HttpException(
					`The user with ${dto.email} already exists. Please sign in.`,
					HttpStatus.CONFLICT,
				);
			}
			throw error;
		}

		return {
			message: 'A new user has been created successfully. Enjoy your time on TemplateAPI!',
		};
	}

	async signToken(userId: string, email: string): Promise<{ access_token: string }> {
		const payload = {
			sub: userId,
			email,
		};

		return {
			access_token: await this.jwt.signAsync(payload, {
				secret: this.config.get('JWT_SECRET')!,
				expiresIn: '1h',
			}),
		};
	}

	async getMe(user: AuthenticatedUser) {
		const userId = user.id;

		const userData = await this.usersRepository.findOne({
			where: {
				id: userId,
			},
		});

		if (!userData) {
			throw new HttpException('The user was not found. Please sign up.', HttpStatus.NOT_FOUND);
		}

		return userData;
	}

	async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
		const { currentPassword, newPassword } = changePasswordDto;

		const user = await this.usersRepository
			.createQueryBuilder('user')
			.addSelect('user.hashedPassword')
			.where('user.id = :id', { id: userId })
			.getOne();

		if (!user) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}

		const passwordMatches = await argon.verify(user.hashedPassword!, currentPassword);
		if (!passwordMatches) {
			throw new HttpException('Current password is incorrect', HttpStatus.UNAUTHORIZED);
		}

		const hashedNewPassword = await argon.hash(newPassword);

		await this.usersRepository.update(
			{ id: userId },
			{
				hashedPassword: hashedNewPassword,
			},
		);
		this.pubSubService.publish('user.password_changed', { userId });

		return { message: 'Password changed successfully' };
	}

	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const { email } = forgotPasswordDto;

		const user = await this.usersRepository.findOne({
			where: { email },
		});

		if (!user) {
			return { message: 'If the email exists, a password reset link has been sent' };
		}

		return { message: 'If the email exists, a password reset link has been sent' };
	}
}
