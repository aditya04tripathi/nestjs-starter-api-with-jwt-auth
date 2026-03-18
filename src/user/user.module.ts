import { Module } from '@nestjs/common';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { USER_REPOSITORY } from 'src/user/repositories/user-repository.port';
import { TypeOrmUserRepository } from 'src/user/repositories/typeorm-user.repository';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	controllers: [UserController],
	providers: [
		UserService,
		TypeOrmUserRepository,
		{
			provide: USER_REPOSITORY,
			useExisting: TypeOrmUserRepository,
		},
	],
	exports: [UserService, USER_REPOSITORY],
})
export class UserModule {}
