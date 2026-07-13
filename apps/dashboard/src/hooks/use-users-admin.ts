import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

interface CustomerAddress {
  id: number;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CustomerOrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  product: { id: number; name: string; productMainImg: string };
}

interface CustomerOrderPayment {
  id: number;
  method: string;
  status: string;
  amount: number;
}

interface CustomerOrder {
  id: number;
  status: string;
  subtotal: number;
  totalProducts: number;
  createdAt: string;
  items: CustomerOrderItem[];
  payments: CustomerOrderPayment[];
}

export interface CustomerListItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  verifiedUser: boolean;
  createdAt: string;
  _count: { orders: number; addresses: number };
}

export interface CustomerDetail extends CustomerListItem {
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
}

export function useUsersAdmin() {
  return useQuery({
    queryKey: ["customers", "admin"] as const,
    queryFn: () => api.get<CustomerListItem[]>("/customers"),
    staleTime: 60 * 1000,
  });
}

export function useUserDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["customers", "admin", id] as const,
    queryFn: () => api.get<CustomerDetail>(`/customers/${id}`),
    enabled: !!id,
  });
}
