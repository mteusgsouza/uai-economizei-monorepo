'use client'

import { IconBell, IconBellOff, IconBellRinging } from '@tabler/icons-react'
import { toast } from 'sonner'

import { usePushNotifications } from '@/hooks/use-push-notifications'

/** Sino de notificações push de novos pedidos, no cabeçalho das views admin. */
export function PushBell() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications()

  if (!isSupported) return null

  const blocked = permission === 'denied'

  const handleClick = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe()
        toast.success('Notificações desativadas.')
        return
      }
      const granted = await subscribe()
      if (granted) {
        toast.success('Notificações ativadas! Você receberá alertas de novos pedidos.')
      } else {
        toast.error('Notificações bloqueadas pelo navegador.', {
          description:
            'Permita notificações nas configurações do navegador e tente novamente.',
        })
      }
    } catch {
      toast.error('Não foi possível ativar as notificações. Tente novamente.')
    }
  }

  const label = blocked
    ? 'Notificações bloqueadas'
    : isSubscribed
      ? 'Desativar notificações'
      : 'Ativar notificações'

  const Icon = blocked ? IconBellOff : isSubscribed ? IconBellRinging : IconBell

  return (
    <button
      type="button"
      className="uai-icon-button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={label}
      title={label}
      data-active={isSubscribed}
    >
      <Icon size={20} />
    </button>
  )
}
