import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | HomeConnect",
  description: "How we use cookies to improve your experience.",
};

export default function CookiePage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Cookie Policy"
        description="We use cookies to enhance your browsing experience and analyze site traffic."
        badge="Legal"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-6 md:p-10 space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Cookie className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">What are cookies?</h3>
                <p className="text-muted-foreground">
                  Cookies are small text files stored on your device that help us remember your preferences, log you in automatically, and analyze how you use our platform.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Types of Cookies We Use</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium text-primary mb-2">Essential Cookies</h4>
                  <p className="text-sm text-muted-foreground">Necessary for the website to function. Without these, you cannot log in or make payments.</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium text-primary mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-muted-foreground">Help us understand how visitors interact with the site (e.g., Google Analytics).</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Managing Your Preferences</h3>
              <p className="text-muted-foreground mb-4">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
              </p>
              <Button>Manage Cookie Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
