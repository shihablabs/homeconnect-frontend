
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { BlogResponse } from '@/lib/api/blog-api';
import { CalendarDays, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogCardProps {
  blog: BlogResponse;
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="group h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-muted/60 dark:bg-card/40 dark:backdrop-blur-sm">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {blog.images && blog.images.length > 0 ? (
            <Image
              src={blog.images[0]}
              alt={blog.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-secondary/30 text-muted-foreground">
              No Image
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="backdrop-blur-md bg-background/60">
              {blog.tags[0] || 'Article'}
            </Badge>
          </div>
        </div>

        <CardHeader className="p-5 pb-0">
          <h3 className="line-clamp-2 text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
            {blog.title}
          </h3>
        </CardHeader>

        <CardContent className="p-5">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
          </p>
        </CardContent>

        <CardFooter className="p-5 pt-0 mt-auto flex items-center justify-between text-xs text-muted-foreground border-t bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span className="truncate max-w-[100px]">{blog.author.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
