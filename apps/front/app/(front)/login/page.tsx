"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { toast } from "@workspace/ui/components/sonner"
import { useAuth } from "@/lib/use-auth"
import { RedirectIfAuth } from "@/components/auth/auth-guard"
import { AuthShell } from "@/components/auth/auth-shell"
import { AuthTabs } from "@/components/auth/auth-tabs"
import { REDIRECT_PARAM, safeRedirect, withRedirect } from "@/lib/auth-redirect"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { useStoreSettings } from "@/lib/store-settings-context"
import { Mono } from "@/components/ui/mono"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error) return String((error as { message: unknown }).message)
  return String(error)
}

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const settings = useStoreSettings()
  const [showPassword, setShowPassword] = useState(false)

  // Para onde voltar depois de entrar (ex.: o checkout interrompido)
  const redirectTo = safeRedirect(searchParams?.get(REDIRECT_PARAM))

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await login(value.email, value.password)
        router.replace(redirectTo)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao fazer login")
      }
    },
  })

  const stats = [
    settings.pixDiscountPercent > 0 && {
      value: `${settings.pixDiscountPercent}%`,
      label: "off no PIX",
    },
    { value: `${settings.maxInstallments}x`, label: "no cartão" },
  ].filter(Boolean) as { value: string; label: string }[]

  return (
    <RedirectIfAuth>
      <AuthShell
        headline={["Entre e veja", "seu preço", "de verdade"]}
        pitch="Clientes cadastrados acompanham pedidos, salvam favoritos e recebem cupons antes de todo mundo."
        stats={stats}
      >
        <>
          <AuthTabs
            current="login"
            loginHref={withRedirect("/login", redirectTo)}
            registerHref={withRedirect("/register", redirectTo)}
            className="mb-5 lg:mb-6"
          />

          <h2 className="mb-1 font-heading text-[28px] uppercase leading-none">
            Acessar conta
          </h2>
          <Mono as="p" className="mb-5 block text-ink/50">
            Use o e-mail do seu cadastro
          </Mono>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Field name="email">
              {(field) => (
                <div className="mb-3.5 flex flex-col gap-1.5">
                  <Label htmlFor={field.name} className="text-xs text-ink/70">
                    E-mail
                  </Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="voce@email.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {errorMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="mb-2.5 flex flex-col gap-1.5">
                  <Label htmlFor={field.name} className="text-xs text-ink/70">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink/50 hover:text-ink"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {errorMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <div className="mb-[18px] flex items-center justify-end lg:mb-5">
              <Link
                href="/forgot-password"
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:underline"
              >
                Esqueci a senha
              </Link>
            </div>

            <Button type="submit" className="w-full py-3">
              Entrar
            </Button>
          </form>

          <div className="my-[18px] flex items-center gap-3 lg:my-5">
            <span className="h-px flex-1 bg-divider" />
            <Mono className="text-ink/45">ou</Mono>
            <span className="h-px flex-1 bg-divider" />
          </div>

          <GoogleSignInButton />

          <Mono
            as="p"
            className="mt-5 hidden text-center leading-[1.7] text-ink/45 lg:block"
          >
            Ao continuar você aceita os termos de uso
          </Mono>
        </>
      </AuthShell>
    </RedirectIfAuth>
  )
}

/** Suspense: a tela lê o destino do login pela query string. */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
