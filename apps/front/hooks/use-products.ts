"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/http-client";
import type { Product, Brand, CategoryWithSubcategories, Subcategory } from "@/types/product";

// ── Tipos para o endpoint /products/home ──────────────────

export interface HomeCategory {
  id: number;
  title: string;
  categorySlug: string;
  subcategories: Subcategory[];
  productImage: string | null;
}

export interface HomeBrand {
  id: number;
  name: string;
  productCount: number;
  products: Product[];
}

export interface HomeData {
  hero: Product[];
  newArrivals: Product[];
  categoryProducts: {
    eletronicos: Product[];
    casa: Product[];
  };
  categories: HomeCategory[];
  topBrands: HomeBrand[];
}

// ── Genérico (com limite) ──────────────────────────────

export function useProducts(limit = 50, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["products", { limit }] as const,
    queryFn: () => {
      const params = new URLSearchParams({ limit: String(limit), sort: "-createdAt" });
      return api.get<Product[]>(`/products?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

// ── Homepage / Destaques ───────────────────────────────

export function useHomeProducts(limit = 4, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["products", "home", { limit }] as const,
    queryFn: () => {
      const params = new URLSearchParams({ limit: String(limit), sort: "-createdAt" });
      return api.get<Product[]>(`/products?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

// ── Novidades ───────────────────────────────────────────

export function useNewProducts(limit = 50, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["products", "new", { limit }] as const,
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(limit),
        sort: "-createdAt",
        isNew: "true",
      });
      return api.get<Product[]>(`/products?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

// ── Home page (endpoint único) ─────────────────────────

export function useHomeData() {
  return useQuery({
    queryKey: ["home"] as const,
    queryFn: () => api.get<HomeData>("/products/home"),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Produtos por categoria ──────────────────────────────

export function useCategoryProducts(categorySlug: string, limit = 4) {
  return useQuery({
    queryKey: ["products", "category", categorySlug, { limit }] as const,
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(limit),
        sort: "-createdAt",
        categorySlug,
      });
      return api.get<Product[]>(`/products?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Detalhe do produto ──────────────────────────────────

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id] as const,
    queryFn: () => api.get<Product>(`/products/${id}`),
    enabled: id > 0,
  });
}

// ── Categorias ──────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ["categories"] as const,
    queryFn: () => api.get<CategoryWithSubcategories[]>("/categories"),
    staleTime: 10 * 60 * 1000,
  });
}

// ── Marcas ──────────────────────────────────────────────

export function useBrands(categorySlug?: string) {
  return useQuery({
    queryKey: ["brands", { categorySlug }] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (categorySlug) params.set("categorySlug", categorySlug);
      const qs = params.toString();
      return api.get<Brand[]>(`/brands${qs ? `?${qs}` : ""}`);
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ── Filtros da página /produtos ─────────────────────────

export interface ProductFilters {
  categoria?: string;
  marca?: string;
  subcategoryId?: number;
  precoMin?: number;
  precoMax?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useFilteredProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      // Força limite em 200 pra não travar se todos os filtros estiverem vazios
      params.set("limit", "200");
      if (filters.categoria) params.set("categorySlug", filters.categoria);
      if (filters.marca) params.set("brandName", filters.marca);
      if (filters.subcategoryId !== undefined) params.set("subcategoryId", String(filters.subcategoryId));
      if (filters.precoMin !== undefined) params.set("precoMin", String(filters.precoMin));
      if (filters.precoMax !== undefined) params.set("precoMax", String(filters.precoMax));
      if (filters.search) params.set("search", filters.search);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      const qs = params.toString();
      return api.get<Product[]>(`/products${qs ? `?${qs}` : ""}`);
    },
    staleTime: 5 * 60 * 1000,
  });
}
