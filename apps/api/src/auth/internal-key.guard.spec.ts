import { ExecutionContext } from '@nestjs/common';
import { InternalKeyGuard } from './internal-key.guard';
import type { Request } from 'express';

function buildContext(headers: Record<string, string>): ExecutionContext {
  const request = { headers } as unknown as Request;
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('InternalKeyGuard', () => {
  const ORIGINAL_ENV = process.env.INTERNAL_API_KEY;
  let guard: InternalKeyGuard;

  beforeEach(() => {
    guard = new InternalKeyGuard();
  });

  afterEach(() => {
    process.env.INTERNAL_API_KEY = ORIGINAL_ENV;
  });

  it('libera quando a chave bate com INTERNAL_API_KEY', () => {
    process.env.INTERNAL_API_KEY = 'segredo-forte';
    const context = buildContext({ 'x-internal-key': 'segredo-forte' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('bloqueia chave incorreta', () => {
    process.env.INTERNAL_API_KEY = 'segredo-forte';
    const context = buildContext({ 'x-internal-key': 'chave-errada' });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('bloqueia quando o header está ausente', () => {
    process.env.INTERNAL_API_KEY = 'segredo-forte';
    const context = buildContext({});

    expect(guard.canActivate(context)).toBe(false);
  });

  it('bloqueia mesmo com header presente quando INTERNAL_API_KEY está vazia', () => {
    delete process.env.INTERNAL_API_KEY;
    const context = buildContext({ 'x-internal-key': 'qualquer-coisa' });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('bloqueia chaves de tamanhos diferentes sem lançar', () => {
    process.env.INTERNAL_API_KEY = 'segredo-forte';
    const context = buildContext({ 'x-internal-key': 'curta' });

    expect(guard.canActivate(context)).toBe(false);
  });
});
