import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction): void {
		const headerValue = req.header('x-request-id');
		const requestId = headerValue && headerValue.length > 0 ? headerValue : randomUUID();
		(req as Request & { requestId: string }).requestId = requestId;
		res.setHeader('x-request-id', requestId);
		next();
	}
}
