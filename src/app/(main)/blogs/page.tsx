import BlogCard from '@/components/blog/BlogCard';
import BlogSearch from '@/components/blog/BlogSearch';
import BlogSort from '@/components/blog/BlogSort';
import { PageHeader } from '@/components/layout/PageHeader';
import { GoodDeals } from '@/components/sections/GoodDeals';
import { blogApi } from '@/lib/api/blog-api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | HomeConnect',
  description: 'Read our latest articles about real estate, home improvement, and more.',
};

export const revalidate = 60; 

interface BlogListPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    sortBy?: 'createdAt' | 'views' | 'title';
    sortOrder?: 'asc' | 'desc';
  }>;
}

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const { search, sortBy, sortOrder } = await searchParams;
  const result = await blogApi.getAllBlogs({
    limit: 100,
    search: search || undefined,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc'
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {}
      <PageHeader
        title="Real Estate & Lifestyle Guide"
        description="Expert analysis, market trends, and home improvement tips to guide your next move."
        badge="Insights"
        className="bg-transparent"
      />

      {}
      <div className="container mx-auto px-4 py-8 max-w-[1600px] -mt-8 relative z-10">

        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-8 bg-blue-600 rounded-full inline-block"></span>
              Latest Articles
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="w-full sm:w-[300px]">
              <BlogSearch />
            </div>
            <BlogSort />
          </div>
        </div>

        {}
        {result.data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.data.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 rounded-2xl bg-white/50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <p className="text-xl font-medium text-slate-900 mb-2">No articles found</p>
            <p className="text-slate-500">We couldn't find any articles matching "{search}"</p>
          </div>
        )}
      </div>

      {}
      <div className="bg-white border-t border-slate-100">
        <GoodDeals />
      </div>
    </div>
  );
}
