"use client"

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ChatBubble } from "@/components/chat/chat-bubbles"
import { ChatShell } from "@/components/chat/chat-shell"
import { SearchAssistantResults } from "./search-assistant-results"
import { MAX_MESSAGE_LENGTH, useSearchAssistant } from "./use-search-assistant"

interface SearchAssistantProps {
  /** O termo que a busca do site não resolveu. */
  term: string
  /** Com resultado fraco o convite nasce fechado; sem resultado, aberto. */
  defaultOpen?: boolean
  /** Conteúdo que o chat substitui assim que a conversa começa (ex.: o card de vazio). */
  replaces?: ReactNode
}

const DISABLED_NOTICE =
  "Por agora o assistente encerrou. Continue pela busca do site: tente o tipo do produto ou a marca."

/** Mini-chat com IA abaixo da listagem quando a busca não encontra (ou encontra mal). */
export function SearchAssistant({ term, defaultOpen = true, replaces }: SearchAssistantProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [draft, setDraft] = useState("")
  const { turns, products, status, disabled, send, retry } = useSearchAssistant(term)
  const loading = status === "loading"
  const panelRef = useRef<HTMLDivElement>(null)

  // Cada leva nova de produtos rola até o topo do chat: resposta e cartões ficam à vista juntos.
  useEffect(() => {
    if (products.length === 0) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    panelRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
  }, [products])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    send(draft)
    setDraft("")
  }

  if (!open) {
    return (
      <>
        {replaces}
        <Button variant="outline" className="mt-6 gap-2" onClick={() => setOpen(true)}>
          <Sparkles /> Não achou? Me conta o que você procura
        </Button>
      </>
    )
  }

  const footer = disabled ? null : (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder="Ex.: quero um fone sem fio barato"
        aria-label="Mensagem para o assistente"
        disabled={loading}
        className="bg-white"
      />
      <Button type="submit" size="icon" disabled={loading || !draft.trim()} aria-label="Enviar">
        <Send />
      </Button>
    </form>
  )

  return (
    <>
      {turns.length === 0 && replaces}
      {/* scroll-mt: o header do site é fixo e cobriria o topo do chat. */}
      <div ref={panelRef} className="mt-6 flex scroll-mt-28 flex-col gap-6">
        <ChatShell
          variant="inline"
          title="Me conta o que você procura"
          onClose={() => setOpen(false)}
          footer={footer}
          className="max-h-[28rem]"
        >
          <ChatBubble role="assistant">
            {`Não achei nada certeiro para “${term}”. Me descreve o que você quer — para que serve, marca, faixa de preço — que eu procuro no catálogo.`}
          </ChatBubble>
          {turns.map((turn, index) => (
            <ChatBubble key={index} role={turn.role}>
              {turn.content}
            </ChatBubble>
          ))}
          <div aria-live="polite" className="flex flex-col gap-3">
            {loading && <ChatBubble role="assistant">Procurando no catálogo…</ChatBubble>}
            {status === "error" && (
              <ChatBubble role="assistant" className="flex flex-col items-start gap-2">
                Não consegui responder agora.
                <Button size="sm" variant="outline" onClick={retry}>
                  Tentar de novo
                </Button>
              </ChatBubble>
            )}
            {disabled && <ChatBubble role="assistant">{DISABLED_NOTICE}</ChatBubble>}
          </div>
        </ChatShell>

        <SearchAssistantResults products={products} />
      </div>
    </>
  )
}
