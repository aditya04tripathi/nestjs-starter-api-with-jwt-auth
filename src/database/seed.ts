import * as argon from 'argon2';
import dataSource from 'src/database/data-source';
import { UserEntity } from 'src/user/entities/user.entity';
import { Role } from 'src/types/role.enum';

async function seed(): Promise<void> {
	await dataSource.initialize();

	try {
		const usersRepository = dataSource.getRepository(UserEntity);
		const existing = await usersRepository.findOne({
			where: {
				email: 'admin@example.com',
			},
		});

		if (!existing) {
			const user = usersRepository.create({
				email: 'admin@example.com',
				name: 'Admin User',
				hashedPassword: await argon.hash('Password123!'),
				roles: [Role.ADMIN],
			});
			await usersRepository.save(user);
		}
	} finally {
		await dataSource.destroy();
	}
}

seed().catch((error) => {
	console.error(error);
	process.exit(1);
});
