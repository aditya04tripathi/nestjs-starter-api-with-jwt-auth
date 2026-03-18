import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { InitUserUuid1700000000000 } from 'src/database/migrations/1700000000000-InitUserUuid';

export default new DataSource({
	type: 'postgres',
	url: process.env.DATABASE_URL,
	entities: [UserEntity],
	migrations: [InitUserUuid1700000000000],
	synchronize: false,
});
