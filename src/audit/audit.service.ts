import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLogEntity } from 'src/audit/entities/audit-log.entity';
import { Repository } from 'typeorm';

export interface AuditLogPayload {
	method: string;
	path: string;
	statusCode: number;
	durationMs: number;
	requestId: string | null;
	userId: string | null;
	ipAddress: string | null;
	userAgent: string | null;
}

@Injectable()
export class AuditService {
	constructor(
		@InjectRepository(AuditLogEntity)
		private readonly auditRepository: Repository<AuditLogEntity>,
	) {}

	async record(payload: AuditLogPayload): Promise<void> {
		const entry = this.auditRepository.create(payload);
		await this.auditRepository.save(entry);
	}
}
