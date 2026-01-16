import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Privacy Policy | HomeConnect",
  description: "Detailed information on how HomeConnect manages and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <PageHeader
        title="Privacy Policy"
        description="At HomeConnect, we are committed to being transparent about how we collect and use your data to provide a better real estate experience."
        badge="Trust & Safety"
      />

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-xl border-0 rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-14 bg-white">
            <div className="prose prose-slate max-w-none">
              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">1. Introduction</h2>
                <p className="text-slate-600 leading-relaxed">
                  Welcome to HomeConnect. Your privacy is paramount to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. By using HomeConnect, you consent to the data practices described in this statement.
                </p>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">2. Information We Collect</h2>
                <div className="grid gap-6">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Personal Identifiable Information (PII)</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      This includes your name, email address, phone number, and physical address provided during registration or property listing.
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Usage Data & Device Info</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      We automatically collect IP addresses, browser types, device identifiers, and page interaction data to optimize platform performance.
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Transaction Details</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Information related to your bookings, payments (processed securely via Stripe), and communication history with other users.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">3. Cookies & Tracking</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for account authentication and security.</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand user behavior to improve features.</li>
                </ul>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">4. Data Security</h2>
                <p className="text-slate-600 leading-relaxed">
                  HomeConnect implements industry-standard security measures, including SSL encryption for all data in transit and AES encryption for sensitive data at rest. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
                </p>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">5. Your Data Rights</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  You have the right to control your personal information:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span className="text-slate-600">Request access to your personal data.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span className="text-slate-600">Request correction of inaccurate data.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span className="text-slate-600">Request deletion of your account/data.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span className="text-slate-600">Withdraw consent for marketing.</span>
                  </div>
                </div>
              </section>

              <Separator className="my-10 border-slate-100" />

              <section>
                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">6. Contact Data Protection Officer</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  For any requests related to your privacy or to exercise your data rights, please reach out to our legal team:
                </p>
                <div className="inline-flex flex-col gap-1 p-6 rounded-2xl bg-blue-600 text-white">
                  <span className="text-xs uppercase tracking-widest font-bold opacity-70">Email Us</span>
                  <a href="mailto:privacy@homeconnect.com" className="text-lg font-bold hover:underline">privacy@homeconnect.com</a>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
