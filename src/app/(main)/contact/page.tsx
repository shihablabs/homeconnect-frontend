import { ContactForm } from "@/components/contact/contact-form";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Contact | HomeConnect",
  description: "Get in touch with HomeConnect for rentals, sales, and property management.",
};

type PageProps = {
  searchParams?: Promise<{ propertyId?: string; type?: "rent" | "buy" | "sell" | "support" | "landlord" | "partnership" | "other" }>;
};

export default async function ContactPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const prefillPropertyId = resolvedParams?.propertyId;
  const prefillType = resolvedParams?.type;

  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Talk to our team"
        description="Whether you want to rent, buy, sell, or manage property, our specialists respond within one business day."
        badge="24/7 Support"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 max-w-7xl mx-auto">
          {}
          <div className="lg:col-span-3">
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm prefill={{ propertyId: prefillPropertyId, type: prefillType }} />
              </CardContent>
            </Card>
          </div>

          {}
          <div className="lg:col-span-2">
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle>Contact information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <a href="tel:+8801722563073" className="flex items-center gap-4 group hover:bg-muted p-2 rounded-lg transition-colors">
                    <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Call us</div>
                      <div className="text-sm text-muted-foreground">+880 1722-563073</div>
                    </div>
                  </a>

                  <a href="mailto:hello@homeconnect.com" className="flex items-center gap-4 group hover:bg-muted p-2 rounded-lg transition-colors">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">hello@homeconnect.com</div>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-2">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Office</div>
                      <div className="text-sm text-muted-foreground">European University, Dhaka</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Hours</div>
                      <div className="text-sm text-muted-foreground">Mon-Fri: 9am - 6pm</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="rounded-lg overflow-hidden border h-48">
                  <iframe
                    title="HomeConnect Office Map"
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.5894109159335!2d90.35246757606708!3d23.79763788709322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c0e96fce29dd%3A0x6ccd9e51aba9e64d!2sEuropean%20University%20of%20Bangladesh%20(EUB)%20-%20Permanent%20Campus!5e0!3m2!1sen!2sbd!4v1701234567890"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}