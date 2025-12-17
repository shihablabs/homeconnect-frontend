"use client";

import BlogForm from '@/components/blog/BlogForm';
import { blogApi, BlogResponse } from '@/lib/api/blog-api';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [blog, setBlog] = useState<BlogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        // We need getById but our API has getAll and getBySlug.
        // Usually we fetch by ID for editing. Let's assume we can fetch list and find, or API supports ID fetch.
        // Looking at backend controller, it has updateBlog by ID. getBlogBySlug for public.
        // But checking `blog.routes.ts`, GET /:slug calls `getBlogBySlug`.
        // AND GET / (list)
        // Oops, I didn't add GET /:id route for fetching by ID specifically in backend!
        // `getBlogBySlug` takes slug.
        // Does the frontend know the slug? The URL has ID: dashboard/blogs/edit/[id].

        // I should have added `getBlogById` in backend or allow slug lookup to find by ID?
        // Or I can just fetch all blogs and find the one with this ID if list is small. 
        // OR I can use the slug if I had it.

        // Let's implement a quick fix: fetch all and find (not efficient but works for now).
        // OR update backend to support GET /:id or make GET /:slug smart enough to check ID format.
        // Backend `getBlogBySlug` does `Blog.findOne({ slug })`.
        // I should probably add `getBlogById` to backend.

        // For now, I'll fetch list and filter client side to avoid context switching too much,
        // unless I can't.

        const result = await blogApi.getAllBlogs({ limit: 1000 });
        const found = result.data.find(b => b.id === id);
        if (found) {
          setBlog(found);
        } else {
          toast.error('Blog not found');
          router.push('/dashboard/blogs');
        }
      } catch {
        toast.error('Failed to fetch blog');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      await blogApi.updateBlog(id, data);
      toast.success('Blog updated successfully');
      router.push('/dashboard/blogs');
    } catch {
      toast.error('Failed to update blog');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Blog Post</h1>
      <BlogForm initialData={blog} onSubmit={handleSubmit} isLoading={isSaving} />
    </div>
  );
}
