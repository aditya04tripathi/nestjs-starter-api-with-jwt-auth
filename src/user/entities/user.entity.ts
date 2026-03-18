import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

const resetTokenExpiresAtType = process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz';

@Entity({ name: 'User' })
export class UserEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', length: 191 })
	name: string;

	@Column({ type: 'varchar', unique: true, length: 191 })
	email: string;

	@Column({ type: 'varchar', nullable: true, select: false })
	hashedPassword: string | null;

	@Column({ type: 'varchar', nullable: true, select: false })
	refreshTokenHash: string | null;

	@Column({ type: 'varchar', nullable: true, select: false })
	passwordResetTokenHash: string | null;

	@Column({ type: resetTokenExpiresAtType, nullable: true, select: false })
	passwordResetTokenExpiresAt: Date | null;
}
