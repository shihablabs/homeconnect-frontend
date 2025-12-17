import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, FileSignature, Key, Search, Truck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Renting Tips | HomeConnect",
  description: "Essential advice for tenants looking to rent in Dhaka.",
};

const tips = [
  {
    title: "1. The Search",
    icon: Search,
    content: "Start looking at least 1 month before your move. Check listing photos carefully and always request a physical tour. Verify if utility bills (Gas/Water/Electricity) are included in the rent or separate."
  },
  {
    title: "2. The Agreement",
    icon: FileSignature,
    content: "Never rent without a written agreement. It should clearly state: Rent amount, Advance/Security Deposit (usually 1-2 months), notice period for leaving, and who pays for major repairs."
  },
  {
    title: "3. Inspection",
    icon: CheckSquare,
    content: "Before moving in, inspect the property with the landlord. Take photos of any existing damage (cracks, broken fittings) and share them via email/WhatsApp as proof to avoid deductions from your security deposit later."
  },
  {
    title: "4. Moving In",
    icon: Truck,
    content: "Notify your current landlord 1 month in advance. Arrange a moving truck early, especially if moving at the end of the month when demand is high. Check if the building has specific moving hours."
  },
  {
    title: "5. Tenant Rights",
    icon: Key,
    content: "Landlords cannot evict you without proper notice or increase rent arbitrarily in the middle of a contract. You have the right to a receipt for every rent payment made."
  }
];

export default function RentingTipsPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Renting Smart"
        description="Navigate the rental market with confidence. Tips for a hassle-free tenancy."
        badge="Tenant Guide"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {tips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <Card key={idx} className="shadow-lg hover:shadow-xl transition-all border-t-4 border-t-primary/50">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tip.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center bg-muted/30 p-10 rounded-3xl">
          <h3 className="text-2xl font-bold mb-4">Looking for a rental?</h3>
          <p className="text-muted-foreground mb-8">We have verified listings tailored for students and families.</p>
          <div className="flex justify-center gap-4">
            <Badge className="px-6 py-2 text-base cursor-pointer bg-blue-600 hover:bg-blue-700">
              <Link href="/properties?type=rent">Find Rentals</Link>
            </Badge>
          </div>
        </div>
      </div>
    </main>
  );
}
