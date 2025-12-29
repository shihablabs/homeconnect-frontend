"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { BlogResponse } from '@/lib/api/blog-api';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface BlogCardProps {
  blog: BlogResponse;
}

export default function BlogCard({ blog }: BlogCardProps) {
  
  const [imgSrc, setImgSrc] = useState<string>(
    (blog.images && blog.images.length > 0 && blog.images[0]) ? blog.images[0] : "/placeholder.jpg"
  );

  return (
    <Link href={`/blogs/${blog.slug}`} className="group h-full block">
      <Card className="h-full border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col bg-white ring-1 ring-slate-900/5 group-hover:-translate-y-1">
        <div className="relative h-60 w-full bg-slate-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge className="absolute top-4 left-4 bg-white/95 text-slate-900 backdrop-blur-md shadow-sm font-bold border-0 hover:bg-white">
            {blog.tags?.[0] || 'Article'}
          </Badge>
        </div>

        <CardHeader className="pb-3 pt-5 px-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300 line-clamp-2 leading-tight">
            {blog.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-grow px-6 pb-2">
          <div
            className="text-slate-600 text-sm line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."
            }}
          />
        </CardContent>

        <CardFooter className="pt-4 px-6 pb-6">
          <div className="text-sm font-bold text-blue-600 flex items-center gap-2 group-hover:gap-3 transition-all">
            Read Article <ArrowRight className="w-4 h-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
