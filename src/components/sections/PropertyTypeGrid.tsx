import { cn } from "@/lib/utils";
import { ArrowRight, Bed, Briefcase, Building2, Home, Map } from "lucide-react";
import Link from "next/link";

const types = [
  {
    label: "Apartments",
    slug: "apartment",
    Icon: Building2,
    color: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50",
    border: "group-hover:border-blue-200",
    text: "text-blue-600",
    desc: "Modern living spaces in the city"
  },
  {
    label: "Houses",
    slug: "house",
    Icon: Home,
    color: "from-purple-500 to-pink-400",
    bg: "bg-purple-50",
    border: "group-hover:border-purple-200",
    text: "text-purple-600",
    desc: "Spacious homes for your family"
  },
  {
    label: "Studios",
    slug: "studio",
    Icon: Bed,
    color: "from-orange-500 to-amber-400",
    bg: "bg-orange-50",
    border: "group-hover:border-orange-200",
    text: "text-orange-600",
    desc: "Compact & efficient living"
  },
  {
    label: "Commercial",
    slug: "commercial",
    Icon: Briefcase,
    color: "from-slate-700 to-slate-500",
    bg: "bg-slate-50",
    border: "group-hover:border-slate-200",
    text: "text-slate-700",
    desc: "Offices & retail spaces"
  },
  {
    label: "Land",
    slug: "land",
    Icon: Map,
    color: "from-emerald-500 to-green-400",
    bg: "bg-emerald-50",
    border: "group-hover:border-emerald-200",
    text: "text-emerald-600",
    desc: "Lots for your dream project"
  },
];

export default function PropertyTypeGrid() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-gradient-to-bl from-cyan-50/50 to-emerald-50/50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 mb-6 uppercase tracking-wider">
            Diverse Options
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Property Type</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            From cozy studios to sprawling lands, find the perfect category that matches your vision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {types.map(({ label, slug, Icon, color, bg, border, text, desc }) => (
            <Link
              key={slug}
              href={`/properties?propertyType=${slug}`}
              className="group relative"
            >
              <div className={cn(
                "relative h-full p-6 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 transition-all duration-300",
                "hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-300/60",
                border
              )}>
                {}
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 shadow-sm",
                  bg
                )}>
                  <Icon className={cn("w-7 h-7", text)} />
                </div>

                {}
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {label}
                </h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  {desc}
                </p>

                {}
                <div className="flex items-center text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>

                {}
                <div className={cn(
                  "absolute bottom-0 left-0 w-full h-1 rounded-b-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  color
                )} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}