import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
	let app: INestApplication<App>;

	beforeAll(() => {
		process.env.NODE_ENV = 'test';
		process.env.JWT_SECRET = 'test-secret';
		process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
	});

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		if (app) {
			await app.close();
		}
	});

	it('/ (GET)', async () => {
		const response = await request(app.getHttpServer()).get('/').expect(200);
		expect(response.body).toHaveProperty('data', 'Hello World!');
	});

	it('/health (GET)', async () => {
		const response = await request(app.getHttpServer()).get('/health').expect(200);
		expect(response.body).toHaveProperty('data.status');
		expect(response.body).toHaveProperty('data.ready.database');
	});

	it('/health/live (GET)', async () => {
		const response = await request(app.getHttpServer()).get('/health/live').expect(200);
		expect(response.body).toHaveProperty('data.status', 'ok');
		expect(response.body).toHaveProperty('data.service', 'live');
	});

	it('/health/ready (GET)', async () => {
		const response = await request(app.getHttpServer()).get('/health/ready').expect(200);
		expect(response.body).toHaveProperty('data.service', 'ready');
	});
});
