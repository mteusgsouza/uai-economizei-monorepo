import type { PushSubscriptionPayload } from './nest-mutate'

/**
 * O que é conversa com o navegador na inscrição de push, separado do hook para
 * deixar lá só a máquina de estados da tela.
 */

/**
 * Só pode ser avaliado no browser. Quem consome recebe `false` até a montagem
 * terminar, para que o primeiro render do cliente seja igual ao do servidor —
 * caso contrário a hidratação quebra.
 */
export function browserSupportsPush(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * A chave VAPID chega em base64url; o `applicationServerKey` quer bytes — e um
 * `Uint8Array` cravado em `ArrayBuffer`, porque o tipo aberto
 * (`ArrayBufferLike`) admitiria `SharedArrayBuffer`, que ele não aceita.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

/**
 * Converte a inscrição do navegador no que a API espera, conferindo os campos
 * em vez de assumir que vieram. `PushSubscriptionJSON` tem tudo opcional, e
 * gravar metade de uma inscrição é criar uma linha que nunca vai receber nada.
 */
export function toSubscriptionPayload(
  subscription: PushSubscription,
): PushSubscriptionPayload | null {
  const json = subscription.toJSON()
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth
  if (!json.endpoint || !p256dh || !auth) return null

  return {
    endpoint: json.endpoint,
    keys: { p256dh, auth },
    userAgent: navigator.userAgent,
  }
}
