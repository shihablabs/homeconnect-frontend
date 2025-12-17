// app/about/page.tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button"; // Assuming you have this
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Code2,
  Database,
  HeartHandshake,
  Layers,
  LayoutDashboard,
  Map,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | HomeConnect",
  description:
    "Empowering property owners and tenants with a seamless, full-stack real estate management solution.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full bg-background pb-20">
      {/* 1. Hero Section Standardized */}
      <PageHeader
        title="Building the Future of Smart Living"
        description="HomeConnect is a comprehensive ecosystem designed to bridge property owners and tenants through secure, transparent technology."
        badge="University Final Year Project"
      />

      {/* 2. Mission & Values Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-t-4 border-t-cyan-400 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <Zap className="mb-2 h-10 w-10 text-cyan-400" />
              <CardTitle>Speed & Efficiency</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Eliminating the hassle of manual paperwork. Our platform streamlines the entire process from property discovery to agreement.
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-orange-500 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <ShieldCheck className="mb-2 h-10 w-10 text-orange-500" />
              <CardTitle>Trust & Security</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Built with secure authentication (JWT) and robust data validation to ensure a safe environment for all users.
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-purple-400 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <HeartHandshake className="mb-2 h-10 w-10 text-purple-400" />
              <CardTitle>Community First</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              More than software, we foster connections. Comment systems and direct profiles allow transparent communication.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. The "MERN" Architecture Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Engineered for Performance</h2>
            <p className="mt-4 text-muted-foreground">
              A robust full-stack architecture powered by the MERN ecosystem.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Frontend */}
            <div className="group rounded-xl border bg-card p-6 transition-colors hover:border-primary/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Modern Frontend</h3>
              <p className="text-sm text-muted-foreground">
                Built with <strong>Next.js 14</strong>, TypeScript, and Tailwind CSS for a responsive, lightning-fast user interface.
              </p>
            </div>

            {/* Backend */}
            <div className="group rounded-xl border bg-card p-6 transition-colors hover:border-blue-800/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-800/10">
                <Code2 className="h-6 w-6 text-blue-800" />
              </div>
              <h3 className="mb-2 font-semibold">Robust Backend</h3>
              <p className="text-sm text-muted-foreground">
                Powered by <strong>Express.js</strong> and Node.js to handle complex business logic and secure API routes.
              </p>
            </div>

            {/* Database */}
            <div className="group rounded-xl border bg-card p-6 transition-colors hover:border-slate-500/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-500/10">
                <Database className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="mb-2 font-semibold">Scalable Data</h3>
              <p className="text-sm text-muted-foreground">
                <strong>MongoDB & Mongoose</strong> ensure flexible schema design for properties, users, and booking data.
              </p>
            </div>

            {/* Features */}
            <div className="group rounded-xl border bg-card p-6 transition-colors hover:border-primary/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Map className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold">Key Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Features <strong>Cloudinary</strong> for image optimization, <strong>Stripe</strong> for payments, and Leaflet maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Developer / Creator Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center gap-8 rounded-3xl border bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center dark:from-slate-900 dark:to-slate-800/50 md:p-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Meet the Creator</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              HomeConnect is the culmination of academic research and professional development passion.
              Designed and developed by <strong>Shihab</strong>, a MERN Stack Developer dedicated to solving real-world problems with code.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-blue-700 border-0">
              <Link href="/properties">
                Explore Properties
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="https://github.com/maker-shihab/homeconnect-frontend" target="_blank">
                <Layers className="mr-2 h-4 w-4" />
                View Source Code
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}