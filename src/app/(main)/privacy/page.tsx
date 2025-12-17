import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Privacy Policy | HomeConnect",
  description: "Learn how HomeConnect collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Privacy Policy"
        description="Your privacy is our priority. We are committed to protecting your personal data."
        badge="Last Updated: Dec 15, 2025"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-6 md:p-10 prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-2xl font-semibold text-primary">1. Information We Collect</h3>
            <p className="text-muted-foreground">
              We collect information you provide directly to us when you create an account, list a property, or contact support. This includes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Personal Identity:</strong> Name, email address, phone number.</li>
              <li><strong>Financial Data:</strong> Payment details (processed securely via Stripe).</li>
              <li><strong>Property Data:</strong> Photos, descriptions, and location data for listings.</li>
            </ul>

            <Separator className="my-8" />

            <h3 className="text-2xl font-semibold text-primary">2. How We Use Your Data</h3>
            <p className="text-muted-foreground">
              We use your data to provide and improve the HomeConnect platform, specifically to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Facilitate connections between landlords and tenants.</li>
              <li>Process secure payments for rentals or sales.</li>
              <li>Send transaction emails and security alerts.</li>
            </ul>

            <Separator className="my-8" />

            <h3 className="text-2xl font-semibold text-primary">3. Data Security</h3>
            <p className="text-muted-foreground">
              We presume a &quot;Security First&quot; approach. All sensitive data is encrypted in transit and at rest. We use industry-standard measures including JWT authentication and secure database practices.
            </p>

            <Separator className="my-8" />

            <h3 className="text-2xl font-semibold text-primary">4. Contact Us</h3>
            <p className="text-muted-foreground">
              If you have questions about this policy, please contact us at <a href="mailto:privacy@homeconnect.com" className="text-blue-600 hover:underline">privacy@homeconnect.com</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}