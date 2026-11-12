'use client'

import { Button, toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { generateSynonymsAction } from '../actions/generate-synonyms'

interface GenerateSynonymsButtonProps {
  /** Quando a lista mudou pela última vez, já formatado pelo servidor. */
  lastUpdatedLabel: string
}

export function GenerateSynonymsButton({ lastUpdatedLabel }: GenerateSynonymsButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const run = () =>
    startTransition(async () => {
      const result = await generateSynonymsAction()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`${result.created} grupos criados, ${result.skipped} já cobertos.`)
      router.refresh()
    })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <Button buttonStyle="secondary" size="small" disabled={pending} onClick={run}>
        {pending ? 'Gerando…' : 'Gerar sinônimos com IA'}
      </Button>
      <span style={{ fontSize: 13, opacity: 0.7 }}>
        A IA sugere; revise e edite os grupos criados.
        <br />
        {lastUpdatedLabel}
      </span>
    </div>
  )
}
