import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, FileSignature, Search, ShieldAlert, Truck, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Renting Tips | HomeConnect",
  description: "Essential insights for securing a premium rental property with confidence.",
};

const tips = [
  {
    title: "1. Advanced Market Research",
    icon: Search,
    content: "The best rentals move fast. Start your search 30-45 days before your target move date. Use HomeConnect's filters to analyze price trends in specific zones. Always prioritize listings with 'Verified' badges to avoid ghost listings and bait-and-switch tactics."
  },
  {
    id: "tip-2",
    title: "2. Comprehensive Inspection",
    icon: CheckSquare,
    content: "Conduct a 'Move-in Audit'. Check all electrical outlets, plumbing pressure, and appliance conditions. Document every minor scratch or paint chip with timestamps and photos. Sharing this document with the landlord at the start of your lease is your best defense against unfair security deposit deductions."
  },
  {
    id: "tip-3",
    title: "3. Decoding the Lease Agreement",
    icon: FileSignature,
    content: "A professional lease is your legal shield. Ensure it clearly outlines: the exact security deposit amount, notice periods (HomeConnect recommends 60 days), utility responsibilities (DESCO/WASA/TITAS), and maintenance protocols for structural vs. cosmetic repairs."
  },
  {
    id: "tip-4",
    title: "4. Protecting Your Rights",
    icon: ShieldAlert,
    content: "Know the local laws. In Bangladesh, landlords must provide a rent receipt and cannot increase rent without mutual consent within the lease term. If you encounter issues, HomeConnect provides templates for professional communication with property management."
  },
  {
    id: "tip-5",
    title: "5. Seamless Transition & Move",
    icon: Truck,
    content: "Coordinate your move-in date with the building's management office (Society). Check for elevator usage fees or truck entry restrictions. Ensure all utility meters are read and cleared by the previous tenant to avoid inheriting their unpaid bills."
  },
  {
    id: "tip-6",
    title: "6. Building a Renter Profile",
    icon: Zap,
    content: "Stand out to high-quality landlords by maintaining a complete HomeConnect profile. Professional references and verified income details accelerate the approval process and may even give you leverage for better rental terms."
  }
];

export default function RentingTipsPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <PageHeader
        title="Elevate Your Renting Experience"
        description="From discovery to move-in, our expert tips ensure you secure the perfect home while protecting your rights as a tenant."
        badge="Tenant Intelligence"
      />

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {tips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <Card key={idx} className="border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[2rem] bg-white group overflow-hidden">
                <CardContent className="p-10">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{tip.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {tip.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 text-center bg-white border border-slate-100 p-12 md:p-16 rounded-[3rem] shadow-xl shadow-slate-200/50 max-w-5xl mx-auto relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50" />
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-slate-900 mb-6">Ready for Hassle-Free Renting?</h3>
            <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Explore our curated selection of verified rental properties across the most sought-after neighborhoods.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/properties?type=rent">
                <Badge className="px-10 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl border-0 shadow-xl shadow-blue-900/40 transition-all cursor-pointer">
                  Find Your Next Home
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
