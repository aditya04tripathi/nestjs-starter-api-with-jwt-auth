import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
	private readonly logger = new Logger('HTTP');

	constructor(private readonly auditService: AuditService) {}

	use(req: Request, res: Response, next: NextFunction): void {
		const startTime = Date.now();
		res.on('finish', () => {
			const requestWithUser = req as Request & { user?: { id?: string }; requestId?: string };
			const durationMs = Date.now() - startTime;
			const requestId = requestWithUser.requestId ?? 'unknown';
			const userId =
				requestWithUser.user?.id && typeof requestWithUser.user.id === 'string'
					? requestWithUser.user.id
					: null;
			const ipAddress = req.ip || req.socket.remoteAddress || null;
			const userAgentHeader = req.get('user-agent');
			this.logger.log(
				`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms requestId=${requestId}`,
			);
			void this.auditService
				.record({
					method: req.method,
					path: req.originalUrl,
					statusCode: res.statusCode,
					durationMs,
					requestId,
					userId,
					ipAddress,
					userAgent: userAgentHeader ?? null,
				})
				.catch(() => undefined);
		});
		next();
	}
}
