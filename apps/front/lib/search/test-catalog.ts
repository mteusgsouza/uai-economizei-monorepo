import type { SearchDoc } from "./types";

/**
 * Amostra do catálogo para os testes, com nomes reais — espaço duplo,
 * código de modelo e medida do jeito que estão no banco. A ordem é a da
 * vitrine (mais novo primeiro), que desempata o ranking.
 */
export const TEST_CATALOG: SearchDoc[] = [
  {
    id: 1,
    name: "Mouse Óptico M110 Silent 1.000 DPI Vermelho Logitech",
    brand: "Logitech",
    taxonomy: ["Informática", "Mouse"],
  },
  {
    id: 2,
    name: "Headset Gamer Warrior 2.0 Com Led Usb Preto E Azul Ph244",
    brand: "Warrior",
    taxonomy: ["Informática", "Headset e Microfone"],
  },
  {
    id: 3,
    name: "Kit Teclado e Mouse Microsoft Wireless 850 Sem fio PY9-00021",
    brand: "Microsoft",
    taxonomy: ["Informática", "Teclado e Mouse"],
  },
  {
    id: 4,
    name: "SSD WD Green, 240GB, M.2, Leitura 545MB/s - WDS240G2G0B",
    brand: "WD",
    taxonomy: ["Informática", "Solid State Disk (SSD)"],
  },
  {
    id: 5,
    name: 'Monitor 28" Samsung Widescreen 4k UHD 1ms 60hz LU28E590DS/ZD',
    brand: "Samsung",
    taxonomy: ["Informática", "Monitor"],
  },
  {
    id: 6,
    name: "Notebook i5 8gb 250gb SSD tela 14",
    brand: "Sem marca",
    taxonomy: ["Informática", "Notebook"],
  },
  {
    id: 7,
    name: "Jogo De Ferramentas 129 Pc Estojo Plastico Maleta Sparta 13564",
    brand: "Sparta",
    taxonomy: ["Ferramentas", "Kits"],
  },
  {
    id: 8,
    name: "Catraca + Cinta Amarração 1,5 Ton 9 Metros 50mm Branca",
    brand: "Sem marca",
    taxonomy: ["Ferramentas", "Amarração"],
  },
  {
    id: 9,
    name: "Geladeira Frost Free 375 Litros  Inox",
    brand: "Electrolux",
    taxonomy: ["Casa e Cozinha", "Eletrodomésticos"],
  },
  {
    id: 10,
    name: "Bateria Recarregável 2400mAh AA",
    brand: "Sem marca",
    taxonomy: ["Eletrônicos", "Acessórios"],
  },
  {
    id: 11,
    name: "Suporte de Parede Articulado para TV 32 a 55",
    brand: "Sem marca",
    taxonomy: ["Eletrônicos", "Acessórios para TV"],
  },
  {
    id: 12,
    name: " Roteador Wireless Mercusys 1200Mbps 4 Antenas AC12",
    brand: "Mercusys",
    taxonomy: ["Informática", "Rede Lan e Wireless"],
  },
];

/** Cadastros de sinônimos como vêm do admin. */
export const TEST_SYNONYMS = [
  "fone, fone de ouvido, headset, headphone",
  "notebook, laptop",
  "sem fio, wireless",
  "tv, televisão, televisor",
];
