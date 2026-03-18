import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'src/types/role.enum';

const isSqlJsLike = !process.env.DATABASE_URL;

@Entity({ name: 'User' })
export class UserEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', length: 191 })
	name: string;

	@Column({ type: 'varchar', unique: true, length: 191 })
	email: string;

	@Column({
		type: isSqlJsLike ? 'simple-json' : 'text',
		array: (isSqlJsLike ? undefined : true) as never,
		default: isSqlJsLike ? '["USER"]' : () => "ARRAY['USER']::text[]",
	})
	roles: Role[];

	@Column({ type: 'varchar', nullable: true, select: false })
	hashedPassword: string | null;

	@Column({ type: 'varchar', nullable: true, select: false })
	refreshTokenHash: string | null;

	@Column({ type: 'varchar', nullable: true, select: false })
	passwordResetTokenHash: string | null;

	@Column({ type: isSqlJsLike ? 'datetime' : 'timestamptz', nullable: true, select: false })
	passwordResetTokenExpiresAt: Date | null;
}
