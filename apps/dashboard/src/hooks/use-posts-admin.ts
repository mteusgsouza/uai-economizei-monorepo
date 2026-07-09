import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

interface PostProduct {
  id: number;
  name: string;
}

interface PostUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  published: boolean;
  authorId: string;
  author: PostUser;
  products: PostProduct[];
  createdAt: string;
  updatedAt: string;
}

export function usePostsAdmin() {
  return useQuery({
    queryKey: ["posts"] as const,
    queryFn: () => api.get<Post[]>("/posts"),
    staleTime: 5 * 60 * 1000,
  });
}
