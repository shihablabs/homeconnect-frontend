"use client";

import { Button } from "@/components/ui/button";
import { BlogResponse } from "@/lib/api/blog-api";
import { useGetPublicBlogsQuery } from "@/redux/features/blog/blogApiSlice";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import BlogCard from "../blog/BlogCard";

export default function BlogPreview() {
  const { data: blogData, isLoading } = useGetPublicBlogsQuery({
    limit: 3,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  const blogs = (blogData?.data?.data || []) as BlogResponse[];

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[#F8FAFC] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] opacity-60" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Insights & News
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-5 tracking-tight leading-[1.1]">
              Latest from our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Blog</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Discover tips, market insights, and success stories from the community.
            </p>
          </div>
          <Link href="/blogs">
            <Button variant="outline" className="group border-slate-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-bold px-8 py-7 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md">
              Explorer All Articles
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {blogs.map((blog: BlogResponse) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  );
}
