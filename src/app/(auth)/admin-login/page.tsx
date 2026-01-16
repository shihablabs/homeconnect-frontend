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
import { PasswordInput } from "@/components/ui/password-input";
import { pacifico } from "@/lib/fonts";
import { useLoginMutation } from "@/redux/features/auth/authApiSlice";
import { logout, logoutUser } from "@/redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("from");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role) {
      if (['admin', 'super-admin', 'support'].includes(user.role)) {
        router.replace("/dashboard/admin");
      } else {
        dispatch(logoutUser()).unwrap().then(() => {
          toast.error("Access Denied: Admin privileges required.");
        }).catch(() => {
          // force redirect even if api fail
        });
      }
    }
  }, [isLoading, isAuthenticated, router, user, logout]);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const isEmail = data.identifier.includes("@");
      const loginPayload = isEmail
        ? { email: data.identifier, password: data.password }
        : { phoneNumber: data.identifier, password: data.password };

      await login(loginPayload).unwrap();

      Swal.fire({
        title: "Admin Login Successful!",
        text: "Accessing dashboard...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        didOpen: () => {
          const container = Swal.getContainer();
          if (container) {
            container.style.backdropFilter = 'blur(8px)';
          }
        }
      });

      router.push(returnUrl ? decodeURIComponent(returnUrl) : "/dashboard/admin");
    } catch (error: any) {
      console.log("Admin Login failed", error);
      const message = error?.data?.message || "Login failed. Please check your credentials.";
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
    <div className="w-full min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Mobile Header */}
        <div className="flex items-center justify-center pb-8">
          <Link
            href="/"
            className={`${pacifico.className} text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}
          >
            HomeConnect
          </Link>
        </div>

        <Card className="shadow-2xl overflow-hidden border-0 bg-white/80 backdrop-blur-sm p-8">
          <CardHeader className="p-0 pb-8 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Staff Access
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Authenticate using your staff credentials
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
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
                  placeholder="admin@homeconnect.com or +880..."
                  {...register("identifier")}
                  className={`h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20 ${errors.identifier ? "border-red-500" : ""}`}
                />
                {errors.identifier && (
                  <p className="text-xs text-red-500">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>Password</span>
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20 ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl"
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
                className="text-sm text-gray-500 hover:text-gray-800 hover:underline transition-colors"
              >
                Return to Main Login
              </Link>
            </div>

            <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Test Credentials</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                  <div>
                    <div className="font-bold text-gray-700">System Admin</div>
                    <div className="font-mono text-gray-500 truncate w-32">admin@homeconnect.com</div>
                    <div className="font-mono text-gray-400 truncate w-32">HomeConnectAdmin2024!</div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                  <div>
                    <div className="font-bold text-gray-700">Support Specialist</div>
                    <div className="font-mono text-gray-500 truncate w-32">support@homeconnect.com</div>
                    <div className="font-mono text-gray-400 truncate w-32">HomeConnectSupport2024!</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} HomeConnect. All rights reserved.
        </p>
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
