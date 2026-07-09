import { Timestamp } from "firebase/firestore"

// colections = {
// banners
// basket
// brands
// categories
// cep
// orders
// products
// users
// }

export type banners = {
  bannerImg: string
  url: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
export type basket = {
  createdAt: Timestamp
  updatedAt: Timestamp
  products: []
}
export type brands = {
    createdAt: Timestamp
    updatedAt: Timestamp
    name: string
}
export type categories = {
  categorySlug: string
  title: string
  subcategory: { title: string; subcatSlug: string }[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type cep = {
  cepFinal: number
  cepInicial: number
  createdAt: Timestamp
  updatedAt: Timestamp
  descricao: string
  valor: number
}
export type orders = { createdAt: Timestamp; updatedAt: Timestamp; order: order; status: number }
type order = {
  address: address
  cart: basket
  user: users
  cepValue: number
  retiraBalcao: boolean
  totalProducts: number
}

export type products = {
  active: boolean
  brand: string
  category: {
    category: string
    id: string
    subcategory: string
  }
  createdAt: Timestamp
  description: string
  isNew: string
  name: string
  paidPrice: number
  productImages: { name: string; url: string }[]
  productMainImg: { name: string; url: string }
  stock: number
  updatedAt: Timestamp
  value: number
}

export type users = {
  address: address[]
  emailAddress: string
  firstName: string
  phone: string
  username: string
  theme: { dark: boolean; primaryColor: string; secondaryColor: string }
  verifiedUser: boolean
}

type address = {
  bairro: string
  cep: string
  complemento: string
  localidade: string
  logradouro: string
  numero: string
  uf: string
}
