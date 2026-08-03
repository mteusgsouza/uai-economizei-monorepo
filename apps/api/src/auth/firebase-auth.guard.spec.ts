import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getAuth } from 'firebase-admin/auth';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import type { AuthenticatedRequest } from './authenticated-request';

// Factory própria: evita carregar o módulo real (e sua cadeia ESM via
// `jose`/`jwks-rsa`), que o ts-jest não consegue transformar.
jest.mock('firebase-admin/auth', () => ({ getAuth: jest.fn() }));

function buildContext(headers: Record<string, string>): ExecutionContext {
  const request = { headers } as unknown as AuthenticatedRequest;
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    guard = new FirebaseAuthGuard(reflector);
    jest.clearAllMocks();
  });

  it('rejeita sem header Authorization', async () => {
    await expect(guard.canActivate(buildContext({}))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejeita token inválido, sem aceitar x-internal-key como substituto', async () => {
    (getAuth as jest.Mock).mockReturnValue({
      verifyIdToken: jest.fn().mockRejectedValue(new Error('bad token')),
    });

    const context = buildContext({
      'x-internal-key': 'qualquer-coisa',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('aceita um Bearer token válido e popula firebaseUid', async () => {
    (getAuth as jest.Mock).mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'user-123' }),
    });

    const request = {
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as AuthenticatedRequest;
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => undefined,
      getClass: () => undefined,
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.firebaseUid).toBe('user-123');
  });

  it('libera direto quando a rota é @Public()', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    await expect(guard.canActivate(buildContext({}))).resolves.toBe(true);
  });
});
