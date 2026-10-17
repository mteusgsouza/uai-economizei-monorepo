export interface NamedBlock {
  blockType: string;
  blockName?: string | null;
}

/**
 * O nome de cada bloco: `video-1`, `video-2`… — a base do tipo mais a posição
 * entre os blocos do mesmo tipo. Nome vazio ou ainda no formato automático é
 * renumerado (reordenar não deixa `video-2` acima de `video-1`); nome que a
 * pessoa escreveu fica como está.
 */
export function autoBlockNames(
  blocks: readonly NamedBlock[],
  baseOf: (blockType: string) => string,
): string[] {
  const seen = new Map<string, number>();

  return blocks.map(({ blockType, blockName }) => {
    const position = (seen.get(blockType) ?? 0) + 1;
    seen.set(blockType, position);

    const base = baseOf(blockType);
    const current = blockName?.trim() ?? "";
    const isAuto = current === "" || new RegExp(`^${base}-\\d+$`).test(current);
    return isAuto ? `${base}-${position}` : current;
  });
}

/** Os mesmos blocos com o nome preenchido — para o hook que salva a página. */
export function withBlockNames<T extends NamedBlock>(
  blocks: readonly T[],
  baseOf: (blockType: string) => string,
): T[] {
  const names = autoBlockNames(blocks, baseOf);
  return blocks.map((block, i) => ({ ...block, blockName: names[i] }));
}
