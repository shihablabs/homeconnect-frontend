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
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4); }
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
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            background-size: 200px 100%;
          }
        `}
      </style>

      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-600 p-4 pt-36 pb-16 font-inter relative overflow-hidden">
        {}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 text-center shadow-2xl md:p-12 z-10">

          {}
          <div className="relative mb-8 flex justify-center">
            <div className="relative h-40 w-40">
              {}
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-glow"></div>

              {}
              <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/30 animate-float">
                <Home size={60} className="text-white drop-shadow-lg" />
              </div>

              {}
              <div className="absolute -top-2 -right-2 z-20 rounded-full bg-white/20 backdrop-blur-md p-3 text-white shadow-lg border border-white/30">
                <Search size={20} />
              </div>
              <div className="absolute -bottom-2 -left-2 z-20 rounded-full bg-white/20 backdrop-blur-md p-3 text-white shadow-lg border border-white/30">
                <Building size={20} />
              </div>

              {}
              <div className="absolute -inset-4 rounded-full border-2 border-white/20 animate-ping"></div>
              <div className="absolute -inset-6 rounded-full border-2 border-white/10 animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {}
          <div className="space-y-6">
            {}
            <div className="relative inline-block">
              <h1 className="text-9xl font-black text-white drop-shadow-2xl relative">
                404
                <div className="absolute inset-0 animate-shimmer rounded-lg"></div>
              </h1>
            </div>

            {}
            {}

            {}
            {}

            {}
            <div className="pt-6">
              <Link href="/">
                <button className="group relative inline-flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/30 hover:scale-105 hover:shadow-2xl border border-white/30 focus:outline-none focus:ring-4 focus:ring-white/50 min-w-[200px] w-full md:w-auto overflow-hidden cursor-pointer">
                  {}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  {}
                  <Home className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="relative drop-shadow-sm">Back to HomeConnect</span>
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </div>

          {}
          <p className="text-white/60 text-sm mt-8 pt-6 border-t border-white/20">
            Can&apos;t find what you&apos;re looking for?{' '}
            <Link
              href="/contact"
              className="text-white/80 hover:text-white underline transition-colors"
            >
              Contact our support team
            </Link>
          </p>
        </div>

        {}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10"
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