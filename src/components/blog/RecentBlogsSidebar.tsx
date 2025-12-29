"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogResponse } from "@/lib/api/blog-api";
import { CalendarDays, Mail, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { BlogImage } from "./BlogImage";

interface RecentBlogsSidebarProps {
  blogs: BlogResponse[];
}

export function RecentBlogsSidebar({ blogs }: RecentBlogsSidebarProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    
    setTimeout(() => {
      toast.success("Thanks for subscribing! Welcome to the community.");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 sticky top-24">
      {}
      <div className="relative">
        <Input
          placeholder="Search articles..."
          className="bg-gray-50 border-gray-200 focus:bg-white transition-colors pl-4 pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-black/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

        <div className="relative z-10 space-y-4">
          <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Weekly Insights</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Join 10,000+ real estate professionals and enthusiasts getting market updates.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-2 pt-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all border-none"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-primary hover:bg-gray-50 font-bold shadow-sm"
            >
              {loading ? "Joining..." : "Subscribe Now"}
            </Button>
          </form>
          <p className="text-[10px] text-white/60 text-center">
            No spam, unsubscribe anytime.
          </p>
        </div>
      </div>

      {}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
            Most Recent
          </h3>
        </div>

        <div className="space-y-6">
          {blogs.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`/blogs/${item.slug}`}
              className="group flex gap-4 items-start"
            >
              <div className="relative h-20 w-24 shrink-0 rounded-xl overflow-hidden bg-muted">
                <BlogImage
                  src={item.images?.[0]}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <Badge className="w-fit text-[10px] h-5 px-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200">
                  {item.tags?.[0] || 'News'}
                </Badge>
                <h4 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-auto">
                  <CalendarDays className="h-3 w-3" />
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


import { Badge } from "@/components/ui/badge";

