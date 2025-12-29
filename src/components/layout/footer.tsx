
import { pacifico } from '@/lib/fonts';
import Link from 'next/link';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import { LuLinkedin, LuMail, LuMapPin, LuPhone } from 'react-icons/lu';

export default function Footer() {
  const homeConnectSocial = [
    {
      name: <FiTwitter />,
      href: "#"
    }, {
      name: <LuLinkedin />,
      href: "#"
    }, {
      name: <FiYoutube />,
      href: "#"
    },
    {
      name: <FiInstagram />,
      href: "#"
    }
  ]

  const footerWidgets = [
    {
      title: "Discover",
      links: [
        { name: "Featured Listings", href: "/featured" },
        { name: "New Properties", href: "/new" },
        { name: "Price Alerts", href: "/price-alerts" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Buying Guide", href: "/buying-guide" },
        { name: "Renting Tips", href: "/renting-tips" },
        { name: "Market Insights", href: "/market-trends" },
        { name: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about-us" },
        { name: "Careers", href: "/careers" },
        { name: "Blogs", href: "/blogs" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookie-policy" },
        { name: "Security", href: "/security" },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: <LuPhone className="w-4 h-4" />,
      text: "+8801722-563073",
      href: "tel:+8801722563073"
    },
    {
      icon: <LuMail className="w-4 h-4" />,
      text: "hello@homeconnect.com",
      href: "mailto:hello@homeconnect.com"
    },
    {
      icon: <LuMapPin className="w-4 h-4" />,
      text: "European University of Bangladesh | Dhaka, Bangladesh",
      href: "https://eub.edu.bd/"
    }
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 border-t border-white/5">
      {}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent" />

      {}
      <div className="absolute top-10 left-10 opacity-10">
        <div className="w-8 h-8 border-2 border-cyan-400 rounded-lg rotate-45" />
      </div>
      <div className="absolute top-20 right-20 opacity-10">
        <div className="w-6 h-6 border border-amber-400 rounded-full" />
      </div>
      <div className="absolute bottom-32 left-1/4 opacity-10">
        <div className="w-12 h-1 bg-emerald-400" />
      </div>

      {}
      <div className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {}


          {}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            {}
            <div className="lg:col-span-4">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <Link href="/" className={`${pacifico.className} text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent`}>
                    HomeConnect
                  </Link>
                </div>
                <p className="text-sm text-gray-300 leading-tight border-l-4 border-cyan-400 pl-4 py-2 bg-gradient-to-r from-cyan-500/5 to-transparent max-w-sm w-full">
                  Your trusted real estate partner. We connect you with premium properties,
                  offering expert guidance and innovative solutions for buyers and renters.
                </p>


                {}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 font-medium">Follow our campus updates:</span>
                  <div className="flex items-center gap-2">
                    {homeConnectSocial.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:border-cyan-400/30"
                      >
                        <span className="text-lg">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {footerWidgets.map((widget, index) => (
                <div key={widget.title} className="group">
                  <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />
                    {widget.title}
                  </h3>
                  <ul className="space-y-2">
                    {widget.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:underline hover:underline-offset-2"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} <span className="text-cyan-400 font-semibold">HomeConnect </span>
                    All rights reserved.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:underline">
                  Terms of Service
                </Link>
                <Link href="/accessibility" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:underline">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="absolute bottom-40 left-10 w-3 h-3 bg-cyan-400 rounded-full opacity-60 animate-float" />
      <div className="absolute top-32 right-40 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 right-32 w-4 h-4 bg-amber-400 rounded-full opacity-30 animate-pulse" />
    </footer>
  );
}