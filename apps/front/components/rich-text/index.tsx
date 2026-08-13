import type { DefaultNodeTypes, SerializedBlockNode } from "@payloadcms/richtext-lexical";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import { cn } from "@workspace/ui/lib/utils";

import { ProductEmbed, type ProductEmbedFields } from "./product-embed";
import "./rich-text.css";

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<ProductEmbedFields>;

const converters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    "product-embed": ({ node }) => (
      <ProductEmbed productId={node.fields.productId} layout={node.fields.layout} />
    ),
  },
});

interface RichTextProps {
  data: SerializedEditorState;
  className?: string;
}

/**
 * Renderiza o richText do Payload. Sem isto o campo é um JSON do Lexical —
 * serializá-lo direto na página imprime o objeto cru na tela.
 */
export function RichText({ data, className }: RichTextProps) {
  return (
    <LexicalRichText
      className={cn("rich-text", className)}
      converters={converters}
      data={data}
    />
  );
}
