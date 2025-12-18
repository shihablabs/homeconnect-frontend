/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast } from 'sonner';

import { AuthRegistrationBrand } from '@/components/auth/AuthRegistrationBrand';
import { AuthSuccessPopup } from '@/components/auth/AuthSuccessPopup';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GlobalLoader } from '@/components/ui/GlobalLoader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { pacifico } from '@/lib/fonts';
import { registerSchema, type RegisterFormData } from '@/lib/validation';
import { useRegisterMutation } from '@/redux/features/auth/authApiSlice';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [registerUser, { isLoading, isSuccess, error }] = useRegisterMutation();

  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord'>('tenant');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'tenant',
      phone: '',
    },
  });

  const currentRole = watch('role');

  const handleRedirect = () => {
    if (user?.role === 'landlord') {
      router.push('/dashboard');
    } else {
      router.push('/properties');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔐 User already logged in, redirecting from register...');
      handleRedirect();
    }
  }, [isAuthenticated, user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isSuccess && isAuthenticated && user) {
      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => {
        handleRedirect();
      }, 1500);
    }
  }, [isSuccess, isAuthenticated, user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) {
      let userFriendlyMessage = 'An unexpected error occurred. Please try again.';

      if ('status' in error) {
        const errorData = (error as any).data;

        if (error.status === 409) {
          userFriendlyMessage = errorData?.message || 'User already exists with this email.';
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

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneValue(value || '');
    setValue('phone', value || '', { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    const submitData = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      phone: data.phone || undefined,
    };

    await registerUser(submitData);
  };

  if (isAuthenticated && !isSuccess) {
    return <GlobalLoader message="Redirecting to dashboard..." />;
  }

  return (
    <>
      {isLoading && <GlobalLoader message="Creating your account..." />}
      <AuthSuccessPopup isOpen={isSuccess} />

      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 py-0">

            <AuthRegistrationBrand />

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
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Join HomeConnect today
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Full Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          {...register('name')}
                          className={`h-12 px-4 text-base border-2 ${errors.name
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            } transition-all duration-200 bg-gray-50/50`}
                          disabled={isLoading}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-600 font-medium flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{errors.name.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          {...register('email')}
                          className={`h-12 px-4 text-base border-2 ${errors.email
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            } transition-all duration-200 bg-gray-50/50`}
                          disabled={isLoading}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600 font-medium flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{errors.email.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
                        I am a
                      </Label>
                      <Select
                        onValueChange={(value: 'tenant' | 'landlord') => {
                          setValue('role', value);
                          setSelectedRole(value);
                        }}
                        defaultValue="tenant"
                        disabled={isLoading}
                      >
                        <SelectTrigger className={`h-12 text-base border-2 ${errors.role
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          } transition-all duration-200 bg-gray-50/50`}>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant" className="text-base py-3">Tenant 🎓</SelectItem>
                          <SelectItem value="landlord" className="text-base py-3">Landlord 🏠</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-sm text-red-600 font-medium flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{errors.role.message}</span>
                        </p>
                      )}
                    </div>

                    {currentRole === 'tenant' && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 font-medium">
                          🎓 As a tenant, you can browse properties, save favorites, and contact landlords.
                        </p>
                      </div>
                    )}

                    {currentRole === 'landlord' && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800 font-medium">
                          🏠 As a landlord, you can list properties, manage inquiries, and connect with tenants. </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Phone Number <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                      </Label>
                      <div className="react-phone-input-container">
                        <PhoneInput
                          international
                          defaultCountry="BD"
                          value={phoneValue}
                          onChange={handlePhoneChange}
                          placeholder="Enter phone number"
                          className={`phone-input ${errors.phone ? 'error' : ''
                            }`}
                          disabled={isLoading}
                        />
                      </div>
                      <input type="hidden" {...register('phone')} />
                      {errors.phone && (
                        <p className="text-sm text-red-600 font-medium flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{errors.phone.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          {...register('password')}
                          className={`h-12 px-4 pr-12 text-base border-2 ${errors.password
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            } transition-all duration-200 bg-gray-50/50`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600 font-medium flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{errors.password.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          {...register('confirmPassword')}
                          className={`h-12 px-4 pr-12 text-base border-2 ${errors.confirmPassword
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            } transition-all duration-200 bg-gray-50/50`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600 font-medium flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{errors.confirmPassword.message}</span>
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>

                    <div className="text-center pt-4">
                      <span className="text-gray-600 text-sm">Already have an account? </span>
                      <Link
                        href="/login"
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                      >
                        Sign in
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}