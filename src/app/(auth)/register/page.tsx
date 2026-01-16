"use client";

import { AuthRegistrationBrand } from "@/components/auth/AuthRegistrationBrand";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card } from "@/components/ui/card";
import { pacifico } from "@/lib/fonts";
import Link from "next/link";

import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 bg-white/80 backdrop-blur-sm p-0">
          { }
          <AuthRegistrationBrand />

          { }
          <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md">
              { }
              <div className="flex lg:hidden items-center justify-center pb-8">
                <Link
                  href="/"
                  className={`${pacifico.className} text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}
                >
                  HomeConnect
                </Link>
              </div>

              <SignupForm />
            </div>
          </div>
        </Card>

        { }
        <p className="text-center mt-8 text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} HomeConnect. All rights reserved.
        </p>
      </div>
    </div>
  );
}
