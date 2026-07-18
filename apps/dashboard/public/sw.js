/* Service worker de Web Push - notificações de novos pedidos */

self.addEventListener("push", (event) => {
  let payload = { title: "Uai Economizei", body: "", tag: undefined, data: {} };
  try {
    payload = event.data.json();
  } catch {
    /* payload inválido - mantém defaults */
  }

  event.waitUntil(
    (async () => {
      // Avisa abas abertas (toast + refresh da lista de pedidos)
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientList) {
        client.postMessage({ type: "NEW_ORDER", payload });
      }

      // Sempre exibe a notificação do SO (obrigatório com userVisibleOnly: true)
      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: payload.tag,
        data: payload.data || {},
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) ||
    "/dashboard/orders";

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientList) {
        if ("focus" in client) {
          await client.focus();
          client.postMessage({ type: "NAVIGATE", url });
          return;
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
