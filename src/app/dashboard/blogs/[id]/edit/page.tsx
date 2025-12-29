
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetBlogByIdQuery, useUpdateBlogMutation } from "@/redux/features/blog/blogApiSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Category is required"),
  thumbnail: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.string().optional(),
  content: z.string().min(20, "Content must be at least 20 characters"),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();

  
  const { data: blog, isLoading: isFetching } = useGetBlogByIdQuery(id as string, {
    skip: !id
  });

  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      thumbnail: "",
      tags: "",
      content: "",
      isPublished: false,
    },
  });

  
  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title,
        category: blog.category || "General",
        thumbnail: blog.thumbnail || "",
        tags: blog.tags ? blog.tags.join(", ") : "",
        content: blog.content,
        isPublished: blog.isPublished,
      });
    }
  }, [blog, form]);

  async function onSubmit(values: FormValues) {
    try {
      const tagsArray = values.tags
        ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      await updateBlog({
        id,
        ...values,
        tags: tagsArray,
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Blog Updated!",
        text: "Your changes have been saved.",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/dashboard/blogs");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.data?.message || "Failed to update blog.",
      });
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
          <p className="text-muted-foreground">Update your article content.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Market News">Market News</SelectItem>
                      <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Investment, Tips" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value} 
                    onChange={(value) => field.onChange(value)}
                    placeholder="Write your amazing content here..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Published Status</FormLabel>
                  <FormDescription>
                    Should this post be visible to the public?
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
