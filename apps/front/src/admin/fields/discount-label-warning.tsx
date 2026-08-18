'use client'

import { useFormFields } from '@payloadcms/ui'

/**
 * Aviso ao lado do rótulo de desconto da promoção.
 *
 * O `discountLabel` é só texto: quem abate preço é o `discountPercent` de cada
 * produto. O alerta já existia no comentário da collection — aqui ele fica onde
 * o engano acontece, e só aparece quando há algo escrito no campo.
 */
export function DiscountLabelWarning() {
  const value = useFormFields(([fields]) => fields?.discountLabel?.value)

  if (!value) return null

  return (
    <p className="uai-inline-warning">
      Só rótulo — não altera preço. O desconto real é o campo <b>Desconto (%)</b> de cada produto.
    </p>
  )
}

export default DiscountLabelWarning
