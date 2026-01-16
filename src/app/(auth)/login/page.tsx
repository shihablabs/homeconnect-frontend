"use client";

import { AuthLoginBrand } from "@/components/auth/AuthLayoutBrand";
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
import { PasswordInput } from "@/components/ui/password-input";
import { authApi } from "@/lib/api/auth-api";
import { auth } from "@/lib/firebase.config";
import { pacifico } from "@/lib/fonts";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("from");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const isEmail = data.identifier.includes("@");
      const loginPayload = isEmail
        ? { email: data.identifier, password: data.password }
        : { phoneNumber: data.identifier, password: data.password };

      // Backend Login
      const result = await authApi.login(loginPayload);

      // Dispatch to Redux immediately for UI responsiveness
      dispatch(setCredentials({ user: result.user as any, token: result.token }));

      // Sync with Firebase if custom token returned
      if (result.firebaseCustomToken && auth) {
        const { signInWithCustomToken } = await import("firebase/auth");
        await signInWithCustomToken(auth, result.firebaseCustomToken);
      }

      Swal.fire({
        title: "Login Successful!",
        text: "Welcome back to HomeConnect.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push(returnUrl ? decodeURIComponent(returnUrl) : "/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <Card className="flex flex-col lg:flex-row shadow-2xl overflow-hidden border-0 bg-white/80 backdrop-blur-sm p-0">
          {/* Left Side - Brand Logic is Handled by Component */}
          <AuthLoginBrand />

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md">
              {/* Mobile Header */}
              <div className="flex lg:hidden items-center justify-center pb-8">
                <Link
                  href="/"
                  className={`${pacifico.className} text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}
                >
                  HomeConnect
                </Link>
              </div>

              <CardHeader className="p-0 pb-8 text-center lg:text-left">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back!
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Please enter your details to sign in
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="space-y-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="identifier"
                        className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
                      >
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>Email or Phone Number</span>
                      </Label>
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="Email or +880..."
                        {...register("identifier")}
                        className={`h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20 ${errors.identifier ? "border-red-500" : ""}`}
                      />
                      <p className="text-[10px] text-gray-400">Enter your registered email or phone number</p>
                      {errors.identifier && (
                        <p className="text-xs text-red-500">
                          {errors.identifier.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="password"
                          className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
                        >
                          <Lock className="w-4 h-4 text-blue-500" />
                          <span>Password</span>
                        </Label>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <PasswordInput
                        id="password"
                        placeholder="••••••••"
                        {...register("password")}
                        className={`h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20 ${errors.password ? "border-red-500" : ""}`}
                      />
                      <p className="text-[10px] text-gray-400">Your secure 6+ character password</p>
                      {errors.password && (
                        <p className="text-xs text-red-500">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-5 w-5" />
                      )}
                      Sign In
                    </Button>
                  </form>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600 font-medium">
                    New to HomeConnect?{" "}
                    <Link
                      href="/register"
                      className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Create an account
                    </Link>
                  </p>

                  {/* Link to Admin Login */}
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <Link
                      href="/admin-login"
                      className="text-xs text-gray-500 hover:text-gray-800 font-medium hover:underline transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="bg-gray-100 px-2 py-1 rounded-full">Admin & Staff Access</span>
                    </Link>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Test Credentials</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                      <div>
                        <div className="font-bold text-gray-700">Landlord</div>
                        <div className="font-mono text-gray-500">landlord1@homeconnect.com</div>
                        <div className="font-mono text-gray-400">StrongPassword123!</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                      <div>
                        <div className="font-bold text-gray-700">Tenant</div>
                        <div className="font-mono text-gray-500">tenant1@homeconnect.com</div>
                        <div className="font-mono text-gray-400">StrongPassword123!</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} HomeConnect. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<GlobalLoader message="Preparing your secure login..." />}>
      <LoginContent />
    </Suspense>
  );
}
