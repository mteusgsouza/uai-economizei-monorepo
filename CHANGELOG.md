# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.
O formato segue [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## 1.0.0 (2026-08-25)

### Novidades

* adicionar imagem de capa nas categorias, pagina de produtos com filtros e subcategorias ([2b1d255](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/2b1d25562d6b876d8598ef2f15bbcdb31193e38f))
* adicionar skill quality-gate com validação SOLID, tipagem Prisma e reuso ([505aec1](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/505aec1ecea75dac9c582113f907736166b5dfa8))
* **admin:** dashboard, pedidos e clientes como views do Payload ([cc4fb1a](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/cc4fb1ad05bd306a49eed64f86e46d7c5a3d4fd7))
* **admin:** descrição com abas Visual, HTML e pré-visualização ([2fe810f](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/2fe810f15aa36dd083d7eec5ed1145a4c16d9093))
* **admin:** descrição do produto como HTML colável, não richtext ([7cdcb14](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/7cdcb14abcb12c0e2b30525fae033d8adcd6102e))
* **admin:** envio de imagem no cadastro de produto ([3dfeefd](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/3dfeefd97cc0ede87dc4aba4953e6fb791c6a142))
* **admin:** filtros nas listas de pedidos e clientes ([f73ed87](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/f73ed8789a1358f6fc0c559626014fd916131961))
* **admin:** paridade do cadastro de produtos com preview de imagens ([62625af](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/62625afd24a30e7f1dfe815030befe2f739b0e6f))
* **admin:** preview de imagem ao lado e subcategoria selecionável ([fe76d41](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/fe76d4156d5fe1f2de7e1d9c1368129c11b4a13d))
* busca, filtros e ordenacao em todas as paginas do dashboard ([76890a3](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/76890a31b6e5263dd67d1008fa004221c12dc08c))
* **catálogo:** esgotado sai das listagens do site ([a8ac017](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/a8ac0171cfeada010837be1384723a2abee444cf))
* **checkout:** frete calculado pela tabela de CEP ([b4bdfa1](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/b4bdfa101fc4127b5ff873cc4c7c38ad28b82b6b))
* **dados:** favoritos, controle de baixa de estoque e escopo do push ([be6eacc](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/be6eaccd2510c02ae3eafce8a42dba7301d3ba77))
* **favoritos:** lista salva na conta em vez do navegador ([7006b76](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/7006b76f0d1d47658c63bf7a2db3d619d18ec0c4))
* **front:** incorpora Payload CMS 3 com catálogo, blog e admin ([72b9552](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/72b9552d3d88ce590d59ecb7f6a7944e6e031401))
* **front:** produto, preço e CTA únicos no card mobile da promoção ([25d1255](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/25d125562a2e7ff13dbb6c38b2217a848905afee))
* **front:** tabela de formas de pagamento com taxa do cartão ([87cde42](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/87cde423695ff1f5493426cfe33b67f04cb5f434))
* **front:** torna régua e faixa de vantagens editáveis no admin ([34d381f](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/34d381f58542389c6480aec2027675f82ce8a684))
* implementar login Firebase com Google no front ([73b69a8](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/73b69a8fb03509f783a8ff0ec4054eb5dccaf034))
* **lgpd:** aviso de cookies na vitrine ([0dd692f](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/0dd692fe22ee93132993dd77802e4263979fabcd))
* migrar auth para Firebase, corrigir páginas de produtos e adicionar editor HTML ([c63b4a3](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/c63b4a39b06ef195eb6f4303e04b9e74d254f7dc))
* **pedidos:** pagamento pelo site como interruptor, pedido vira orçamento ([5c72260](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/5c7226064606dd41103be966430dc6eef0fae48f))
* **pedidos:** retirada no balcão como dado, escolhida no fechamento ([6d5729d](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/6d5729d288392ad6a0c57644be0c9cdb4e1121da))
* **seo:** título, Open Graph e JSON-LD na página do produto ([ec69b3f](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/ec69b3f397bf799ff639456009ec362ba194707b))

### Correções

* **admin:** barra lateral nas views de pedidos e clientes ([deaf7c4](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/deaf7c491f07646a0c95027a746587924f7071bb))
* **admin:** corrige hidratação do sino de notificações ([50dfee8](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/50dfee8d67c55f481ab1974c8ad7fe7790d369ab))
* **admin:** pedidos e clientes voltam a aparecer, com paginação ([eb34a2a](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/eb34a2af11618586b87a0536d72d4bcc8678d2d4))
* **api:** corrige slug da collection de frete no Payload ([45b616b](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/45b616b82da15d3cb0a61b1d54858c88a8330d71))
* corrigir Select do shadcn e refatorar filtros com useHandleChangeQuery ([d12b891](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/d12b891ad13f91645f32db92d3cfd157dbf2d9f5))
* **deploy:** corrige build do Render (remove corepack, fixa Node 22) ([5e5fb88](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/5e5fb889fd23a4d23b57b0fc302da5fd690e51d5))
* **deploy:** prisma generate no build sem exigir DATABASE_URL_UNPOOLED ([7526aa7](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/7526aa7c7e5188081783c30aea7625db69927504))
* **front:** abre o form de endereço vazio e alinha o select ao input ([f7be9a2](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/f7be9a23e82ba869da76fe96c61b4da1e0862a7b))
* **front:** botao vazio no checkout, frete em centavos e CEP automatico ([f7b41d7](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/f7b41d76f3d7f2dadef4f116b343276c084f15b4))
* **front:** forca inclusao do libvips do sharp na funcao serverless ([1f0c1ea](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/1f0c1ea0ad712bda041922fe07c7a02d7d1f0300))
* **front:** inclui binarios do sharp nas funcoes dinamicas da Vercel ([8befa17](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/8befa171e611f4f74e87b2a12c23a8bd2f41054a))
* **front:** inclui binarios nativos do sharp na funcao serverless da Vercel ([9cef938](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/9cef9387458c7dc1085b1aafb245ac8d8870ffb6))
* **front:** login no checkout devolve o cliente ao carrinho ([a2ac0c8](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/a2ac0c8dda352bb43e1ed6d3931eef3628e7914f))
* **front:** node-linker=hoisted para o sharp funcionar na Vercel ([e877c95](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/e877c956ec47263298f348fd56e0c441b6cc5f29))
* **front:** unifica sharp em 0.35.3 para corrigir type error na Vercel ([1c787b0](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/1c787b021426442ba8f1b70edd20069775d58b7a))
* **mídia:** recortes com nome próprio e imagem local otimizada ([93b22f3](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/93b22f3a2996b4500b72100371435cc90773f371))
* **mídia:** upload sem Vercel Blob para de falhar mudo ([0eabdbc](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/0eabdbc1d5a4ca6631f003b0a92ba3145088865a))
* **notificações:** sino do admin grava a inscrição e para de mentir ([b7a801b](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/b7a801b3bce8a82be69e8e541eae3a1cebee6858))
* **pedidos:** confirmação chega, mostra o pedido e o status ganha cor ([c65552b](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/c65552b4c9f1ca93e9815cd66198d60e8a970c26))
* **pedidos:** estoque baixa na confirmação e o frete é calculado no servidor ([edc162e](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/edc162ebde7b7bab59f2dcd11fe6993e876c09f0))
* **seo:** og:image no recorte social, e um recorte a menos por envio ([9e70404](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/9e70404236a04cc7a096fdf4f21e067ce0f68704))
* **vitrine:** foto do produto na cor real e sem corte ([a0d16df](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/a0d16dfe02daf00ae257fbe392d57520509ae321))
* **vitrine:** moldura da foto branca, acento só onde falta imagem ([2661c59](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/2661c59bb310e5d3fbf5e7674f70a7036b46685d))

### Performance

* **front:** migra catálogo público para Payload Local API com SSR ([cd2006a](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/cd2006aee5aca6187d55b1ff86b18e66bbef17cb))
* **front:** reduz Serverless Functions para caber no plano Hobby ([fbb1640](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/fbb1640807bcdf90d490dfa6f46012d2976c2929))

### Refatoração

* **admin:** reorganiza o formulário de produto ([65ba6d1](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/65ba6d1ffe4eaff6b744ac52ec24cc0e3ea314a8))
* **api:** tipa request autenticado e elimina any do lint ([71976ac](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/71976ac20f2af6a8d9cf90afa3ab1e3e93eac766))
* universalizar formatPrice no pacote ui compartilhado ([c3c1560](https://github.com/mteusgsouza/uai-economizei-monorepo/commit/c3c1560d6595ecbceb2052156727ba6689d1c47b))
