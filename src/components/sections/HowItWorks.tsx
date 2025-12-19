import { ArrowRight, CheckCircle, Key, Search, Sparkles, Video } from "lucide-react";

const steps = [
  {
    title: "Search Smart",
    desc: "Find your perfect space instantly with AI-powered matching and real-time market data.",
    Icon: Search,
    features: ["AI Matches", "Smart Filters", "Real-time Alerts"]
  },
  {
    title: "See It Real",
    desc: "Experience properties your way—schedule in-person visits or take immersive virtual tours.",
    Icon: Video,
    features: ["Virtual Tours", "Instant Booking", "Verified Hosts"]
  },
  {
    title: "Make It Yours",
    desc: "Seal the deal securely with digital contracts, instant payments, and automated handovers.",
    Icon: Key,
    features: ["E-Signature", "Secure Pay", "Fast Closing"]
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
            Simple 3-Step Process
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Dream Home in{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                3 Easy Steps
              </span>
              <div className="absolute bottom-2 left-0 w-full h-3 bg-cyan-200/40 -z-10 rounded-full" />
            </span>
          </h2>

          <p className="text-xl text-gray-600 leading-relaxed">
            We've stripped away the complexity. From discovery to keys in hand,
            experience the future of real estate.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
          {steps.map(({ title, desc, Icon, features }, index) => (
            <div
              key={title}
              className="relative group"
            >
              {/* Connection Line (Desktop) */}
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cyan-700 transition-colors duration-300">
                  {title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed min-h-[48px]">
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
        <div className="text-center mt-16">
          <div className="inline-flex flex-col md:flex-row items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-5 border border-cyan-100 shadow-xl shadow-cyan-500/10">
            <div className="flex items-center gap-3">
              From listing to closing, we&apos;ve streamlined the entire process. No more
              paperwork headaches or endless phone calls.
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-gray-700 font-medium">Ready to start your journey?</span>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}