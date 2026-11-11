"use client";

import { MessageCircle, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface ChatLauncherProps {
  open: boolean;
  onToggle: () => void;
  label: string;
}

/** Botão redondo fixo no canto; z-40 para ficar abaixo do aviso de cookies (z-50). */
export function ChatLauncher({ open, onToggle, label }: ChatLauncherProps) {
  return (
    <Button
      size="icon"
      onClick={onToggle}
      aria-label={open ? "Fechar chat" : label}
      aria-expanded={open}
      className="fixed bottom-4 right-4 z-40 size-12 rounded-full shadow-lg"
    >
      {open ? <X /> : <MessageCircle />}
    </Button>
  );
}
