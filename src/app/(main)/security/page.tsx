import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Server, ShieldCheck, UserCheck } from "lucide-react";

export const metadata = {
  title: "Security | HomeConnect",
  description: "How we protect your data and transactions.",
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Security Center"
        description="We employ enterprise-grade security to keep your property and personal data safe."
        badge="Trust"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <Card className="shadow-md border-t-4 border-t-emerald-500">
            <CardHeader>
              <Lock className="w-10 h-10 text-emerald-500 mb-2" />
              <CardTitle>Data Encryption</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              All data transmitted between your browser and our servers is encrypted using 256-bit SSL/TLS. Sensitive data like passwords are hashed using bcrypt before storage.
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-blue-500">
            <CardHeader>
              <Server className="w-10 h-10 text-blue-500 mb-2" />
              <CardTitle>Secure Infrastructure</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Our platform is hosted on secure cloud infrastructure with regular backups, firewalls, and DDoS protection to ensure 99.9% uptime.
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-purple-500">
            <CardHeader>
              <UserCheck className="w-10 h-10 text-purple-500 mb-2" />
              <CardTitle>Identity Verification</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              We verify the identity of property owners and high-volume users to prevent fraud. Our secure authentication system (JWT) prevents unauthorized access.
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-orange-500">
            <CardHeader>
              <ShieldCheck className="w-10 h-10 text-orange-500 mb-2" />
              <CardTitle>Payment Security</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              We do not store your credit card information. All payments are processed via Stripe, a PCI-DSS certified payment provider.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
