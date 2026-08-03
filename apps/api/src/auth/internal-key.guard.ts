import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';

/**
 * Só libera chamadas server-to-server que apresentem `x-internal-key`
 * idêntica a `INTERNAL_API_KEY`. Usado nas rotas de admin (Payload → Nest),
 * nunca em rotas alcançadas pelo browser.
 */
@Injectable()
export class InternalKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers['x-internal-key'];
    const expected = process.env.INTERNAL_API_KEY;

    if (!expected || typeof provided !== 'string') return false;

    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    if (providedBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(providedBuffer, expectedBuffer);
  }
}
