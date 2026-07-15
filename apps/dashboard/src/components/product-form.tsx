import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/http-client"
import { useBrands } from "../hooks/use-brands"
import { useCategories } from "../hooks/use-categories"
import { ImageUpload } from "./image-upload"
import { RichTextEditor } from "./rich-text-editor"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"
import { IconArrowLeft, IconPlus, IconX } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

const productSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string().default(""),
  value: z.string().min(1, "Preco e obrigatorio"),
  paidPrice: z.string().default(""),
  stock: z.string().default("0"),
  productMainImg: z.string().min(1, "Imagem principal e obrigatoria"),
  brandId: z.string().min(1, "Marca e obrigatoria"),
  categoryId: z.string().min(1, "Categoria e obrigatoria"),
  subcategoryId: z.string().optional(),
  active: z.boolean().default(true),
  isNew: z.string().default("false"),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductImageItem {
  name: string
  url: string
}

interface ProductFormData {
  id: number
  name: string
  description: string | null
  value: number
  paidPrice?: number
  stock: number
  productMainImg: string
  productImages: ProductImageItem[]
  brand: { id: number; name: string }
  category: { id: number; title: string; categorySlug: string }
  subcategory?: { id: number; title: string; subcatSlug: string } | null
  subcategoryId?: number | null
  active: boolean
  isNew: string | null
}

interface ProductFormProps {
  product?: ProductFormData | null
  isLoading?: boolean
}

export function ProductForm({ product, isLoading }: ProductFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: brands } = useBrands()
  const { data: categories } = useCategories()

  const [extraImages, setExtraImages] = useState<{ name: string; url: string }[]>(
    product?.productImages ?? []
  )

  function addImage() {
    setExtraImages((prev) => [...prev, { name: "", url: "" }])
  }

  function updateImage(index: number, field: "name" | "url", value: string) {
    setExtraImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)))
  }

  function removeImage(index: number) {
    setExtraImages((prev) => prev.filter((_, i) => i !== index))
  }

  const form = useForm({
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      value: product?.value ? (product.value / 100).toFixed(2) : "",
      paidPrice: product?.paidPrice ? (product.paidPrice / 100).toFixed(2) : "",
      stock: product?.stock?.toString() ?? "0",
      productMainImg: product?.productMainImg ?? "",
      brandId: product?.brand?.id?.toString() ?? "",
      categoryId: product?.category?.id?.toString() ?? "",
      subcategoryId: product?.subcategoryId?.toString() ?? "",
      active: product?.active ?? true,
      isNew: product?.isNew ?? "false",
    } satisfies ProductFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = productSchema.safeParse(value)
        if (!result.success) {
          const errors: Record<string, string> = {}
          result.error.errors.forEach((e) => {
            const key = e.path[0] as string
            if (!errors[key]) errors[key] = e.message
          })
          return errors
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        description: value.description || null,
        value: Math.round(parseFloat(value.value) * 100),
        paidPrice: value.paidPrice ? Math.round(parseFloat(value.paidPrice) * 100) : 0,
        stock: parseInt(value.stock, 10) || 0,
        productMainImg: value.productMainImg,
        productImages: extraImages.filter((img) => img.url.length > 0),
        brandId: parseInt(value.brandId, 10),
        categoryId: parseInt(value.categoryId, 10),
        subcategoryId: value.subcategoryId ? parseInt(value.subcategoryId, 10) : undefined,
        active: value.active,
        isNew: value.isNew || "false",
      }

      try {
        if (product) {
          await api.put(`/products/${product.id}`, payload)
          toast.success("Produto atualizado com sucesso")
        } else {
          await api.post("/products", payload)
          toast.success("Produto criado com sucesso")
        }
        queryClient.invalidateQueries({ queryKey: ["products"] })
        navigate("/dashboard/products")
      } catch (err) {
        toast.error((err as Error).message)
      }
    },
    onSubmitInvalid: ({ value }) => {
      const result = productSchema.safeParse(value)
      if (!result.success) {
        const first = result.error.errors[0]
        toast.error(`Campo "${String(first.path[0])}": ${first.message}`)
      }
    },
  })

  const isEdit = !!product

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-steel">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard/products")} className="mb-6 -ml-2">
        <IconArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Produtos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{isEdit ? "Editar Produto" : "Novo Produto"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-1">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-1">
                    <Label htmlFor="description">Descricao</Label>
                    <RichTextEditor
                      value={field.state.value}
                      onChange={(html) => field.handleChange(html)}
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-3 gap-4">
                <form.Field name="value">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="value">Preco de venda (R$)</Label>
                      <Input
                        id="value"
                        placeholder="0,00"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>
                <form.Field name="paidPrice">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="paidPrice">Preco pago (R$)</Label>
                      <Input
                        id="paidPrice"
                        placeholder="0,00"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="stock">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="stock">Estoque</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="brandId">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="brandId">Marca</Label>
                      <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                        <SelectTrigger id="brandId">
                          <SelectValue placeholder="Selecionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {(brands ?? []).map((b) => (
                            <SelectItem key={b.id} value={b.id.toString()}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>
                <form.Field name="categoryId">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="categoryId">Categoria</Label>
                      <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                        <SelectTrigger id="categoryId">
                          <SelectValue placeholder="Selecionar categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {(categories ?? []).map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="subcategoryId">
                {(field) => {
                  const selectedCategoryId = form.getFieldValue("categoryId");
                  const selectedCategory = categories?.find(
                    (c) => c.id.toString() === selectedCategoryId
                  );
                  const subcategories = selectedCategory?.subcategories ?? [];

                  return (
                    <div className="space-y-1">
                      <Label htmlFor="subcategoryId">Subcategoria</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                        disabled={subcategories.length === 0}
                      >
                        <SelectTrigger id="subcategoryId">
                          <SelectValue
                            placeholder={
                              subcategories.length === 0
                                ? "Sem subcategorias"
                                : "Selecionar subcategoria"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhuma</SelectItem>
                          {subcategories.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="isNew">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="isNew">Destaque</Label>
                      <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                        <SelectTrigger id="isNew">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">Normal</SelectItem>
                          <SelectItem value="lancamento">Lancamento</SelectItem>
                          <SelectItem value="novidade">Novidade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
                <form.Field name="active">
                  {(field) => (
                    <div className="space-y-1">
                      <Label>Ativo</Label>
                      <div className="flex items-center gap-2 pt-2">
                        <Switch
                          checked={field.state.value}
                          onCheckedChange={(v) => field.handleChange(v)}
                        />
                        <span className="text-sm text-steel">
                          {field.state.value ? "Visivel na loja" : "Oculto"}
                        </span>
                      </div>
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="border-border flex justify-end gap-4 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard/products")}>
                  Cancelar
                </Button>
                <Button type="submit">{isEdit ? "Salvar" : "Criar Produto"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle>Midia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form.Field name="productMainImg">
              {(field) => (
                <ImageUpload
                  label="Imagem Principal"
                  value={field.state.value}
                  onChange={(url) => field.handleChange(url)}
                  isCover
                />
              )}
            </form.Field>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Imagens Adicionais</Label>
                <Button type="button" variant="outline" size="sm" onClick={addImage}>
                  <IconPlus className="mr-1 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              {extraImages.length === 0 && (
                <p className="text-steel text-sm">Nenhuma imagem adicional.</p>
              )}
              {extraImages.map((img, index) => (
                <div key={index} className="space-y-2 rounded border p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Imagem {index + 1}</Label>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeImage(index)}>
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Nome da imagem"
                    value={img.name}
                    onChange={(e) => updateImage(index, "name", e.target.value)}
                  />
                  <Input
                    placeholder="URL da imagem"
                    value={img.url}
                    onChange={(e) => updateImage(index, "url", e.target.value)}
                  />
                  {img.url && (
                    <div className="h-20 rounded border bg-surface overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.name || `Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
