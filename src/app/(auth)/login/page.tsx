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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/firebase.config";
import { pacifico } from "@/lib/fonts";
import { useAppSelector } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Chrome, Loader2, Lock, LogIn, Mail, Phone } from "lucide-react";
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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("from");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  // Recaptcha initialization is now handled lazily in handleSendOtp

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
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Login successful!");
      router.push(returnUrl ? decodeURIComponent(returnUrl) : "/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Login successful!");
      router.push(returnUrl ? decodeURIComponent(returnUrl) : "/dashboard");
    } catch (error: any) {
      console.error("Google Login Error:", error);
      toast.error(error.message || "Failed to login with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth");

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      }

      const appVerifier = window.recaptchaVerifier;
      // Format phone number if needed, simple pass validation is assumed 
      // (usually requires E.164, user provided input might need +880...)
      // Assuming input includes country code or user types it.

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      toast.success('Verification code sent to your phone!');
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast.success('Logged in successfully!');
      router.push(returnUrl ? decodeURIComponent(returnUrl) : "/dashboard");
    } catch (error: any) {
      console.error("OTP Verify Error:", error);
      toast.error(error.message || "Invalid code");
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
                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger value="email" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 py-2">Email</TabsTrigger>
                    <TabsTrigger value="phone" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 py-2">Phone</TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
                        >
                          <Mail className="w-4 h-4 text-blue-500" />
                          <span>Email Address</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          {...register("email")}
                          className={`h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20 ${errors.email ? "border-red-500" : ""}`}
                        />
                        <p className="text-[10px] text-gray-400">Enter your registered email address</p>
                        {errors.email && (
                          <p className="text-xs text-red-500">
                            {errors.email.message}
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
                        <Input
                          id="password"
                          type="password"
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

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500 font-medium tracking-wider">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full h-12 border-gray-300 font-bold hover:bg-gray-50 bg-white text-gray-700 rounded-xl transition-all hover:border-blue-500/50 group"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <Chrome className="mr-2 h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />{" "}
                      Sign in with Google
                    </Button>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4">
                    {!confirmationResult ? (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
                          >
                            <Phone className="w-4 h-4 text-blue-500" />
                            <span>Phone Number</span>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+880 1XXX-XXXXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20"
                          />
                          <p className="text-[10px] text-gray-400">We'll send a 6-digit verification code</p>
                        </div>
                        <div id="recaptcha-container"></div>
                        <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl" disabled={loading}>
                          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Phone className="mr-2 h-5 w-5" />}
                          Send OTP Code
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">Enter Verification Code</Label>
                          <Input
                            id="otp"
                            type="text"
                            placeholder="6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500/20"
                          />
                          <p className="text-[10px] text-gray-400">Enter the code sent to your phone</p>
                        </div>
                        <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl" disabled={loading}>
                          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                          Verify & Login
                        </Button>
                        <Button
                          variant="link"
                          type="button"
                          className="w-full text-xs text-blue-600 font-bold"
                          onClick={() => setConfirmationResult(null)}
                        >
                          Change phone number
                        </Button>
                      </form>
                    )}
                  </TabsContent>
                </Tabs>

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
                      href="/auth/admin-login"
                      className="text-xs text-gray-500 hover:text-gray-800 font-medium hover:underline transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="bg-gray-100 px-2 py-1 rounded-full">Admin & Staff Access</span>
                    </Link>
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
