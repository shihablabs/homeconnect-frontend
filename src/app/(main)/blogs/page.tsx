import BlogCard from '@/components/blog/BlogCard';
import BlogSearch from '@/components/blog/BlogSearch';
import { GoodDeals } from '@/components/sections/GoodDeals';
import { blogApi } from '@/lib/api/blog-api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | HomeConnect',
  description: 'Read our latest articles about real estate, home improvement, and more.',
};

export const revalidate = 60; // Revalidate every 60 seconds

interface BlogListPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const { search } = await searchParams;
  const result = await blogApi.getAllBlogs({
    limit: 100,
    search: search || undefined
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Header Section */}
      <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Latest Insights
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Discover Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Real Estate Wisdom
                </span>
              </h1>
              <p className="text-slate-300 text-lg md:text-xl max-w-[600px] leading-relaxed">
                Expert analysis, market trends, and home improvement tips to guide your next move.
              </p>
            </div>

            <div className="w-full md:w-auto min-w-[300px]">
              <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                <BlogSearch />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-[1600px]">
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

      {/* Good Deals Section - Separated by visual break */}
      <div className="bg-white border-t border-slate-100">
        <GoodDeals />
      </div>
    </div>
  );
}
