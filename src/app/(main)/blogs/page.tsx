import BlogCard from '@/components/blog/BlogCard';
import BlogSearch from '@/components/blog/BlogSearch';
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
  const { search, page } = await searchParams;
  const result = await blogApi.getAllBlogs({
    limit: 100,
    search: search || undefined
  });

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Blog</h1>
          <p className="text-muted-foreground max-w-[600px]">
            Insights, tips, and news from the world of real estate.
          </p>
        </div>
        <BlogSearch />
      </div>

      {result.data.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="min-h-[300px] flex flex-col items-center justify-center border-dashed border-2 rounded-lg bg-muted/30">
          <p className="text-lg font-medium text-muted-foreground mb-2">No articles found</p>
          <p className="text-sm text-muted-foreground/80">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
