'use client';

import DashboardLayout from '@/app/dashboard/DashboardLayout';
import { usePathname } from 'next/navigation';
import Footer from './footer';
import Header from './header';
import Breadcrumb from './Breadcrumb';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  
  if (isDashboard) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {!isHomePage ? (
          <>
            <div className="container mx-auto px-4 py-6">
              <Breadcrumb />
            </div>
            <div className="flex-1">{children}</div>
          </>
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  );
}