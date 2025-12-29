
import { PageHeader } from "@/components/layout/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | HomeConnect",
  description: "Answers to common questions about renting, listing, payments, and support on HomeConnect.",
};

const faqs = [
  {
    q: "How do I schedule a property viewing?",
    a: "Open a listing and click “Request a tour” or use the Contact page. We’ll confirm via email or phone within one business day.",
  },
  {
    q: "What documents are needed for a rental application?",
    a: "Typically ID, proof of income, references, and credit/guarantor details if required. Requirements vary by property.",
  },
  {
    q: "Do you charge application fees?",
    a: "Application fees are shown on the listing if applicable. We only charge disclosed fees and never take cash outside the platform.",
  },
  {
    q: "How are maintenance requests handled?",
    a: "Tenants can submit a support request via the Contact page (type: Support). Urgent issues are triaged 24/7; non-urgent within support hours.",
  },
  {
    q: "Are pets allowed?",
    a: "Pet policies vary by property. Check the listing details or ask our team; some properties require an additional deposit.",
  },
  {
    q: "How do I list my property on HomeConnect?",
    a: "Use the Contact page (type: Landlord) and share basic details. Our team will verify and help you onboard.",
  },
  {
    q: "How do you screen tenants?",
    a: "We use a standard screening flow aligned with local regulations, with landlord approval before finalizing any lease.",
  },
  {
    q: "Is my payment information secure?",
    a: "Payments are processed by reputable third-party providers over encrypted connections. We do not store raw card data.",
  },
  {
    q: "How fast do you respond to inquiries?",
    a: "Within one business day for general inquiries. Emergencies for tenants are handled 24/7.",
  },
];

export default function FAQPage() {
  
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <main className="pb-24">
      <PageHeader
        title="Frequently Asked Questions"
        description="Quick answers for renters, buyers, and landlords. Can’t find it? Reach out to our team."
        badge="Support"
      />

      <section className="container mx-auto max-w-5xl px-4 -mt-8 relative z-10">
        <Card className="shadow-sm">
          <CardContent className="p-6 md:p-10">
            <div className="flex items-start gap-3 rounded-md border p-4 bg-muted/30 mb-6">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                This FAQ is a starting point for the academic project. We’ll expand it based on user feedback during testing.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Separator className="my-8" />
            <div className="text-sm text-muted-foreground">
              Still stuck? Contact us at{" "}
              <a href="/contact" className="underline underline-offset-4">Contact</a>.
            </div>
          </CardContent>
        </Card>
      </section>

      {}
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </main>
  );
}