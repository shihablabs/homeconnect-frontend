import { ArrowRight, CheckCircle, FileSignature, Search, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Smart Search",
    desc: "Use AI-powered filters to find your perfect match with personalized recommendations.",
    Icon: Search,
    features: ["AI Recommendations", "Smart Filters", "Price Alerts"]
  },
  {
    title: "Digital Signing",
    desc: "Complete applications and sign documents securely with e-signature technology.",
    Icon: FileSignature,
    features: ["E-Signature", "Secure Documents", "Instant Submission"]
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white text-sm font-medium mb-6 shadow-lg shadow-cyan-500/25">
            <Sparkles className="w-4 h-4" />
            Simple 2-Step Process
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Your Dream Home in{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                2 Easy Steps
              </span>
              <div className="absolute bottom-2 left-0 w-full h-3 bg-cyan-200/40 -z-10 rounded-full" />
            </span>
          </h2>

          <p className="text-xl text-gray-600 leading-relaxed">
            Our streamlined process makes finding and securing your perfect property
            faster and easier than ever before.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {steps.map(({ title, desc, Icon, features }, index) => (
            <div
              key={title}
              className="relative group"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-300 to-blue-300 group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300 z-20" />
              )}

              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30">
                {index + 1}
              </div>

              {/* Main Card */}
              <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-100/60 shadow-lg shadow-cyan-500/10 p-8 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-cyan-500/20 group-hover:scale-105 group-hover:border-cyan-200">
                {/* Icon Container */}
                <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/40 transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-7 h-7" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-700 transition-colors duration-300">
                  {title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {desc}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className="flex items-center gap-2 text-cyan-600 font-semibold text-sm group/btn hover:text-cyan-700 transition-colors duration-300">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500 -z-10" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-cyan-100 shadow-lg shadow-cyan-500/10">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
            <span className="text-gray-700 font-medium">
              Ready to start your journey?{" "}
              <button className="text-cyan-600 font-semibold hover:text-cyan-700 underline decoration-2 decoration-cyan-300 underline-offset-4 transition-colors duration-300">
                Get started today
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}