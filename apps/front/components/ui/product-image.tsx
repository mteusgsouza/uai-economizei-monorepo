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

/**
 * Product image with built-in fallback placeholder.
 *
 * States:
 * - loaded: displays the image with object-cover
 * - empty/missing src: shows "Sem imagem" placeholder centered on a surface background
 */
export function ProductImage({
  src,
  alt,
  aspectRatio = "3/4",
  className,
  imageClassName,
  priority = false,
  sizes,
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
        <img
          src={src}
          alt={alt}
          className={cn("h-full w-full object-cover", imageClassName)}
          loading={priority ? undefined : "lazy"}
          sizes={sizes}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-stone text-sm">
          Sem imagem
        </div>
      )}
    </div>
  );
}
