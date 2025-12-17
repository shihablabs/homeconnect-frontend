import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Blog | HomeConnect",
  description: "News, tips, and insights about the real estate market.",
};

const posts = [
  {
    title: "10 Tips for First-Time Home Buyers",
    category: "Buying Guide",
    date: "Dec 10, 2025",
    excerpt: "Navigating the property market for the first time? Here’s what you need to know before making an offer.",
    image: "/placeholder-property.jpg" // Using generic placeholder if available, otherwise will need real url or handle error. 
    // Assuming backend provided placeholder or local asset.
  },
  {
    title: "Understanding Property Taxes in Dhaka",
    category: "Market Insights",
    date: "Dec 05, 2025",
    excerpt: "A comprehensive guide to understanding property tax rates and how they affect your investment.",
    image: "/placeholder-property.jpg"
  },
  {
    title: "How to Stage Your Home for Sale",
    category: "Selling Tips",
    date: "Nov 28, 2025",
    excerpt: "Learn the secrets of home staging that can increase your property's value by up to 10%.",
    image: "/placeholder-property.jpg"
  }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="HomeConnect Blog"
        description="Latest news, market trends, and expert advice for buyers and renters."
        badge="Resources"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {posts.map((post, idx) => (
            <Card key={idx} className="shadow-lg overflow-hidden flex flex-col group cursor-pointer border-t-4 border-t-purple-500 hover:border-t-purple-600 transition-all">
              <div className="relative h-48 w-full bg-muted">
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gray-100">
                  <span className="text-sm">Image Placeholder</span>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="text-xs">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0 text-primary">Read More &rarr;</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
