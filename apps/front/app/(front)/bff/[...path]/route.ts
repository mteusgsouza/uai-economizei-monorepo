import 'server-only'
import { NextRequest, NextResponse } from 'next/server'

/**
 * BFF: proxy entre o browser e a API Nest no Render. Mascara `API_URL` (nunca
 * chega ao bundle) e restringe o tráfego a uma allowlist de rotas de cliente
 * — nada de admin passa por aqui, essas rotas exigem `x-internal-key` e só o
 * server do admin (`src/admin/lib/nest-client.ts`) tem essa chave.
 *
 * O header `Authorization` do browser (ID token do Firebase) é repassado
 * como está; a API valida o token, não este proxy.
 */

const API_URL = process.env.API_URL || 'http://localhost:8080'

interface Rule {
  method: string
  pattern: RegExp
}

const ALLOWLIST: Rule[] = [
  { method: 'POST', pattern: /^auth\/customer\/login$/ },
  { method: 'GET', pattern: /^auth\/customer\/me$/ },
  { method: 'GET', pattern: /^customers\/me$/ },
  { method: 'PATCH', pattern: /^customers\/me$/ },
  { method: 'GET', pattern: /^customers\/me\/addresses$/ },
  { method: 'POST', pattern: /^customers\/me\/addresses$/ },
  { method: 'POST', pattern: /^orders$/ },
  { method: 'GET', pattern: /^orders$/ },
  { method: 'GET', pattern: /^orders\/\d+$/ },
  { method: 'GET', pattern: /^notifications\/public-key$/ },
  { method: 'POST', pattern: /^notifications\/subscriptions$/ },
  { method: 'DELETE', pattern: /^notifications\/subscriptions$/ },
  { method: 'GET', pattern: /^cep\/lookup$/ },
]

function isAllowed(method: string, path: string): boolean {
  return ALLOWLIST.some((rule) => rule.method === method && rule.pattern.test(path))
}

async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  const joined = path.join('/')

  if (!isAllowed(req.method, joined)) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const headers = new Headers({
    'content-type': req.headers.get('content-type') ?? 'application/json',
  })
  const authorization = req.headers.get('authorization')
  if (authorization) headers.set('authorization', authorization)

  const upstream = await fetch(`${API_URL}/${joined}${req.nextUrl.search}`, {
    method: req.method,
    headers,
    body: req.method === 'GET' ? undefined : await req.text(),
  })

  const body = await upstream.text()
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
    },
  })
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  return proxy(req, (await params).path)
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  return proxy(req, (await params).path)
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  return proxy(req, (await params).path)
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  return proxy(req, (await params).path)
}
