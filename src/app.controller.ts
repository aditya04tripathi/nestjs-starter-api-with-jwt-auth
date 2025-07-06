import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Post('/upload')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: path.join(__dirname, '..', 'uploads'),
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
	// For multiple files, use the below line instead:
	// uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
	uploadFile(@UploadedFile() file: Express.Multer.File): string {
		console.log(file);
		return `File ${file.originalname} uploaded successfully!`;
	}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
}
