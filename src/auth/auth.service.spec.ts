import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PubSubService } from '../realtime/pubsub/pubsub.service';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import * as argon from 'argon2';

describe('AuthService', () => {
	let service: AuthService;
	let repository: jest.Mocked<Repository<UserEntity>>;
	let jwtService: jest.Mocked<JwtService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: getRepositoryToken(UserEntity),
					useValue: {
						createQueryBuilder: jest.fn(),
						findOne: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						update: jest.fn(),
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
		repository = module.get(getRepositoryToken(UserEntity));
		jwtService = module.get(JwtService);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('throws when signing in with unknown email', async () => {
		const getOne = jest.fn().mockResolvedValue(null);
		repository.createQueryBuilder.mockReturnValue({
			addSelect: jest.fn().mockReturnThis(),
			where: jest.fn().mockReturnThis(),
			getOne,
		} as never);

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
		const getOne = jest.fn().mockResolvedValue({
			id: 'user-123',
			email: 'user@example.com',
			refreshTokenHash: 'hash',
		});
		repository.createQueryBuilder.mockReturnValue({
			addSelect: jest.fn().mockReturnThis(),
			where: jest.fn().mockReturnThis(),
			getOne,
		} as never);
		const signAsyncMock = (jwtService as unknown as { signAsync: jest.Mock }).signAsync;
		signAsyncMock.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

		const result = await service.refreshToken('refresh-token');
		const updateMock = (repository as unknown as { update: jest.Mock }).update;

		expect(result).toEqual({
			access_token: 'access-token',
			refresh_token: 'refresh-token',
		});
		expect(updateMock).toHaveBeenCalledWith(
			{ id: 'user-123' },
			expect.objectContaining({
				refreshTokenHash: expect.any(String),
			}),
		);
	});
});
