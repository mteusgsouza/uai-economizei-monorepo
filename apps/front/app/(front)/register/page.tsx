'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { FieldError } from '@workspace/ui/components/field';
import { Separator } from '@workspace/ui/components/separator';
import { toast } from '@workspace/ui/components/sonner';
import { useAuth } from '@/lib/use-auth';
import { RedirectIfAuth } from '@/components/auth/auth-guard';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';

const registerSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

function errorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange: registerSchema as any,
    },
    onSubmit: async ({ value }) => {
      try {
        await register(
          value.email,
          value.password,
          value.firstName || undefined,
          value.lastName || undefined,
        );
        router.replace('/');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao criar conta');
      }
    },
  });

  return (
    <RedirectIfAuth>
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Criar conta</CardTitle>
            <CardDescription>Preencha os dados abaixo para se cadastrar</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="firstName">
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>Nome</Label>
                      <Input
                        id={field.name}
                        placeholder="João"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="lastName">
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={field.name}>Sobrenome</Label>
                      <Input
                        id={field.name}
                        placeholder="Silva"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
              <form.Field name="email">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="email@exemplo.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">{errorMessage(field.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </form.Field>
              <form.Field name="password">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Senha</Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        className="pr-10"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>{errorMessage(field.state.meta.errors[0])}</FieldError>
                    )}
                  </div>
                )}
              </form.Field>
              <form.Field name="confirmPassword">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Confirmar senha</Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repita a senha"
                        className="pr-10"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>{errorMessage(field.state.meta.errors[0])}</FieldError>
                    )}
                  </div>
                )}
              </form.Field>
              <Button type="submit" className="w-full">
                Criar conta
              </Button>
            </form>
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>
              <div className="mt-4">
                <GoogleSignInButton />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </RedirectIfAuth>
  );
}
