import { buildCorsOptions, resolveAllowedOrigins } from './cors.config';

describe('resolveAllowedOrigins', () => {
  it('cai nos hosts locais quando CORS_ORIGIN não está definida', () => {
    expect(resolveAllowedOrigins(undefined)).toEqual([
      'http://localhost:5173',
      'http://localhost:3000',
    ]);
  });

  it('cai nos hosts locais quando CORS_ORIGIN está vazia', () => {
    expect(resolveAllowedOrigins('   ')).toEqual([
      'http://localhost:5173',
      'http://localhost:3000',
    ]);
  });

  it('lê a lista separada por vírgula ignorando espaços', () => {
    expect(
      resolveAllowedOrigins('https://loja.vercel.app, https://www.loja.com.br'),
    ).toEqual(['https://loja.vercel.app', 'https://www.loja.com.br']);
  });

  it('substitui os defaults em vez de somar a eles', () => {
    expect(resolveAllowedOrigins('https://loja.vercel.app')).not.toContain(
      'http://localhost:3000',
    );
  });
});

describe('buildCorsOptions', () => {
  type OriginCallback = (err: Error | null, allow?: boolean) => void;
  type OriginFn = (
    origin: string | undefined,
    callback: OriginCallback,
  ) => void;

  const check = (allowed: string[], origin: string | undefined) => {
    const originFn = buildCorsOptions(allowed).origin as OriginFn;
    const callback = jest.fn<void, [Error | null, boolean?]>();

    originFn(origin, callback);

    return callback.mock.calls[0];
  };

  it('libera origens da lista', () => {
    expect(
      check(['https://loja.vercel.app'], 'https://loja.vercel.app'),
    ).toEqual([null, true]);
  });

  it('libera requisições sem Origin (server-to-server)', () => {
    expect(check(['https://loja.vercel.app'], undefined)).toEqual([null, true]);
  });

  it('bloqueia origens fora da lista', () => {
    const [error, allow] = check(
      ['https://loja.vercel.app'],
      'https://evil.com',
    );

    expect(error).toBeInstanceOf(Error);
    expect(allow).toBeUndefined();
  });
});
