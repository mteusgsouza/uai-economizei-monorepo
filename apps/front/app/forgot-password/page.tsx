'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { api } from '@/lib/http-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await api.post<{ resetToken?: string; message: string }>(
        '/auth/customer/forgot-password',
        { email },
      );
      setSent(true);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar solicitação');
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verifique seu email</CardTitle>
            <CardDescription>
              Se o email informado estiver cadastrado, um link de redefinição foi enviado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetToken && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Ambiente de desenvolvimento — token de redefinição:
                </p>
                <code className="block break-all rounded bg-muted p-2 text-xs">
                  {resetToken}
                </code>
                <Link
                  href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="inline-block text-sm underline underline-offset-4 hover:text-primary"
                >
                  Ir para redefinir senha
                </Link>
              </div>
            )}
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Esqueceu a senha?</CardTitle>
          <CardDescription>
            Insira seu email e enviaremos um link de redefinição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Enviar link
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
