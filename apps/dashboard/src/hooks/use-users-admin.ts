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

export interface UserFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useUsersAdmin(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ["customers", "admin", filters] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      const qs = params.toString();
      return api.get<CustomerListItem[]>(`/customers${qs ? `?${qs}` : ""}`);
    },
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
