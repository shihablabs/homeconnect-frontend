"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PriceAlertsPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitted(true);
    toast.success("Price alert set successfully!");
  };

  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Price Alerts"
        description="Never miss a deal. Get notified when properties match your budget."
        badge="Notifications"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <Card className="max-w-xl mx-auto shadow-lg">
          {submitted ? (
            <CardContent className="py-20 text-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Alert Set!</h2>
              <p className="text-muted-foreground mb-8">
                We&apos;ll email you as soon as new properties match your criteria.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline">
                Set Another Alert
              </Button>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Create New Alert
                </CardTitle>
                <CardDescription>
                  Choose your preferences below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Property Type</Label>
                    <Select defaultValue="apartment">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget-min">Min Budget</Label>
                      <Input id="budget-min" placeholder="e.g. 5000" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget-max">Max Budget</Label>
                      <Input id="budget-max" placeholder="e.g. 25000" type="number" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Preferred Area</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        {}
                        <SelectItem value="gulshan">Gulshan</SelectItem>
                        <SelectItem value="banani">Banani</SelectItem>
                        <SelectItem value="dhanmondi">Dhanmondi</SelectItem>
                        <SelectItem value="uttara">Uttara</SelectItem>
                        <SelectItem value="bashundhara">Bashundhara R/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-[#ee0979] to-[#ff6a00]">
                    Set Alert
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
