import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, DollarSign, FileText, Home } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Buying Guide | HomeConnect",
  description: "Step-by-step guide to buying your dream property in Bangladesh.",
};

const guideSteps = [
  {
    id: "step-1",
    title: "1. Determine Your Budget",
    icon: DollarSign,
    content: "Before you start looking, calculate how much you can afford. Consider your savings, income, and any debt. Don't forget to factor in registration costs (approx 10-12% of property value) and recurring maintenance fees."
  },
  {
    id: "step-2",
    title: "2. Choose the Right Location",
    icon: Home,
    content: "Dhaka is vast. Consider proximity to work, schools, and healthcare. Areas like Uttara and Mirpur offer good value, while Gulshan and Banani are premium choices. Check future infrastructure plans (like Metro Rail lines) that could boost property value."
  },
  {
    id: "step-3",
    title: "3. Property Verification",
    icon: FileText,
    content: "Crucial step! Verify the 'Mutatation' (Namjari), land tax records, and ensuring the developer has RAJUK approval. Always hire a lawyer to check the deed (Dalil) authenticity."
  },
  {
    id: "step-4",
    title: "4. Verification & Booking",
    icon: CheckCircle2,
    content: "Once satisfied, pay the booking money. Ensure all terms (handover date, penalty clauses) are written in the allotment letter. Never make cash payments without a receipt."
  }
];

export default function BuyingGuidePage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Property Buying Guide"
        description="A complete handbook for first-time home buyers in Bangladesh."
        badge="Resources"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 max-h-screen overflow-y-auto hidden lg:block">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-lg">Table of Contents</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {guideSteps.map((step) => (
                    <li key={step.id}>
                      <Link href={`#${step.id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {step.title}
                      </Link>
                    </li>
                  ))}
                  <li className="pt-4 border-t mt-4">
                    <Link href="/contact" className="text-primary font-medium hover:underline">
                      Need Expert Help?
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {guideSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} id={step.id} className="scroll-mt-24">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">{step.title}</h2>
                  </div>
                  <Card className="shadow-sm">
                    <CardContent className="p-6 md:p-8 text-muted-foreground leading-relaxed">
                      {step.content}
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* CTA */}
            <div className="bg-primary/5 rounded-2xl p-8 text-center mt-12 border border-primary/10">
              <h3 className="text-2xl font-bold mb-4">Ready to start looking?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Explore thousands of verified listings in your preferred area today.
              </p>
              <Badge variant="secondary" className="px-6 py-2 text-base cursor-pointer hover:bg-secondary/80">
                <Link href="/properties">Browse Properties</Link>
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
