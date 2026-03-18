import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from 'src/user/dto';
import { PubSubService } from 'src/realtime/pubsub/pubsub.service';
import { USER_REPOSITORY } from 'src/user/repositories/user-repository.port';
import type { UserRepository } from 'src/user/repositories/user-repository.port';

@Injectable()
export class UserService {
	constructor(
		@Inject(USER_REPOSITORY)
		private readonly usersRepository: UserRepository,
		private readonly pubSubService: PubSubService,
	) {}

	async findById(id: string) {
		return this.usersRepository.findById(id);
	}

	async updateUser(id: string, updateUserDto: UpdateUserDto) {
		await this.usersRepository.updateById(id, updateUserDto);
		const user = await this.usersRepository.findById(id);
		if (user) {
			this.pubSubService.publish('user.updated', {
				id: user.id,
				email: user.email,
				name: user.name,
			});
		}
		return user;
	}
}
