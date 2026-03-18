import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const configuredOrigins = configService.get<string>('CORS_ORIGIN');
	const defaultOrigins =
		configService.get<string>('NODE_ENV') === 'production'
			? []
			: ['http://localhost:3000', 'http://127.0.0.1:3000'];
	const origins = configuredOrigins
		? configuredOrigins
				.split(',')
				.map((origin) => origin.trim())
				.filter(Boolean)
		: defaultOrigins;

	app.enableCors({
		origin: origins,
		credentials: true,
		methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin'],
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const config = new DocumentBuilder()
		.setTitle('Template API')
		.setDescription('This is the documentation for the starter template made by Aditya Tripathi')
		.setVersion('1.0.0')
		.addBearerAuth()
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, documentFactory);

	const port = configService.get('PORT') || 3000;
	await app.listen(port);
	console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
