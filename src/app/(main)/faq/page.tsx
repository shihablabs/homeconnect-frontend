import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Home, MessageCircle, UserCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | HomeConnect Support",
  description: "Common questions about the HomeConnect real estate ecosystem for landlords, tenants, and buyers.",
};

const faqCategories = [
  {
    title: "Account & Verification",
    icon: UserCheck,
    items: [
      {
        q: "Why do I need to verify my phone and email?",
        a: "Verification is a critical security layer. It ensures that every user on HomeConnect is a real person, which helps prevent fraudulent listings and builds trust between owners and seekers.",
      },
      {
        q: "How long does the verification process take?",
        a: "Phone and email verification are instantaneous. Once you provide the codes sent to you, your account status is updated immediately.",
      },
    ],
  },
  {
    title: "Listings & Bookings",
    icon: Home,
    items: [
      {
        q: "How do I schedule a professional property tour?",
        a: "Within any listing, use the 'Request Tour' feature. You can select your preferred dates, and the landlord will coordinate with our team to confirm a time that works for you.",
      },
      {
        q: "What does a 'Verified Listing' mean?",
        a: "A 'Verified' badge means our team has manually checked the property details, ownership documents, and location accuracy to ensure the listing is authentic.",
      },
    ],
  },
  {
    title: "Payments & Security",
    icon: CreditCard,
    items: [
      {
        q: "How secure is my payment information?",
        a: "We use Stripe, a global leader in payment processing. HomeConnect never stores your raw credit card data. All transactions are encrypted and compliant with PCI-DSS standards.",
      },
      {
        q: "What is the escrow system for security deposits?",
        a: "For rental agreements, your security deposit is held in a secure escrow account until move-in. This protects you from dishonest landlords and ensures funds are available for return at the end of the tenancy.",
      },
    ],
  },
];

export default function FAQPage() {
  const allFaqs = faqCategories.flatMap(c => c.items);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      <PageHeader
        title="Help Center"
        description="Find answers to common questions about our platform, services, and policies."
        badge="Support"
      />

      <section className="container mx-auto px-4 -mt-12 relative z-10 max-w-5xl">
        <div className="grid gap-8 mb-16">
          {faqCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{category.title}</h2>
                </div>
                <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                  <CardContent className="p-4 md:p-8">
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, i) => (
                        <AccordionItem key={i} value={`item-${idx}-${i}`} className="border-slate-100 last:border-0 hover:border-blue-100 transition-colors">
                          <AccordionTrigger className="text-left font-bold py-6 text-lg hover:text-blue-600 hover:no-underline px-4">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-500 leading-relaxed px-4 pb-6 mt-1">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Support Section */}
        <div className="rounded-[3rem] bg-slate-900 p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 -translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white text-slate-900 flex items-center justify-center mb-6 shadow-xl shadow-white/5">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black mb-4">Still have questions?</h3>
            <p className="text-slate-400 mb-10 max-w-lg leading-relaxed text-lg">
              Our support team is available 24/7 to assist you with any inquiries or technical issues.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20">
                  Contact Support
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </main>
  );
}
