import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/http-client"
import { usePublishers } from "../hooks/use-publishers"
import { ImageUpload } from "./image-upload"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { IconArrowLeft, IconPlus, IconX } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

const GENRE_OPTIONS = [
  { value: "Fiction", label: "Ficcao" },
  { value: "NonFiction", label: "Nao-Ficcao" },
  { value: "ScienceFiction", label: "Ficcao Cientifica" },
  { value: "Fantasy", label: "Fantasia" },
  { value: "Mystery", label: "Misterio" },
  { value: "Biography", label: "Biografia" },
  { value: "History", label: "Historia" },
  { value: "Romance", label: "Romance" },
  { value: "Thriller", label: "Suspense" },
  { value: "SelfHelp", label: "Autoajuda" },
]

const TYPE_OPTIONS = [
  { value: "Book", label: "Livro" },
  { value: "Magazine", label: "Revista" },
  { value: "Comic", label: "Quadrinho" },
  { value: "Audiobook", label: "Audiolivro" },
  { value: "eBook", label: "eBook" },
  { value: "Game", label: "Game" },
]

const productSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  image: z.string().min(1),
  categories: z.string().default(""),
  authors: z.string().default(""),
  tags: z.string().default(""),
  genre: z.string().default(""),
  type_of_work: z.string().default(""),
  publisherId: z.string().min(1),
  publication_date: z.string().default(""),
  description: z.string().default(""),
  url: z.string().min(1),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormData {
  id: number
  name: string
  price: number
  image: string
  categories: string[]
  authors: string[]
  tags: string[]
  genre: string | null
  type_of_work: string | null
  publisherId: number
  publication_date: string
  description: string | null
  url: string
  preview_images?: string[]
  preview_videos?: { id?: number; url: string }[]
}

interface ProductFormProps {
  product?: ProductFormData | null
  isLoading?: boolean
}

export function ProductForm({ product, isLoading }: ProductFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: publishers } = usePublishers()

  const [previewImages, setPreviewImages] = useState<string[]>(product?.preview_images ?? [])
  const [previewVideos, setPreviewVideos] = useState<string[]>(product?.preview_videos?.map((v) => v.url) ?? [])

  function addPreviewImage() {
    setPreviewImages((prev) => [...prev, ""])
  }

  function updatePreviewImage(index: number, url: string) {
    setPreviewImages((prev) => prev.map((u, i) => (i === index ? url : u)))
  }

  function removePreviewImage(index: number) {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  function addPreviewVideo() {
    setPreviewVideos((prev) => [...prev, ""])
  }

  function updatePreviewVideo(index: number, url: string) {
    setPreviewVideos((prev) => prev.map((u, i) => (i === index ? url : u)))
  }

  function removePreviewVideo(index: number) {
    setPreviewVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const form = useForm({
    defaultValues: {
      name: product?.name ?? "",
      price: product?.price ? (product.price / 100).toFixed(2) : "",
      image: product?.image ?? "",
      categories: product?.categories?.join(", ") ?? "",
      authors: product?.authors?.join(", ") ?? "",
      tags: product?.tags?.join(", ") ?? "",
      genre: product?.genre ?? "",
      type_of_work: product?.type_of_work ?? "",
      publisherId: product?.publisherId?.toString() ?? "",
      publication_date: product?.publication_date?.split("T")[0] ?? "",
      description: product?.description ?? "",
      url: product?.url ?? "",
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
        price: Math.round(parseFloat(value.price) * 100),
        image: value.image,
        categories: value.categories
          ? value.categories
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        authors: value.authors
          ? value.authors
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        tags: value.tags
          ? value.tags
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        genre: value.genre || null,
        type_of_work: value.type_of_work || null,
        publisherId: parseInt(value.publisherId, 10),
        publication_date: value.publication_date || undefined,
        description: value.description || null,
        url: value.url,
        preview_images: previewImages.filter((u) => u.length > 0),
        preview_videos: previewVideos.filter((u) => u.length > 0).map((url) => ({ url })),
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

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="price">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="price">Preço</Label>
                      <Input
                        id="price"
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
                <form.Field name="publisherId">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="publisherId">Editora</Label>
                      <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                        <SelectTrigger id="publisherId">
                          <SelectValue placeholder="Selecionar editora" />
                        </SelectTrigger>
                        <SelectContent>
                          {(publishers ?? []).map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name}
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

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="genre">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="genre">Gênero</Label>
                      <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                        <SelectTrigger id="genre">
                          <SelectValue placeholder="Selecionar gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRE_OPTIONS.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
                <form.Field name="type_of_work">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="type_of_work">Tipo</Label>
                      <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                        <SelectTrigger id="type_of_work">
                          <SelectValue placeholder="Selecionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_OPTIONS.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="categories">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="categories">Categorias (separadas por virgula)</Label>
                      <Input
                        id="categories"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="authors">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="authors">Autores (separados por virgula)</Label>
                      <Input
                        id="authors"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="tags">
                {(field) => (
                  <div className="space-y-1">
                    <Label htmlFor="tags">Tags (separadas por virgula)</Label>
                    <Input
                      id="tags"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="url">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="url">URL / Slug</Label>
                      <Input
                        id="url"
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
                <form.Field name="publication_date">
                  {(field) => (
                    <div className="space-y-1">
                      <Label htmlFor="publication_date">Data de Publicacao</Label>
                      <Input
                        id="publication_date"
                        type="date"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-1">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      rows={6}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              </form.Field>

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
            <form.Field name="image">
              {(field) => (
                <ImageUpload
                  label="Imagem Principal (Capa)"
                  value={field.state.value}
                  onChange={(url) => field.handleChange(url)}
                  isCover
                />
              )}
            </form.Field>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Imagens de Preview</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPreviewImage}>
                  <IconPlus className="mr-1 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              {previewImages.length === 0 && (
                <p className="text-steel text-sm">Nenhuma imagem de preview adicionada.</p>
              )}
              {previewImages.map((url, index) => (
                <ImageUpload
                  key={index}
                  label={`Preview ${index + 1}`}
                  value={url}
                  onChange={(newUrl) => updatePreviewImage(index, newUrl)}
                  onRemove={() => removePreviewImage(index)}
                />
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Videos de Preview</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPreviewVideo}>
                  <IconPlus className="mr-1 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              {previewVideos.length === 0 && (
                <p className="text-steel text-sm">Nenhum video de preview adicionado.</p>
              )}
              {previewVideos.map((url, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Label>Video {index + 1} URL</Label>
                    <Input
                      value={url}
                      onChange={(e) => updatePreviewVideo(index, e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-6"
                    onClick={() => removePreviewVideo(index)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
