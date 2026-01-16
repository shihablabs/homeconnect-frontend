"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pacifico } from "@/lib/fonts";
import { useAppSelector } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("from");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role) {
      // Check if user is actually admin/support/super-admin
      if (['admin', 'super-admin', 'support'].includes(user.role)) {
        router.replace("/dashboard/admin");
      } else {
        // If tenant/landlord tries to access admin login page while logged in, maybe redirect to main dashboard
        router.replace("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, router, user]);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [login, { isLoading: isLoginLoading }] = useAdminLoginMutation();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      // Attempt Backend Login
      // This calls the custom JWT backend endpoint
      await login(data).unwrap();

      toast.success("Admin Login successful!");
      // Redirect to Admin Dashboard
      router.push(returnUrl ? decodeURIComponent(returnUrl) : "/dashboard/admin");
    } catch (error: any) {
      console.log("Admin Login failed", error);
      // Simplify error message for user
      const message = error?.data?.message || "Login failed. Please check your credentials.";

      // If the backend specifically says "Use Client Interface", it means they are a Tenant trying to login here.
      if (error?.status === 403 || message.includes("client interface")) {
        toast.error("This portal is for Staff only. Please use the main Login page.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 bg-white/95 backdrop-blur-sm p-0">

          {/* Brand Section - Darker for Admin */}
          <div className="lg:w-1/2 bg-slate-900 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-90" />
            <div className="relative z-10 text-center">
              <Link href="/" className={`${pacifico.className} text-4xl lg:text-5xl font-bold mb-4 block`}>
                HomeConnect
              </Link>
              <div className="text-xl lg:text-2xl font-light tracking-wide mb-8 bg-slate-800/50 px-4 py-1 rounded-full border border-slate-700 inline-block">
                Admin Portal
              </div>
              <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
                Secure access for System Administrators and Support Staff.
              </p>
            </div>
          </div>


          <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md">
              <div className="flex lg:hidden items-center justify-center pb-8">
                <Link
                  href="/"
                  className={`${pacifico.className} text-3xl font-bold text-slate-900`}
                >
                  HomeConnect Admin
                </Link>
              </div>

              <CardHeader className="p-0 pb-8 text-center lg:text-left">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Staff Access
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Authenticate using your staff credentials
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
                    >
                      <Mail className="w-4 h-4 text-slate-800" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@homeconnect.com"
                      {...register("email")}
                      className={`h-11 bg-gray-50/50 border-gray-200 focus:ring-slate-500/20 ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
                    >
                      <Lock className="w-4 h-4 text-slate-800" />
                      <span>Password</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      className={`h-11 bg-gray-50/50 border-gray-200 focus:ring-slate-500/20 ${errors.password ? "border-red-500" : ""}`}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl"
                    disabled={loading || isLoginLoading}
                  >
                    {loading || isLoginLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <LogIn className="mr-2 h-5 w-5" />
                    )}
                    Authorize Session
                  </Button>
                </form>

                <div className="text-center pt-6">
                  <Link
                    href="/login"
                    className="text-sm text-slate-500 hover:text-slate-800 hover:underline transition-colors"
                  >
                    Return to Main Login
                  </Link>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<GlobalLoader message="Initializing Secure Connection..." />}>
      <AdminLoginContent />
    </Suspense>
  );
}
