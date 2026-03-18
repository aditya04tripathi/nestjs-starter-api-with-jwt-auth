import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
