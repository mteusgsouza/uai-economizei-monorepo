'use client'

import { useEffect, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'
import { IconPhotoOff } from '@tabler/icons-react'

import { formatBRL } from '../lib/format'

interface FeaturedProduct {
  productMainImg?: string | null
  price?: number | null
}

/**
 * Pré-visualização do slide do carrossel.
 *
 * Campo `ui`: não guarda nada. Existe porque a promoção é um banner e hoje só dá
 * para conferir o resultado abrindo a home — título, rótulo, preço e botão são
 * escritos às cegas. A composição aqui é a mesma de `components/layout/promo-slide`,
 * o suficiente para julgar o texto sem sair da tela.
 */
export function PromotionPreview() {
  const title = useFormFields(([fields]) => fields?.title?.value) as string | undefined
  const description = useFormFields(([fields]) => fields?.description?.value) as string | undefined
  const discountLabel = useFormFields(([f]) => f?.discountLabel?.value) as string | undefined
  const note = useFormFields(([fields]) => fields?.note?.value) as string | undefined
  const ctaLabel = useFormFields(([fields]) => fields?.ctaLabel?.value) as string | undefined
  const priceLabel = useFormFields(([fields]) => fields?.priceLabel?.value) as string | undefined
  const image = useFormFields(([fields]) => fields?.image?.value) as string | undefined
  const productId = useFormFields(([fields]) => fields?.product?.value)

  const [product, setProduct] = useState<FeaturedProduct | null>(null)
  const [failed, setFailed] = useState(false)

  // O relacionamento guarda só o id; imagem e preço do destaque vêm por REST,
  // como o campo de subcategoria já faz com a categoria dona.
  useEffect(() => {
    if (!productId) return

    let cancelled = false
    fetch(`/api/products/${productId}?depth=0`, { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : null))
      .then((doc: FeaturedProduct | null) => {
        if (!cancelled) setProduct(doc)
      })
      .catch(() => {
        if (!cancelled) setProduct(null)
      })

    return () => {
      cancelled = true
    }
  }, [productId])

  // Derivado, não zerado no efeito: sem produto selecionado o destaque some do
  // slide sem precisar de um `setState` extra a cada troca.
  const featured = productId ? product : null

  const figure = image?.trim() || featured?.productMainImg?.trim() || ''
  const price =
    priceLabel?.trim() ||
    (typeof featured?.price === 'number' ? formatBRL(featured.price) : '')

  return (
    <div className="uai-preview uai-promo-preview">
      <div className="uai-preview__head">
        <span>Como aparece no carrossel</span>
        <span>{image?.trim() ? 'imagem própria' : 'imagem do produto'}</span>
      </div>

      <div className="uai-promo-slide">
        <div className="uai-promo-slide__text">
          {(discountLabel || note) && (
            <p className="uai-promo-slide__kicker">
              {discountLabel}
              {discountLabel && note ? ' · ' : ''}
              {note && <span className="uai-promo-slide__note">{note}</span>}
            </p>
          )}

          <h4 className="uai-promo-slide__title">{title || 'Sem título'}</h4>
          {description && <p className="uai-promo-slide__desc">{description}</p>}
          {price && <p className="uai-promo-slide__price">{price}</p>}
          {ctaLabel && <span className="uai-promo-slide__cta">{ctaLabel}</span>}
        </div>

        <div className="uai-promo-slide__figure">
          {!figure || failed ? (
            <div className="uai-image-preview-empty">
              <IconPhotoOff size={22} />
              <span>{figure ? 'Imagem indisponível' : 'Sem imagem'}</span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={figure} alt="" onError={() => setFailed(true)} />
          )}
        </div>
      </div>
    </div>
  )
}

export default PromotionPreview
