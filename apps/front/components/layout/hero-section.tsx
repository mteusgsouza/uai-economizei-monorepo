import { HeroCarousel } from "@/components/layout/hero-carousel";
import type { Product } from "@/types/product";

export function HeroSection({ products }: { products?: Product[] }) {
  return <HeroCarousel products={products} />;
}
