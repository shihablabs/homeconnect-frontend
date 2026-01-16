import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, DollarSign, FileText, MapPin, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Buying Guide | HomeConnect",
  description: "A comprehensive roadmap for navigating the property market in Bangladesh.",
};

const guideSteps = [
  {
    id: "step-1",
    title: "1. Financial Planning & Budgeting",
    icon: DollarSign,
    content: "Success begins with a clear financial roadmap. Beyond the property price, factor in registration fees (typically 10-12% in Bangladesh), stamp duties, and hidden costs like utility connection fees. If you're opting for a home loan, ensure your Debt-to-Income ratio is healthy. HomeConnect recommends getting a pre-approval from a reputable bank before starting your physical search."
  },
  {
    id: "step-2",
    title: "2. Strategic Location Analysis",
    icon: MapPin,
    content: "Location dictates both lifestyle and future ROI. Consider proximity to key transit hubs like the Metro Rail. While areas like Gulshan and Dhanmondi offer prestige, emerging zones like Purbachal and Bashundhara provide significant appreciation potential. Evaluate the neighborhood's drainage system, security, and access to essential services."
  },
  {
    id: "step-3",
    title: "3. Rigorous Legal Due Diligence",
    icon: ShieldCheck,
    content: "This is the most critical phase. Verify the 'Chain of Title' going back 25-30 years. Specifically, check the CS, SA, RS, and City Surveys (Porcha). Ensure the property is not 'Khas' land or involved in any litigation. For apartments, verify RAJUK/CDA approval of the plan and the developer's registration with REHAB."
  },
  {
    id: "step-4",
    title: "4. Inspection & Quality Audit",
    icon: Search,
    content: "Never skip a physical inspection. Look beyond the paint for structural integrity, dampness, and quality of fittings. For new builds, ask for the 'Load Test' reports and material specifications. HomeConnect connects you with professional inspectors to ensure the property matches the promised standards."
  },
  {
    id: "step-5",
    title: "5. Negotiation & Document Execution",
    icon: FileText,
    content: "Once satisfied, negotiate the payment schedule. The 'Bayanama' (Agreement to Sell) should clearly mention the total price, payment milestones, and handover deadlines with penalty clauses for delays. Always execute these agreements on non-judicial stamps as per governmental regulations."
  }
];

export default function BuyingGuidePage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <PageHeader
        title="Master the Real Estate Market"
        description="Our expert roadmap simplifies the complex process of property acquisition, ensuring your investment is secure and your journey is smooth."
        badge="Property Intelligence"
      />

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 max-h-screen overflow-y-auto hidden lg:block">
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-8 bg-white">
                <h3 className="font-black text-slate-900 mb-6 text-sm uppercase tracking-widest">Guide Chapters</h3>
                <ul className="space-y-4">
                  {guideSteps.map((step) => (
                    <li key={step.id}>
                      <Link href={`#${step.id}`} className="text-slate-500 hover:text-blue-600 font-medium transition-colors flex items-center gap-3 group">
                        <span className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-600 transition-colors" />
                        <span className="text-sm">{step.title.split('. ')[1]}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="pt-6 border-t mt-6">
                    <Link href="/contact" className="text-blue-600 font-bold hover:text-blue-700 transition-colors inline-flex items-center gap-2">
                      Consult an Expert
                      <CheckCircle2 className="w-4 h-4" />
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Guide Content */}
          <div className="lg:col-span-9 space-y-12">
            {guideSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} id={step.id} className="scroll-mt-24 group">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="h-16 w-16 rounded-[2rem] bg-white shadow-xl shadow-blue-500/5 flex items-center justify-center text-blue-600 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{step.title}</h2>
                  </div>
                  <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden">
                    <CardContent className="p-10 md:p-12 text-slate-600 text-lg leading-relaxed">
                      {step.content}
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* CTA Section */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-center mt-20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white mb-4">Start Your Search Securely</h3>
                <p className="text-slate-400 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                  Now that you have the knowledge, browse our verified listings to find a property that meets our professional standards.
                </p>
                <Link href="/properties">
                  <Badge variant="secondary" className="px-10 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all shadow-xl shadow-blue-900/50 cursor-pointer rounded-2xl">
                    Explore Verified Properties
                  </Badge>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
