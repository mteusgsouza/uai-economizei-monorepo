/**
 * Traduz a aparência escolhida no admin para variáveis CSS.
 *
 * O sistema Industry é mono: um acento só, com uma rampa de nove tons usada em
 * link, tag, hover, foco e no duotone das fotos. Guardar os nove no admin seria
 * pedir à loja que mantivesse uma escala perceptual à mão, então só a cor base é
 * salva e a rampa sai daqui.
 *
 * A mistura é feita em OKLCH, o mesmo espaço em que a rampa original foi gerada
 * — em sRGB os tons claros de um azul ficam acinzentados e a escala perde o
 * passo uniforme. As porcentagens abaixo reproduzem o espaçamento da rampa de
 * `brand.css`.
 *
 * Sem cor escolhida nada é emitido: valem os valores originais do design, e a
 * loja de hoje não muda um pixel.
 */

/** Passos claros: proporção do acento contra o branco. */
const TINTS: Array<[step: number, amount: number]> = [
  [100, 8],
  [200, 18],
  [300, 32],
  [400, 50],
  [500, 72],
]

/** Passos escuros: proporção do acento contra o quase-preto da marca. */
const SHADES: Array<[step: number, amount: number]> = [
  [700, 78],
  [800, 56],
  [900, 38],
]

const INK = '#0f1114'

const RADIUS: Record<string, string> = {
  square: '0px',
  soft: '4px',
  round: '8px',
}

export interface ThemeSettings {
  primaryColor?: string | null
  radius?: string | null
}

/**
 * Monta o conteúdo do `<style>` do layout. String vazia quando não há nada a
 * sobrescrever — o layout então não injeta tag nenhuma.
 */
export function themeCss(theme: ThemeSettings | null | undefined): string {
  const declarations: string[] = []
  const accent = normalizeHex(theme?.primaryColor)

  if (accent) {
    declarations.push(`--color-accent: ${accent}`)
    // `--primary` é o token do shadcn; sem ele o botão principal e as bordas
    // de `Tag`/`Button` continuariam no aço antigo.
    declarations.push(`--primary: ${accent}`)
    declarations.push(`--ring: ${accent}`)

    for (const [step, amount] of TINTS) {
      declarations.push(
        `--color-accent-${step}: color-mix(in oklch, ${accent} ${amount}%, #ffffff)`,
      )
    }

    declarations.push(`--color-accent-600: ${accent}`)

    for (const [step, amount] of SHADES) {
      declarations.push(`--color-accent-${step}: color-mix(in oklch, ${accent} ${amount}%, ${INK})`)
    }

    // O hover dos primitivos shadcn é a tinta clara da rampa, não o aço cheio.
    declarations.push(`--accent: color-mix(in oklch, ${accent} 8%, #ffffff)`)
    declarations.push(`--accent-foreground: color-mix(in oklch, ${accent} 56%, ${INK})`)
  }

  const radius = theme?.radius ? RADIUS[theme.radius] : undefined
  if (radius && radius !== '0px') {
    declarations.push(`--radius: ${radius}`)
    declarations.push(`--radius-xs: ${radius}`)
  }

  return declarations.length > 0 ? `:root{${declarations.join(';')}}` : ''
}

/** Aceita só hexadecimal de seis dígitos — o mesmo que a validação do admin. */
function normalizeHex(value: string | null | undefined): string | null {
  if (!value) return null
  const hex = value.trim()
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : null
}
