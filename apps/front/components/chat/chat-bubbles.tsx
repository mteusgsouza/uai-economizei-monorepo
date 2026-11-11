import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export interface ChatBubbleProps {
  role: "user" | "assistant";
  children: ReactNode;
  className?: string;
}

/** Balão de mensagem: assistente à esquerda, cliente à direita. */
export function ChatBubble({ role, children, className }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "max-w-[88%] whitespace-pre-line px-3.5 py-2.5 text-sm leading-snug",
        isUser
          ? "self-end bg-accent-700 text-white"
          : "self-start border border-divider bg-white text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Opção de menu do chat. Aceita as props de `Button` (onClick, asChild...). */
export function ChatOptionButton({
  className,
  children,
  asChild,
  ...props
}: Omit<ComponentProps<typeof Button>, "variant">) {
  return (
    <Button
      variant="outline"
      asChild={asChild}
      className={cn(
        "h-auto w-full justify-between gap-3 whitespace-normal border-divider bg-white px-3.5 py-3 text-left text-sm font-medium hover:border-accent hover:bg-white",
        className,
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          <span>{children}</span>
          <ChevronRight className="text-ink/40" />
        </>
      )}
    </Button>
  );
}
