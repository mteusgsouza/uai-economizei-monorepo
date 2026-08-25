/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Escopos livres, mas em minúsculas: `feat(vitrine)`, `fix(pedidos)`.
    "scope-case": [2, "always", "lower-case"],
    // Assunto em português costuma passar de 72; 100 é o teto do header.
    "header-max-length": [2, "always", 100],
    // O corpo do commit é opcional aqui — não exigimos linha em branco à toa.
    "body-max-line-length": [0],
  },
};
