
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import { AuthLoginBrand } from '@/components/auth/AuthLayoutBrand';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GlobalLoader } from '@/components/ui/GlobalLoader';
import { pacifico } from '@/lib/fonts';
import { loginSchema, type LoginFormData } from '@/lib/validation';
import { useLoginMutation } from '@/redux/features/auth/authApiSlice';
import { RootState } from '@/redux/store';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [login, { isLoading, isSuccess, error }] = useLoginMutation();

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔐 User already logged in, redirecting...');
      // Redirect based on role
      switch (user?.role) {
        case 'landlord':
        case 'admin':
        case 'support':
          router.push('/dashboard');
          break;
        case 'tenant':
        default:
          router.push('/properties'); // Tenants usually want to browse first
          break;
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Login Successful! Redirecting...");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      let userFriendlyMessage = 'An unexpected error occurred. Please try again.';

      if ('status' in error) {
        const errorData = (error as any).data;

        if (error.status === 401 || error.status === 404) {
          userFriendlyMessage = errorData?.message || 'Invalid email or password.';
        } else if (errorData?.message) {
          userFriendlyMessage = errorData.message;
        } else if (typeof error.status === 'number' && error.status >= 500) {
          userFriendlyMessage = 'A server error occurred. Please try again shortly.';
        } else if (error.status === 'FETCH_ERROR') {
          userFriendlyMessage = 'Network error. Please check your internet connection.';
        }
      } else {
        console.error('🔴 Non-RTK Error:', error);
      }
      toast.error(userFriendlyMessage);
    }
  }, [error]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  if (isAuthenticated) {
    return <GlobalLoader message="Redirecting to dashboard..." />;
  }

  return (
    <>
      {isLoading && <GlobalLoader message="Signing in..." />}

      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 py-0">

            <AuthLoginBrand />

            <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
              <div className="w-full max-w-md">
                <CardHeader className="p-0 pb-8 text-center">
                  <div className='flex lg:hidden items-center justify-center pb-6'>
                    <Link
                      href="/"
                      className={`${pacifico.className} text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent`}
                    >
                      HomeConnect
                    </Link>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Sign in to your account
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  <LoginForm
                    register={register}
                    handleSubmit={handleSubmit}
                    onSubmit={onSubmit}
                    errors={errors}
                    isLoading={isLoading}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    rememberMe={rememberMe}
                    setRememberMe={setRememberMe}
                  />

                  {/* Demo Accounts */}
                  <div className="border-t pt-6 mt-6">
                    <p className="text-xs text-gray-500 text-center mb-4 font-medium uppercase tracking-wide">
                      Demo Accounts
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="font-semibold text-red-900">Admin</p>
                        <p className="text-red-700 mt-1 font-medium">admin@homeconnect.com</p>
                        <p className="text-red-600">StrongPassword123!</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="font-semibold text-purple-900">Landlord</p>
                        <p className="text-purple-700 mt-1 font-medium">landlord1@homeconnect.com</p>
                        <p className="text-purple-600">StrongPassword123!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}