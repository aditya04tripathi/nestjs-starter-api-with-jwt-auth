import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AuditLogEntity } from '../audit/entities/audit-log.entity';
import { InitUserUuid1700000000000 } from './migrations/1700000000000-InitUserUuid';
import { CreateAuditLogTable1700000000001 } from './migrations/1700000000001-CreateAuditLogTable';

export default new DataSource({
	type: 'postgres',
	url: process.env.DATABASE_URL,
	entities: [UserEntity, AuditLogEntity],
	migrations: [InitUserUuid1700000000000, CreateAuditLogTable1700000000001],
	synchronize: false,
});
