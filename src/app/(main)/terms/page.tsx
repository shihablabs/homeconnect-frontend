import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Terms of Service | HomeConnect",
  description: "Rules and regulations for using the HomeConnect platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Terms of Service"
        description="Please read these terms carefully before using our platform."
        badge="Effective: Dec 15, 2025"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-6 md:p-10 prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-2xl font-semibold text-primary">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By accessing HomeConnect, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.
            </p>

            <Separator className="my-8" />

            <h3 className="text-2xl font-semibold text-primary">2. Use License</h3>
            <p className="text-muted-foreground">
              Permission is granted to temporarily download one copy of the materials (information or software) on HomeConnect for personal, non-commercial transitory viewing only.
            </p>

            <Separator className="my-8" />

            <h3 className="text-2xl font-semibold text-primary">3. User Responsibilities</h3>
            <p className="text-muted-foreground">
              <strong>Landlords:</strong> You warrant that you have the right to lease or sell any property you list. <br />
              <strong>Tenants:</strong> You agree to provide accurate information for background checks and agreements.
            </p>

            <Separator className="my-8" />

            <h3 className="text-2xl font-semibold text-primary">4. Limitation of Liability</h3>
            <p className="text-muted-foreground">
              HomeConnect enables connections but is not a party to the actual lease or sale agreement. We are not liable for disputes arising between users.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}