"use client";

import { Badge } from '@/components/ui/badge';
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
    (blog.images && blog.images.length > 0 && blog.images[0]) ? blog.images[0] : "/blog-placeholder.png"
  );

  return (
    <Link href={`/blogs/${blog.slug}`} className="group block h-full">
      <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group-hover:-translate-y-1.5 flex flex-col">
        {/* Image Section */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={imgSrc}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgSrc("/blog-placeholder.png")}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Tag Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md border-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow-sm">
              {blog.tags?.[0] || 'Real Estate'}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow p-5 md:p-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600/80 uppercase tracking-widest mb-3">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>
              {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
            {blog.title}
          </h3>

          <div
            className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{
              __html: blog.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + "..."
            }}
          />

          <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors inline-flex items-center gap-1.5">
              Read Story
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

