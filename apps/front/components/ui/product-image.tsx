"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  /** `auto` larga a moldura fixa: a figura ocupa a largura e dá a própria altura. */
  aspectRatio?: keyof typeof ASPECT_CLASS | "auto";
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

/**
 * Palpite de proporção para o modo `auto`: o `next/image` exige `width`/`height`
 * e o catálogo não guarda as dimensões. Como a UA só usa esse par enquanto o
 * arquivo não chega (`aspect-ratio: auto W / H` cede para a proporção real
 * assim que ela é conhecida), o quadrado serve de reserva de espaço e some
 * quando a figura carrega.
 */
const INTRINSIC_HINT = 1200;

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
  const intrinsic = aspectRatio === "auto";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface",
        intrinsic ? "w-full" : ASPECT_CLASS[aspectRatio],
        className,
      )}
    >
      {showImage ? (
        intrinsic ? (
          <Image
            src={src as string}
            alt={alt}
            width={INTRINSIC_HINT}
            height={INTRINSIC_HINT}
            className={cn("block h-auto w-full", imageClassName)}
            priority={priority}
            sizes={sizes}
            unoptimized={!canOptimize(src as string)}
            onError={() => setFailed(true)}
          />
        ) : (
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
        )
      ) : (
        <div
          className={cn(
            "grid h-full w-full place-items-center bg-accent-100",
            // Sem moldura fixa e sem figura não sobra altura nenhuma: o
            // marcador precisa reservar a sua.
            intrinsic && "aspect-square",
          )}
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
