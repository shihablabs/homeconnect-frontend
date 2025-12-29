
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeleteBlogMutation, useGetAdminBlogsQuery, useUpdateBlogMutation } from "@/redux/features/blog/blogApiSlice";
import { format } from "date-fns";
import { Edit, Eye, Loader2, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";

export default function BlogsDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useGetAdminBlogsQuery({ searchTerm, sort: "-createdAt" });
  const [deleteBlog] = useDeleteBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBlog(id).unwrap();
          Swal.fire("Deleted!", "Your blog has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete blog.", "error");
        }
      }
    });
  };

  const handeTogglePublish = async (blog: any) => {
    try {
      await updateBlog({ id: blog.id || blog._id, isPublished: !blog.isPublished }).unwrap();
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: `Blog ${!blog.isPublished ? 'Published' : 'Unpublished'}`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const blogs = data?.data?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage news and articles.</p>
        </div>
        <Link href="/dashboard/blogs/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create New
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search blogs..."
          className="pl-8 bg-white max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-white">
          <p className="text-muted-foreground">No blogs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: any) => (
            <Card key={blog._id || blog.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-gray-100">
                {blog.thumbnail ? (
                  <Image src={blog.thumbnail} alt={blog.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant={blog.isPublished ? "default" : "secondary"} className={blog.isPublished ? "bg-emerald-500" : ""}>
                    {blog.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2 text-lg">{blog.title}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <span>{format(new Date(blog.createdAt), "MMM d, yyyy")}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {blog.views}</span>
                </div>
              </CardHeader>
              <CardFooter className="mt-auto border-t bg-gray-50/50 p-4 gap-2">
                <Link href={`/dashboard/blogs/${blog._id || blog.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => handeTogglePublish(blog)}>
                  {blog.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(blog._id || blog.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
