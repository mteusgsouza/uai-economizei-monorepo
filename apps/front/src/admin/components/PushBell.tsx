"use client";

import { IconBell, IconBellOff, IconBellRinging } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function PushBell() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) return null;

  const blocked = permission === "denied";

  const handleClick = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success("Notificações desativadas.");
        return;
      }
      const granted = await subscribe();
      if (granted) {
        toast.success("Notificações ativadas! Você receberá alertas de novos pedidos.");
      } else {
        toast.error("Notificações bloqueadas pelo navegador.", {
          description: "Permita notificações nas configurações do navegador e tente novamente.",
        });
      }
    } catch {
      toast.error("Não foi possível ativar as notificações. Tente novamente.");
    }
  };

  const label = blocked
    ? "Notificações bloqueadas"
    : isSubscribed
      ? "Desativar notificações"
      : "Ativar notificações";

  const Icon = blocked ? IconBellOff : isSubscribed ? IconBellRinging : IconBell;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleClick} disabled={isLoading} aria-label={label}>
            <Icon className={isSubscribed ? "text-primary" : undefined} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
