import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

const createdAtColumnType =
	process.env.NODE_ENV === 'test' && !process.env.DATABASE_URL ? 'datetime' : 'timestamptz';

@Entity({ name: 'AuditLog' })
export class AuditLogEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', length: 20 })
	method: string;

	@Column({ type: 'varchar', length: 2048 })
	path: string;

	@Column({ type: 'integer' })
	statusCode: number;

	@Column({ type: 'integer' })
	durationMs: number;

	@Column({ type: 'varchar', length: 100, nullable: true })
	requestId: string | null;

	@Column({ type: 'varchar', length: 128, nullable: true })
	userId: string | null;

	@Column({ type: 'varchar', length: 128, nullable: true })
	ipAddress: string | null;

	@Column({ type: 'varchar', length: 512, nullable: true })
	userAgent: string | null;

	@CreateDateColumn({ type: createdAtColumnType })
	createdAt: Date;
}
