const LETTERS_ONLY = /^[a-z]+$/;

/** Célula da matriz; fora dela conta como infinito. */
function cell(row: readonly number[], index: number): number {
  return row[index] ?? Number.POSITIVE_INFINITY;
}

/**
 * Distância de edição OSA (Damerau restrita): inserir, apagar, trocar uma
 * letra ou inverter duas vizinhas custa 1 cada. Para assim que passa de
 * `max` e devolve `max + 1` — só interessa saber se cabe no orçamento.
 */
export function boundedDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let beforePrevious: number[] = [];
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(
        cell(previous, j) + 1,
        cell(current, j - 1) + 1,
        cell(previous, j - 1) + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, cell(beforePrevious, j - 2) + 1);
      }
      current.push(value);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > max) return max + 1;
    beforePrevious = previous;
    previous = current;
  }

  return Math.min(cell(previous, b.length), max + 1);
}

/**
 * Quantos erros de digitação um termo tolera: 1 a partir de 5 letras, 2 a
 * partir de 9. Termo com dígito não tolera nenhum — 240gb não pode virar 250gb.
 */
export function typoBudget(word: string): number {
  if (!LETTERS_ONLY.test(word)) return 0;
  if (word.length >= 9) return 2;
  if (word.length >= 5) return 1;
  return 0;
}
