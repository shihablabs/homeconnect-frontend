import { BlogImage } from '@/components/blog/BlogImage';
import { RelatedProperties } from '@/components/blog/RelatedProperties';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogApi, BlogResponse } from '@/lib/api/blog-api';
import { propertiesApi } from '@/lib/api/properties-api';
import { PropertyResponse } from '@/types/property.types';
import { ArrowLeft, CalendarDays, Eye, Share2, Tag, User } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const blog = await blogApi.getBlogBySlug(slug);
    return {
      title: `${blog.title} | HomeConnect Blog`,
      description: blog.content.substring(0, 160),
      openGraph: {
        images: blog.images && blog.images.length > 0 ? [blog.images[0]] : [],
      },
    };
  } catch {
    return {
      title: 'Blog Post Not Found',
    };
  }
}

import { RecentBlogsSidebar } from '@/components/blog/RecentBlogsSidebar';



export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;

  let blog: BlogResponse;
  let recommendedProperties: PropertyResponse[] = [];
  let recentBlogs: BlogResponse[] = [];

  try {
    
    const blogPromise = blogApi.getBlogBySlug(slug);
    const propertiesPromise = propertiesApi.getFeaturedProperties(6);
    const recentPromise = blogApi.getAllBlogs({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' });

    const [blogData, propertiesData, recentData] = await Promise.all([blogPromise, propertiesPromise, recentPromise]);

    blog = blogData;
    recommendedProperties = propertiesData;
    recentBlogs = recentData.data.filter(b => b.id !== blog.id).slice(0, 5);

  } catch (error) {
    console.error("Error fetching blog data:", error);
    notFound();
  }

  return (
    <article className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-8 hover:bg-transparent pl-0 -ml-3 text-muted-foreground hover:text-foreground">
        <Link href="/blogs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      <div className="space-y-10">
        {}
        <div className="space-y-6 text-center md:text-left max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Badge variant="secondary" className="px-3 py-1 font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors uppercase tracking-widest text-[10px]">
              {blog.tags?.[0] || "Featured"}
            </Badge>
          </div>

          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-[1.1]">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-muted-foreground border-b border-gray-100 pb-8">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted border-2 border-white shadow-sm ring-1 ring-gray-100">
                {blog.author.avatar ? (
                  <Image src={blog.author.avatar} alt={blog.author.name} fill className="object-cover" />
                ) : (
                  <User className="h-6 w-6 absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-gray-900">{blog.author.name}</span>
                <span className="text-xs">Author & Editor</span>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-gray-900">Published</span>
                <span className="text-xs">{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <Eye className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-gray-900">Reads</span>
                <span className="text-xs">{blog.views} views</span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="relative h-[350px] md:h-[450px] w-full overflow-hidden rounded-3xl border border-gray-100 shadow-xl bg-muted">
          <BlogImage
            src={blog.images?.[0] || ""}
            alt={blog.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            {}
            <div
              className="prose prose-lg prose-gray dark:prose-invert max-w-none 
                  prose-headings:font-black prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                  prose-p:leading-relaxed prose-p:text-gray-600
                  prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-2xl prose-img:shadow-lg prose-img:border prose-img:border-gray-100"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {}
            <div className="flex flex-col gap-4 pt-10 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Related Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map(tag => (
                  <div key={tag} className="bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border border-gray-100">
                    #{tag}
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="p-8 bg-gray-50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-gray-900">Share this article</h3>
                <p className="text-sm text-gray-500">Inspire others by sharing this insight.</p>
              </div>
              {}
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full bg-white hover:bg-gray-50 border-gray-200">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>
          </div>



          <aside className="hidden lg:block lg:col-span-4 pl-8 border-l border-gray-100">
            <RecentBlogsSidebar blogs={recentBlogs} />
          </aside>
        </div>

        {}
        <RelatedProperties properties={recommendedProperties} title="Find Your Dream Home" />

      </div>
    </article >
  );
}
