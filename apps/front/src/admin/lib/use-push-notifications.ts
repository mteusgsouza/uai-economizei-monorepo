'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  getVapidPublicKeyAction,
  subscribeAdminPushAction,
  unsubscribeAdminPushAction,
} from '../actions/push-subscription'
import {
  browserSupportsPush,
  toSubscriptionPayload,
  urlBase64ToUint8Array,
} from './push-browser'

/**
 * Alertas de novo pedido, para quem opera a loja.
 *
 * Mora sob `src/admin` porque é do admin: a inscrição passa por server actions
 * que exigem sessão do Payload. Enquanto ficava em `hooks/`, chamava o `/bff`
 * sem header de autorização, levava 401 e — por não conferir a resposta —
 * anunciava "notificações ativadas" com o banco vazio.
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  // Só após montar: no servidor não há window, e divergir aqui quebra a hidratação
  useEffect(() => {
    if (!browserSupportsPush()) return
    setIsSupported(true)
    setPermission(Notification.permission)
  }, [])

  // Registra SW e escuta mensagens de push (novos pedidos)
  useEffect(() => {
    if (!isSupported) return
    let cancelled = false

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!cancelled) setIsSubscribed(!!subscription)
      })
      .catch(() => {})

    const onMessage = (event: MessageEvent) => {
      const data = event.data as
        | { type?: string; url?: string; payload?: { title?: string; body?: string } }
        | null
      if (!data) return

      // Com a aba do admin aberta, o pedido novo aparece como toast em vez de
      // notificação do sistema.
      if (data.type === 'NEW_ORDER') {
        toast.info(data.payload?.title ?? 'Novo pedido recebido', {
          description: data.payload?.body,
        })
      } else if (data.type === 'NAVIGATE' && data.url) {
        window.location.href = data.url
      }
    }

    navigator.serviceWorker.addEventListener('message', onMessage)

    return () => {
      cancelled = true
      navigator.serviceWorker.removeEventListener('message', onMessage)
    }
  }, [isSupported])

  /**
   * Devolve `false` quando o navegador negou a permissão e **lança** quando a
   * gravação falhou. São coisas diferentes: uma é escolha da pessoa, a outra é
   * defeito — e antes as duas terminavam no mesmo "ativado com sucesso".
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return false

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const publicKey = await getVapidPublicKeyAction()
      if (!publicKey) {
        throw new Error('Web push não está configurado na API.')
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const payload = toSubscriptionPayload(subscription)
      if (!payload) {
        await subscription.unsubscribe()
        throw new Error('O navegador devolveu uma inscrição incompleta.')
      }

      const saved = await subscribeAdminPushAction(payload)

      // Sem isso o navegador ficaria inscrito e o servidor sem saber: o sino
      // diria "ativado" e nenhum pedido chegaria.
      if (!saved.ok) {
        await subscription.unsubscribe()
        throw new Error(saved.error ?? 'Não foi possível salvar a inscrição.')
      }

      setIsSubscribed(true)
      return true
    } finally {
      setIsLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        const { endpoint } = subscription
        await subscription.unsubscribe()
        const removed = await unsubscribeAdminPushAction(endpoint)
        if (!removed.ok) {
          throw new Error(removed.error ?? 'Não foi possível remover a inscrição.')
        }
      }
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe }
}
