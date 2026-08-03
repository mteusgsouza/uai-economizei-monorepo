'use client';

import { useEffect, useState, type FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { auth } from '@/lib/firebase';
import { firebaseErrorMessage } from '@/lib/firebase-errors';

type CodeStatus = 'checking' | 'valid' | 'invalid';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  // Nome do parâmetro definido pelo Firebase no link de redefinição enviado
  // por email — não é digitado pelo usuário.
  const oobCode = searchParams.get('oobCode') ?? '';

  const [status, setStatus] = useState<CodeStatus>(() => (oobCode ? 'checking' : 'invalid'));
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!oobCode) return;
    verifyPasswordResetCode(auth, oobCode)
      .then(() => setStatus('valid'))
      .catch(() => setStatus('invalid'));
  }, [oobCode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof FirebaseError ? firebaseErrorMessage(err) : 'Erro ao redefinir senha');
    }
  }

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Verificando link...</div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Link inválido</CardTitle>
            <CardDescription>
              Este link de redefinição é inválido ou já expirou.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/forgot-password" className="text-sm underline underline-offset-4 hover:text-primary">
              Solicitar novo link
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Senha redefinida</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login" className="text-sm underline underline-offset-4 hover:text-primary">
              Ir para o login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Redefinir senha</CardTitle>
          <CardDescription>
            Insira sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Redefinir senha
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm underline underline-offset-4 hover:text-primary">
            Voltar para o login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
