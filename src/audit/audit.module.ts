import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from 'src/audit/entities/audit-log.entity';
import { AuditService } from 'src/audit/audit.service';

@Module({
	imports: [TypeOrmModule.forFeature([AuditLogEntity])],
	providers: [AuditService],
	exports: [AuditService],
})
export class AuditModule {}
