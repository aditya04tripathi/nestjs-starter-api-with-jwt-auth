import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PubSubService } from '../realtime/pubsub/pubsub.service';
import { HttpException } from '@nestjs/common';
import * as argon from 'argon2';
import { USER_REPOSITORY, UserRepository } from '../user/repositories/user-repository.port';

describe('AuthService', () => {
	let service: AuthService;
	let repository: jest.Mocked<UserRepository>;
	let jwtService: jest.Mocked<JwtService>;

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
	});

	afterEach(() => {
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

	it('refreshes tokens when refresh token is valid', async () => {
		jest.spyOn(argon, 'verify').mockResolvedValue(true as never);
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
});
