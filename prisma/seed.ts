import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
	console.log('Seeding database...');

	const hashedPassword = await argon.hash('password123');

	const user = await prisma.user.upsert({
		where: { email: 'test@example.com' },
		update: {},
		create: {
			email: 'test@example.com',
			name: 'Test User',
			hashedPassword: hashedPassword,
		},
	});

	console.log('Created user:', user);

	console.log('Seeding completed!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
