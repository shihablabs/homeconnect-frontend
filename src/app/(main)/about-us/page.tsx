
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  Eye,
  HeartHandshake,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Target,
  Users,
  Zap
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | HomeConnect",
  description:
    "Revolutionizing the real estate experience in Bangladesh with transparency, security, and technology.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full bg-background pb-20">
      <PageHeader
        title="Redefining the Real Estate Journey"
        description="HomeConnect is more than a property portal; we are a dedicated technology partner committed to making property management seamless and accessible for everyone."
        badge="Our Story"
      />

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 items-center mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 leading-tight">
              A Mission to <span className="text-blue-600">Simplify</span> Living
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Founded on the belief that finding a home or managing a property should be effortless, HomeConnect brings a modern touch to the traditional real estate landscape of Bangladesh.
              </p>
              <p>
                We recognize the challenges faced by both property owners and seekers—from lack of transparency to cumbersome manual processes. Our platform is engineered to dismantle these barriers, providing a verified digital environment where trust is built into every transaction.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-100 flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-blue-600 mb-4" />
              <div className="text-2xl font-bold text-slate-900">10k+</div>
              <div className="text-sm text-slate-500 font-medium">Active Users</div>
            </div>
            <div className="p-8 rounded-3xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center text-center">
              <Layers className="w-8 h-8 text-indigo-600 mb-4" />
              <div className="text-2xl font-bold text-slate-900">5k+</div>
              <div className="text-sm text-slate-500 font-medium">Verified Listings</div>
            </div>
            <div className="p-8 rounded-3xl bg-cyan-50/50 border border-cyan-100 flex flex-col items-center text-center">
              <ShieldCheck className="w-8 h-8 text-cyan-600 mb-4" />
              <div className="text-2xl font-bold text-slate-900">100%</div>
              <div className="text-sm text-slate-500 font-medium">Secure Payments</div>
            </div>
            <div className="p-8 rounded-3xl bg-purple-50/50 border border-purple-100 flex flex-col items-center text-center">
              <Target className="w-8 h-8 text-purple-600 mb-4" />
              <div className="text-2xl font-bold text-slate-900">24/7</div>
              <div className="text-sm text-slate-500 font-medium">Expert Support</div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-20">
          <Card className="border-0 shadow-lg shadow-blue-500/5 bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-500 text-sm leading-relaxed">
              To empower every individual with the tools they need to rent, buy, or manage properties with total confidence and efficiency.
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-indigo-500/5 bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-500 text-sm leading-relaxed">
              To become the gold standard of real estate in Bangladesh, where every property journey starts and ends with a click of trust.
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-purple-500/5 bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                <HeartHandshake className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Our Values</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-500 text-sm leading-relaxed">
              Transparency, Security, and Innovation guide everything we do. We prioritize the user experience above all else.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Engineered for Excellence</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Our platform combines cutting-edge technology with deep market expertise to deliver a premium user experience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:border-blue-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <LayoutDashboard className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">Smart Interface</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                A highly intuitive dashboard designed for both desktop and mobile efficiency.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <ShieldCheck className="h-6 w-6 text-indigo-600 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">Identity Verfied</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Multi-layer verification protocols including Phone OTP and Email authentication.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:border-cyan-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center mb-6 group-hover:bg-cyan-600 transition-colors">
                <Database className="h-6 w-6 text-cyan-600 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">Verified Data</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Rigorously checked property details ensuring accuracy and reducing fraud risks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:border-purple-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <Zap className="h-6 w-6 text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3 text-lg">One-Click Booking</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Streamlined rental and sales flows with integrated secure payment processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24">
        <div className="flex flex-col items-center gap-10 rounded-[2.5rem] bg-slate-900 p-12 text-center text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[150px] opacity-20 translate-x-1/2 translate-y-1/2" />

          <div className="space-y-6 relative z-10">
            <h2 className="text-4xl font-black tracking-tight">Ready to Find Your Home?</h2>
            <p className="mx-auto max-w-2xl text-slate-400 text-lg leading-relaxed">
              Join thousands of users who have found their perfect properties with HomeConnect.
              Efficiency and clarity are just a click away.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-7 text-lg rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/40">
              <Link href="/properties">
                Start Exploring
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-slate-700 text-white hover:bg-slate-800 hover:border-slate-500 px-10 py-7 text-lg rounded-2xl font-bold transition-all">
              <Link href="/contact">
                Contact Our Team
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}