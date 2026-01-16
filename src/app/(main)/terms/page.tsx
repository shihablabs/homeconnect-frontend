import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Terms of Service | HomeConnect",
  description: "Terms and conditions governing the use of the HomeConnect platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <PageHeader
        title="Terms of Service"
        description="By using HomeConnect, you agree to these terms. Please read them carefully to understand your rights and responsibilities."
        badge="Legal Agreement"
      />

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-xl border-0 rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-14 bg-white">
            <div className="prose prose-slate max-w-none">
              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">1. Acceptance of Agreement</h2>
                <p className="text-slate-600 leading-relaxed">
                  These Terms of Service constitute a legally binding agreement between you and HomeConnect. By accessing or using our platform, you signify that you have read, understood, and agree to be bound by these terms. If you do not agree, you must immediately cease all use of the platform.
                </p>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">2. User Accounts & Verification</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  To access certain features, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Provide accurate, current, and complete information.</li>
                  <li>Maintain the security of your password and accept all risks of unauthorized access.</li>
                  <li>Complete required identity verification (Phone/Email) before listing properties or making payments.</li>
                </ul>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">3. Listing & Marketplace Rules</h2>
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-bold mb-2">For Property Owners (Landlords)</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      You represent that you have the legal right to lease or sell any property you list. All descriptions and photos must be accurate and not misleading. HomeConnect reserves the right to remove any listing that violates our quality standards.
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-bold mb-2">For Property Seekers (Tenants/Buyers)</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      You agree to use the platform in good faith. Any booking made is subject to the owner's approval and the successful completion of the payment process.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">4. Payments & Scrow</h2>
                <p className="text-slate-600 leading-relaxed">
                  HomeConnect uses Stripe for secure payment processing. By making a payment, you agree to Stripe's Services Agreement. HomeConnect may hold funds in escrow for rental security deposits to ensure a fair resolution in case of disputes. Platform fees are non-refundable unless otherwise stated.
                </p>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">5. Limitation of Liability</h2>
                <p className="text-slate-600 leading-relaxed">
                  HomeConnect is a marketplace facilitator. We are not a party to the actual lease or sale agreements between users. We are not liable for the condition of properties, the behavior of users, or any damages arising from off-platform transactions.
                </p>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">6. Termination</h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                  We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the platform.
                </p>
                <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col items-center text-center gap-4">
                  <h3 className="text-xl font-bold">Questions about our terms?</h3>
                  <p className="text-slate-400 text-sm max-w-md">
                    Our legal team is here to help you understand your rights on the platform.
                  </p>
                  <a href="mailto:legal@homeconnect.com" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">legal@homeconnect.com</a>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
