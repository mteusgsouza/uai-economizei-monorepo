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
    ).toEqual([
      'https://loja.vercel.app',
      'https://www.loja.com.br',
      'http://localhost:5173',
      'http://localhost:3000',
    ]);
  });

  it('mantém os hosts locais mesmo com CORS_ORIGIN definida', () => {
    // É o que permite apontar o front local para a API publicada.
    expect(resolveAllowedOrigins('https://loja.vercel.app')).toEqual([
      'https://loja.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
    ]);
  });

  it('não repete um host local que já veio na variável', () => {
    expect(resolveAllowedOrigins('http://localhost:3000')).toEqual([
      'http://localhost:3000',
      'http://localhost:5173',
    ]);
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

  it('libera as URLs de preview quando a entrada tem curinga', () => {
    const pattern = ['https://loja-*.vercel.app'];

    expect(check(pattern, 'https://loja-git-fix-abc.vercel.app')).toEqual([
      null,
      true,
    ]);
    expect(check(pattern, 'https://loja.vercel.app')[0]).toBeInstanceOf(Error);
  });

  it('o curinga não escapa para outro host', () => {
    const [error] = check(
      ['https://loja-*.vercel.app'],
      'https://evil.com/x.vercel.app',
    );

    expect(error).toBeInstanceOf(Error);
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
