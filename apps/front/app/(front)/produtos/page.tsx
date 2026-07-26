"use client"

import { Suspense, useState } from "react"
import type { Brand, CategoryWithSubcategories, Subcategory } from "@/types/product"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { ProductCard } from "@/components/product/product-card"
import { useFilteredProducts, useCategories, useBrands } from "@/hooks/use-products"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@workspace/ui/components/sheet"
import { Package, SlidersHorizontal, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import usePageParams from "@/hooks/usePageParams"
import useHandleChangeQuery from "@/hooks/useHandleChangeQuery"

interface FiltersContentProps {
  categories?: CategoryWithSubcategories[]
  brands?: Brand[]
  activeCategory?: CategoryWithSubcategories
  activeSubcategories: Subcategory[]
  categoria?: string
  subcategoryId?: number
  marca?: string
  precoMin?: number
  precoMax?: number
  hasActiveFilters: boolean
  precoMinInput: string
  precoMaxInput: string
  onPrecoMinInputChange: (value: string) => void
  onPrecoMaxInputChange: (value: string) => void
  onPrecoMinBlur: () => void
  onPrecoMaxBlur: () => void
  onChangeQuery: (params: { label: string; value: string }) => void
  onClearAllFilters: () => void
  onClearPriceFilter: () => void
}

function FiltersContent({
  categories,
  brands,
  activeCategory,
  activeSubcategories,
  categoria,
  subcategoryId,
  marca,
  precoMin,
  precoMax,
  hasActiveFilters,
  precoMinInput,
  precoMaxInput,
  onPrecoMinInputChange,
  onPrecoMaxInputChange,
  onPrecoMinBlur,
  onPrecoMaxBlur,
  onChangeQuery,
  onClearAllFilters,
  onClearPriceFilter,
}: FiltersContentProps) {
  return (
    <div className="space-y-6">
      {/* Active filter chips */}
      {hasActiveFilters && (
        <div>
          <div className="flex flex-wrap gap-2">
            {activeCategory && (
              <Badge variant="secondary" className="gap-1">
                {activeCategory.title}
                <button
                  onClick={() => onChangeQuery({ label: "categoria", value: "*" })}
                  className="ml-0.5 rounded-full hover:bg-steel/20"
                  aria-label="Remover filtro de categoria"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {subcategoryId && (
              <Badge variant="secondary" className="gap-1">
                {activeSubcategories.find((s) => s.id === subcategoryId)?.title ?? "Subcategoria"}
                <button
                  onClick={() => onChangeQuery({ label: "subcategoria", value: "*" })}
                  className="ml-0.5 rounded-full hover:bg-steel/20"
                  aria-label="Remover filtro de subcategoria"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {marca && (
              <Badge variant="secondary" className="gap-1">
                {marca}
                <button
                  onClick={() => onChangeQuery({ label: "marca", value: "*" })}
                  className="ml-0.5 rounded-full hover:bg-steel/20"
                  aria-label="Remover filtro de marca"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(precoMin || precoMax) && (
              <Badge variant="secondary" className="gap-1">
                {precoMin ? `R$ ${Math.round(precoMin / 100)}` : "R$ 0"} -{" "}
                {precoMax ? `R$ ${Math.round(precoMax / 100)}` : "..."}
                <button
                  onClick={onClearPriceFilter}
                  className="ml-0.5 rounded-full hover:bg-steel/20"
                  aria-label="Remover filtro de preco"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          <Separator className="mt-4" />
        </div>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Categorias</h3>
          <ScrollArea className="h-52 overflow-hidden">
            <div className="space-y-2 pr-3">
              {categories.map((cat) => (
                <label key={cat.id} className="group flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={categoria === cat.categorySlug}
                    onCheckedChange={(checked) =>
                      onChangeQuery({ label: "categoria", value: checked ? cat.categorySlug : "*" })
                    }
                    id={`cat-${cat.id}`}
                  />
                  <span className="line-clamp-1 text-sm text-steel transition-colors group-hover:text-ink">
                    {cat.title}
                  </span>
                </label>
              ))}
            </div>
          </ScrollArea>
          <Separator className="mt-4" />
        </div>
      )}

      {/* Subcategories */}
      {activeSubcategories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Subcategorias</h3>
          <ScrollArea className="h-52 overflow-hidden">
            <div className="space-y-2 pr-3">
              {activeSubcategories.map((sub) => (
                <label key={sub.id} className="group flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={subcategoryId === sub.id}
                    onCheckedChange={(checked) =>
                      onChangeQuery({ label: "subcategoria", value: checked ? String(sub.id) : "*" })
                    }
                    id={`subcat-${sub.id}`}
                  />
                  <span className="line-clamp-1 text-sm text-steel transition-colors group-hover:text-ink">
                    {sub.title}
                  </span>
                </label>
              ))}
            </div>
          </ScrollArea>
          <Separator className="mt-4" />
        </div>
      )}

      {/* Brands */}
      {brands && brands.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Marcas</h3>
          <ScrollArea className="h-52 overflow-hidden">
            <div className="space-y-2 pr-3">
              {brands.map((brand) => (
                <label key={brand.id} className="group flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={marca === brand.name}
                    onCheckedChange={(checked) =>
                      onChangeQuery({ label: "marca", value: checked ? brand.name : "*" })
                    }
                    id={`brand-${brand.id}`}
                  />
                  <span className="line-clamp-1 text-sm text-steel transition-colors group-hover:text-ink">
                    {brand.name}
                  </span>
                </label>
              ))}
            </div>
          </ScrollArea>
          <Separator className="mt-4" />
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Preco</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="preco-min" className="text-xs text-steel">
              Min
            </Label>
            <Input
              id="preco-min"
              type="text"
              inputMode="numeric"
              placeholder="R$ 0"
              value={precoMinInput}
              onChange={(e) => onPrecoMinInputChange(e.target.value)}
              onBlur={onPrecoMinBlur}
              className="mt-1"
            />
          </div>
          <span className="mt-5 text-steel">-</span>
          <div className="flex-1">
            <Label htmlFor="preco-max" className="text-xs text-steel">
              Max
            </Label>
            <Input
              id="preco-max"
              type="text"
              inputMode="numeric"
              placeholder="R$ 999"
              value={precoMaxInput}
              onChange={(e) => onPrecoMaxInputChange(e.target.value)}
              onBlur={onPrecoMaxBlur}
              className="mt-1"
            />
          </div>
        </div>
        <Separator className="mt-4" />
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={onClearAllFilters}
          className="text-sm text-steel underline underline-offset-2 transition-colors hover:text-ink"
        >
          Limpar todos os filtros
        </button>
      )}
    </div>
  )
}

function ProdutosContent() {
  const { searchParams, router, pathname } = usePageParams()
  const handleChangeQuery = useHandleChangeQuery()

  // Read filters from URL
  const categoria = searchParams.get("categoria") ?? undefined
  const subcategoryId = searchParams.get("subcategoria") ? Number(searchParams.get("subcategoria")) : undefined
  const marca = searchParams.get("marca") ?? undefined
  const precoMin = searchParams.get("precoMin") ? Number(searchParams.get("precoMin")) : undefined
  const precoMax = searchParams.get("precoMax") ? Number(searchParams.get("precoMax")) : undefined
  const sortBy = searchParams.get("sortBy") ?? undefined
  const sortOrder = searchParams.get("sortOrder") ?? undefined

  // Local state for price inputs (so user can type freely)
  const [precoMinInput, setPrecoMinInput] = useState(searchParams.get("precoMin") ?? "")
  const [precoMaxInput, setPrecoMaxInput] = useState(searchParams.get("precoMax") ?? "")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useFilteredProducts({
    categoria,
    marca,
    subcategoryId,
    precoMin,
    precoMax,
    sortBy,
    sortOrder,
  })
  const { data: categories } = useCategories()
  const { data: brands } = useBrands(categoria)

  const activeCategory = categories?.find((c) => c.categorySlug === categoria)
  const activeSubcategories = activeCategory?.subcategories ?? []

  function clearAllFilters() {
    router.push("/produtos", { scroll: false })
    setPrecoMinInput("")
    setPrecoMaxInput("")
  }

  function clearPriceFilter() {
    handleChangeQuery({ label: "precoMin", value: "*" })
    handleChangeQuery({ label: "precoMax", value: "*" })
    setPrecoMinInput("")
    setPrecoMaxInput("")
  }

  function handlePrecoMinBlur() {
    const val = precoMinInput ? Number(precoMinInput.replace(/\D/g, "")) : undefined
    const params = new URLSearchParams(searchParams.toString())
    if (val !== undefined) {
      params.set("precoMin", String(val))
    } else {
      params.delete("precoMin")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handlePrecoMaxBlur() {
    const val = precoMaxInput ? Number(precoMaxInput.replace(/\D/g, "")) : undefined
    const params = new URLSearchParams(searchParams.toString())
    if (val !== undefined) {
      params.set("precoMax", String(val))
    } else {
      params.delete("precoMax")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function updateSort(val: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (val === "*") {
      params.delete("sortBy")
      params.delete("sortOrder")
    } else {
      const parts = val.split("-")
      const sb = parts[0] ?? ""
      const so = parts[1] ?? "asc"
      params.set("sortBy", sb)
      params.set("sortOrder", so)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const hasActiveFilters = !!(categoria || subcategoryId || marca || precoMin || precoMax)

  // --- Render ---

  return (
    <div className="flex gap-8">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-24">
          <h2 className="mb-4 text-sm font-semibold tracking-wider text-ink uppercase">Filtros</h2>
          <FiltersContent
            categories={categories}
            brands={brands}
            activeCategory={activeCategory}
            activeSubcategories={activeSubcategories}
            categoria={categoria}
            subcategoryId={subcategoryId}
            marca={marca}
            precoMin={precoMin}
            precoMax={precoMax}
            hasActiveFilters={hasActiveFilters}
            precoMinInput={precoMinInput}
            precoMaxInput={precoMaxInput}
            onPrecoMinInputChange={setPrecoMinInput}
            onPrecoMaxInputChange={setPrecoMaxInput}
            onPrecoMinBlur={handlePrecoMinBlur}
            onPrecoMaxBlur={handlePrecoMaxBlur}
            onChangeQuery={handleChangeQuery}
            onClearAllFilters={clearAllFilters}
            onClearPriceFilter={clearPriceFilter}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile filter trigger */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-on-dark">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto pt-12">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent
                    categories={categories}
                    brands={brands}
                    activeCategory={activeCategory}
                    activeSubcategories={activeSubcategories}
                    categoria={categoria}
                    subcategoryId={subcategoryId}
                    marca={marca}
                    precoMin={precoMin}
                    precoMax={precoMax}
                    hasActiveFilters={hasActiveFilters}
                    precoMinInput={precoMinInput}
                    precoMaxInput={precoMaxInput}
                    onPrecoMinInputChange={setPrecoMinInput}
                    onPrecoMaxInputChange={setPrecoMaxInput}
                    onPrecoMinBlur={handlePrecoMinBlur}
                    onPrecoMaxBlur={handlePrecoMaxBlur}
                    onChangeQuery={handleChangeQuery}
                    onClearAllFilters={clearAllFilters}
                    onClearPriceFilter={clearPriceFilter}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {!isLoading && products && (
              <p className="text-sm text-steel">
                {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
              </p>
            )}
          </div>

          {/* Sort */}
          <Select
            value={sortBy ? `${sortBy}-${sortOrder ?? "asc"}` : "*"}
            onValueChange={(val) => updateSort(val)}
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="*">Mais recentes</SelectItem>
              <SelectItem value="value-asc">Menor preco</SelectItem>
              <SelectItem value="value-desc">Maior preco</SelectItem>
              <SelectItem value="name-asc">Nome A-Z</SelectItem>
              <SelectItem value="name-desc">Nome Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-3/4 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-steel">Erro ao carregar produtos: {(error as Error).message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-on-dark transition-colors hover:bg-ink/90"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!products || products.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-4 h-12 w-12 text-stone" />
            <p className="text-steel">
              {hasActiveFilters
                ? "Nenhum produto encontrado com os filtros selecionados."
                : "Nenhum produto disponivel no momento."}
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-ink/90"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Product grid */}
        {!isLoading && !isError && products && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProdutosSkeleton() {
  return (
    <div className="flex gap-8">
      <aside className="hidden w-60 shrink-0 lg:block">
        <Skeleton className="h-96 w-full rounded-lg" />
      </aside>
      <div className="flex-1">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-3/4 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProdutosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-8">
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.005em] text-ink md:text-4xl">
            Produtos
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            Explore nossa colecao completa de produtos.
          </p>
          <div className="mt-12">
            <Suspense fallback={<ProdutosSkeleton />}>
              <ProdutosContent />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
