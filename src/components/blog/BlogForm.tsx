"use client";

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BlogResponse } from '@/lib/api/blog-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  tags: z.string().optional(), 
  isPublished: z.boolean(),
});

interface BlogFormProps {
  initialData?: BlogResponse;
  
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function BlogForm({ initialData, onSubmit, isLoading }: BlogFormProps) {
  const [imageInput, setImageInput] = useState('');
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const form = useForm<z.infer<typeof blogSchema>>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      tags: initialData?.tags?.join(', ') || '',
      isPublished: initialData?.isPublished ?? true,
    },
  });

  const handleAddImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (imageInput && !images.includes(imageInput)) {
      setImages([...images, imageInput]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setImages(images.filter((img) => img !== imageToRemove));
  };

  const handleSubmit = async (values: z.infer<typeof blogSchema>) => {
    const formattedData = {
      ...values,
      tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      images,
    };
    await onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter blog title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Images (URLs)</FormLabel>
          <div className="flex gap-2">
            <Input
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Button type="button" onClick={handleAddImage} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-video rounded-md overflow-hidden border">
                <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your blog content here..."
                  className="min-h-[300px] font-mono text-sm leading-relaxed"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Basic text content. HTML is not parsed for security, but newlines are preserved.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="Real Estate, Tips, Investment (comma separated)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Published
                </FormLabel>
                <FormDescription>
                  This blog will be visible to the public immediately.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Blog' : 'Create Blog'}
        </Button>
      </form>
    </Form>
  );
}
