import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Public } from 'src/utils/decorator';

@ApiTags('App')
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Post('/upload')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Upload a file' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
			required: ['file'],
		},
	})
	@ApiCreatedResponse({
		description: 'File uploaded successfully',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'string',
					example: 'File avatar.png uploaded successfully!',
				},
			},
		},
	})
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: join(__dirname, '..', 'uploads'),
				filename: (req, file, cb) => {
					const randomName = Array(32)
						.fill(null)
						.map(() => Math.round(Math.random() * 16).toString(16))
						.join('');
					return cb(null, `${randomName}${extname(file.originalname)}`);
				},
			}),
		}),
	)
	uploadFile(@UploadedFile() file: Express.Multer.File): string {
		console.log(file);
		return `File ${file.originalname} uploaded successfully!`;
	}

	@Get()
	@Public()
	@ApiOperation({ summary: 'Root endpoint' })
	@ApiOkResponse({
		description: 'Service greeting',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'string',
					example: 'Hello World!',
				},
			},
		},
	})
	getHello(): string {
		return this.appService.getHello();
	}
}
