import { Bed, Briefcase, Building2, Home, Map } from "lucide-react";
import Link from "next/link";

const types = [
  { label: "Apartments", slug: "apartment", Icon: Building2 },
  { label: "Houses", slug: "house", Icon: Home },
  { label: "Studios", slug: "studio", Icon: Bed },
  { label: "Commercial", slug: "commercial", Icon: Briefcase },
  { label: "Land", slug: "land", Icon: Map },
];

export default function PropertyTypeGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Property Type</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover properties tailored to your specific needs and preferences
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {types.map(({ label, slug, Icon }) => (
            <Link
              key={slug}
              href={`/properties?propertyType=${slug}`}
              className="group"
            >
              <div className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 group-hover:shadow-md">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
                <p className="text-xs text-gray-500">View properties</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}