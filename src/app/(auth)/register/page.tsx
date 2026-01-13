'use client';

import { AuthRegistrationBrand } from '@/components/auth/AuthRegistrationBrand';
import { SignupForm } from '@/components/auth/SignupForm';
import { Card } from '@/components/ui/card';
import { pacifico } from '@/lib/fonts';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 py-0">
          {/* Left Side Branding */}
          <AuthRegistrationBrand />

          {/* Right Side Form */}
          <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
            <div className="w-full max-w-md">
              <div className='flex lg:hidden items-center justify-center pb-6'>
                <Link
                  href="/"
                  className={`${pacifico.className} text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent`}
                >
                  HomeConnect
                </Link>
              </div>

              {/* Modular Signup Form with OTP Support */}
              <SignupForm />

              <div className="text-center pt-6 text-sm text-muted-foreground">
                By clicking Signup, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}