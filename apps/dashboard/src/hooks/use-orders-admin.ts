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

export function useOrdersAdmin() {
  return useQuery({
    queryKey: ["orders", "admin"] as const,
    queryFn: () => api.get<OrderListItem[]>("/orders/all"),
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
