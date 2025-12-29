import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
}

export function PageHeader({ title, description, badge, className }: PageHeaderProps) {


  return (
    <div className={cn("relative overflow-hidden pt-5 pb-16", className)}>
      {}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-blue-900/5 to-slate-900/5 dark:from-primary/10 dark:via-blue-800/10 dark:to-slate-900/10 opacity-50" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-transparent to-transparent opacity-80" />

      <div className="container mx-auto px-4 text-center">
        {badge && (
          <Badge
            variant="outline"
            className="mb-6 border-primary/20 bg-primary/5 px-4 py-1 text-primary uppercase tracking-wider text-xs font-semibold"
          >
            {badge}
          </Badge>
        )}
        <h1 className={cn(
          "mb-6 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent pb-2"
        )}>
          {title}
        </h1>
        {description && (
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
