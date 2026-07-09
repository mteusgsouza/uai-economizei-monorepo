import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/http-client";
import { PostForm } from "../../../components/post-form";
import type { Post } from "../../../hooks/use-posts-admin";

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const { data: post, isLoading } = useQuery({
    queryKey: ["posts", postId] as const,
    queryFn: () => api.get<Post>(`/posts/${postId}`),
    enabled: !isNaN(postId),
  });

  return <PostForm post={post ?? null} isLoading={isLoading} />;
}
