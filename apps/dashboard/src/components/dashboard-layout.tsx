import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { ThemeRoot } from "./theme-root";

type ServiceWorkerPushMessage =
  | { type: "NEW_ORDER"; payload?: { title?: string; body?: string } }
  | { type: "NAVIGATE"; url?: string };

export function DashboardLayout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Reage a mensagens do service worker de push (aba aberta)
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent<ServiceWorkerPushMessage>) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "NEW_ORDER") {
        queryClient.invalidateQueries({ queryKey: ["orders", "admin"] });
        toast.info(data.payload?.title ?? "Novo pedido recebido", {
          description: data.payload?.body,
        });
      } else if (data.type === "NAVIGATE" && data.url) {
        navigate(data.url);
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [queryClient, navigate]);

  return (
    <ThemeRoot theme="dark">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <Outlet />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeRoot>
  );
}
