# Plano: Busca tolerante com sinônimos editáveis (`/produtos`)

> **Status:** ✅ Implementado em 2026-09-11  
> **Data da decisão:** 2026-09-10

## Estado

- **Código:**
  - lógica pura em `apps/front/lib/search/`, com 47 testes (`pnpm --filter @store/front test`);
  - integração em `apps/front/lib/catalog/` (`listing.ts`, `search-results.ts`, `search-data.ts`,
    `product-query.ts`, `listing-params.ts`).
- **Banco:** migration `20260911_033028_search_synonyms`, com a tabela e os 33 grupos iniciais. Já aplicada no
  Neon `main`.
- **Admin:** coleção "Sinônimos de busca" (`search-synonyms`).
- **Quando revisitar:** se o catálogo comprável passar de ~3 mil itens. Nesse ponto, troque o índice em memória
  por uma coluna normalizada com índice GIN `pg_trgm` (ver "Abordagem").

### Ajustes feitos na implementação (em relação ao plano abaixo)

- `buildWhere`/`buildSort` e `ProductQuery` foram para `product-query.ts`, não `product-where.ts`.
- `FILTER_KEYS` saiu de `use-filter-params.ts` (`"use client"`) para `listing-params.ts`, porque o servidor
  também usa a constante em `hasActiveFilters`.
- Erro de digitação também casa com o **começo** das palavras: "logitek" → "logitech".
- A marca-curinga "Sem marca" fica fora do índice, senão "sem fio" casaria com todo produto sem marca.
- O chip "Busca" só aparece quando o termo tem algo aproveitável: "de" não vira etiqueta.
- O `down` da migration usa `IF EXISTS`. O `DROP TABLE … CASCADE` já derruba a FK, e o `DROP CONSTRAINT` gerado
  falharia.

## Contexto

Hoje a busca do site é uma linha só (`apps/front/lib/catalog/products.ts:38`): `name like termo`. O Payload
traduz isso em um `ILIKE '%palavra%'` por palavra, todos com AND. Com isso:

- "informatica" não acha "Informática", porque o ILIKE diferencia acentos.
- Qualquer erro de digitação zera o resultado.
- "geladeiras" não acha "Geladeira".
- Marca, categoria e subcategoria não entram na busca.
- Não há ordenação por relevância: "Relevância" na tela é `-createdAt`.
- O placeholder promete "produto, marca ou código", mas os códigos de modelo só existem dentro do nome.
- Quirks atuais:
  - o termo não pode ser limpo pela página;
  - o campo do header não reflete a URL;
  - um termo só com espaços devolve o catálogo inteiro.

Objetivo: busca que tolere acentos, maiúsculas, erros de digitação, plural, códigos (`PY9-00021`) e unidades
(`8 GB`, `28"`), com sinônimos que o lojista incrementa pelo admin conforme cadastra produtos novos.

**Decisões tomadas:**
- Busca lexical tolerante, sem embeddings nem serviço externo.
- Sinônimos numa **coleção do Payload**, com lista inicial inserida pela migration.
- Sem campo de termos por produto.
- Só a página de resultados, sem sugestões enquanto digita.

## Abordagem

A busca inteira roda **em memória, dentro de uma consulta cacheada**. Não há coluna nova em `products`, nem
`pg_trgm`, nem SQL cru.

- **Por que dá:** o catálogo tem 1.131 produtos, dos quais ~280 compráveis (`AVAILABLE`). Montar o índice por
  consulta custa alguns ms.
- **O que fica fora do caminho:** raw SQL acoplado às tabelas do Payload, extensões e backfill.
- **Por que não um índice cacheado à parte:** no Next 16, um `unstable_cache` aninhado **ignora o cache interno e
  não propaga tags** (confirmado em `node_modules/next/dist/server/web/spec-extension/unstable-cache.js:132-146`).
- **Quando revisitar:** se o catálogo comprável passar de ~3 mil itens, vale migrar para uma coluna normalizada
  com índice GIN `pg_trgm`. O `afterSchemaInit` + `migrate:create` já capturam esse índice.

### Fluxo

1. `page.tsx` monta a query. O novo `loadListing` (sem cache) decide o caminho:
   - sem termos válidos: `getProducts`, como hoje;
   - com termos: `getSearchResults(filtros, termoCanônico)`.
2. `getSearchResults` usa `unstable_cache` com as tags `products`, `brands`, `categories` e `search-synonyms`
   e `revalidate: 300`. A chave é o termo canônico: sem acento, minúsculo, espaços colapsados, ≤ 100 chars.
3. `fetchSearchResults`:
   1. Carrega os candidatos com `buildWhere(filtros)`, que é `AVAILABLE` mais os filtros ativos, com:
      - `pagination: false`, `depth: 1`, `sort: "-createdAt"`;
      - `select` de `name`, `brand`, `category` e `subcategory`;
      - `populate: { brands: { name }, categories: { title, subcategories } }`.
   2. Carrega as linhas de sinônimos e chama `rankProducts`, que devolve `{ ids, mode, corrections, correctedTerm }`.
   3. Pagina conforme a ordenação:
      - com `sortBy`: `find` com `AVAILABLE + id in ids`, `buildSort`, page e limit;
      - em relevância: fatia os ids da página, faz `find` com `id in pageIds` e `depth: 1`, reordena pelo
        ranking e aplica `mapProduct`.
   4. Guardas: lista de ids vazia não consulta nada, e página além de `totalPages` é ajustada.

## Regras da busca (`apps/front/lib/search/`, funções puras)

### Normalização (aplicada igual na consulta, nos produtos e nos sinônimos)

- Minúsculas, NFD sem diacríticos, espaços colapsados.
- Separadores numéricos: `1.000` vira `1000` (milhar); `2,5` vira `2.5` (decimal); `3.0` fica como está.
- Número colado na unidade:

  | Entrada | Normalizado |
  |---|---|
  | `8 GB` | `8gb` |
  | `28"`, `28 polegadas` | `28pol` |
  | `129 Pc`, `41 Peças` | `129pc`, `41pc` |
  | `1,5 Ton` | `1.5ton` |

  Unidades cobertas: gb, tb, mb, kb, ghz, mhz, hz, w, v, mah, dpi, mbps, gbps, ms, mm, cm, m/metros, kg, g, l,
  ml, ton, pol, pc. Isso também desfaz a ambiguidade do "pc" (peças) nos kits de ferramentas.
- Trechos com pontuação interna (`py9-00021`, `lu28e590ds/zd`, `m.2`, `wi-fi`, `micro-ondas`) viram duas
  alternativas: junto (`py900021`) ou em partes (`py9 00021`).
- Stopwords removidas: de, da, do, das, dos, e, com, para, pra, em, no, na, a, o, as, os, um, uma, por.
  "sem" fica, por causa de "sem fio".
- Tokens de 1 letra são descartados, com no máximo 8 termos. Uma consulta que não sobra nada vira "sem busca",
  o que corrige o bug do termo só com espaços.

### Correspondência de cada termo

| Tipo | Peso | Condição |
|---|---|---|
| Palavra exata | 1.0 | termos de 2 letras (tv, hd) só casam assim |
| Prefixo de palavra | 0.85 | ≥ 3 letras; número só em fronteira de dígito: "240" casa "240gb", não "2400mah" |
| Infixo | 0.5 | só códigos (letras + dígitos, ≥ 4): "rede" **não** casa "parede" |

- **Pesos por campo:** nome 1.0, marca 0.8, categoria/subcategoria 0.6.
- **Pesos por variante:** original 1.0, singular 0.95, sinônimo 0.9, erro de digitação 0.75 (1 edição) ou 0.6
  (2 edições).
- **Erros de digitação:**
  - Só para termos alfabéticos sem acerto exato nem de prefixo no vocabulário.
  - Orçamento: 1 edição com ≥ 5 letras e 2 com ≥ 9.
  - A distância é OSA: trocar duas letras vizinhas conta como 1 edição.
  - Termos com dígitos nunca são aproximados, para que 240gb não vire 250gb.
  - Os candidatos vêm do vocabulário dos produtos mais as palavras dos sinônimos, então "smartfone" chega em
    "smartphone" e daí ao grupo "celular".
- **Plural:** singularização conservadora (oes/aes→ao, ais→al, eis→el, res/zes/ses→sem "es", ns→m, senão tira
  o "s"). Vale nos dois lados, e só entram candidatos que existem no vocabulário. O vocabulário é um `Map`, para
  que "constructor" não conte como acerto.
- **Sinônimos:**
  - Cada grupo é uma lista de termos separados por `,`, `;` ou quebra de linha.
  - A detecção é gulosa: vence a frase mais longa da consulta, contando também as formas no singular.
  - Um termo que está em dois grupos recebe os dois.
  - Uma alternativa de várias palavras exige todas elas (em qualquer campo e ordem) e pontua o mínimo × 0.9.

### Ranking

- **Modo "todos" (AND):**
  - Pontuação: soma dos termos, mais um bônus se o nome começa pelo 1º termo e outro se todos casaram no nome.
  - Empate mantém `-createdAt`.
- **Fallback "qualquer" (OR), quando o AND não acha nada:**
  - Ficam só os produtos com o **maior** número de termos casados.
  - Ordem: esse número, depois se o 1º termo casou (o substantivo vem primeiro: "mouse azul"), depois a
    pontuação, depois a data.

## Arquivos (todos em `apps/front/`, cada um ≤ 150 linhas)

**Lógica pura — `lib/search/`:**

| Arquivo | Conteúdo |
|---|---|
| `types.ts` | tipos |
| `lexicon.ts` | stopwords, unidades, pesos |
| `normalize.ts` | `foldText`, `tokenize`, `canonicalSearch`, `hasSearchTerms` |
| `singular.ts` | singularização |
| `distance.ts` | OSA com saída antecipada + `typoBudget` |
| `synonyms.ts` | `splitTerms`, `parseSynonymGroups`, `findPhrases` |
| `build-index.ts` | índice |
| `token-matches.ts` | regras de casamento + candidatos de erro |
| `parse-query.ts` | termos e correções |
| `score.ts` | pontuação |
| `rank.ts` | `rankProducts(docs, synonymRows, term): Ranking` |

- Importações só relativas, porque a coleção importa `splitTerms` e o CLI do Payload carrega via tsx.
- Nada de `RegExp` montada a partir do input do usuário.
- `noUncheckedIndexedAccess` está ligado, então as matrizes da distância precisam de `?? 0`.

**Camada de catálogo — `lib/catalog/`:**

| Arquivo | Mudança |
|---|---|
| `product-where.ts` (novo) | `buildWhere` e `buildSort` saem de `products.ts`; a linha `name like` é removida |
| `products.ts` | tira `search` de `ProductQuery`; exporta o mapeamento para `ProductListResult`. Os outros usos de `getProducts` (mais-vendidos, categorias, novidades, marcas, produto relacionado) não passam `search` |
| `map-product.ts` | extrai `subcategoryTitle(category, slug)` para reúso |
| `search-data.ts` (novo) | `loadSearchDocs(payload, where)` e `loadSynonymRows(payload)` |
| `search-results.ts` (novo) | `fetchSearchResults`, `fetchRankedPage`, `getSearchResults` |
| `listing.ts` (novo) | `ListingQuery`, `ListingResult` com `search?: { term, mode, correctedTerm }`, `loadListing` |
| `listing-params.ts` (novo) | `PAGE_SIZE`, `buildListingQuery`, `flattenParams`, `hasActiveFilters`, tirados de `page.tsx` |

**UI:**

- `app/(front)/produtos/page.tsx` fica só com a composição e cai de 204 para ~115 linhas.
- `components/product/listing-heading.tsx` (novo): trilha, título, contagem e `SortControl`.
  - Com busca, o título é `Resultados para “{termo}”`.
- `components/product/search-notice.tsx` (novo) mostra os avisos:
  - `Mostrando resultados para “{corrigido}”.`
  - `Nenhum produto tem todos os termos — mostrando os mais próximos.`
- `components/product/listing-empty.tsx` (novo) é o estado vazio de busca, montado sobre o `EmptyState` existente:
  - Título `Nada encontrado para “{termo}”`.
  - Texto: dica de grafia ou de um termo mais geral.
  - Ação: com filtros ativos, "Limpar filtros" mantendo o termo; sem filtros, "Ver todos os produtos".
- `components/product/filters/filter-chips.tsx`: novo chip `Busca: {termo} ×`.
  - Fica **fora** de `FILTER_KEYS`, então "Limpar" mantém o termo.
- `components/layout/search-form.tsx` (novo): o formulário atual, recebendo `initialTerm`.
- `components/layout/search-field.tsx` sincroniza o campo com a URL:
  - `<Suspense fallback={<SearchForm initialTerm="" />}>` envolve um filho que lê `useSearchParams().get("search")`.
  - Esse filho renderiza `<SearchForm key={term} …/>`.
  - O Suspense é obrigatório porque o header aparece em rotas estáticas; sem ele o `next build` falha.
  - A sincronização é por `key`, não por `setState` em effect (regra `set-state-in-effect` do react-hooks 7).
  - O mesmo padrão já existe em login/cadastro.

**Admin:**

- `src/collections/SearchSynonyms.ts` (novo):
  - Slug `search-synonyms`, rótulos "Sinônimo de busca" / "Sinônimos de busca".
  - `useAsTitle: "terms"`, `defaultColumns: ["terms", "updatedAt"]`.
  - Um campo `terms`: text, obrigatório, rótulo "Termos equivalentes".
    - Descrição: "Separe por vírgula. Ex.: fone de ouvido, headset".
    - `validate` usa `splitTerms` e exige ≥ 2 termos distintos. Mensagem: "Informe pelo menos dois termos
      diferentes, separados por vírgula."
  - Hooks `revalidateAfterChange` e `revalidateAfterDelete("search-synonyms")`, de `src/collections/hooks/revalidate.ts`.
  - Sem bloco `access`: o padrão do Payload (usuário logado) é o desejado, e a Local API ignora access.
  - Sem `admin.group`: o grupo "Loja" do nav é fixo em `src/admin/components/nav-links.tsx`, e usar esse
    nome duplicaria o grupo.
- `payload.config.ts`: registrar a coleção depois de `Categories`.
- Não precisa de `generate:importmap`, porque não há componente de admin.

**Tooling:**

- `apps/front/package.json`: `tsx` como devDependency, na mesma faixa de `packages/prisma` (`^4.23.0`).
- Script `"test": "tsx --test \"lib/**/*.test.ts\""`, rodando com node:test, sem framework novo.

## Migration (fluxo do CLAUDE.md)

1. `pnpm --filter @store/front generate:types`
2. `pnpm --filter @store/front payload migrate:create search_synonyms`. Gera `.ts` + `.json` e regenera `index.ts`.
3. **Revisar o SQL.** O esperado no `up`:
   - `CREATE TABLE "search_synonyms"` com `id serial`, `terms varchar NOT NULL`, `updated_at` e `created_at`;
   - índices de `updated_at` e `created_at`;
   - em `payload_locked_documents_rels`: `ADD COLUMN "search_synonyms_id"`, com FK e índice.

   Se aparecer qualquer outra coisa, o snapshot está fora de sincronia: parar. Um prompt de "renamed column"
   tem o mesmo significado; não responder no chute nem usar `--force-accept-warning`.
4. Acrescentar ao `up` um segundo `db.execute(sql\`INSERT INTO "search_synonyms" ("terms") VALUES …\`)` com a
   lista inicial abaixo. O `down` gerado já derruba a tabela, e as linhas vão junto. O `.ts` e o `.json` vão
   juntos no commit.
5. `payload migrate:status`: só a nova pode estar pendente. Depois `payload migrate`.
   - Isso aplica no Neon `main`, que é produção, porque só existe essa branch.
   - É aditivo (tabela e coluna nulável novas), o caso que o CLAUDE.md libera sem branch de validação.

### Lista inicial de sinônimos (33 grupos)

Evita abreviações ambíguas soltas: pc, hd, tela, case, jogo, catraca, fonte, memória.

1. notebook, laptop
2. computador, desktop, computador de mesa
3. ssd, disco sólido
4. hd externo, disco externo, hd portátil
5. pendrive, pen drive
6. mousepad, mouse pad
7. webcam, câmera web
8. sem fio, wireless
9. fone, fone de ouvido, headset, headphone
10. caixa de som, alto-falante, speaker
11. tv, televisão, televisor
12. videogame, video game, console
13. celular, smartphone, telefone celular
14. capinha, capa de celular
15. película, protetor de tela
16. power bank, powerbank, carregador portátil, bateria externa
17. placa de vídeo, placa gráfica, gpu
18. placa-mãe, placa mãe, motherboard
19. processador, cpu
20. kit de ferramentas, jogo de ferramentas, maleta de ferramentas, conjunto de ferramentas
21. esmerilhadeira, lixadeira angular
22. trena, fita métrica
23. máquina de solda, inversora de solda
24. lavadora de alta pressão, lava jato
25. cinta de amarração, cinta com catraca
26. carregador veicular, carregador automotivo, carregador de carro
27. aspirador automotivo, aspirador veicular, aspirador de carro
28. geladeira, refrigerador
29. micro-ondas, microondas
30. air fryer, airfryer, fritadeira elétrica, fritadeira sem óleo
31. cafeteira, máquina de café
32. ventilador, circulador de ar
33. purificador de água, filtro de água

## Testes (`lib/search/*.test.ts`, com fixture montada de nomes reais do catálogo)

- **normalize:**
  - acentos e caixa;
  - espaços extras;
  - stopwords, mantendo "sem";
  - unidades: `8 GB`, `28"`, `28 polegadas`, `1.000 DPI`, `1,5 Ton`, `3.0`;
  - formas junto/partes de `PY9-00021`, `LU28E590DS/ZD`, `M.2`, `Micro-ondas`;
  - `hasSearchTerms("   ")` e `hasSearchTerms("de da")` são falsos.
- **singular:**
  - geladeiras, botoes, aneis, jornais, lencois, compressores, luzes, nuvens, mesas;
  - tokens com dígitos ficam intactos.
- **distance:**
  - "notbook", "teclaod" e "samsumg" dão 1;
  - a função sai cedo quando passa do limite;
  - orçamento: 4 letras → 0, 7 → 1, 13 → 2; com dígito → 0.
- **synonyms:**
  - separadores `,`, `;` e quebra de linha, com deduplicação;
  - grupo com menos de 2 termos é rejeitado;
  - vence a frase mais longa;
  - frase no plural;
  - termo em dois grupos.
- **rank:**

  | Consulta | Esperado |
  |---|---|
  | notbook | acha Notebook, com correção |
  | mouse logitec | acha por prefixo, sem correção |
  | mouse logitek | corrigido |
  | fone de ouvido | acha "Headset" |
  | py900021 / PY9-00021 / py9 00021 | acha o kit Microsoft |
  | ssd 240 | acha o SSD, não um 2400mAh |
  | 28 polegadas | acha o monitor |
  | geladeiras | acha Geladeira |
  | informatica | casa pela categoria |
  | rede | ≠ Parede |
  | mouse azul | cai no modo OR, com mouses primeiro |
  | xyzabc | vazio |

  Na ordem: para "mouse", "Mouse Óptico…" fica acima de "Kit Teclado e Mouse…", e empates mantêm a ordem de entrada.

## Verificação

1. `pnpm --filter @store/front test`, depois `lint` e `typecheck` (quality gate).
2. `pnpm --filter @store/front build`. É o único passo que pega Suspense faltando no header.
3. Conferir se a porta 3000 está livre (`Get-NetTCPConnection -LocalPort 3000 -State Listen`) e reusar ou subir o
   preview `front`. Em `/produtos`:
   - Consultas: notbook, mouse logitec, fone de ouvido, py900021, ssd 240, 28 polegadas, geladeiras,
     informatica, celulares, rede, mouse azul, e só espaços (deve dar a listagem completa, sem chip).
   - Ordenação e paginação durante a busca.
   - O chip "Busca" remove o termo e limpa o campo do header.
   - "Limpar" mantém o termo.
   - Voltar e avançar mantêm o header sincronizado.
4. No admin, criar "parafusadeira, aparafusadeira" e buscar "aparafusadeira". Recarregar até duas vezes:
   `revalidateTag(tag, 'max')` serve o cache velho uma vez.
5. Encerrar tudo o que foi aberto e confirmar as portas 3000 e 8080 livres.

## Fora do escopo

- Sugestões enquanto digita.
- Embeddings / busca por significado. O `rankProducts` isolado permite somar um ranker semântico depois.
- Busca nas descrições HTML, que só trariam ruído.
- Contagens do painel de filtros refletindo o termo buscado: hoje elas refletem o catálogo todo.
- Unificar com o `normalize-name.ts` da Nest: o front não importa da API, e a API fica intocada.
