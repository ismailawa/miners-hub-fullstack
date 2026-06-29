import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(entry: AuditLogEntry): Promise<void> {
    const log = this.auditLogRepository.create({
      userId: entry.userId,
      action: entry.action,
      metadata: {
        resource: entry.resource,
        resourceId: entry.resourceId,
        ...(entry.metadata || {}),
      },
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    });
    // Fire-and-forget — never block the main request on audit logging
    this.auditLogRepository.save(log).catch((err) => {
      console.error('[AuditLog] Failed to write audit entry:', err?.message);
    });
  }
}
