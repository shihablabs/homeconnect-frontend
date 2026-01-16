'use client';

import { useGetProfileQuery } from '@/redux/features/auth/authApiSlice';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';
import { usePathname } from 'next/navigation';
import Breadcrumb from './Breadcrumb';
import Footer from './footer';
import Header from './header';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAppSelector(selectCurrentUser);

  // Sync user profile on mount if authenticated
  const { isLoading } = useGetProfileQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true
  });

  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const isHome = pathname === "/";

  let content;
  if (isDashboard || isAuthPage) {
    content = <>{children}</>;
  } else {
    content = (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {!isHome ? (
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

  return (
    <>
      {content}

    </>
  );
}