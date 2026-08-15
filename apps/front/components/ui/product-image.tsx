"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  aspectRatio?: keyof typeof ASPECT_CLASS;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Classes literais: o Tailwind varre o código-fonte, então `aspect-[${x}]`
 * interpolado nunca chega a gerar CSS.
 */
const ASPECT_CLASS = {
  "3/4": "aspect-[3/4]",
  "2/3": "aspect-[2/3]",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-video",
} as const;

/** Hosts liberados em next.config.mjs (images.remotePatterns) para otimização. */
const OPTIMIZED_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "media.flixcar.com",
  "melonbooks.akamaized.net",
]);

function canOptimize(src: string): boolean {
  try {
    const { hostname } = new URL(src);
    return (
      OPTIMIZED_HOSTS.has(hostname) || hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

/**
 * Imagem de produto. Sem URL — ou quando a URL falha, o que é comum num
 * catálogo com links antigos — cai num marcador mudo: fundo na cor do tema e
 * um ícone esmaecido. Nada de texto: o nome do produto já aparece embaixo, e
 * repetir o `alt` no lugar da figura só suja a grade.
 */
export function ProductImage({
  src,
  alt,
  aspectRatio = "1/1",
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface",
        ASPECT_CLASS[aspectRatio],
        className,
      )}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          className={cn("object-cover", imageClassName)}
          priority={priority}
          sizes={sizes}
          unoptimized={!canOptimize(src as string)}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="grid h-full w-full place-items-center bg-accent-100"
          role="img"
          aria-label={alt}
        >
          <ImageIcon
            className="size-[28%] max-h-16 min-h-6 min-w-6 max-w-16 text-accent-700/25"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
