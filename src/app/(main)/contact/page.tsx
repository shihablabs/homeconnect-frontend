import { ContactForm } from "@/components/contact/contact-form";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Globe, Mail, MapPin, MessageSquare, Phone } from "lucide-react";

export const metadata = {
  title: "Contact US | HomeConnect",
  description: "Connect with HomeConnect specialists for exclusive property insights and management support.",
};

type PageProps = {
  searchParams?: Promise<{ propertyId?: string; type?: "rent" | "buy" | "sell" | "support" | "landlord" | "partnership" | "other" }>;
};

export default async function ContactPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const prefillPropertyId = resolvedParams?.propertyId;
  const prefillType = resolvedParams?.type;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      <PageHeader
        title="Connect with Our Experts"
        description="Whether you're looking to acquire assets, manage your portfolio, or find your next home, our dedicated specialists are here to assist."
        badge="Concierge Support"
      />

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 max-w-7xl mx-auto">
          {/* Main Inquiry Form */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl shadow-blue-500/5 bg-white rounded-[2.5rem] overflow-hidden group">
              <CardHeader className="p-10 pb-2">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tight">Direct Inquiry</CardTitle>
                </div>
                <p className="text-slate-500 text-sm">Fill out the form below and we'll route your request to the right department.</p>
              </CardHeader>
              <CardContent className="p-10 pt-6">
                <ContactForm prefill={{ propertyId: prefillPropertyId, type: prefillType }} />
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-2xl font-black tracking-tight">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-2 space-y-8">
                <div className="space-y-6">
                  <a href="tel:+8801722563073" className="flex items-center gap-5 group p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Direct Line</div>
                      <div className="text-lg font-black text-slate-900">+880 1722-563073</div>
                    </div>
                  </a>

                  <a href="mailto:hello@homeconnect.com" className="flex items-center gap-5 group p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Email Inquiry</div>
                      <div className="text-lg font-black text-slate-900">hello@homeconnect.com</div>
                    </div>
                  </a>

                  <div className="flex items-center gap-5 p-4">
                    <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Corporate Headquarters</div>
                      <div className="text-lg font-black text-slate-900">European University, Dhaka Branch</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 p-4">
                    <div className="h-14 w-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-sm">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Operating Hours</div>
                      <div className="text-lg font-black text-slate-900">Mon - Fri: 09:00 - 18:00</div>
                    </div>
                  </div>
                </div>

                <Separator className="border-slate-100" />

                <div className="rounded-[2rem] overflow-hidden border border-slate-100 h-64 shadow-inner relative">
                  <iframe
                    title="HomeConnect Office Map"
                    className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.5894109159335!2d90.35246757606708!3d23.79763788709322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c0e96fce29dd%3A0x6ccd9e51aba9e64d!2sEuropean%20University%20of%20Bangladesh%20(EUB)%20-%20Permanent%20Campus!5e0!3m2!1sen!2sbd!4v1701234567890"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-white/20 shadow-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Global Operations Branch</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
