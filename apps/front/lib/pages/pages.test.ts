import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify, slugifyTyping } from "../slugify";
import { autoBlockNames } from "./block-names";
import { slugProblem } from "./slug-rules";

describe("slugify", () => {
  it("vira endereço sem acento, caixa nem pontuação", () => {
    assert.equal(slugify("Trocas e Devoluções!"), "trocas-e-devolucoes");
    assert.equal(slugify("  Política de Privacidade  "), "politica-de-privacidade");
    assert.equal(slugify("Memória RAM", "_"), "memoria_ram");
    assert.equal(slugify("!!!"), "");
  });

  it("enquanto digita, guarda o hífen do fim", () => {
    assert.equal(slugifyTyping("Minha página "), "minha-pagina-");
    assert.equal(slugifyTyping(" Olá"), "ola");
  });
});

describe("slugProblem", () => {
  it("aceita endereço limpo", () => {
    assert.equal(slugProblem("trocas-e-devolucoes"), null);
  });

  it("explica o que está errado", () => {
    assert.match(slugProblem("") ?? "", /Informe/);
    assert.match(slugProblem("Minha Página") ?? "", /minúsculas/);
    assert.match(slugProblem("fim-") ?? "", /minúsculas/);
    assert.match(slugProblem("produtos") ?? "", /tela da loja/);
  });
});

describe("autoBlockNames", () => {
  const baseOf = (type: string) => ({ video: "video", content: "texto" })[type] ?? type;

  it("numera por tipo, na ordem da página", () => {
    const names = autoBlockNames(
      [{ blockType: "video" }, { blockType: "content" }, { blockType: "video" }, { blockType: "video" }],
      baseOf,
    );
    assert.deepEqual(names, ["video-1", "texto-1", "video-2", "video-3"]);
  });

  it("renumera os automáticos e preserva o nome escrito", () => {
    const names = autoBlockNames(
      [
        { blockType: "video", blockName: "video-2" },
        { blockType: "video", blockName: "Vídeo da fábrica" },
        { blockType: "video", blockName: "video-1" },
      ],
      baseOf,
    );
    assert.deepEqual(names, ["video-1", "Vídeo da fábrica", "video-3"]);
  });
});
