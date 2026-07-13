import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

interface OrderProduct {
  id: number;
  name: string;
  productMainImg: string;
  value: number;
}

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  product: OrderProduct;
}

interface OrderPayment {
  id: number;
  method: string;
  status: string;
  amount: number;
}

interface OrderAddress {
  id: number;
  street: string;
  number: string | null;
  city: string;
  state: string;
  postalCode: string;
}

interface OrderCustomer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface OrderListItem {
  id: number;
  status: string;
  subtotal: number;
  totalProducts: number;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  payments: OrderPayment[];
}

export interface OrderDetail extends OrderListItem {
  address: OrderAddress | null;
  cepValue: number;
  retiraBalcao: boolean;
  updatedAt: string;
  customer: OrderCustomer & { phone: string | null };
}

export interface OrderFilters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useOrdersAdmin(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ["orders", "admin", filters] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      const qs = params.toString();
      return api.get<OrderListItem[]>(`/orders/all${qs ? `?${qs}` : ""}`);
    },
    staleTime: 60 * 1000,
  });
}

export function useOrderDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["orders", "admin", id] as const,
    queryFn: () => api.get<OrderDetail>(`/orders/admin/${id}`),
    enabled: !!id,
  });
}
