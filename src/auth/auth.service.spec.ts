import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PubSubService } from '../realtime/pubsub/pubsub.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as argon from 'argon2';
import { USER_REPOSITORY } from '../user/repositories/user-repository.port';
import type { UserRepository } from '../user/repositories/user-repository.port';

describe('AuthService', () => {
	let service: AuthService;
	let repository: jest.Mocked<UserRepository>;
	let jwtService: jest.Mocked<JwtService>;
	let configService: jest.Mocked<ConfigService>;
	let pubSubService: jest.Mocked<PubSubService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: USER_REPOSITORY,
					useValue: {
						findById: jest.fn(),
						findByEmail: jest.fn(),
						findByIdWithSecrets: jest.fn(),
						findByEmailWithSecrets: jest.fn(),
						createUser: jest.fn(),
						updateById: jest.fn(),
					},
				},
				{
					provide: JwtService,
					useValue: {
						signAsync: jest.fn(),
						verifyAsync: jest.fn(),
					},
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn((key: string) => {
							if (key === 'JWT_SECRET') return 'secret';
							if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
							if (key === 'JWT_EXPIRES_IN') return '1h';
							if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
							return undefined;
						}),
					},
				},
				{
					provide: PubSubService,
					useValue: {
						publish: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		repository = module.get(USER_REPOSITORY);
		jwtService = module.get(JwtService);
		configService = module.get(ConfigService);
		pubSubService = module.get(PubSubService);
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it('throws when signing in with unknown email', async () => {
		repository.findByEmailWithSecrets.mockResolvedValue(null);

		await expect(
			service.signin({
				email: 'unknown@example.com',
				password: 'Password123!',
			}),
		).rejects.toBeInstanceOf(HttpException);
	});

	it('throws when signing in with missing password hash', async () => {
		repository.findByEmailWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			hashedPassword: null,
		} as never);

		await expect(
			service.signin({
				email: 'user@example.com',
				password: 'Password123!',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.UNAUTHORIZED,
		});
	});

	it('throws when signing in with invalid password', async () => {
		repository.findByEmailWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			hashedPassword: 'hash',
		} as never);
		jest.spyOn(argon, 'verify').mockResolvedValue(false as never);

		await expect(
			service.signin({
				email: 'user@example.com',
				password: 'Password123!',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.UNAUTHORIZED,
		});
	});

	it('returns tokens when signin succeeds', async () => {
		repository.findByEmailWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			hashedPassword: 'hash',
		} as never);
		jest.spyOn(argon, 'verify').mockResolvedValue(true as never);
		jest.spyOn(argon, 'hash').mockResolvedValue('refresh-hash' as never);
		jwtService.signAsync
			.mockResolvedValueOnce('access-token')
			.mockResolvedValueOnce('refresh-token');

		const result = await service.signin({
			email: 'user@example.com',
			password: 'Password123!',
		});

		expect(result).toEqual({
			access_token: 'access-token',
			refresh_token: 'refresh-token',
		});
		expect(repository.updateById.mock.calls).toContainEqual([
			'user-123',
			{ refreshTokenHash: 'refresh-hash' },
		]);
	});

	it('throws when JWT secret is missing while signing token', async () => {
		configService.get.mockImplementation((key: string) => {
			if (key === 'JWT_SECRET') return undefined;
			return undefined;
		});

		await expect(service.signToken('user-123', 'user@example.com')).rejects.toMatchObject({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
		});
	});

	it('refreshes tokens when refresh token is valid', async () => {
		jest.spyOn(argon, 'verify').mockResolvedValue(true as never);
		jest.spyOn(argon, 'hash').mockResolvedValue('new-refresh-hash' as never);
		jwtService.verifyAsync.mockResolvedValue({
			sub: 'user-123',
			email: 'user@example.com',
		} as never);
		repository.findByIdWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			refreshTokenHash: 'hash',
		} as never);
		const signAsyncMock = (jwtService as unknown as { signAsync: jest.Mock }).signAsync;
		signAsyncMock.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

		const result = await service.refreshToken('refresh-token');
		const updateMock = (repository as unknown as { updateById: jest.Mock }).updateById;

		expect(result).toEqual({
			access_token: 'access-token',
			refresh_token: 'refresh-token',
		});
		expect(updateMock).toHaveBeenCalledWith(
			'user-123',
			expect.objectContaining({
				refreshTokenHash: expect.any(String),
			}),
		);
	});

	it('throws when refresh token verification fails', async () => {
		jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

		await expect(service.refreshToken('bad-token')).rejects.toMatchObject({
			status: HttpStatus.UNAUTHORIZED,
		});
	});

	it('throws when refresh token hash is absent in database', async () => {
		jwtService.verifyAsync.mockResolvedValue({
			sub: 'user-123',
			email: 'user@example.com',
		} as never);
		repository.findByIdWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			refreshTokenHash: null,
		} as never);

		await expect(service.refreshToken('refresh-token')).rejects.toMatchObject({
			status: HttpStatus.UNAUTHORIZED,
		});
	});

	it('throws when refresh token hash does not match', async () => {
		jwtService.verifyAsync.mockResolvedValue({
			sub: 'user-123',
			email: 'user@example.com',
		} as never);
		repository.findByIdWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			refreshTokenHash: 'stored-hash',
		} as never);
		jest.spyOn(argon, 'verify').mockResolvedValue(false as never);

		await expect(service.refreshToken('refresh-token')).rejects.toMatchObject({
			status: HttpStatus.UNAUTHORIZED,
		});
	});

	it('returns profile data from getMe', async () => {
		repository.findById.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			name: 'User',
		} as never);

		const result = await service.getMe({
			id: 'user-123',
			email: 'user@example.com',
			name: 'User',
		});

		expect(result).toMatchObject({
			id: 'user-123',
			email: 'user@example.com',
		});
	});

	it('throws in getMe when user does not exist', async () => {
		repository.findById.mockResolvedValue(null);

		await expect(
			service.getMe({
				id: 'user-123',
				email: 'user@example.com',
				name: 'User',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.NOT_FOUND,
		});
	});

	it('throws on changePassword when user is missing', async () => {
		repository.findByIdWithSecrets.mockResolvedValue(null);

		await expect(
			service.changePassword('user-123', {
				currentPassword: 'old-password',
				newPassword: 'new-password',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.NOT_FOUND,
		});
	});

	it('throws on changePassword when hash is missing', async () => {
		repository.findByIdWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			hashedPassword: null,
		} as never);

		await expect(
			service.changePassword('user-123', {
				currentPassword: 'old-password',
				newPassword: 'new-password',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.UNAUTHORIZED,
		});
	});

	it('throws on changePassword when current password is incorrect', async () => {
		repository.findByIdWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			hashedPassword: 'stored-hash',
		} as never);
		jest.spyOn(argon, 'verify').mockResolvedValue(false as never);

		await expect(
			service.changePassword('user-123', {
				currentPassword: 'old-password',
				newPassword: 'new-password',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.UNAUTHORIZED,
		});
	});

	it('updates hash and revokes refresh token on changePassword', async () => {
		repository.findByIdWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			hashedPassword: 'stored-hash',
		} as never);
		jest.spyOn(argon, 'verify').mockResolvedValue(true as never);
		jest.spyOn(argon, 'hash').mockResolvedValue('new-hash' as never);

		const result = await service.changePassword('user-123', {
			currentPassword: 'old-password',
			newPassword: 'new-password',
		});

		expect(result).toEqual({ message: 'Password changed successfully' });
		expect(repository.updateById.mock.calls).toContainEqual([
			'user-123',
			{
				hashedPassword: 'new-hash',
				refreshTokenHash: null,
			},
		]);
		expect(pubSubService.publish.mock.calls).toContainEqual([
			'user.password_changed',
			{ userId: 'user-123' },
		]);
	});

	it('returns generic response for unknown forgotPassword email', async () => {
		repository.findByEmail.mockResolvedValue(null);

		const result = await service.forgotPassword({ email: 'missing@example.com' });

		expect(result).toEqual({
			message: 'If the email exists, a password reset link has been sent',
		});
		expect(repository.updateById.mock.calls).toHaveLength(0);
		expect(pubSubService.publish.mock.calls).toHaveLength(0);
	});

	it('stores reset token and publishes event for forgotPassword', async () => {
		repository.findByEmail.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
		} as never);
		jest.spyOn(argon, 'hash').mockResolvedValue('reset-hash' as never);

		const result = await service.forgotPassword({ email: 'user@example.com' });

		expect(result).toEqual({
			message: 'If the email exists, a password reset link has been sent',
		});
		expect(repository.updateById.mock.calls[0]).toEqual([
			'user-123',
			expect.objectContaining({
				passwordResetTokenHash: 'reset-hash',
				passwordResetTokenExpiresAt: expect.any(Date),
			}),
		]);
		expect(pubSubService.publish.mock.calls[0]).toEqual([
			'user.password_reset_requested',
			expect.objectContaining({
				userId: 'user-123',
				email: 'user@example.com',
				token: expect.any(String),
				expiresAt: expect.any(String),
			}),
		]);
	});

	it('throws on resetPassword when token metadata is missing', async () => {
		repository.findByEmailWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			passwordResetTokenHash: null,
			passwordResetTokenExpiresAt: null,
		} as never);

		await expect(
			service.resetPassword({
				email: 'user@example.com',
				token: 'token',
				newPassword: 'new-password',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.BAD_REQUEST,
		});
	});

	it('throws on resetPassword when token is expired', async () => {
		repository.findByEmailWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			passwordResetTokenHash: 'stored-hash',
			passwordResetTokenExpiresAt: new Date(Date.now() - 1000),
		} as never);

		await expect(
			service.resetPassword({
				email: 'user@example.com',
				token: 'token',
				newPassword: 'new-password',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.BAD_REQUEST,
		});
	});

	it('throws on resetPassword when token hash check fails', async () => {
		repository.findByEmailWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			passwordResetTokenHash: 'stored-hash',
			passwordResetTokenExpiresAt: new Date(Date.now() + 10000),
		} as never);
		jest.spyOn(argon, 'verify').mockResolvedValue(false as never);

		await expect(
			service.resetPassword({
				email: 'user@example.com',
				token: 'token',
				newPassword: 'new-password',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.BAD_REQUEST,
		});
	});

	it('resets password and clears reset metadata', async () => {
		repository.findByEmailWithSecrets.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			passwordResetTokenHash: 'stored-hash',
			passwordResetTokenExpiresAt: new Date(Date.now() + 10000),
		} as never);
		jest.spyOn(argon, 'verify').mockResolvedValue(true as never);
		jest.spyOn(argon, 'hash').mockResolvedValue('new-password-hash' as never);

		const result = await service.resetPassword({
			email: 'user@example.com',
			token: 'token',
			newPassword: 'new-password',
		});

		expect(result).toEqual({ message: 'Password reset successful' });
		expect(repository.updateById.mock.calls).toContainEqual([
			'user-123',
			{
				hashedPassword: 'new-password-hash',
				passwordResetTokenHash: null,
				passwordResetTokenExpiresAt: null,
				refreshTokenHash: null,
			},
		]);
		expect(pubSubService.publish.mock.calls).toContainEqual([
			'user.password_reset_completed',
			{
				userId: 'user-123',
				email: 'user@example.com',
			},
		]);
	});

	it('clears refresh token hash on logout', async () => {
		const result = await service.logout('user-123');

		expect(result).toEqual({ message: 'Logged out successfully' });
		expect(repository.updateById.mock.calls).toContainEqual([
			'user-123',
			{ refreshTokenHash: null },
		]);
	});

	it('creates user and returns tokens on signup', async () => {
		repository.createUser.mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			name: 'User',
		} as never);
		jest
			.spyOn(argon, 'hash')
			.mockResolvedValueOnce('hashed-password' as never)
			.mockResolvedValueOnce('refresh-hash' as never);
		jwtService.signAsync
			.mockResolvedValueOnce('access-token')
			.mockResolvedValueOnce('refresh-token');

		const result = await service.signup({
			email: 'user@example.com',
			name: 'User',
			password: 'Password123!',
		});

		expect(repository.createUser.mock.calls).toContainEqual([
			{
				email: 'user@example.com',
				name: 'User',
				hashedPassword: 'hashed-password',
			},
		]);
		expect(pubSubService.publish.mock.calls).toContainEqual([
			'user.created',
			{
				id: 'user-123',
				email: 'user@example.com',
				name: 'User',
			},
		]);
		expect(result).toEqual({
			access_token: 'access-token',
			refresh_token: 'refresh-token',
		});
	});

	it('throws conflict on duplicate signup email', async () => {
		jest.spyOn(argon, 'hash').mockResolvedValue('hashed-password' as never);
		repository.createUser.mockRejectedValue({ code: '23505' } as never);

		await expect(
			service.signup({
				email: 'user@example.com',
				name: 'User',
				password: 'Password123!',
			}),
		).rejects.toMatchObject({
			status: HttpStatus.CONFLICT,
		});
	});
});
