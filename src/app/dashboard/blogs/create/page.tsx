"use client";

import BlogForm from '@/components/blog/BlogForm';
import { blogApi } from '@/lib/api/blog-api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreateBlogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await blogApi.createBlog(data);
      toast.success('Blog created successfully');
      router.push('/dashboard/blogs');
    } catch {
      toast.error('Failed to create blog');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Blog Post</h1>
      <BlogForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
