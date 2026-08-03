"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Só pode ser avaliado no browser. Quem consome recebe `isSupported` como
 * `false` até a montagem terminar, para que o primeiro render do cliente seja
 * igual ao do servidor — caso contrário a hidratação quebra.
 */
const browserSupportsPush = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Mesma origem: passa pelo proxy do Next (app/(front)/bff), não pela API
// Nest diretamente.
const NESTJS_URL = "/bff";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Só após montar: no servidor não há window, e divergir aqui quebra a hidratação
  useEffect(() => {
    if (!browserSupportsPush()) return;
    setIsSupported(true);
    setPermission(Notification.permission);
  }, []);

  // Registra SW e escuta mensagens de push (novos pedidos)
  useEffect(() => {
    if (!isSupported) return;
    let cancelled = false;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!cancelled) setIsSubscribed(!!subscription);
      })
      .catch(() => {});

    // Listener de mensagens do SW (NEW_ORDER toast + NAVIGATE)
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;
      if (data.type === "NEW_ORDER") {
        toast.info(data.payload?.title ?? "Novo pedido recebido", {
          description: data.payload?.body,
        });
      } else if (data.type === "NAVIGATE" && data.url) {
        window.location.href = data.url;
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return false;

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const res = await fetch(`${NESTJS_URL}/notifications/public-key`);
      const { publicKey } = await res.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = subscription.toJSON();
      await fetch(`${NESTJS_URL}/notifications/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      });

      setIsSubscribed(true);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const { endpoint } = subscription;
        await subscription.unsubscribe();
        await fetch(`${NESTJS_URL}/notifications/subscriptions`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
