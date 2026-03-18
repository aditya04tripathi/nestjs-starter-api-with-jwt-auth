import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from 'src/user/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { PubSubService } from 'src/realtime/pubsub/pubsub.service';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		private readonly pubSubService: PubSubService,
	) {}

	async findById(id: string) {
		return this.usersRepository.findOne({
			where: { id },
		});
	}

	async updateUser(id: string, updateUserDto: UpdateUserDto) {
		await this.usersRepository.update({ id }, updateUserDto);
		const user = await this.usersRepository.findOne({ where: { id } });
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
