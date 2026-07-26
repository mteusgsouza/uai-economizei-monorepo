import Image from "next/image";
import { cn } from "@workspace/ui/lib/utils";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  aspectRatio?: "3/4" | "2/3" | "1/1" | "4/3";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}

/** Hosts liberados em next.config.mjs (images.remotePatterns) para otimização. */
const OPTIMIZED_HOSTS = new Set(["melonbooks.akamaized.net"]);

function canOptimize(src: string): boolean {
  try {
    return OPTIMIZED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

/**
 * Imagem de produto com placeholder de fallback.
 * Usa next/image; hosts fora de remotePatterns são servidos sem otimização
 * (unoptimized) para não quebrar o loader.
 */
export function ProductImage({
  src,
  alt,
  aspectRatio = "3/4",
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
}: ProductImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface",
        `aspect-[${aspectRatio}]`,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={cn("object-cover", imageClassName)}
          priority={priority}
          sizes={sizes}
          unoptimized={!canOptimize(src)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-stone text-sm">
          Sem imagem
        </div>
      )}
    </div>
  );
}
