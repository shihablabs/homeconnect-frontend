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
