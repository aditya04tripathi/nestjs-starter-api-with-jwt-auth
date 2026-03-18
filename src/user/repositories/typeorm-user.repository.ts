import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import type { UserRepository } from 'src/user/repositories/user-repository.port';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
	constructor(
		@InjectRepository(UserEntity)
		private readonly repository: Repository<UserEntity>,
	) {}

	findById(id: string): Promise<UserEntity | null> {
		return this.repository.findOne({ where: { id } });
	}

	findByEmail(email: string): Promise<UserEntity | null> {
		return this.repository.findOne({ where: { email } });
	}

	findByIdWithSecrets(id: string): Promise<UserEntity | null> {
		return this.repository
			.createQueryBuilder('user')
			.addSelect('user.hashedPassword')
			.addSelect('user.refreshTokenHash')
			.addSelect('user.passwordResetTokenHash')
			.addSelect('user.passwordResetTokenExpiresAt')
			.where('user.id = :id', { id })
			.getOne();
	}

	findByEmailWithSecrets(email: string): Promise<UserEntity | null> {
		return this.repository
			.createQueryBuilder('user')
			.addSelect('user.hashedPassword')
			.addSelect('user.refreshTokenHash')
			.addSelect('user.passwordResetTokenHash')
			.addSelect('user.passwordResetTokenExpiresAt')
			.where('user.email = :email', { email })
			.getOne();
	}

	async createUser(
		data: Pick<UserEntity, 'name' | 'email' | 'hashedPassword'>,
	): Promise<UserEntity> {
		const entity = this.repository.create(data);
		return this.repository.save(entity);
	}

	async updateById(id: string, data: Partial<UserEntity>): Promise<void> {
		await this.repository.update({ id }, data);
	}
}
