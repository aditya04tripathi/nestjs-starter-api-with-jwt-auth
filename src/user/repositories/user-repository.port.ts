import { UserEntity } from 'src/user/entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
	findById(id: string): Promise<UserEntity | null>;
	findByEmail(email: string): Promise<UserEntity | null>;
	findByIdWithSecrets(id: string): Promise<UserEntity | null>;
	findByEmailWithSecrets(email: string): Promise<UserEntity | null>;
	createUser(data: Pick<UserEntity, 'name' | 'email' | 'hashedPassword'>): Promise<UserEntity>;
	updateById(id: string, data: Partial<UserEntity>): Promise<void>;
}
