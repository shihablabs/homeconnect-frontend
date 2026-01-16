import { ArrowRight, Building, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.1); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 3s ease-in-out infinite;
          }
          
          .animate-shimmer {
            animation: shimmer 2s infinite linear;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
            background-size: 200px 100%;
          }
        `}
      </style>

      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white p-4 font-inter relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-100/50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative w-full max-w-lg p-8 text-center z-10">

          {/* Icon Area */}
          <div className="relative mb-6 flex justify-center">
            <div className="relative h-32 w-32">
              {/* Outer Glow */}
              <div className="absolute inset-0 rounded-full bg-blue-100/40 animate-pulse-glow"></div>

              {/* Main Icon Circle */}
              <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-white to-blue-50 border border-blue-50 shadow-sm animate-float">
                <Home size={48} className="text-blue-600" />
              </div>

              {/* Small Floating Icons */}
              <div className="absolute -top-1 -right-1 z-20 rounded-full bg-white p-2.5 text-cyan-600 shadow-sm border border-gray-50">
                <Search size={16} />
              </div>
              <div className="absolute -bottom-1 -left-1 z-20 rounded-full bg-white p-2.5 text-purple-600 shadow-sm border border-gray-50">
                <Building size={16} />
              </div>

              {/* Ripple Rings */}
              <div className="absolute -inset-4 rounded-full border-2 border-blue-100/30 animate-ping"></div>
              <div className="absolute -inset-6 rounded-full border-2 border-cyan-100/20 animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            {/* 404 Text */}
            <div className="relative inline-block">
              <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 relative tracking-tighter">
                404
                <div className="absolute inset-0 animate-shimmer rounded-lg mix-blend-overlay"></div>
              </h1>
            </div>

            {/* Headings */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
              <p className="text-gray-500 text-base">
                The page you are looking for doesn't exist or has been moved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-6">
              <Link href="/">
                <button className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 min-w-[160px] cursor-pointer overflow-hidden">
                  {/* Sheen Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  {/* Button Content */}
                  <Home className="mr-2.5 h-4 w-4" />
                  <span className="relative">Back Home</span>
                  <ArrowRight className="ml-2.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-gray-400 text-xs mt-8">
            Need help?{' '}
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              Contact Support
            </Link>
          </p>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-400/10"
              style={{
                width: Math.random() * 6 + 2 + 'px',
                height: Math.random() * 6 + 2 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
        </div>
      </main>
    </>
  );
}