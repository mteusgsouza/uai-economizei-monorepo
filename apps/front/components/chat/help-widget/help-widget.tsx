"use client";

import { useState } from "react";
import { ChatShell } from "../chat-shell";
import { ChatLauncher } from "../chat-launcher";
import { Contact } from "./contact";
import { LastOrder } from "./last-order";
import { HelpMenu, OrdersAnswer, type HelpView } from "./menu";
import { Pickup } from "./pickup";

const TITLE = "Ajuda";

export function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<HelpView>("menu");

  function toggle() {
    setOpen((current) => !current);
    setView("menu");
  }

  return (
    <>
      {open && (
        <ChatShell
          variant="floating"
          title={TITLE}
          onClose={toggle}
          onBack={view === "menu" ? undefined : () => setView("menu")}
        >
          {view === "menu" && <HelpMenu onSelect={setView} />}
          {view === "lastOrder" && <LastOrder open={open} />}
          {view === "orders" && <OrdersAnswer />}
          {view === "contact" && <Contact />}
          {view === "pickup" && <Pickup />}
        </ChatShell>
      )}
      <ChatLauncher open={open} onToggle={toggle} label="Abrir ajuda" />
    </>
  );
}
