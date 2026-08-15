import { pixPrice, sellingPrice } from './pricing';

/**
 * Estes números decidem quanto o cliente paga e precisam bater com
 * `apps/front/lib/commerce.ts`, que é o que a vitrine mostra. Se um valor aqui
 * mudar sem o gêmeo mudar junto, o site anuncia um preço e a loja cobra outro.
 */
describe('pricing — o que a loja cobra', () => {
  describe('sellingPrice', () => {
    it('devolve o preço cheio quando não há desconto', () => {
      expect(sellingPrice(89900, 0)).toBe(89900);
      expect(sellingPrice(89900, null)).toBe(89900);
      expect(sellingPrice(89900, undefined)).toBe(89900);
    });

    it('abate a porcentagem arredondando ao centavo', () => {
      expect(sellingPrice(89900, 39)).toBe(54839);
      expect(sellingPrice(129900, 24)).toBe(98724);
      // 1/3 de 100 reais: dízima que precisa cair no mesmo lado dos dois lados
      expect(sellingPrice(10000, 33)).toBe(6700);
      expect(sellingPrice(9999, 33)).toBe(6699);
    });

    it('trata porcentagens fora da faixa em vez de gerar preço negativo', () => {
      expect(sellingPrice(10000, 150)).toBe(0);
      expect(sellingPrice(10000, -20)).toBe(10000);
      expect(sellingPrice(10000, Number.NaN)).toBe(10000);
    });
  });

  describe('pixPrice', () => {
    it('aplica o desconto à vista sobre o preço já com desconto', () => {
      expect(pixPrice(54900, 10)).toBe(49410);
      expect(pixPrice(109200, 10)).toBe(98280);
      expect(pixPrice(18900, 10)).toBe(17010);
    });

    it('devolve o mesmo valor quando a loja não dá desconto no PIX', () => {
      expect(pixPrice(54900, 0)).toBe(54900);
    });
  });
});
