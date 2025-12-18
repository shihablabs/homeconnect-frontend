"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { BlogResponse } from '@/lib/api/blog-api';
import { CalendarDays } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface BlogCardProps {
  blog: BlogResponse;
}

export default function BlogCard({ blog }: BlogCardProps) {
  // Initialize with the first image, or fallback if none exist
  const [imgSrc, setImgSrc] = useState<string>(
    (blog.images && blog.images.length > 0 && blog.images[0]) ? blog.images[0] : "/placeholder.jpg"
  );

  return (
    <Link href={`/blogs/${blog.slug}`} className="group h-full block">
      <Card className="h-full shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border-border/50 group-hover:border-primary/20 bg-card">
        <div className="relative h-56 w-full bg-muted overflow-hidden">
          <Image
            src={imgSrc}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
          <Badge variant="secondary" className="absolute top-4 left-4 bg-white/95 text-black backdrop-blur-sm shadow-sm font-bold pointer-events-none">
            {blog.tags?.[0] || 'Article'}
          </Badge>
        </div>

        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            <span>
              {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {blog.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-grow px-5 pb-2">
          <div
            className="text-muted-foreground text-sm line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."
            }}
          />
        </CardContent>

        <CardFooter className="pt-2 px-5 pb-6">
          <div className="text-sm font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Read Article <span aria-hidden="true">&rarr;</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
