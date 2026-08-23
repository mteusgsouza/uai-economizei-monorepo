/**
 * Dados estruturados no corpo da página. O Google lê JSON-LD em qualquer lugar
 * do documento, então não precisa ir para o `<head>` — o que permite montá-lo
 * no server component que já tem o dado em mãos.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // `<` escapado porque o conteúdo vem do admin: um `</script>` dentro do
      // nome ou da descrição fecharia a tag aqui e o resto viraria HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
