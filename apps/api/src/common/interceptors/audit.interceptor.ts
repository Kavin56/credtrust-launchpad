import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Observable, tap } from 'rxjs';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const actorId = request.user?.sub;
    const ip = request.ip;
    const userAgent = request.headers['user-agent'];
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(async (data) => {
        // Only persist audit for mutating operations
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;
        try {
          await this.prisma.auditLog.create({
            data: {
              actorId,
              action:
                method === 'POST'
                  ? AuditAction.CREATE
                  : method === 'DELETE'
                  ? AuditAction.DELETE
                  : AuditAction.UPDATE,
              entity: url,
              entityId: data?.id ?? '',
              ip,
              userAgent,
              diff: data ? JSON.parse(JSON.stringify(data)) : undefined,
            },
          });
        } catch (err) {
          // Do not block response on audit failure
          console.error('Audit write failed', err);
        }
      }),
    );
  }
}
