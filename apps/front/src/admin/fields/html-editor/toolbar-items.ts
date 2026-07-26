import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconClearFormatting,
  IconH2,
  IconH3,
  IconItalic,
  IconList,
  IconListNumbers,
  IconPilcrow,
  IconUnderline,
  type Icon,
} from '@tabler/icons-react'

import { exec, formatBlock, type EditorCommand } from './commands'

export interface ToolbarItem {
  id: string
  title: string
  Icon: Icon
  run: EditorCommand
}

/** Grupos separados por divisória na barra. */
export const TOOLBAR_GROUPS: ToolbarItem[][] = [
  [
    { id: 'bold', title: 'Negrito', Icon: IconBold, run: exec('bold') },
    { id: 'italic', title: 'Itálico', Icon: IconItalic, run: exec('italic') },
    { id: 'underline', title: 'Sublinhado', Icon: IconUnderline, run: exec('underline') },
  ],
  [
    { id: 'p', title: 'Parágrafo', Icon: IconPilcrow, run: formatBlock('p') },
    { id: 'h2', title: 'Título', Icon: IconH2, run: formatBlock('h2') },
    { id: 'h3', title: 'Subtítulo', Icon: IconH3, run: formatBlock('h3') },
  ],
  [
    { id: 'ul', title: 'Lista', Icon: IconList, run: exec('insertUnorderedList') },
    { id: 'ol', title: 'Lista numerada', Icon: IconListNumbers, run: exec('insertOrderedList') },
  ],
  [
    { id: 'left', title: 'Alinhar à esquerda', Icon: IconAlignLeft, run: exec('justifyLeft') },
    { id: 'center', title: 'Centralizar', Icon: IconAlignCenter, run: exec('justifyCenter') },
    { id: 'right', title: 'Alinhar à direita', Icon: IconAlignRight, run: exec('justifyRight') },
  ],
  [
    {
      id: 'clear',
      title: 'Limpar formatação',
      Icon: IconClearFormatting,
      run: exec('removeFormat'),
    },
    { id: 'undo', title: 'Desfazer', Icon: IconArrowBackUp, run: exec('undo') },
    { id: 'redo', title: 'Refazer', Icon: IconArrowForwardUp, run: exec('redo') },
  ],
]
