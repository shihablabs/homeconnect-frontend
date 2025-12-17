import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogApi } from '@/lib/api/blog-api';
import { ArrowLeft, CalendarDays, Eye, User } from 'lucide-react';
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

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;

  let blog;
  try {
    blog = await blogApi.getBlogBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article className="container max-w-4xl py-12 px-4 md:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-8 hover:bg-transparent pl-0 -ml-3 text-muted-foreground hover:text-foreground">
        <Link href="/blogs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {blog.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted">
                {blog.author.avatar ? (
                  <Image src={blog.author.avatar} alt={blog.author.name} fill className="object-cover" />
                ) : (
                  <User className="h-5 w-5 absolute top-1.5 left-1.5" />
                )}
              </div>
              <span className="font-medium text-foreground">{blog.author.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{blog.views} views</span>
            </div>
          </div>
        </div>

        {blog.images && blog.images.length > 0 && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted my-8">
            <Image
              src={blog.images[0]}
              alt={blog.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Simple rendering for now. For rich text, use a parser */}
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
