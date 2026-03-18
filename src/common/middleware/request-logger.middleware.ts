import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
	private readonly logger = new Logger('HTTP');

	use(req: Request, res: Response, next: NextFunction): void {
		const startTime = Date.now();
		res.on('finish', () => {
			const durationMs = Date.now() - startTime;
			const requestId = (req as Request & { requestId?: string }).requestId ?? 'unknown';
			this.logger.log(
				`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms requestId=${requestId}`,
			);
		});
		next();
	}
}
